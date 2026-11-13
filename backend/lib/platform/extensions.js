'use strict';
const { randomUUID, randomBytes, createHash } = require('node:crypto');
const stamp = () => new Date().toISOString();
async function limit(q, key, max = 5, window = 900000) { const k = createHash('sha256').update(key).digest('hex'); const row = await q.one('SELECT * FROM nova_throttles WHERE key_hash=?', [k]); const fresh = !row || Date.now() - Number(row.window_at) > window; if (!fresh && row.failures >= max)
    throw Object.assign(new Error('درخواست زیاد است؛ کمی بعد تلاش کنید.'), { status: 429 }); await q.run('INSERT INTO nova_throttles(key_hash,failures,window_at) VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET failures=excluded.failures,window_at=excluded.window_at', [k, fresh ? 1 : row.failures + 1, fresh ? Date.now() : Number(row.window_at)]); }
async function publicRecovery({ store, route, req, data, send, res, hashPassword, hash, fail }) {
    if (!['/recovery/request', '/recovery/complete'].includes(route) || req.method !== 'POST')
        return null;
    const token = typeof data.token === 'string' ? data.token : '';
    if (route === '/recovery/request')
        return store.tx(async (q) => { await limit(q, 'recovery-request:' + require('./demo-features').clientIp(req), 5); const username = String(data.username || '').trim().toLowerCase().slice(0, 80); if (!username)
            fail(400, 'نام کاربری را وارد کنید.'); const user = await q.one('SELECT id FROM nova_users WHERE username=? AND active=1', [username]); if (user)
            await q.run('INSERT INTO nova_recovery_requests(id,username,user_id,status,created_at) VALUES(?,?,?,\'open\',?)', [randomUUID(), username, user.id, stamp()]); return send(res, 200, { message: 'اگر حساب فعال باشد، درخواست برای مدیر ثبت می‌شود. کد بازیابی را پس از تأیید هویت از مدیر دریافت کنید.' }); });
    if (!/^[a-f0-9]{64}$/.test(token) || typeof data.password !== 'string' || data.password.length < 12 || data.password.length > 256)
        fail(400, 'کد یا گذرواژه معتبر نیست.');
    // Reserve a request slot before expensive hashing, including invalid/expired codes.
    await store.tx(q => limit(q, 'recovery-complete:' + require('./demo-features').clientIp(req), 8));
    const encoded = await hashPassword(data.password);
    return store.tx(async (q) => { const row = await q.one('SELECT t.* FROM nova_reset_tokens t JOIN nova_users u ON u.id=t.user_id WHERE t.token_hash=? AND t.used_at IS NULL AND t.expires_at>? AND u.active=1' + (q.postgres ? ' FOR UPDATE OF t' : ''), [hash(token), stamp()]); if (!row)
        fail(400, 'کد بازیابی منقضی یا استفاده شده است.'); await require('./demo-features').lockIdentity(q,row.user_id); await q.run('UPDATE nova_users SET password_hash=? WHERE id=?', [encoded, row.user_id]); await q.run('UPDATE nova_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL', [stamp(), row.user_id]); await q.run('DELETE FROM nova_sessions WHERE user_id=?', [row.user_id]); await q.run("UPDATE nova_recovery_requests SET status='resolved' WHERE user_id=? AND status IN('open','issued')", [row.user_id]); await q.run('INSERT INTO nova_audit(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)', [randomUUID(), row.user_id, 'account.recovered', row.user_id, stamp()]); return send(res, 200, { message: 'گذرواژه تغییر کرد. با گذرواژه تازه وارد شوید.' }); });
}
async function checkPrerequisites(q, u, lesson) { const current=await q.one('SELECT course_id,position FROM nova_lessons WHERE id=?',[lesson.id]);if(current){const previous=await q.one("SELECT l.id,l.published_version,v.content_json FROM nova_lessons l JOIN nova_versions v ON v.lesson_id=l.id AND v.version=l.published_version WHERE l.course_id=? AND l.position<? AND l.status='published' ORDER BY l.position DESC LIMIT 1",[current.course_id,current.position]);if(previous&&JSON.parse(previous.content_json).completion?.gateNext===true&&!await q.one('SELECT lesson_id FROM nova_progress WHERE user_id=? AND lesson_id=? AND version=? AND completed_at IS NOT NULL',[u.id,previous.id,previous.published_version]))throw Object.assign(new Error('ابتدا جلسه قبل را طبق شرایط دبیر تکمیل کنید.'),{status:403});}const missing = await q.one(`SELECT r.required_id FROM nova_prerequisites r JOIN nova_lessons l ON l.id=r.required_id LEFT JOIN nova_progress p ON p.lesson_id=l.id AND p.user_id=? AND p.version=l.published_version WHERE r.lesson_id=? AND (l.status<>'published' OR p.completed_at IS NULL) LIMIT 1`, [u.id, lesson.id]); if (missing)
    throw Object.assign(new Error('ابتدا درس‌های پیش‌نیاز را تکمیل کنید.'), { status: 403 }); }
