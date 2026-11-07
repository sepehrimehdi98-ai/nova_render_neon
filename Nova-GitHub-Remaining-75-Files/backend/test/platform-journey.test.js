'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { openStore } = require('../lib/platform/store');
const { start } = require('../product-server');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
test('persistent full course journey and endpoint access boundaries', async () => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-product-'));
    const filename = path.join(folder, 'test.sqlite');
    const origin = 'http://127.0.0.1:3002';
    let app;
    let checks = 0;
    async function launch() { const store = await openStore({ filename }); app = await start({ port: 0, store, origin, demo: true }); return `http://127.0.0.1:${app.server.address().port}`; }
    let base = await launch();
    async function request(route, { cookie, body, method, foreign = false } = {}, expected = 200) { const response = await fetch(base + '/api/platform' + route, { method: method || (body === undefined ? 'GET' : 'POST'), headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { 'content-type': 'application/json', origin: foreign ? 'http://evil.test' : origin } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await response.json(); assert.equal(response.status, expected, `${route}: ${JSON.stringify(data)}`); checks++; return { data, cookie: response.headers.get('set-cookie')?.split(';')[0] }; }
    try {
        await request('/courses', {}, 401);
        await request('/login', { foreign: true, body: { demoRole: 'admin' } }, 403);
        await request('/users', { method: 'DELETE' }, 405);
        const admin = (await request('/login', { body: { demoRole: 'admin' } })).cookie, teacher = (await request('/login', { body: { demoRole: 'teacher' } })).cookie, student = (await request('/login', { body: { demoRole: 'student' } })).cookie;
        const users = (await request('/users', { cookie: admin })).data.users;
        const tid = users.find(u => u.role === 'teacher').id, sid = users.find(u => u.role === 'student').id;
        await request('/users', { cookie: student }, 403);
        const created = await request('/users', { cookie: admin, body: { username: 'new_student', name: 'New student', role: 'student', password: 'A-strong-local-password-42' } }, 201);
        await request('/login', { body: { username: 'new_student', password: 'wrong-password' } }, 401);
        const realCookie = (await request('/login', { body: { username: 'new_student', password: 'A-strong-local-password-42', role: 'admin' } })).cookie;
        assert.equal((await request('/me', { cookie: realCookie })).data.user.role, 'student');
        await request('/users', { cookie: realCookie }, 403);
        await request('/users', { cookie: admin, body: { username: 'new_student', name: 'Duplicate', role: 'student', password: 'A-strong-local-password-42' } }, 409);
        await request('/users', { cookie: admin, body: { username: 'illegal_admin', name: 'Illegal', role: 'admin', password: 'A-strong-local-password-42' } }, 400);
        await request('/users', { cookie: admin, body: { username: 'weak', name: 'Weak', role: 'student', password: 'short' } }, 400);
        await request('/courses', { cookie: teacher, body: { title: 'Forbidden' } }, 403);
        const cid = (await request('/courses', { cookie: admin, body: { title: 'Python foundations' } }, 201)).data.id;
        const other = (await request('/courses', { cookie: admin, body: { title: 'Other course' } }, 201)).data.id;
        await request(`/courses/${cid}`, { cookie: teacher }, 403);
        await request(`/courses/${cid}`, { cookie: student }, 403);
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: tid, active: true } });
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: sid, active: true } });
        await request(`/courses/${other}/results`, { cookie: teacher }, 403);
        await request(`/courses/${cid}/members`, { cookie: teacher, body: { userId: sid, active: true } }, 403);
        const doc = { title: 'Variables', blocks: [{ id: 'text-1', kind: 'text', title: 'Variables', body: 'Assign a value.', fontSize: 24, textColor: '#0f766e' }, { id: 'video-1', kind: 'video', title: 'Video', body: '', mediaId: 'immcuy8dntih' }], exercise: { prompt: 'Print a variable', starter: 'name="Nova"\nprint(name)' }, quiz: [{ prompt: 'Valid identifier?', options: ['user_name', '2name'], correct: 0 }], passScore: 70 };
        await request(`/courses/${cid}/lessons`, { cookie: teacher, body: { ...doc, blocks: [{ id: 'bad', kind: 'video', title: 'Bad', body: '', mediaId: '<script>' }] } }, 400);
        const lid = (await request(`/courses/${cid}/lessons`, { cookie: teacher, body: doc }, 201)).data.id;
        await request(`/lessons/${lid}`, { cookie: student }, 403);
        await request(`/lessons/${lid}/publish`, { cookie: student, body: { draftRev: 1 } }, 403);
        await request(`/lessons/${lid}/publish`, { cookie: teacher, body: { draftRev: 1 } });
        await request(`/courses/${cid}/status`, { cookie: admin, body: { status: 'published' } });
        await request('/profile/details',{cookie:student,body:{name:'Student Updated',phone:'+989121234567',address:'Test address'}});
        assert.equal((await request('/profile/details',{cookie:student})).data.phone,'+989121234567');
        assert.equal((await request('/profile/details',{cookie:teacher})).data.phone,'');
        await request('/profile',{cookie:student,body:{avatar:8}});
        assert.equal((await request('/profile',{cookie:student})).data.avatar,8);
        await request('/profile',{cookie:student,body:{avatar:9}},400);
        await request('/lesson-note',{cookie:student,body:{lessonId:lid,body:'Private lesson note'}});
        assert.equal((await request('/lesson-note?lessonId='+lid,{cookie:student})).data.body,'Private lesson note');
        assert.equal((await request('/lesson-note?lessonId='+lid,{cookie:teacher})).data.body,'');
        await request('/lesson-note',{cookie:student,body:{lessonId:lid,body:''}});
        assert.equal((await request('/lesson-note?lessonId='+lid,{cookie:student})).data.body,'');

        const lesson = (await request(`/lessons/${lid}`, { cookie: student })).data;
        assert.equal(lesson.content.quiz[0].correct, undefined);
        assert.equal(lesson.version, 1);
        assert.equal(lesson.content.blocks[0].fontSize, 24);
        assert.equal(lesson.content.blocks[0].textColor, '#0f766e');
        await request(`/lessons/${lid}`, { cookie: student, body: { ...doc, draftRev: 1 } }, 403);
        await request(`/lessons/${lid}/complete`, { cookie: student, body: { version: 1 } }, 409);
        await request(`/lessons/${lid}/practice`, { cookie: teacher, body: { version: 1, submissionId: randomUUID(), code: 'print(1)' } }, 403);
        const submissionId = randomUUID();
        await request(`/lessons/${lid}/practice`, { cookie: student, body: { version: 1, submissionId, code: 'print("Nova")', passed: true } });
        await request(`/lessons/${lid}/practice`, { cookie: student, body: { version: 1, submissionId, code: 'print("Nova")' } });
        await request(`/lessons/${lid}/practice`, { cookie: student, body: { version: 1, submissionId, code: 'print("changed")' } }, 409);
        await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId: randomUUID(), answers: [], score: 100 } }, 400);
        let r = await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId: randomUUID(), answers: [1], score: 100 } });
        assert.equal(r.data.score, 0);
        await request(`/lessons/${lid}/complete`, { cookie: student, body: { version: 1 } }, 409);
        const attemptId = randomUUID();
        r = await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId, answers: [0] } });
        assert.equal(r.data.score, 100);
        await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId, answers: [0] } });
        await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId, answers: [1] } }, 409);
        await request(`/lessons/${lid}/progress`, { cookie: student, body: { version: 1, videoAcknowledged: true } });
        r = await request(`/lessons/${lid}/complete`, { cookie: student, body: { version: 1 } });
        assert.ok(r.data.completedAt);
        const results = (await request(`/courses/${cid}/results`, { cookie: teacher })).data.results;
        assert.equal(results[0].best_score, 100);
        assert.equal(Number(results[0].attempts), 2);
        assert.equal(Number(results[0].practices), 1);
        assert.ok(results[0].completed_at);
        await request(`/courses/${cid}/results`, { cookie: student }, 403);
        // Editing a draft cannot change the published student's content; stale editors cannot overwrite.
        await request(`/lessons/${lid}`, { cookie: teacher, body: { ...doc, title: 'New draft', draftRev: 1 } });
        await request(`/lessons/${lid}`, { cookie: teacher, body: { ...doc, title: 'Stale', draftRev: 1 } }, 409);
        assert.equal((await request(`/lessons/${lid}`, { cookie: student })).data.content.title, 'Variables');
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: sid, active: false } });
        await request(`/lessons/${lid}`, { cookie: student }, 403);
        await request(`/lessons/${lid}/quiz`, { cookie: student, body: { version: 1, attemptId: randomUUID(), answers: [0] } }, 403);
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: sid, active: true } });
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: tid, active: false } });
        await request(`/lessons/${lid}`, { cookie: teacher }, 403);
        await request(`/courses/${cid}/members`, { cookie: admin, body: { userId: tid, active: true } });
        await request(`/lessons/${lid}/unpublish`, { cookie: teacher, body: {} });
        await request(`/lessons/${lid}`, { cookie: student }, 404);
        await request(`/lessons/${lid}/publish`, { cookie: teacher, body: { draftRev: 2 } });
        await request(`/lessons/${lid}/complete`, { cookie: student, body: { version: 1 } }, 409);
        r = await request(`/lessons/${lid}`, { cookie: student });
        assert.equal(r.data.progress.completedAt, null);
        assert.equal(r.data.version, 2);
        // A real server restart retains the database, sessions, versions and records.
        await app.close();
        base = await launch();
        assert.equal((await request('/me', { cookie: admin })).data.user.role, 'admin');
        assert.equal((await request(`/lessons/${lid}`, { cookie: student })).data.content.title, 'New draft');
        await request(`/users/${sid}/active`, { cookie: admin, body: { active: false } });
        await request('/me', { cookie: student }, 401);
        await request('/logout', { cookie: admin, body: {} });
        await request('/me', { cookie: admin }, 401);
        console.log(`Verified ${checks} HTTP assertions, persistence after restart, private grading, revocation, publication versions and idempotency.`);
    }
    finally {
        if (app)
            await app.close();
        const absolute = path.resolve(folder);
        assert.equal(path.dirname(absolute), path.resolve(os.tmpdir()));
        assert.ok(path.basename(absolute).startsWith('nova-product-'));
        fs.rmSync(absolute, { recursive: true, force: true });
    }
});
test('production rejects local role access and missing production configuration', async () => {
    const old = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
        await assert.rejects(() => start({ port: 0, origin: 'http://127.0.0.1:3002', demo: true }), /Production requires/);
        await assert.rejects(() => openStore({ filename: ':memory:', url: '' }), /Production requires/);
    }
    finally {
        if (old === undefined)
            delete process.env.NODE_ENV;
        else
            process.env.NODE_ENV = old;
    }
});

test('normal account mode rejects role bypass and unsafe requests',async()=>{
 const store=await openStore({filename:':memory:',url:''});const origin='http://127.0.0.1:3002';const app=await start({port:0,origin,demo:false,store});const base=`http://127.0.0.1:${app.server.address().port}`;
 try{await app.platform.bootstrap({username:'owner',name:'Owner',password:'A-unique-strong-password-77'});
 let r=await fetch(base+'/api/platform/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({demoRole:'admin'})});assert.equal(r.status,401);
 r=await fetch(base+'/api/platform/login',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(r.status,403);
 r=await fetch(base+'/api/platform/login',{method:'POST',headers:{origin,'content-type':'text/plain'},body:'{}'});assert.equal(r.status,415);
 r=await fetch(base+'/api/platform/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username:'owner',password:'A-unique-strong-password-77'})});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);
 assert.equal((await fetch(base+'/api/auth/login')).status,404);assert.equal((await fetch(base+'/.env')).status,404);
 }finally{await app.close();}
});
