'use strict';
require('../lib/load-env');
const { openStore } = require('../lib/platform/store');
const { processOne } = require('../lib/platform/grader');
(async () => { if (!process.env.NOVA_GRADER_IMAGE)
    throw new Error('Configure NOVA_GRADER_IMAGE to a pre-pulled trusted Python image pinned by digest. Use a dedicated grading host.'); const store = await openStore({ migrate: false }); try { if(process.argv.includes('--retry-blocked'))await store.tx(q=>q.run("UPDATE nova_grading_jobs SET status='queued',lease_id=NULL,lease_until=NULL WHERE status='blocked'"));
    if (process.argv.includes('--once'))
        await processOne(store);
    else {
        let stopping = false;
        process.on('SIGINT', () => { stopping = true; });
        process.on('SIGTERM', () => { stopping = true; });
        while (!stopping) {
            if (!await processOne(store))
                await new Promise(r => setTimeout(r, 1500));
        }
    }
}
finally {
    await store.close();
} })().catch(e => { console.error('Grading worker stopped:', e.message); process.exitCode = 1; });