async function extensions(ctx) {
    const { q, u, route, req, data, url, scope, lessonScope, send, res, fail, id, text, integer, audit, hashPassword, verifyPassword, hash } = ctx;
    if (route === '/account/password' && req.method === 'POST') {
        await limit(q, 'password-change:' + u.id, 5);
        if (!await verifyPassword(String(data.currentPassword || ''), u.password_hash))
            return send(res, 400, { error: 'گذرواژه فعلی صحیح نیست.' });
        if (typeof data.password !== 'string' || data.password.length < 12 || data.password.length > 256)
            fail(400, 'گذرواژه تازه باید ۱۲ تا ۲۵۶ نویسه باشد.');
        const encoded = await hashPassword(data.password);
        await require('./demo-features').lockIdentity(q,u.id);
        const freshUser=await q.one('SELECT password_hash FROM nova_users WHERE id=?',[u.id]);
        if(freshUser.password_hash!==u.password_hash)fail(409,'گذرواژه تغییر کرده است؛ دوباره وارد شوید.');
        await q.run('UPDATE nova_users SET password_hash=? WHERE id=?', [encoded, u.id]);
        await q.run('DELETE FROM nova_sessions WHERE user_id=?', [u.id]);
        await audit(q, u, 'account.password', u.id);
        return send(res, 200, { message: 'گذرواژه تغییر کرد؛ دوباره وارد شوید.' });
    }
    if (route === '/admin/recovery' && req.method === 'GET') {
        if (u.role !== 'admin')
            fail(403, 'فقط مدیر مجاز است.');
        return send(res, 200, { requests: await q.all('SELECT r.id,r.username,r.status,r.created_at,u.name,u.role FROM nova_recovery_requests r JOIN nova_users u ON u.id=r.user_id ORDER BY r.created_at DESC LIMIT 100') });
    }
    let match = route.match(/^\/users\/([^/]+)\/recovery$/);
    if (match && req.method === 'POST') {
        if (u.role !== 'admin')
            fail(403, 'فقط مدیر مجاز است.');
        const target = await q.one('SELECT * FROM nova_users WHERE id=?', [id(match[1])]);
        if (!target || !target.active || target.role === 'admin')
            fail(400, 'برای این حساب نمی‌توان کد صادر کرد.');
        if (data.identityConfirmed !== true)
            fail(400, 'تأیید هویت صاحب حساب لازم است.');
        await limit(q, 'reset-issue:' + target.id, 5);
        await require('./demo-features').lockIdentity(q,target.id);
        const token = randomBytes(32).toString('hex'), expiresAt = new Date(Date.now() + 900000).toISOString();
        await q.run('UPDATE nova_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL', [stamp(), target.id]);
        await q.run('INSERT INTO nova_reset_tokens(token_hash,user_id,expires_at,issued_by) VALUES(?,?,?,?)', [hash(token), target.id, expiresAt, u.id]);
        await q.run("UPDATE nova_users SET password_hash='!reset-required' WHERE id=?", [target.id]);
        await q.run('DELETE FROM nova_sessions WHERE user_id=?', [target.id]);
        await q.run("UPDATE nova_recovery_requests SET status='issued' WHERE user_id=? AND status='open'", [target.id]);
        await audit(q, u, 'account.recovery-issued', target.id);
        return send(res, 200, { token, expiresAt, message: 'کد یک‌بارمصرف است؛ آن را فقط به صاحب حساب تأییدشده بدهید. ورود قبلی غیرفعال شد.' });
    }
    if (route === '/admin/operations' && req.method === 'GET') {
        if (u.role !== 'admin')
            fail(403, 'فقط مدیر مجاز است.');
        return send(res, 200, { metrics: require('./monitor').snapshot(), storage: q.postgres ? 'postgresql' : 'sqlite-local', backupConfigured: require('./backup').keyConfigured(), users: Number((await q.one('SELECT COUNT(*) AS n FROM nova_users')).n), courses: Number((await q.one('SELECT COUNT(*) AS n FROM nova_courses')).n), audit: await q.all('SELECT a.action,a.target_id,a.created_at,u.name FROM nova_audit a JOIN nova_users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 100'), videoHost: 'stream.novextech.ir', videoProtection: 'provider-verification-required' });
    }
    if (route === '/admin/backup' && req.method === 'POST') {
        if (u.role !== 'admin')
            fail(403, 'فقط مدیر مجاز است.');
        await limit(q, 'backup:' + u.id, 3, 3600000);
        const result = await require('./backup').snapshot(q);
        await audit(q, u, 'backup.created', result.filename);
        return send(res, 200, result);
    }
    match = route.match(/^\/lessons\/([^/]+)\/submissions$/);
    if (match && req.method === 'GET') {
        const lesson = await lessonScope(q, u, match[1]);
        const rows = await q.all(`SELECT p.id,p.user_id,p.version,p.code,p.created_at,u.name,r.grade,r.feedback,r.revision,r.updated_at AS reviewed_at FROM nova_practice p JOIN nova_users u ON u.id=p.user_id LEFT JOIN nova_reviews r ON r.submission_id=p.id WHERE p.lesson_id=?${u.role === 'student' ? ' AND p.user_id=?' : ''} ORDER BY p.created_at DESC LIMIT 100`, u.role === 'student' ? [lesson.id, u.id] : [lesson.id]);
        return send(res, 200, { submissions: rows });
    }
    match = route.match(/^\/submissions\/([^/]+)\/review$/);
    if (match && req.method === 'POST') {
        if (u.role === 'student')
            fail(403, 'فقط مدرس یا مدیر بازبینی می‌کند.');
        const submission = await q.one('SELECT * FROM nova_practice WHERE id=?', [id(match[1])]);
        if (!submission)
            fail(404, 'تمرین پیدا نشد.');
        await lessonScope(q, u, submission.lesson_id, true);
        const existing = await q.one('SELECT revision FROM nova_reviews WHERE submission_id=?', [submission.id]);
        const rev = existing?.revision || 0;
        if (data.revision !== rev)
            fail(409, 'بازخورد تغییر کرده است؛ تازه‌سازی کنید.');
        const grade = integer(data.grade, 0, 100), feedback = text(data.feedback, 8000);
        await q.run('INSERT INTO nova_reviews(submission_id,reviewer_id,grade,feedback,revision,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(submission_id) DO UPDATE SET reviewer_id=excluded.reviewer_id,grade=excluded.grade,feedback=excluded.feedback,revision=excluded.revision,updated_at=excluded.updated_at', [submission.id, u.id, grade, feedback, rev + 1, stamp()]);
        await audit(q, u, 'practice.review', submission.id);
        return send(res, 200, { revision: rev + 1 });
    }
    match = route.match(/^\/courses\/([^/]+)\/(structure|modules|organize)$/);
    if (match) {
        const cid = id(match[1]), action = match[2];
        await scope(q, u, cid, req.method === 'POST');
        const lessons = await q.all('SELECT id,position,published_version,status FROM nova_lessons WHERE course_id=? ORDER BY position', [cid]);
        if (action === 'structure' && req.method === 'GET') {
            const prereqs = await q.all('SELECT p.lesson_id,p.required_id FROM nova_prerequisites p JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=?', [cid]);
            const layout = await q.all('SELECT x.lesson_id,x.module_id FROM nova_lesson_layout x JOIN nova_lessons l ON l.id=x.lesson_id WHERE l.course_id=?', [cid]);
            const modules = await q.all('SELECT * FROM nova_modules WHERE course_id=? ORDER BY position', [cid]);
            const locks = [];
            if (u.role === 'student')
                for (const l of lessons) {
                    try {
                        await checkPrerequisites(q, u, l);
                    }
                    catch {
                        locks.push(l.id);
                    }
                }
            return send(res, 200, { modules, layout, prerequisites: prereqs, locked: locks, revision: (await q.one('SELECT revision FROM nova_course_revisions WHERE course_id=?', [cid]))?.revision || 0, order: lessons.filter(l => u.role !== 'student' || l.status === 'published').map(l => l.id) });
        }
        if (u.role === 'student')
            fail(403, 'فقط مدرس یا مدیر ساختار دوره را تغییر می‌دهد.');
        const bump = () => q.run('INSERT INTO nova_course_revisions(course_id,revision) VALUES(?,1) ON CONFLICT(course_id) DO UPDATE SET revision=nova_course_revisions.revision+1', [cid]);
        if (action === 'modules' && req.method === 'POST') {
            const mid = randomUUID();
            const last = await q.one('SELECT MAX(position) AS n FROM nova_modules WHERE course_id=?', [cid]);
            await q.run('INSERT INTO nova_modules(id,course_id,title,position) VALUES(?,?,?,?)', [mid, cid, text(data.title), (last.n ?? -1) + 1]);
            await bump();
            await audit(q, u, 'module.create', mid);
            return send(res, 201, { id: mid });
        }
        if (action === 'organize' && req.method === 'POST') {
            const current = (await q.one('SELECT revision FROM nova_course_revisions WHERE course_id=?', [cid]))?.revision || 0;
            if (data.revision !== current)
                fail(409, 'ساختار دوره تغییر کرده است.');
            const ids = lessons.map(l => l.id);
            if (!Array.isArray(data.order) || data.order.length !== ids.length || new Set(data.order).size !== ids.length || data.order.some(x => !ids.includes(x)))
                fail(400, 'ترتیب باید تمام درس‌های همین دوره را شامل شود.');
            const mods = await q.all('SELECT id FROM nova_modules WHERE course_id=?', [cid]);
            if(data.chapterOrder!==undefined){const order=data.chapterOrder;if(!Array.isArray(order)||order.length!==mods.length||new Set(order).size!==mods.length||order.some(mid=>!mods.some(m=>m.id===mid)))fail(400,'ترتیب فصل‌ها معتبر نیست.');const highest=await q.one('SELECT MAX(position) AS n FROM nova_modules WHERE course_id=?',[cid]);await q.run('UPDATE nova_modules SET position=position+? WHERE course_id=?',[Number(highest?.n||0)+mods.length+1000,cid]);for(let i=0;i<order.length;i++)await q.run('UPDATE nova_modules SET position=? WHERE id=? AND course_id=?',[i,order[i],cid]);}
            const layout = data.layout || [];
            if (!Array.isArray(layout) || layout.length > ids.length || new Set(layout.filter(Boolean).map(x => x.lessonId)).size !== layout.length || layout.some(x => !x || typeof x !== 'object') || layout.some(x => !ids.includes(x.lessonId) || (x.moduleId && !mods.some(m => m.id === x.moduleId))))
                fail(400, 'فصل‌بندی معتبر نیست.');
            const edges = data.prerequisites || [];
            if (!Array.isArray(edges) || edges.length > 1000 || edges.some(e => !e || typeof e !== 'object') || edges.some(e => !ids.includes(e.lessonId) || !ids.includes(e.requires) || e.lessonId === e.requires))
                fail(400, 'پیش‌نیاز معتبر نیست.');
            const visiting = new Set(), done = new Set();
            function visit(l) { if (visiting.has(l))
                fail(400, 'چرخه در پیش‌نیازها مجاز نیست.'); if (done.has(l))
                return; visiting.add(l); for (const e of edges.filter(e => e.lessonId === l))
                visit(e.requires); visiting.delete(l); done.add(l); }
            ids.forEach(visit);
            // Offset all positions before applying a permutation, preserving the unique constraint.
            const offset = (lessons.reduce((max, l) => Math.max(max, l.position), 0) + 1000);
            await q.run('UPDATE nova_lessons SET position=position+? WHERE course_id=?', [offset, cid]);
            for (let i = 0; i < data.order.length; i++)
                await q.run('UPDATE nova_lessons SET position=? WHERE id=?', [i, data.order[i]]);
            for (const lid of ids) {
                await q.run('DELETE FROM nova_lesson_layout WHERE lesson_id=?', [lid]);
                await q.run('DELETE FROM nova_prerequisites WHERE lesson_id=?', [lid]);
            }
            for (const item of layout)
                if (item.moduleId)
                    await q.run('INSERT INTO nova_lesson_layout(lesson_id,module_id) VALUES(?,?)', [item.lessonId, item.moduleId]);
            for (const e of edges)
                await q.run('INSERT INTO nova_prerequisites(lesson_id,required_id) VALUES(?,?) ON CONFLICT DO NOTHING', [e.lessonId, e.requires]);
            await bump();
            await audit(q, u, 'course.organize', cid);
            return send(res, 200, { revision: current + 1 });
        }
    }
    return null;
}
module.exports = { extensions, publicRecovery, checkPrerequisites };
