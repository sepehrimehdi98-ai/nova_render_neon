'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');
const { openStore } = require('../lib/platform/store');
const { start } = require('../product-server');
const { snapshot, restore } = require('../lib/platform/backup');
const fs = require('node:fs/promises'), path = require('node:path'), os = require('node:os');
test('account recovery, feedback, modules, prerequisites and encrypted restore', async () => {
    const store = await openStore({ filename: ':memory:', url: '' }), origin = 'http://127.0.0.1:3002';
    const app = await start({ port: 0, store, origin, demo: true });
    const base = `http://127.0.0.1:${app.server.address().port}`;
    let checks = 0;
    let folder;
    const oldKey = process.env.BACKUP_ENCRYPTION_KEY;
    async function call(route, cookie, body, status = 200) { const r = await fetch(base + '/api/platform' + route, { method: body === undefined ? 'GET' : 'POST', headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { origin, 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await r.json(); assert.equal(r.status, status, route + ': ' + JSON.stringify(data)); checks++; return { data, cookie: r.headers.get('set-cookie')?.split(';')[0] }; }
    try {
        const admin = (await call('/login', null, { demoRole: 'admin' })).cookie, teacher = (await call('/login', null, { demoRole: 'teacher' })).cookie;
        const users = (await call('/users', admin)).data.users;
        const tid = users.find(u => u.role === 'teacher').id;
        const sid = (await call('/users', admin, { username: 'learner', name: 'Learner', role: 'student', password: 'Old-strong-password-001' }, 201)).data.id;
        const sid2 = (await call('/users', admin, { username: 'otherlearner', name: 'Other learner', role: 'student', password: 'Other-strong-password-001' }, 201)).data.id;
        let student = (await call('/login', null, { username: 'learner', password: 'Old-strong-password-001' })).cookie;
        const second = (await call('/login', null, { username: 'otherlearner', password: 'Other-strong-password-001' })).cookie;
        const cid = (await call('/courses', admin, { title: 'Organized Python' }, 201)).data.id;
        for (const uid of [tid, sid, sid2])
            await call(`/courses/${cid}/members`, admin, { userId: uid, active: true });
        const doc = { title: 'Lesson one', blocks: [{ id: 'v', kind: 'video', title: 'Video', body: '', mediaId: 'immcuy8dntih' }], exercise: { prompt: 'Print a value', starter: 'print(1)' }, quiz: [{ prompt: 'One?', options: ['1', '2'], correct: 0 }], passScore: 70 };
        const lid = (await call(`/courses/${cid}/lessons`, teacher, doc, 201)).data.id;
        const lid2 = (await call(`/courses/${cid}/lessons`, teacher, { ...doc, title: 'Lesson two' }, 201)).data.id;
        for (const activeLid of [lid, lid2])
            await call(`/lessons/${activeLid}/publish`, teacher, { draftRev: 1 });
        await call(`/courses/${cid}/status`, admin, { status: 'published' });
        const mid = (await call(`/courses/${cid}/modules`, teacher, { title: 'Getting started' }, 201)).data.id;
        const structure = (await call(`/courses/${cid}/structure`, teacher)).data;
        const organize = { revision: structure.revision, order: [lid, lid2], layout: [{ lessonId: lid, moduleId: mid }, { lessonId: lid2, moduleId: mid }], prerequisites: [{ lessonId: lid2, requires: lid }] };
        await call(`/courses/${cid}/organize`, student, organize, 403);
        await call(`/courses/${cid}/organize`, teacher, { ...organize, prerequisites: [{ lessonId: lid, requires: lid2 }, { lessonId: lid2, requires: lid }] }, 400);
        await call(`/courses/${cid}/organize`, teacher, organize);
        await call(`/courses/${cid}/organize`, teacher, organize, 409);
        await call(`/lessons/${lid2}`, student, undefined, 403);
        const submission = randomUUID();
        await call(`/lessons/${lid}/practice`, student, { version: 1, submissionId: submission, code: 'def double(x):\n    return x * 2\nprint(double(3))' });
        const own = (await call(`/lessons/${lid}/submissions`, student)).data.submissions;
        assert.equal(own.length, 1);
        assert.equal((await call(`/lessons/${lid}/submissions`, second)).data.submissions.length, 0);
        await call(`/submissions/${submission}/review`, student, { revision: 0, grade: 100, feedback: 'Forged' }, 403);
        await call(`/submissions/${submission}/review`, teacher, { revision: 0, grade: 85, feedback: 'Correct function; add another example.' });
        await call(`/submissions/${submission}/review`, teacher, { revision: 0, grade: 90, feedback: 'Stale' }, 409);
        const review = (await call(`/lessons/${lid}/submissions`, student)).data.submissions[0];
        assert.equal(review.grade, 85);
        assert.match(review.feedback, /another example/);
        await call(`/lessons/${lid}/quiz`, student, { version: 1, attemptId: randomUUID(), answers: [0] });
        await call(`/lessons/${lid}/progress`, student, { version: 1, videoAcknowledged: true });
        await call(`/lessons/${lid}/complete`, student, { version: 1 });
        await call(`/lessons/${lid2}`, student);
        assert.ok(!(await call(`/courses/${cid}/structure`, student)).data.locked.includes(lid2));
        const unknown = (await call('/recovery/request', null, { username: 'unknown' })).data;
        const known = (await call('/recovery/request', null, { username: 'learner' })).data;
        assert.deepEqual(known, unknown);
        await call('/admin/recovery', student, undefined, 403);
        assert.ok((await call('/admin/recovery', admin)).data.requests.some(r => r.username === 'learner'));
        await call(`/users/${sid}/recovery`, teacher, { identityConfirmed: true }, 403);
        await call(`/users/${sid}/recovery`, admin, { identityConfirmed: false }, 400);
        const reset = (await call(`/users/${sid}/recovery`, admin, { identityConfirmed: true })).data;
        assert.equal(reset.token.length, 64);
        const tokenRow = await store.tx(q => q.one('SELECT token_hash FROM nova_reset_tokens WHERE user_id=?', [sid]));
        assert.notEqual(tokenRow.token_hash, reset.token);
        await call('/me', student, undefined, 401);
        await call('/login', null, { username: 'learner', password: 'Old-strong-password-001' }, 401);
        await call('/recovery/complete', null, { token: reset.token, password: 'New-strong-password-001' });
        await call('/recovery/complete', null, { token: reset.token, password: 'New-strong-password-001' }, 400);
        student = (await call('/login', null, { username: 'learner', password: 'New-strong-password-001' })).cookie;
        await call('/account/password', student, { currentPassword: 'wrong', password: 'Final-strong-password-001' }, 400);
        await call('/account/password', student, { currentPassword: 'New-strong-password-001', password: 'Final-strong-password-001' });
        await call('/me', student, undefined, 401);
        student = (await call('/login', null, { username: 'learner', password: 'Final-strong-password-001' })).cookie;
        const expiring = (await call(`/users/${sid2}/recovery`, admin, { identityConfirmed: true })).data;
        await store.tx(q => q.run('UPDATE nova_reset_tokens SET expires_at=? WHERE user_id=?', ['2000-01-01T00:00:00.000Z', sid2]));
        await call('/recovery/complete', null, { token: expiring.token, password: 'Another-strong-password-02' }, 400);
        process.env.BACKUP_ENCRYPTION_KEY = randomBytes(32).toString('base64');
        folder = await fs.mkdtemp(path.join(os.tmpdir(), 'nova-restore-'));
        const backup = await store.tx(q => snapshot(q, { directory: folder }));
        const file = path.join(folder, backup.filename);
        const bytes = await fs.readFile(file, 'utf8');
        assert.ok(!bytes.includes('Final-strong-password'));
        assert.ok(!bytes.includes('Correct function'));
        const restored = await openStore({ filename: ':memory:', url: '' });
        try {
            await restored.tx(q => restore(q, file));
            assert.equal(Number((await restored.tx(q => q.one('SELECT COUNT(*) AS n FROM nova_reviews'))).n), 1);
            assert.equal(Number((await restored.tx(q => q.one('SELECT COUNT(*) AS n FROM nova_sessions'))).n), 0);
            await assert.rejects(() => restored.tx(q => restore(q, file)), /empty database/);
            const corrupt = JSON.parse(bytes);
            corrupt.tag = Buffer.alloc(16).toString('base64');
            await fs.writeFile(file + '.corrupt', JSON.stringify(corrupt));
            await assert.rejects(() => restored.tx(q => restore(q, file + '.corrupt')));
        }
        finally {
            await restored.close();
        }
        const op = (await call('/admin/operations', admin)).data;
        assert.equal(op.backupConfigured, true);
        await call('/admin/operations', student, undefined, 403);
        await call('/admin/backup', student, {}, 403);
        console.log(`Verified ${checks} extension HTTP checks plus encrypted backup/restore, token replay/expiry, private feedback and prerequisites.`);
    }
    finally {
        await app.close();
        if (oldKey === undefined)
            delete process.env.BACKUP_ENCRYPTION_KEY;
        else
            process.env.BACKUP_ENCRYPTION_KEY = oldKey;
        if (folder) {
            const absolute = path.resolve(folder);
            assert.equal(path.dirname(absolute), path.resolve(os.tmpdir()));
            assert.ok(path.basename(absolute).startsWith('nova-restore-'));
            await fs.rm(absolute, { recursive: true, force: true });
        }
    }
});
