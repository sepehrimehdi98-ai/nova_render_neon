'use strict';
const {randomBytes,createHash}=require('node:crypto');
const digest=code=>createHash('sha256').update('nova-admin-recovery-v1:'+code).digest('hex');
async function complete({store,route,req,data,send,res,fail,hashPassword}){
 if(route!=='/admin-recovery/complete'||req.method!=='POST')return null;
 const {limit}=require('./extensions');
 await store.tx(q=>limit(q,'admin-recovery:'+require('./demo-features').clientIp(req),5,900000));
 const username=String(data.username||'').trim().toLowerCase(),code=String(data.code||'').trim().toLowerCase();
 if(!/^[a-f0-9]{40}$/.test(code)||typeof data.password!=='string'||data.password.length<12||data.password.length>256)fail(400,'کد بازیابی یا گذرواژه معتبر نیست.');
 const password=await hashPassword(data.password);
 return store.tx(async q=>{
  const user=await q.one("SELECT id FROM nova_users WHERE username=? AND role='admin' AND active=1",[username]);
  if(!user)fail(400,'کد بازیابی معتبر نیست یا قبلاً استفاده شده است.');
  await require('./demo-features').lockIdentity(q,user.id);
  const row=await q.one('SELECT code_hash FROM nova_admin_recovery_codes WHERE user_id=? AND code_hash=? AND used_at IS NULL',[user.id,digest(code)]);
  if(!row)fail(400,'کد بازیابی معتبر نیست یا قبلاً استفاده شده است.');
  const at=new Date().toISOString();
  // Invalidate every remaining code after a recovery, so a leaked old set cannot be reused.
  await q.run('UPDATE nova_admin_recovery_codes SET used_at=? WHERE user_id=? AND used_at IS NULL',[at,user.id]);
  await q.run('UPDATE nova_users SET password_hash=? WHERE id=?',[password,user.id]);
  await q.run('DELETE FROM nova_sessions WHERE user_id=?',[user.id]);
  await q.run('UPDATE nova_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL',[at,user.id]);
  await q.run('INSERT INTO nova_audit(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)',[require('node:crypto').randomUUID(),user.id,'account.admin-recovered',user.id,at]);
  return send(res,200,{message:'گذرواژه تغییر کرد. همه نشست‌ها و کدهای قبلی باطل شدند؛ پس از ورود، کدهای تازه بسازید.'});
 });
}
async function routes({q,u,route,req,data,send,res,fail,verifyPassword,audit}){
 if(route!=='/admin/recovery-codes')return null;
 if(u.role!=='admin')fail(403,'فقط مدیر مجاز است.');
 if(req.method==='GET')return send(res,200,{remaining:Number((await q.one('SELECT COUNT(*) AS n FROM nova_admin_recovery_codes WHERE user_id=? AND used_at IS NULL',[u.id])).n)});
 if(req.method!=='POST')fail(405,'روش مجاز نیست.');
 await require('./extensions').limit(q,'admin-code-issue:'+u.id,5,900000);
 if(!await verifyPassword(String(data.currentPassword||''),u.password_hash))fail(400,'گذرواژه فعلی صحیح نیست.');
 await require('./demo-features').lockIdentity(q,u.id);
 const fresh=await q.one('SELECT password_hash FROM nova_users WHERE id=?',[u.id]);if(fresh.password_hash!==u.password_hash)fail(409,'حساب تغییر کرده است؛ دوباره وارد شوید.');
 const codes=Array.from({length:8},()=>randomBytes(20).toString('hex'));
 await q.run('DELETE FROM nova_admin_recovery_codes WHERE user_id=?',[u.id]);
 for(const code of codes)await q.run('INSERT INTO nova_admin_recovery_codes(code_hash,user_id,created_at) VALUES(?,?,?)',[digest(code),u.id,new Date().toISOString()]);
 await audit(q,u,'account.recovery-codes-issued',u.id);
 return send(res,200,{codes});
}
module.exports={complete,routes};
