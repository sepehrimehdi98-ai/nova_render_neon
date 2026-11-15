'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{openStore}=require('../lib/platform/store'),{start}=require('../product-server'),{hashPassword}=require('../lib/passwords');
test('admin recovery revokes codes and sessions; teacher actions and course status are visible only to admin',async()=>{
 const store=await openStore({filename:':memory:',url:''}),origin='http://127.0.0.1:3019',app=await start({port:0,store,origin,demo:true}),base='http://127.0.0.1:'+app.server.address().port;
 async function call(path,cookie,body,status=200){const r=await fetch(base+'/api/platform'+path,{method:body===undefined?'GET':'POST',headers:{cookie:cookie||'',origin,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();assert.equal(r.status,status,path+': '+JSON.stringify(data));return {data,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 try{
  const demo=(await call('/login',null,{demoRole:'admin'})).cookie,users=(await call('/users',demo)).data.users,admin=users.find(u=>u.role==='admin'),teacher=users.find(u=>u.role==='teacher');
  const password='Initial-admin-password-2026!';await store.tx(async q=>q.run('UPDATE nova_users SET password_hash=? WHERE id=?',[await hashPassword(password),admin.id]));
  const cookie=(await call('/login',null,{username:admin.username,password})).cookie,tc=(await call('/login',null,{demoRole:'teacher'})).cookie;
  await call('/admin/recovery-codes',tc,undefined,403);await call('/admin/recovery-codes',cookie,{currentPassword:'wrong'},400);
  const issued=(await call('/admin/recovery-codes',cookie,{currentPassword:password})).data.codes;assert.equal(issued.length,8);assert.equal(new Set(issued).size,8);
  const rows=await store.tx(q=>q.all('SELECT * FROM nova_admin_recovery_codes'));assert.ok(rows.every(row=>!issued.includes(row.code_hash)));assert.equal((await call('/admin/recovery-codes',cookie)).data.remaining,8);
  const next='Recovered-admin-password-2026!';await call('/admin-recovery/complete',null,{username:admin.username,code:issued[0],password:next});await call('/me',cookie,undefined,401);
  await call('/admin-recovery/complete',null,{username:admin.username,code:issued[0],password:next},400);await call('/admin-recovery/complete',null,{username:admin.username,code:issued[1],password:next},400);
  const fresh=(await call('/login',null,{username:admin.username,password:next})).cookie;assert.equal((await call('/admin/recovery-codes',fresh)).data.remaining,0);
  const cid=(await call('/courses',fresh,{title:'Oversight test course',description:'Audit sample'},201)).data.id;await call('/courses/'+cid+'/members',fresh,{userId:teacher.id,active:true});
  const doc={title:'Teacher audited lesson',blocks:[{id:'text',kind:'text',title:'Text',body:'Example content'},{id:'video',kind:'video',title:'Video',body:'',mediaId:'DEMO00000001'}],exercise:{prompt:'Print one',starter:'print(1)'},quiz:[{prompt:'Output?',options:['1','2'],correct:0}]};const lid=(await call('/courses/'+cid+'/lessons',tc,doc,201)).data.id;
  await call('/lessons/'+lid,tc,{...doc,title:'Teacher updated lesson',draftRev:1});await call('/lessons/'+lid+'/publish',tc,{draftRev:2});await call('/courses/'+cid+'/status',fresh,{status:'published'});
  const ops=(await call('/admin/operations',fresh)).data,course=ops.courseSummary.find(c=>c.id===cid);assert.equal(course.status,'published');assert.equal(Number(course.published_lessons),1);
  const event=ops.audit.find(e=>e.action==='lesson.save'&&e.target_id===lid);assert.equal(event.role,'teacher');const detail=JSON.parse(event.details_json);assert.equal(detail.draftRevision,2);assert.equal(detail.title,'Teacher updated lesson');assert.equal(detail.blocks.text,1);await call('/admin/operations',tc,undefined,403);
  const ticket=(await call('/tickets',tc,{courseId:cid,subject:'Oversight support',category:'content',priority:'normal',body:'Please check this lesson.'},201)).data.id;
  await call('/tickets/'+ticket+'/messages',fresh,{revision:1,body:'Private admin note',internal:true});assert.equal((await call('/tickets/'+ticket,tc)).data.messages.length,1);
  await call('/tickets/'+ticket+'/messages',fresh,{revision:2,body:'Public response'});assert.equal((await call('/tickets/'+ticket,tc)).data.messages.length,2);await call('/tickets/'+ticket+'/status',fresh,{revision:3,status:'resolved'});assert.equal((await call('/tickets/'+ticket,tc)).data.ticket.status,'resolved');const finalOps=(await call('/admin/operations',fresh)).data;const ticketEvent=finalOps.audit.find(e=>e.target_id===ticket&&e.action==='ticket.create');assert.equal(JSON.parse(ticketEvent.details_json).title,'Oversight support');assert.equal(JSON.stringify(finalOps).includes('Private admin note'),false);
 }finally{await app.close();}
});
