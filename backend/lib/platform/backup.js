'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomBytes, createCipheriv, createDecipheriv, randomUUID } = require('node:crypto');
function encryptionKey() { const raw = process.env.BACKUP_ENCRYPTION_KEY || ''; const key = Buffer.from(raw, 'base64'); if (key.length !== 32)
    throw Object.assign(new Error('کلید رمزگذاری پشتیبان تنظیم نشده است.'), { status: 503 }); return key; }
const keyConfigured = () => { try {
    encryptionKey();
    return true;
}
catch {
    return false;
} };
const tables = () => [...require('./store').schema.matchAll(/CREATE TABLE IF NOT EXISTS (nova_\w+)\(/g)].map(m => m[1]).filter(t => !['nova_sessions', 'nova_throttles', 'nova_reset_tokens'].includes(t));
async function snapshot(q, { directory = process.env.BACKUP_DIRECTORY || path.join(__dirname, '../../data/backups') } = {}) { const key = encryptionKey(), names = tables(); if (q.postgres)
    await q.run('LOCK TABLE ' + names.join(',') + ' IN SHARE MODE'); const data = {}; for (const table of names)
    {data[table] = await q.all('SELECT * FROM ' + table);if(data[table].length>100000)throw new Error('Backup table exceeds supported restore limit.');} const payload = Buffer.from(JSON.stringify({ format: 1, createdAt: new Date().toISOString(), data })); if(payload.length>67108864)throw new Error('Backup payload exceeds 64 MiB limit.');
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv); const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]); const envelope = JSON.stringify({ format: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') }); await fs.mkdir(directory, { recursive: true, mode: 0o700 }); const filename = 'nova-' + Date.now() + '-' + randomUUID() + '.backup'; await fs.writeFile(path.join(directory, filename), envelope, { mode: 0o600, flag: 'wx' }); return { filename, createdAt: new Date().toISOString(), tables: names.length, rows: Object.values(data).reduce((n, rows) => n + rows.length, 0), encrypted: true }; }
async function restore(q, filename) { const stat = await fs.stat(filename); if (stat.size > 134217728)
    throw new Error('Backup exceeds restore limit.'); const envelope = JSON.parse(await fs.readFile(filename, 'utf8')); if (envelope.format !== 1)
    throw new Error('Unsupported backup.'); const decrypt = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(envelope.iv, 'base64')); decrypt.setAuthTag(Buffer.from(envelope.tag, 'base64')); const payload = JSON.parse(Buffer.concat([decrypt.update(Buffer.from(envelope.data, 'base64')), decrypt.final()]).toString('utf8')); if (payload.format !== 1)
    throw new Error('Unsupported payload.'); const names = tables(); if (q.postgres)
    await q.run('LOCK TABLE ' + names.join(',') + ' IN EXCLUSIVE MODE'); for (const table of names)
    if (Number((await q.one('SELECT COUNT(*) AS n FROM ' + table)).n))
        throw new Error('Restore only supports a new empty database. Existing data was not changed.'); for (const table of names) {
    const rows = payload.data[table];
    if (!Array.isArray(rows) || rows.length > 100000)
        throw new Error('Invalid backup tables.');
    const columns = q.postgres ? (await q.all('SELECT column_name AS name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=?', [table])).map(x => x.name) : (await q.all('PRAGMA table_info(' + table + ')')).map(x => x.name);
    for (const row of rows) {
        const keys = Object.keys(row);
        if (!keys.length || keys.some(k => !columns.includes(k)))
            throw new Error('Invalid backup columns.');
        await q.run('INSERT INTO ' + table + '(' + keys.join(',') + ') VALUES(' + keys.map(() => '?').join(',') + ')', keys.map(k => row[k]));
    }
} return { restored: true, sessionsRestored: false }; }
module.exports = { keyConfigured, snapshot, restore };
