const { demoRoutes, clientIp, lockIdentity } = require('./demo-features');
const { ragRoutes } = require('./rag');
'use strict';
const { randomUUID, createHash } = require('node:crypto');
const { hashPassword, verifyPassword } = require('../passwords');
const { extensions, publicRecovery, checkPrerequisites } = require('./extensions');
const { learningRoutes } = require('./learning');
const now = () => new Date().toISOString();
const hash = x => createHash('sha256').update(x).digest('hex');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const id = v => {
    if (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))
        fail(400, 'شناسه معتبر نیست.');
    return v;
};
const text = (v, max = 200, min = 1) => {
    if (typeof v !== 'string' || v.trim().length < min || v.length > max)
        fail(400, 'متن ورودی معتبر نیست.');
    return v.trim();
};
const integer = (v, min, max) => {
    if (!Number.isInteger(v) || v < min || v > max)
        fail(400, 'عدد ورودی معتبر نیست.');
    return v;
};
const publicUser = u => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: Boolean(u.active) });
async function audit(q, u, action, target) { await q.run('INSERT INTO nova_audit(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)', [randomUUID(), u.id, action, target, now()]); }
function validateLesson(input, publishing = false) {
    let cover;try{cover=require('./lesson-cover').validateCover(input.cover)}catch{fail(400,'جلد درس باید تصویر HTTPS یا عنصر معتبر باشد.')}
    const title = text(input.title);
    const blocks = input.blocks;
    if (!Array.isArray(blocks) || blocks.length > 80 || (publishing && !blocks.length))
        fail(400, 'بلوک‌های درس معتبر نیستند.');
    const seen = new Set();
    const clean = blocks.map(b => {
        if (!b || !['heading', 'text', 'code', 'image', 'video', 'note'].includes(b.kind))
            fail(400, 'نوع بلوک معتبر نیست.');
        const key = text(b.id, 80);
        if (seen.has(key))
            fail(400, 'شناسه بلوک تکراری است.');
        seen.add(key);
        const result = { id: key, kind: b.kind, title: text(b.title || ' ', 200, 0), body: text(b.body || ' ', 12000, 0) };
        if(Array.isArray(b.textMarks)&&typeof b.body==='string')result.body=b.body;
        if(b.variant!==undefined){if(!['quote','list','divider'].includes(b.variant))fail(400,'سبک بلوک معتبر نیست.');result.variant=b.variant;}
        if(b.textMarks!==undefined){if(!Array.isArray(b.textMarks)||b.textMarks.length>100)fail(400,'قالب متن معتبر نیست.');let last=0;result.textMarks=b.textMarks.map(m=>{const start=integer(m.start,0,result.body.length),end=integer(m.end,1,result.body.length),fontSize=integer(m.fontSize,12,36);if(start<last||end<=start)fail(400,'بازه متن معتبر نیست.');last=end;return {start,end,fontSize};});}
        if (b.fontSize !== undefined) result.fontSize = integer(b.fontSize, 12, 36);
        if (b.textColor !== undefined) { if (typeof b.textColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(b.textColor)) fail(400, 'رنگ متن معتبر نیست.'); result.textColor = b.textColor.toLowerCase(); }
        if (b.kind === 'video') {
            if (b.sourceUrl && /^\/api\/platform\/files\/[a-f0-9-]{36}$/.test(b.sourceUrl)) { result.sourceUrl=b.sourceUrl; }
            else if (b.embedUrl) {
                let url;
                try { url = new URL(b.embedUrl); } catch { fail(400,'نشانی ویدیو معتبر نیست.'); }
                if (url.protocol !== 'https:' || url.port || url.username || url.password ||
                    !/^(?:stream\.novextech\.ir|(?:[a-z0-9-]+\.)*kavimo\.(?:com|ir))$/.test(url.hostname))
                    fail(400,'نشانی پخش کاویمو معتبر نیست.');
                result.embedUrl = url.href;
            }
            else if (typeof b.mediaId !== 'string' || !/^[a-zA-Z0-9]{12}$/.test(b.mediaId))
                fail(400, 'شناسه ویدیوی کاویمو معتبر نیست.');
            if(b.mediaId)result.mediaId = b.mediaId;
        }
        if (b.kind === 'image') {
            let url;
            try {
                url = new URL(b.imageUrl, 'http://nova.local');
            }
            catch {
                fail(400, 'نشانی تصویر معتبر نیست.');
            }
            if ((url.protocol !== 'https:' && url.origin !== 'http://nova.local') || url.username || url.password)
                fail(400, 'تصویر باید نشانی HTTPS داشته باشد.');
            result.imageUrl = url.origin === 'http://nova.local' ? url.pathname : url.href;
            if (!result.title)
                fail(400, 'متن جایگزین تصویر لازم است.');
        }
        return result;
    });
    const exercise = { prompt: text(input.exercise?.prompt || ' ', 4000, 0), starter: text(input.exercise?.starter || ' ', 4000, 0) };
    const gradingTests = input.exercise?.gradingTests || [];
    if (!Array.isArray(gradingTests) || gradingTests.length > 10)
        fail(400, 'حداکثر ۱۰ آزمون کد مجاز است.');
    exercise.gradingTests = gradingTests.map(t => { if (!t || typeof t.stdin !== 'string' || typeof t.stdout !== 'string' || t.stdin.length > 2000 || t.stdout.length > 4000)
        fail(400, 'آزمون کد معتبر نیست.'); return { stdin: t.stdin, stdout: t.stdout }; });
    const quiz = input.quiz || [];
    if (!Array.isArray(quiz) || quiz.length > 20)
        fail(400, 'آزمون معتبر نیست.');
    const questions = quiz.map(question => {
        if (!question || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6)
            fail(400, 'گزینه‌های سؤال معتبر نیستند.');
        return { prompt: text(question.prompt, 1000), options: question.options.map(x => text(x, 500)), correct: integer(question.correct, 0, question.options.length - 1) };
    });
    if (publishing && (!clean.some(b => b.kind === 'video') || !exercise.prompt || !questions.length))
        fail(400, 'برای انتشار، ویدیو، تمرین و حداقل یک سؤال کامل لازم است.');
    const references=(input.references||[]);if(!Array.isArray(references)||references.length>8)fail(400,'حداکثر هشت مرجع مجاز است.');for(const link of references){let u;try{u=new URL(link)}catch{fail(400,'لینک مرجع معتبر نیست.')}if(u.protocol!=='https:'||u.username||u.password||link.length>2000)fail(400,'مرجع باید HTTPS باشد.');}
    const examId=input.examId?id(input.examId):null;
    return { title, cover, references, examId, blocks: clean, exercise, quiz: questions, passScore: integer(input.passScore ?? 70, 1, 100) };
}
function studentContent(doc) { const { gradingTests, ...exercise } = doc.exercise; const {references,...publicDoc}=doc;return { ...publicDoc, exercise: { ...exercise, autoGradingEnabled: Boolean(gradingTests?.length) }, quiz: doc.quiz.map(({ correct, ...question }) => question) }; }
async function scope(q, u, courseId, write = false) {
    const course = await q.lockCourse(id(courseId));
    if (!course)
        fail(404, 'دوره پیدا نشد.');
    if (u.role === 'admin')
        return course;
    if (u.role === 'teacher') {
        if (!await q.one('SELECT user_id FROM nova_teachers WHERE course_id=? AND user_id=?', [courseId, u.id]))
            fail(403, 'دسترسی به این دوره ندارید.');
        return course;
    }
    if (write || course.status !== 'published' || !await q.one("SELECT user_id FROM nova_enrollments WHERE course_id=? AND user_id=? AND status='active'", [courseId, u.id]))
        fail(403, 'ثبت‌نام فعال در این دوره ندارید.');
    return course;
}
async function lessonScope(q, u, lessonId, write = false) {
    const lesson = await q.one('SELECT * FROM nova_lessons WHERE id=?', [id(lessonId)]);
    if (!lesson)
        fail(404, 'درس پیدا نشد.');
    await scope(q, u, lesson.course_id, write);
    const current = await q.one('SELECT * FROM nova_lessons WHERE id=?', [lessonId]);
    if (u.role === 'student' && (current.status !== 'published' || !current.published_version))
        fail(404, 'درس منتشر نشده است.');
    if (u.role === 'student')
        await checkPrerequisites(q, u, current);
    return current;
}
async function published(q, lesson, version) {
    if (lesson.published_version !== version || lesson.status !== 'published')
        fail(409, 'نسخه درس تغییر کرده است؛ صفحه را تازه کنید.');
    const row = await q.one('SELECT content_json FROM nova_versions WHERE lesson_id=? AND version=?', [lesson.id, version]);
    if (!row)
        fail(404, 'نسخه منتشرشده پیدا نشد.');
    return JSON.parse(row.content_json);
}
async function progress(q, u, lesson, version) { const p = await q.one('SELECT * FROM nova_progress WHERE user_id=? AND lesson_id=? AND version=?', [u.id, lesson.id, version]); const practice = await q.one('SELECT id FROM nova_practice WHERE user_id=? AND lesson_id=? AND version=? LIMIT 1', [u.id, lesson.id, version]); const best = await q.one('SELECT MAX(score) AS score,COUNT(*) AS attempts FROM nova_attempts WHERE user_id=? AND lesson_id=? AND version=?', [u.id, lesson.id, version]); return { videoAcknowledged: Boolean(p?.video_ack), practiceSubmitted: Boolean(practice), bestScore: best?.score ?? null, attempts: Number(best?.attempts || 0), completedAt: p?.completed_at || null }; }
async function createPlatform(store, { demo = false, origin = 'http://127.0.0.1:3002' } = {}) {
    if (demo && process.env.NODE_ENV === 'production')
        throw new Error('Demo access is forbidden in production.');
    async function bootstrap({ username, name, password }) {
        const normalized = text(username, 80).toLowerCase();
        const passwordHash = await hashPassword(password);
        return store.tx(async (q) => {
            const existing = await q.one("SELECT id FROM nova_users WHERE role='admin'");
            if (existing)
                fail(409, 'مدیر اولیه قبلاً ساخته شده است.');
            const uid = randomUUID();
            await q.run('INSERT INTO nova_users(id,username,name,role,password_hash,active,created_at) VALUES(?,?,?,?,?,1,?)', [uid, normalized, text(name), 'admin', passwordHash, now()]);
            return uid;
        });
    }
    if (demo)
        await store.tx(async (q) => {
            for (const role of ['admin', 'teacher', 'student']) {
                const exists = await q.one('SELECT id FROM nova_users WHERE username=?', ['local-' + role]);
                if (!exists)
                    await q.run('INSERT INTO nova_users(id,username,name,role,password_hash,active,created_at) VALUES(?,?,?,?,?,1,?)', [randomUUID(), 'local-' + role, { admin: 'مدیر محلی', teacher: 'مدرس محلی', student: 'دانش‌آموز محلی' }[role], role, '!local-role-only', now()]);
            }
        });
    const cookieName = 'nova_product_session';
    const sessionCookieName = req => cookieName + (new URL(req.url, 'http://local').pathname.match(/^\/api\/platform\/portal\/(student|teacher|admin)\//)?.[1] ? '_' + new URL(req.url, 'http://local').pathname.split('/')[4] : '');
    const secure = process.env.NODE_ENV === 'production';
    const cookie = (token, clear = false, role = '') => `${cookieName}${role ? '_' + role : ''}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : 43200}${secure ? '; Secure' : ''}`;
    const send = (_res, status, data, headers = {}) => ({ status, data, headers });
    async function body(req) {
        if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json'))
            fail(415, 'JSON لازم است.');
        const chunks = []; let size = 0;
        for await (const chunk of req) {
            chunks.push(Buffer.from(chunk)); size += chunk.length;
            if (size > (new URL(req.url,'http://local').pathname.match(/^\/api\/platform(?:\/portal\/(?:student|teacher|admin))?\/media$/) ? 8500000 : 131072))
                fail(413, 'درخواست بیش از حد بزرگ است.');
        }
        let data;
        try {
            data = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        }
        catch {
            fail(400, 'JSON معتبر نیست.');
        }
        if (!data || Array.isArray(data) || typeof data !== 'object')
            fail(400, 'JSON معتبر نیست.');
        return data;
    }
    async function auth(q, req) {
        const cookieName = sessionCookieName(req);
        const match = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='));
        if (!match)
            return null;
        const token = match.slice(cookieName.length + 1);
        if (!/^[a-f0-9]{64}$/.test(token))
            return null;
        return q.one('SELECT u.* FROM nova_sessions s JOIN nova_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1', [hash(token), now()]);
    }
    async function session(q, u) { const token = require('node:crypto').randomBytes(32).toString('hex'); await q.run('DELETE FROM nova_sessions WHERE expires_at<?', [now()]); await q.run('INSERT INTO nova_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)', [hash(token), u.id, new Date(Date.now() + 43200000).toISOString()]); return token; }
    async function dispatch(req, res) {
        const url = new URL(req.url, origin);let route=url.pathname.replace(/^\/api\/platform/,'');const portalMatch=route.match(/^\/portal\/(student|teacher|admin)(?=\/)/);const portalRole=portalMatch?.[1];if(portalRole)route=route.slice(portalRole.length+8);
        try {
            if (!['GET', 'POST'].includes(req.method))
                fail(405, 'روش درخواست مجاز نیست.');
            if(route==='/public-info'&&req.method==='GET')return send(res,200,{localDemo:process.env.NODE_ENV!=='production'&&!store.postgres,app:'Nova'});
            if (route === '/health' && req.method === 'GET') {
                await store.tx(q => q.one('SELECT 1 AS healthy'));
                const worker=await store.tx(q=>q.one("SELECT last_seen FROM nova_worker_health WHERE kind='ai'"));
                const aiReady=Boolean(worker&&Date.now()-Date.parse(worker.last_seen)<900000&&(process.env.OPENROUTER_API_KEY||process.env.LIARA_AI_API_KEY));
                return send(res, 200, { ok: true, demoMode: demo, storage: store.postgres ? 'postgresql' : 'sqlite-local', aiReady });
            }
            let data = {};
            if (req.method === 'POST') {
                if (![origin,...(process.env.APP_ORIGINS||'').split(',').filter(Boolean)].includes(req.headers.origin))
                    fail(403, 'مبدأ درخواست معتبر نیست.');
                data = await body(req);
            }
            const recovery = await publicRecovery({ store, route, req, data, send, res, hashPassword, hash, fail });
            if (recovery)
                return recovery;
            // Hash passwords outside database locks, after checking authentication/role in a separate read transaction.
            let newHash;
            if (route === '/users' && req.method === 'POST') {
                const actor = await store.tx(q => auth(q, req));
                if (!actor)
                    fail(401, 'ابتدا وارد شوید.');
                if (actor.role !== 'admin')
                    fail(403, 'فقط مدیر می‌تواند حساب بسازد.');
                if (typeof data.password !== 'string' || data.password.length < 12 || data.password.length > 256)
                    fail(400, 'گذرواژه باید ۱۲ تا ۲۵۶ نویسه داشته باشد.');
                newHash = await hashPassword(data.password);
            }
            if (route === '/login' && req.method === 'POST') {
                const username = text(data.username || ' ', 80, 0).toLowerCase();
                const ip = clientIp(req);
                const key = hash(ip);
                const candidate = await store.tx(async (q) => {
                    const rateKey = hash('login-rate:' + ip);
                    await q.run('INSERT INTO nova_throttles(key_hash,failures,window_at) VALUES(?,0,0) ON CONFLICT DO NOTHING',[rateKey]);
                    if(q.postgres) await q.one('SELECT key_hash FROM nova_throttles WHERE key_hash=? FOR UPDATE',[rateKey]);
                    const rate = await q.one('SELECT * FROM nova_throttles WHERE key_hash=?', [rateKey]);
                    const rateFresh = !rate || Date.now() - Number(rate.window_at) >= 60000;
                    if (!rateFresh && rate.failures >= 30)
                        fail(429, 'تعداد درخواست‌ها زیاد است؛ یک دقیقه بعد امتحان کنید.');
                    await q.run('INSERT INTO nova_throttles(key_hash,failures,window_at) VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET failures=excluded.failures,window_at=excluded.window_at', [rateKey, rateFresh ? 1 : rate.failures + 1, rateFresh ? Date.now() : Number(rate.window_at)]);
                    const throttle = await q.one('SELECT * FROM nova_throttles WHERE key_hash=?', [key]);
                    if (throttle && Date.now() - Number(throttle.window_at) < 900000 && throttle.failures >= 8)
                        fail(429, 'تلاش‌های ورود زیاد است؛ ۱۵ دقیقه بعد امتحان کنید.');
                    return q.one('SELECT * FROM nova_users WHERE username=?', [demo && data.demoRole ? 'local-' + data.demoRole : username]);
                });
                const localAllowed = demo && ['admin', 'teacher', 'student'].includes(data.demoRole) && candidate?.username === 'local-' + data.demoRole;
                const good = localAllowed || await verifyPassword(String(data.password || ''), candidate?.password_hash || await dummyHash);
                return await store.tx(async (q) => {
                    if (!candidate || !candidate.active || !good) {
                        const prev = await q.one('SELECT * FROM nova_throttles WHERE key_hash=?', [key]);
                        const fresh = !prev || Date.now() - Number(prev.window_at) >= 900000;
                        await q.run('INSERT INTO nova_throttles(key_hash,failures,window_at) VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET failures=excluded.failures,window_at=excluded.window_at', [key, fresh ? 1 : prev.failures + 1, fresh ? Date.now() : Number(prev.window_at)]);
                        return send(res, 401, { error: 'نام کاربری یا گذرواژه صحیح نیست.' });
                    }
                    const current = await q.one('SELECT * FROM nova_users WHERE id=?' + (q.postgres ? ' FOR UPDATE' : ''), [candidate.id]);
                    if (!current || current.password_hash !== candidate.password_hash) fail(401, 'گذرواژه تغییر کرده است؛ دوباره وارد شوید.');
                    if(portalRole&&current.role!==portalRole)fail(403,'این حساب متعلق به ورودی دیگری است.');
                    if (!current?.active)
                        fail(401, 'حساب غیرفعال است.');
                    const token = await session(q, current);
                    return send(res, 200, { user: publicUser(current) }, { 'Set-Cookie': cookie(token, false, portalRole) });
                });
            }
            return await store.tx(async (q) => {
                const u = await auth(q, req);
                if (!u)
                    fail(401, 'ابتدا وارد شوید.');
                if(portalRole&&u.role!==portalRole)fail(401,'با حساب متناسب با این ورودی وارد شوید.');
                if(route==='/workers'&&req.method==='GET'){
 if(u.role!=='admin')fail(403,'فقط مدیر');
 const workers=await q.all('SELECT * FROM nova_worker_health');
 return send(res,200,{workers:workers.map(w=>({...w,stale:Date.now()-Date.parse(w.last_seen)>900000})),ai:await q.all('SELECT status,COUNT(*) AS count FROM nova_ai_jobs GROUP BY status'),grading:await q.all('SELECT status,COUNT(*) AS count FROM nova_grading_jobs GROUP BY status')});
 }
 const ticketResult=await require('./tickets').tickets({q,u,route,req,data,url,scope,send,res,fail,id,text,audit});if(ticketResult)return ticketResult;
                const feature = await demoRoutes({q,u,route,req,data,url,scope,lessonScope,send,res,fail,id,text,integer,audit,store,demo});
                if(feature)return feature;
                const rag = await ragRoutes({q,u,route,req,data,scope,lessonScope,send,res,fail,id,text});
                if(rag)return rag;
                const learning = await learningRoutes({ q, u, route, req, data, url, scope, lessonScope, send, res, fail, id, integer });
                if (learning)
                    return learning;
                const extra = await extensions({ q, u, route, req, data, url, scope, lessonScope, send, res, fail, id, text, integer, audit, hashPassword, verifyPassword, hash });
                if (extra)
                    return extra;
                if(route==='/profile/details' && req.method==='GET')return send(res,200,{name:u.name,...(await q.one('SELECT phone,address FROM nova_contact WHERE user_id=?',[u.id])||{phone:'',address:''})});
                if(route==='/profile/details' && req.method==='POST'){
                  const name=text(data.name,120),phone=text(data.phone,32,0),address=text(data.address,1000,0);
                  if(phone&&!/^[+0-9۰-۹٠-٩ ()-]+$/.test(phone))fail(400,'شماره تماس معتبر نیست.');
                  await q.run('UPDATE nova_users SET name=? WHERE id=?',[name,u.id]);
                  await q.run('INSERT INTO nova_contact(user_id,phone,address) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET phone=excluded.phone,address=excluded.address',[u.id,phone,address]);return send(res,200,{ok:true});
                }
                if(route==='/lesson-note'){
                  const lid=id(req.method==='GET'?url.searchParams.get('lessonId'):data.lessonId);await lessonScope(q,u,lid);
                  if(req.method==='GET')return send(res,200,{body:(await q.one('SELECT body FROM nova_lesson_notes WHERE user_id=? AND lesson_id=?',[u.id,lid]))?.body||''});
                  if(req.method==='POST'){const body=text(data.body,10000,0);if(!body)await q.run('DELETE FROM nova_lesson_notes WHERE user_id=? AND lesson_id=?',[u.id,lid]);else await q.run('INSERT INTO nova_lesson_notes(user_id,lesson_id,body,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at',[u.id,lid,body,now()]);return send(res,200,{ok:true});}
                }
                if(route==='/profile' && req.method==='GET')return send(res,200,{user:publicUser(u),avatar:(await q.one('SELECT avatar FROM nova_profiles WHERE user_id=?',[u.id]))?.avatar||1});
                if(route==='/profile' && req.method==='POST'){
                    const avatar=integer(data.avatar,1,8);
                    await q.run('INSERT INTO nova_profiles(user_id,avatar) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET avatar=excluded.avatar',[u.id,avatar]);
                    return send(res,200,{avatar});
                }
                if(route==='/notes' && req.method==='GET')return send(res,200,{notes:await q.all('SELECT id,body,updated_at FROM nova_notes WHERE user_id=? ORDER BY updated_at DESC LIMIT 200',[u.id])});
                if(route==='/notes' && req.method==='POST'){
                    const body=text(data.body,10000),noteId=data.id?id(data.id):randomUUID();
                    if(data.id){if(!await q.one('SELECT id FROM nova_notes WHERE id=? AND user_id=?',[noteId,u.id]))fail(404,'یادداشت پیدا نشد.');await q.run('UPDATE nova_notes SET body=?,updated_at=? WHERE id=? AND user_id=?',[body,now(),noteId,u.id]);}
                    else await q.run('INSERT INTO nova_notes(id,user_id,body,updated_at) VALUES(?,?,?,?)',[noteId,u.id,body,now()]);
                    return send(res,200,{id:noteId});
                }
                if(route==='/notes/delete' && req.method==='POST'){await q.run('DELETE FROM nova_notes WHERE id=? AND user_id=?',[id(data.id),u.id]);return send(res,200,{ok:true});}
                if (route === '/me' && req.method === 'GET')
                    return send(res, 200, { user: publicUser(u), demoMode: demo });
                if (route === '/logout' && req.method === 'POST') {
                    const cookieName = sessionCookieName(req);
                    const token = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
                    if (token)
                        await q.run('DELETE FROM nova_sessions WHERE token_hash=?', [hash(token)]);
                    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', true, portalRole) });
                }
                if (route === '/users') {
                    if (u.role !== 'admin')
                        fail(403, 'فقط مدیر به کاربران دسترسی دارد.');
                    if (req.method === 'GET')
                        return send(res, 200, { users: (await q.all('SELECT * FROM nova_users ORDER BY created_at DESC LIMIT 500')).map(publicUser) });
                    const username = text(data.username, 80).toLowerCase();
                    if (!/^[a-z0-9_.-]{3,80}$/.test(username))
                        fail(400, 'نام کاربری باید لاتین و حداقل ۳ نویسه باشد.');
                    if (!['teacher', 'student'].includes(data.role))
                        fail(400, 'نقش مجاز نیست.');
                    const uid = randomUUID();
                    await q.run('INSERT INTO nova_users(id,username,name,role,password_hash,active,created_at) VALUES(?,?,?,?,?,1,?)', [uid, username, text(data.name), data.role, newHash, now()]);
                    await audit(q, u, 'user.create', uid);
                    return send(res, 201, { id: uid });
                }
                let match = route.match(/^\/users\/([^/]+)\/active$/);
                if (match && req.method === 'POST') {
                    if (u.role !== 'admin')
                        fail(403, 'فقط مدیر مجاز است.');
                    if (typeof data.active !== 'boolean')
                        fail(400, 'وضعیت معتبر نیست.');
                    const target = await q.one('SELECT * FROM nova_users WHERE id=?', [id(match[1])]);
                    if (!target || target.role === 'admin')
                        fail(400, 'تغییر این حساب مجاز نیست.');
                    await q.run('UPDATE nova_users SET active=? WHERE id=?', [data.active ? 1 : 0, target.id]);
                    await q.run('DELETE FROM nova_sessions WHERE user_id=?', [target.id]);
                    await audit(q, u, 'user.active', target.id);
                    return send(res, 200, { ok: true });
                }
                if (route === '/courses') {
                    if (req.method === 'GET') {
                        const courses = await q.all(u.role === 'admin' ? 'SELECT * FROM nova_courses ORDER BY created_at' : u.role === 'teacher' ? 'SELECT c.* FROM nova_courses c JOIN nova_teachers t ON t.course_id=c.id WHERE t.user_id=? ORDER BY c.created_at' : "SELECT c.* FROM nova_courses c JOIN nova_enrollments e ON e.course_id=c.id WHERE e.user_id=? AND e.status='active' AND c.status='published' ORDER BY c.created_at", u.role === 'admin' ? [] : [u.id]);
                        return send(res, 200, { courses });
                    }
                    if (u.role !== 'admin')
                        fail(403, 'فقط مدیر دوره ایجاد می‌کند.');
                    const cid = randomUUID();
                    await q.run("INSERT INTO nova_courses(id,title,description,status,created_by,created_at) VALUES(?,?,?,'draft',?,?)", [cid, text(data.title), text(data.description || ' ', 4000, 0), u.id, now()]);
                    await audit(q, u, 'course.create', cid);
                    return send(res, 201, { id: cid });
                }
                match = route.match(/^\/courses\/([^/]+)(?:\/(members|status|lessons|results))?$/);
                if (match) {
                    const cid = id(match[1]), action = match[2];
                    const c = await scope(q, u, cid, req.method === 'POST' && action !== 'lessons');
                    if (!action && req.method === 'GET') {
                        const lessons = await q.all('SELECT id,position,draft_json,draft_rev,published_version,status FROM nova_lessons WHERE course_id=?' + (u.role === 'student' ? " AND status='published'" : '') + ' ORDER BY position', [cid]);
                        const list = [];
                        for (const l of lessons) {
                            let content = u.role === 'student' ? await published(q, l, l.published_version) : JSON.parse(l.draft_json);
                            list.push({ id: l.id, title: content.title, cover: content.cover || null, position: l.position, status: l.status, draftRev: l.draft_rev, version: l.published_version, ...(u.role === 'student' ? { progress: await progress(q, u, l, l.published_version) } : {}) });
                        }
                        return send(res, 200, { course: c, lessons: list });
                    }
                    if (action === 'members') {
                        if (u.role !== 'admin')
                            fail(403, 'فقط مدیر عضویت را تغییر می‌دهد.');
                        if (req.method === 'GET')
                            return send(res, 200, { teachers: await q.all('SELECT u.id,u.name,u.username FROM nova_teachers t JOIN nova_users u ON u.id=t.user_id WHERE t.course_id=?', [cid]), students: await q.all('SELECT u.id,u.name,u.username,e.status FROM nova_enrollments e JOIN nova_users u ON u.id=e.user_id WHERE e.course_id=?', [cid]) });
                        const target = await q.one('SELECT * FROM nova_users WHERE id=?', [id(data.userId)]);
                        if (!target || !target.active || !['teacher', 'student'].includes(target.role))
                            fail(400, 'حساب مناسب نیست.');
                        if (typeof data.active !== 'boolean')
                            fail(400, 'وضعیت معتبر نیست.');
                        if (target.role === 'teacher') {
                            if (data.active)
                                await q.run('INSERT INTO nova_teachers(course_id,user_id) VALUES(?,?) ON CONFLICT DO NOTHING', [cid, target.id]);
                            else
                                await q.run('DELETE FROM nova_teachers WHERE course_id=? AND user_id=?', [cid, target.id]);
                        }
                        else
                            await q.run('INSERT INTO nova_enrollments(course_id,user_id,status) VALUES(?,?,?) ON CONFLICT(course_id,user_id) DO UPDATE SET status=excluded.status', [cid, target.id, data.active ? 'active' : 'withdrawn']);
                        await audit(q, u, 'course.membership', target.id);
                        return send(res, 200, { ok: true });
                    }
                    if (action === 'status' && req.method === 'POST') {
                        if (u.role !== 'admin')
                            fail(403, 'فقط مدیر وضعیت دوره را تعیین می‌کند.');
                        if (!['draft', 'published', 'archived'].includes(data.status))
                            fail(400, 'وضعیت معتبر نیست.');
                        if (data.status === 'published' && !await q.one("SELECT id FROM nova_lessons WHERE course_id=? AND status='published' LIMIT 1", [cid]))
                            fail(400, 'ابتدا یک درس منتشر کنید.');
                        await q.run('UPDATE nova_courses SET status=? WHERE id=?', [data.status, cid]);
                        await audit(q, u, 'course.' + data.status, cid);
                        return send(res, 200, { ok: true });
                    }
                    if (action === 'lessons' && req.method === 'POST') {
                        if (!['teacher', 'admin'].includes(u.role))
                            fail(403, 'فقط مدرس یا مدیر درس می‌سازد.');
                        const doc = validateLesson(data), lid = randomUUID();
                        if(doc.examId&&!await q.one('SELECT id FROM nova_exams WHERE id=? AND course_id=?',[doc.examId,cid]))fail(400,'آزمون باید متعلق به همین دوره باشد.');
                        const row = await q.one('SELECT MAX(position) AS last FROM nova_lessons WHERE course_id=?', [cid]);
                        await q.run("INSERT INTO nova_lessons(id,course_id,position,draft_json,draft_rev,published_version,status,created_by) VALUES(?,?,?,?,1,0,'draft',?)", [lid, cid, (row?.last ?? -1) + 1, JSON.stringify(doc), u.id]);
                        await audit(q, u, 'lesson.create', lid);
                        return send(res, 201, { id: lid });
                    }
                    if (action === 'results' && req.method === 'GET') {
                        if (u.role === 'student')
                            fail(403, 'فقط مدرس یا مدیر گزارش را می‌بیند.');
                        const rows = await q.all(`SELECT u.id AS student_id,u.name,u.username,e.status AS enrollment_status,l.id AS lesson_id,l.published_version,l.status AS lesson_status,v.content_json,p.video_ack,p.completed_at,(SELECT r.grade FROM nova_reviews r JOIN nova_practice p2 ON p2.id=r.submission_id WHERE p2.user_id=u.id AND p2.lesson_id=l.id AND p2.version=l.published_version ORDER BY r.updated_at DESC LIMIT 1) AS practice_grade,(SELECT MAX(a.score) FROM nova_attempts a WHERE a.user_id=u.id AND a.lesson_id=l.id AND a.version=l.published_version) AS best_score,(SELECT COUNT(*) FROM nova_attempts a WHERE a.user_id=u.id AND a.lesson_id=l.id AND a.version=l.published_version) AS attempts,(SELECT COUNT(*) FROM nova_practice x WHERE x.user_id=u.id AND x.lesson_id=l.id AND x.version=l.published_version) AS practices FROM nova_enrollments e JOIN nova_users u ON u.id=e.user_id JOIN nova_lessons l ON l.course_id=e.course_id AND l.published_version>0 JOIN nova_versions v ON v.lesson_id=l.id AND v.version=l.published_version LEFT JOIN nova_progress p ON p.user_id=u.id AND p.lesson_id=l.id AND p.version=l.published_version WHERE e.course_id=? ORDER BY u.name,l.position`, [cid]);
                        return send(res, 200, { results: rows.map(({ content_json, ...r }) => ({ ...r, title: JSON.parse(content_json).title })) });
                    }
                }
                match = route.match(/^\/lessons\/([^/]+)(?:\/(publish|unpublish|practice|quiz|progress|complete))?$/);
                if (match) {
                    const lid = id(match[1]), action = match[2];
                    const writing = ['publish', 'unpublish'].includes(action) || (!action && req.method === 'POST');
                    const lesson = await lessonScope(q, u, lid, writing);
                    if (!action && req.method === 'GET') {
                        const doc = u.role === 'student' ? await published(q, lesson, lesson.published_version) : JSON.parse(lesson.draft_json);
                        return send(res, 200, { id: lid, courseId: lesson.course_id, version: lesson.published_version, draftRev: lesson.draft_rev, status: lesson.status, content: u.role === 'student' ? studentContent(doc) : doc, ...(u.role === 'student' ? { progress: await progress(q, u, lesson, lesson.published_version) } : {}) });
                    }
                    if (!action && req.method === 'POST') {
                        const rev = integer(data.draftRev, 1, 1000000);
                        if (rev !== lesson.draft_rev)
                            fail(409, 'پیش‌نویس تغییر کرده است؛ دوباره دریافت کنید.');
                        const doc = validateLesson(data);
                        if(doc.examId&&!await q.one('SELECT id FROM nova_exams WHERE id=? AND course_id=?',[doc.examId,lesson.course_id]))fail(400,'آزمون باید متعلق به همین دوره باشد.');
                        await q.run('UPDATE nova_lessons SET draft_json=?,draft_rev=draft_rev+1 WHERE id=?', [JSON.stringify(doc), lid]);
                        await audit(q, u, 'lesson.save', lid);
                        return send(res, 200, { draftRev: rev + 1 });
                    }
                    if (action === 'publish' && req.method === 'POST') {
                        if (data.draftRev !== lesson.draft_rev)
                            fail(409, 'پیش‌نویس تغییر کرده است.');
                        const doc = validateLesson(JSON.parse(lesson.draft_json), true);
                        for(const block of doc.blocks){const source=block.sourceUrl||(block.imageUrl?.startsWith('/api/platform/files/')?block.imageUrl:null);if(source){const media=await q.one('SELECT course_id,status FROM nova_media WHERE id=?',[source.split('/').pop()]);if(!media||media.course_id!==lesson.course_id||media.status!=='approved')fail(400,'رسانه باید متعلق به همین دوره و تأییدشده باشد.');}}
                        const version = lesson.published_version + 1;
                        await q.run('INSERT INTO nova_versions(lesson_id,version,content_json,published_by,published_at) VALUES(?,?,?,?,?)', [lid, version, JSON.stringify(doc), u.id, now()]);
                        await q.run("UPDATE nova_lessons SET published_version=?,status='published' WHERE id=?", [version, lid]);
                        await audit(q, u, 'lesson.publish', lid);
                        return send(res, 200, { version });
                    }
                    if (action === 'unpublish' && req.method === 'POST') {
                        await q.run("UPDATE nova_lessons SET status='draft' WHERE id=?", [lid]);
                        await audit(q, u, 'lesson.unpublish', lid);
                        return send(res, 200, { ok: true });
                    }
                    if (['practice', 'quiz', 'progress', 'complete'].includes(action) && req.method === 'POST') {
                        if (u.role !== 'student')
                            fail(403, 'این عملیات برای دانش‌آموز است.');
                        const version = integer(data.version, 1, 1000000), doc = await published(q, lesson, version);
                        if (action === 'practice') {
                            const submission = id(data.submissionId), code = text(data.code, 4000);
                            const prev = await q.one('SELECT * FROM nova_practice WHERE id=?', [submission]);
                            if (prev) {
                                if (prev.user_id !== u.id || prev.lesson_id !== lid || prev.version !== version || prev.code !== code)
                                    fail(409, 'شناسه ارسال تکراری است.');
                            }
                            else {
                                const n = await q.one('SELECT COUNT(*) AS n FROM nova_practice WHERE user_id=? AND lesson_id=? AND version=?', [u.id, lid, version]);
                                if (Number(n.n) >= 100)
                                    fail(429, 'حداکثر ارسال تمرین این نسخه ثبت شده است.');
                                await q.run('INSERT INTO nova_practice(id,user_id,lesson_id,version,code,created_at) VALUES(?,?,?,?,?,?)', [submission, u.id, lid, version, code, now()]);
                            }
                            if (doc.exercise.gradingTests?.length)
                                await q.run("INSERT INTO nova_grading_jobs(submission_id,status,updated_at) VALUES(?,'queued',?) ON CONFLICT DO NOTHING", [submission, now()]);
                            return send(res, 200, { submitted: true, graded: false, gradingStatus: doc.exercise.gradingTests?.length ? 'queued' : 'manual' });
                        }
                        if (action === 'quiz') {
                            const attempt = id(data.attemptId);
                            if (!Array.isArray(data.answers) || data.answers.length !== doc.quiz.length)
                                fail(400, 'به تمام سؤال‌ها پاسخ دهید.');
                            const answers = data.answers.map((answer, i) => integer(answer, 0, doc.quiz[i].options.length - 1));
                            const encoded = JSON.stringify(answers);
                            const prev = await q.one('SELECT * FROM nova_attempts WHERE id=?', [attempt]);
                            if (prev) {
                                if (prev.user_id !== u.id || prev.lesson_id !== lid || prev.version !== version || prev.answers_json !== encoded)
                                    fail(409, 'شناسه تلاش تکراری است.');
                                return send(res, 200, { score: prev.score, passed: prev.score >= doc.passScore });
                            }
                            const n = await q.one('SELECT COUNT(*) AS n FROM nova_attempts WHERE user_id=? AND lesson_id=? AND version=?', [u.id, lid, version]);
                            if (Number(n.n) >= 20)
                                fail(429, 'حداکثر ۲۰ تلاش برای این نسخه مجاز است.');
                            const score = Math.round(100 * answers.filter((x, i) => x === doc.quiz[i].correct).length / doc.quiz.length);
                            await q.run('INSERT INTO nova_attempts(id,user_id,lesson_id,version,answers_json,score,created_at) VALUES(?,?,?,?,?,?,?)', [attempt, u.id, lid, version, encoded, score, now()]);
                            return send(res, 200, { score, passed: score >= doc.passScore });
                        }
                        if (action === 'progress') {
                            if (data.videoAcknowledged !== true)
                                fail(400, 'تأیید مشاهده ویدیو لازم است.');
                            await q.run('INSERT INTO nova_progress(user_id,lesson_id,version,video_ack,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(user_id,lesson_id,version) DO UPDATE SET video_ack=1,updated_at=excluded.updated_at', [u.id, lid, version, now()]);
                            return send(res, 200, await progress(q, u, lesson, version));
                        }
                        if (doc.exercise.gradingTests?.length) {
                            const scores = await q.one('SELECT MAX(g.score) AS score FROM nova_grading_jobs g JOIN nova_practice p ON p.id=g.submission_id WHERE p.user_id=? AND p.lesson_id=? AND p.version=? AND g.status=?', [u.id, lid, version, 'completed']);
                            const manual = await q.one('SELECT MAX(r.grade) AS score FROM nova_reviews r JOIN nova_practice p ON p.id=r.submission_id WHERE p.user_id=? AND p.lesson_id=? AND p.version=?', [u.id, lid, version]);
                            if (Math.max(scores?.score ?? -1, manual?.score ?? -1) < doc.passScore)
                                fail(409, 'ابتدا ارزیابی خودکار موفق یا نمره تأییدشده مدرس لازم است.');
                        }
                        const p = await progress(q, u, lesson, version);
                        if (!p.videoAcknowledged || !p.practiceSubmitted || p.bestScore === null || p.bestScore < doc.passScore)
                            fail(409, 'تأیید ویدیو، ارسال تمرین و قبولی آزمون لازم است.');
                        await q.run('UPDATE nova_progress SET completed_at=COALESCE(completed_at,?),updated_at=? WHERE user_id=? AND lesson_id=? AND version=?', [now(), now(), u.id, lid, version]);
                        return send(res, 200, await progress(q, u, lesson, version));
                    }
                }
                fail(404, 'مسیر پیدا نشد.');
            });
        }
        catch (error) {
            if (res.headersSent)
                return;
            const status = error.status || (error.code === '23505' || String(error.code).includes('CONSTRAINT_UNIQUE') || String(error.message).includes('UNIQUE constraint') ? 409 : 503);
            if (status >= 500)
                console.error('Platform request failed:', error.code || 'storage');
            return send(res, status, { error: error.status ? error.message : status === 409 ? 'این رکورد قبلاً وجود دارد.' : 'سرویس موقتاً در دسترس نیست.' });
        }
    }
    const dummyHash = hashPassword(require('node:crypto').randomBytes(32).toString('hex'));
    return { async handler(req, res) {
            const result = await dispatch(req, res);
            if (!result || result.streamed)
                return;
            res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...result.headers });
            res.end(JSON.stringify(result.data));
        }, bootstrap };
}
module.exports = { createPlatform, validateLesson, studentContent, scope };

module.exports.aiScope = {scope,lessonScope,studentContent};
