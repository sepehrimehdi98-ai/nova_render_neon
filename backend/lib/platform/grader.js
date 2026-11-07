'use strict';
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
function runDocker(code, stdin, { image = process.env.NOVA_GRADER_IMAGE } = {}) {
    if (!image || !/^[a-z0-9][a-z0-9./:_-]*@sha256:[a-f0-9]{64}$/.test(image))
        return Promise.reject(new Error('GRADER_NOT_CONFIGURED'));
    const name = 'nova-grade-' + randomUUID();
    return new Promise((resolve, reject) => {
        let stdout = '', stderr = '', ended = false, timer;
        const child = spawn('docker', ['run', '--rm', '--pull=never', '--name', name, '--network=none', '--read-only', '--memory=128m', '--memory-swap=128m', '--cpus=0.5', '--pids-limit=32', '--cap-drop=ALL', '--security-opt=no-new-privileges=true', '--user=65534:65534', '--tmpfs=/tmp:rw,noexec,nosuid,size=16m', '--interactive', image, 'python', '-I', '-B', '-c', code], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
        const cleanup = () => { const c = spawn('docker', ['rm', '-f', name], { stdio: 'ignore', windowsHide: true }); c.on('error', () => { }); };
        const finish = (error, result) => { if (ended)
            return; ended = true; clearTimeout(timer); cleanup(); if (error)
            reject(error);
        else
            resolve(result); };
        child.on('error', () => finish(new Error('GRADER_RUNTIME_UNAVAILABLE')));
        child.stdin.on('error', () => { });
        child.stdout.on('data', b => { stdout += b; if (Buffer.byteLength(stdout) > 24000) {
            child.kill();
            finish(null, { ok: false, reason: 'output_limit' });
        } });
        child.stderr.on('data', b => { stderr += b; if (Buffer.byteLength(stderr) > 24000) {
            child.kill();
            finish(null, { ok: false, reason: 'output_limit' });
        } });
        child.on('close', exit => { if ([125, 126, 127].includes(exit))
            return finish(new Error('GRADER_RUNTIME_UNAVAILABLE')); finish(null, { ok: exit === 0, stdout, reason: exit === 0 ? 'executed' : 'runtime_error' }); });
        timer = setTimeout(() => { child.kill(); finish(null, { ok: false, reason: 'timeout' }); }, 5000);
        child.stdin.end(stdin);
    });
}
async function processOne(store, { runner = runDocker } = {}) {
    await store.tx(q=>q.run('INSERT INTO nova_worker_health(kind,last_seen,state) VALUES(?,?,?) ON CONFLICT(kind) DO UPDATE SET last_seen=excluded.last_seen,state=excluded.state',['grading',new Date().toISOString(),'polling']));
 const lease = randomUUID();
    const job = await store.tx(async (q) => { const row = await q.one("SELECT submission_id FROM nova_grading_jobs WHERE status='queued' OR (status='running' AND lease_until<?) ORDER BY updated_at LIMIT 1" + (q.postgres ? ' FOR UPDATE SKIP LOCKED' : ''), [Date.now()]); if (!row)
        return null; await q.run("UPDATE nova_grading_jobs SET status='running',lease_id=?,lease_until=?,updated_at=? WHERE submission_id=?", [lease, Date.now() + 120000, new Date().toISOString(), row.submission_id]); return q.one('SELECT p.*,v.content_json FROM nova_practice p JOIN nova_versions v ON v.lesson_id=p.lesson_id AND v.version=p.version WHERE p.id=?', [row.submission_id]); });
    if (!job)
        return false;
    let result;
    try {
        const tests = JSON.parse(job.content_json).exercise.gradingTests || [];
        if (!tests.length)
            throw new Error('NO_TESTS');
        const outcomes = [];
        for (const t of tests) {
            const run = await runner(job.code, t.stdin);
            const normalize = x => String(x || '').replace(/\r\n/g, '\n').trimEnd();
            outcomes.push({ passed: run.ok && normalize(run.stdout) === normalize(t.stdout), reason: run.reason });
        }
        const passed = outcomes.filter(x => x.passed).length;
        result = { status: 'completed', score: Math.round(passed * 100 / tests.length), passed, total: tests.length, details: outcomes };
    }
    catch (e) {
        result = { status: 'blocked', score: null, passed: 0, total: 0, details: [{ reason: ['GRADER_NOT_CONFIGURED', 'GRADER_RUNTIME_UNAVAILABLE', 'NO_TESTS'].includes(e.message) ? e.message : 'GRADER_ERROR' }] };
    }
    await store.tx(q => q.run('UPDATE nova_grading_jobs SET status=?,score=?,passed=?,total=?,result_json=?,lease_id=NULL,lease_until=NULL,updated_at=? WHERE submission_id=? AND lease_id=?', [result.status, result.score, result.passed, result.total, JSON.stringify(result.details), new Date().toISOString(), job.id, lease]));
    return true;
}
module.exports = { runDocker, processOne };
