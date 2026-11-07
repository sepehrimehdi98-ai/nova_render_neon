'use strict';
require('../lib/load-env');
const { openStore } = require('../lib/platform/store');
const { snapshot, restore } = require('../lib/platform/backup');
(async () => { const mode = process.argv[2]; if (!['backup', 'restore'].includes(mode) || mode === 'restore' && (!process.argv[3] || !process.argv.includes('--empty-database')))
    throw new Error('Use: node scripts/platform-backup.js backup | restore <file> --empty-database'); const store = await openStore(); try {
    const result = await store.tx(q => mode === 'backup' ? snapshot(q) : restore(q, process.argv[3]));
    console.log(JSON.stringify(result));
}
finally {
    await store.close();
} })().catch(e => { console.error('Backup operation failed:', e.message); process.exitCode = 1; });
