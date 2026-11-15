'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{randomBytes}=require('node:crypto');
const {snapshot,restore,keyConfigured}=require('../lib/platform/backup');
test('encrypted backups fail closed for invalid keys and tampering before database writes',async()=>{
 const prior=process.env.BACKUP_ENCRYPTION_KEY,folder=await fs.mkdtemp(path.join(os.tmpdir(),'nova-backup-safety-'));
 let writes=0;const q={postgres:false,all:async()=>[],run:async()=>{writes++},one:async()=>({n:0})};
 try{
  process.env.BACKUP_ENCRYPTION_KEY='invalid-key';assert.equal(keyConfigured(),false);await assert.rejects(snapshot(q,{directory:folder}));assert.deepEqual(await fs.readdir(folder),[]);
  const key=randomBytes(32).toString('base64');process.env.BACKUP_ENCRYPTION_KEY=key+'!';assert.equal(keyConfigured(),false);
  process.env.BACKUP_ENCRYPTION_KEY=key;const saved=await snapshot(q,{directory:folder}),file=path.join(folder,saved.filename),raw=await fs.readFile(file,'utf8'),envelope=JSON.parse(raw);
  assert.deepEqual(await fs.readdir(folder),[saved.filename]);assert.equal(raw.includes('nova_users'),false);
  const cipher=Buffer.from(envelope.data,'base64');cipher[0]^=1;await fs.writeFile(file,JSON.stringify({...envelope,data:cipher.toString('base64')}));await assert.rejects(restore(q,file));assert.equal(writes,0);
  await fs.writeFile(file,raw);process.env.BACKUP_ENCRYPTION_KEY=randomBytes(32).toString('base64');await assert.rejects(restore(q,file));assert.equal(writes,0);
  process.env.BACKUP_ENCRYPTION_KEY=key;await fs.writeFile(file,JSON.stringify({...envelope,iv:'AAAA'}));await assert.rejects(restore(q,file),/envelope/);assert.equal(writes,0);
 }finally{if(prior===undefined)delete process.env.BACKUP_ENCRYPTION_KEY;else process.env.BACKUP_ENCRYPTION_KEY=prior;await fs.rm(folder,{recursive:true,force:true});}
});
