'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { openStore } = require('../lib/platform/store');
const { start } = require('../product-server');
const { processOne, runDocker } = require('../lib/platform/grader');
test('grading queue and course analysis use private tests and server bounded activity', async () => {
    const store = await openStore({ filename: ':memory:', url: '' }), origin = 'http://127.0.0.1:3002';
    const app = await start({ port: 0, store, origin, demo: true }), base = `http://127.0.0.1:${app.server.address().port}`;
    let count = 0;
    async function call(route, cookie, body, status = 200) { const r = await fetch(base + '/api/platform' + route, { method: body === undefined ? 'GET' : 'POST', headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { origin, 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await r.json(); assert.equal(r.status, status, route + JSON.stringify(data)); count++; return { data, cookie: r.headers.get('set-cookie')?.split(';')[0] }; }
    try {
        const admin = (await call('/login', null, { demoRole: 'admin' })).cookie, teacher = (await call('/login', null, { demoRole: 'teacher' })).cookie, student = (await call('/login', null, { demoRole: 'student' })).cookie;
        const users = (await call('/users', admin)).data.users;
        const sid = users.find(u => u.role === 'student').id, tid = users.find(u => u.role === 'teacher').id;
        const cid = (await call('/courses', admin, { title: 'Analysis course' }, 201)).data.id;
        for (const uid of [sid, tid])
            await call(`/courses/${cid}/members`, admin, { userId: uid, active: true });
        const doc = { title: 'Double', blocks: [{ id: 'v', kind: 'video', title: 'Video', body: '', mediaId: 'immcuy8dntih' }], exercise: { prompt: 'Double input', starter: 'n=int(input())\nprint(n*2)', gradingTests: [{ stdin: '3', stdout: '6' }, { stdin: '8', stdout: '16' }] }, quiz: [{ prompt: 'Double of 3?', options: ['6', '3'], correct: 0 }], passScore: 70 };
        const lid = (await call(`/courses/${cid}/lessons`, teacher, doc, 201)).data.id;
        await call(`/lessons/${lid}/publish`, teacher, { draftRev: 1 });
        await call(`/courses/${cid}/status`, admin, { status: 'published' });
        const l = (await call(`/lessons/${lid}`, student)).data;
        assert.equal(l.content.exercise.gradingTests, undefined);
        assert.equal(l.content.exercise.autoGradingEnabled, true);
        const submissionId = randomUUID();
        await call(`/lessons/${lid}/practice`, student, { version: 1, submissionId, code: 'n=int(input())\nprint(n*2)', score: 100 });
        assert.equal((await call(`/lessons/${lid}/grading`, student)).data.jobs[0].status, 'queued');
        await call(`/lessons/${lid}/quiz`, student, { version: 1, attemptId: randomUUID(), answers: [0] });
        await call(`/lessons/${lid}/progress`, student, { version: 1, videoAcknowledged: true });
        await call(`/lessons/${lid}/complete`, student, { version: 1 }, 409);
        let runs = 0;
        await processOne(store, { runner: async (code, stdin) => { runs++; assert.match(code, /input/); return { ok: true, stdout: String(Number(stdin) * 2), reason: 'executed' }; } });
        assert.equal(runs, 2);
        const result = (await call(`/lessons/${lid}/grading`, student)).data.jobs[0];
        assert.equal(result.score, 100);
        assert.equal(result.status, 'completed');
        await call(`/lessons/${lid}/complete`, student, { version: 1 });
        assert.equal(await processOne(store, { runner: async () => { throw new Error('Unexpected execution'); } }), false);
        // An explicit configuration failure is not a grade and does not execute host Python.
        const blocked = randomUUID();
        await call(`/lessons/${lid}/practice`, student, { version: 1, submissionId: blocked, code: 'print(1)' });
        await processOne(store, { runner: async () => { throw new Error('GRADER_RUNTIME_UNAVAILABLE'); } });
        const blockedRow = await store.tx(q => q.one('SELECT * FROM nova_grading_jobs WHERE submission_id=?', [blocked]));
        assert.equal(blockedRow.status, 'blocked');
        assert.equal(blockedRow.score, null);
        await assert.rejects(() => runDocker('print(1)', '', { image: '' }), /NOT_CONFIGURED/);
        await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: randomUUID(), seconds: 1000, foreground: true }, 400);
        const first = randomUUID();
        assert.equal((await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: first, seconds: 15, foreground: true })).data.acceptedSeconds, 0);
        await store.tx(q => q.run('UPDATE nova_activity_clock SET last_at=? WHERE user_id=?', [Date.now() - 10000, sid]));
        const event = randomUUID();
        const pulse = (await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: event, seconds: 15, foreground: true })).data;
        assert.ok(pulse.acceptedSeconds >= 10 && pulse.acceptedSeconds <= 11);
        await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: event, seconds: 15, foreground: true });
        await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: randomUUID(), seconds: 1000, foreground: true }, 400);
        await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: randomUUID(), seconds: 15, foreground: false }, 400);
        const analysis = (await call(`/courses/${cid}/analysis`, teacher)).data;
        assert.equal(analysis.students[0].completed, 1);
        assert.equal(analysis.students[0].automatic_average, 100);
        assert.equal(analysis.students[0].activity_seconds, pulse.acceptedSeconds);
        assert.equal(analysis.videoWatchSeconds, null);
        await call(`/courses/${cid}/analysis`, student, undefined, 403);
        const {processAi}=require('../lib/platform/rag-engine');
        await call(`/courses/${cid}/ai/sources`,student,undefined,403);
        const source=(await call(`/courses/${cid}/ai/sources`,teacher,{title:'Python loops',body:'Python for loops iterate over the elements of a sequence.'},201)).data.id;
        await call(`/courses/${cid}/ai/approve`,teacher,{sourceId:source},409);
        await processAi(store,{client:{json:async()=>({accepted:true,feedback:'Relevant Python material'})}});
        await call(`/courses/${cid}/ai/approve`,teacher,{sourceId:source});
        const job=(await call(`/courses/${cid}/ai/jobs`,student,{question:'Explain doubling a number',lessonId:lid},202)).data.id;
        let calls=0;
        await processAi(store,{client:{embed:async texts=>texts.map(()=>[1,0]),json:async(instruction,data)=>{calls++;assert.equal(JSON.stringify(data).includes('gradingTests'),false);assert.equal(JSON.stringify(data).includes('Python for loops'),false);return calls===1?{answer:'Use multiplication by two.',citations:['lesson:'+lid+':1'],needsTeacher:false}:{accepted:true,feedback:'Supported'};}}});
        const jobs=(await call(`/courses/${cid}/ai/jobs`,student)).data.jobs;
        assert.equal(jobs.find(j=>j.id===job).status,'completed');
        assert.equal(JSON.parse(jobs.find(j=>j.id===job).result_json).attempts,1);
        const others=(await call(`/courses/${cid}/ai/jobs`,teacher)).data.jobs;
        assert.equal(others.some(j=>j.id===job),false);
        // Worker-level regression: unavailable execution never releases the generated code.
        const withheldJob=(await call(`/courses/${cid}/ai/jobs`,student,{question:'Give a runnable example',lessonId:lid},202)).data.id;
        let drafts=0;
        await processAi(store,{exampleRunner:async()=>{throw Error('runtime unavailable')},client:{embed:async texts=>texts.map(()=>[1,0]),json:async()=>{drafts++;return {answer:'```python\nprint(2)\n```',examples:[{stdin:'',stdout:'2'}],citations:['lesson:'+lid+':1'],needsTeacher:false}}}});
        const withheld=await store.tx(q=>q.one('SELECT result_json FROM nova_ai_jobs WHERE id=?',[withheldJob]));
        assert.equal(JSON.parse(withheld.result_json).verification,'withheld');assert.equal(drafts,2);
        assert.doesNotMatch(JSON.parse(withheld.result_json).answer,/print/);
        const rejected=(await call(`/courses/${cid}/ai/sources`,teacher,{title:'Unrelated',body:'Unrelated content that needs correction by its teacher.'},201)).data.id;
        await processAi(store,{client:{json:async()=>({accepted:false,feedback:'Please supply Python material'})}});
        await call(`/courses/${cid}/ai/approve`,teacher,{sourceId:rejected},409);

        await call(`/courses/${cid}/members`, admin, { userId: tid, active: false });
        await call(`/courses/${cid}/analysis`, teacher, undefined, 403);
        await call(`/courses/${cid}/members`, admin, { userId: sid, active: false });
        await call(`/lessons/${lid}/activity`, student, { version: 1, eventId: randomUUID(), seconds: 15, foreground: true }, 403);
        console.log(`Verified ${count} learning HTTP checks; grading runner was a deterministic test double, not Docker.`);
    }
    finally {
        await app.close();
    }
});
