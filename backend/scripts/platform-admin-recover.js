'use strict';
require('../lib/load-env');
const { openStore } = require('../lib/platform/store');
const { hashPassword } = require('../lib/passwords');
const { randomUUID } = require('node:crypto');
(async () => { if (!process.argv.includes('--confirm-admin-recovery'))
    throw new Error('Stop the app and pass --confirm-admin-recovery for operator recovery.'); const username = String(process.env.ADMIN_RECOVERY_USERNAME || '').trim().toLowerCase(); const encoded = await hashPassword(process.env.ADMIN_RECOVERY_PASSWORD); const store = await openStore(); try {
    await store.tx(async (q) => { const user = await q.one("SELECT id FROM nova_users WHERE username=? AND role='admin'", [username]); if (!user)
        throw new Error('Administrator not found.'); await q.run('UPDATE nova_users SET password_hash=?,active=1 WHERE id=?', [encoded, user.id]); await q.run('DELETE FROM nova_sessions WHERE user_id=?', [user.id]); await q.run('INSERT INTO nova_audit(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)', [randomUUID(), user.id, 'account.operator-recovered', user.id, new Date().toISOString()]); });
    console.log('Administrator recovered; remove the private recovery variables before restarting.');
}
finally {
    await store.close();
} })().catch(e => { console.error('Operator recovery failed:', e.message); process.exitCode = 1; });
