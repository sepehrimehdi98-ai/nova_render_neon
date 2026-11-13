'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {start}=require('../product-server'),{openStore}=require('../lib/platform/store');
test('builder styles, scoped exams, chapter ordering and focused AI drafts persist',async()=>{
 const store=await openStore({filename:':memory:',url:''}),app=await start({port:0,demo:true,store});const base='http://127.0.0.1:'+app.server.address().port,cookies={};
 async function call(role,p,b,status=200){const r=await fetch(base+'/api/platform'+p,{method:b===undefined?'GET':'POST',headers:{origin:'http://127.0.0.1:3003','content-type':'application/json',cookie:cookies[role]||''},body:b===undefined?undefined:JSON.stringify(b)});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));const c=r.headers.get('set-cookie');if(c)cookies[role]=c.split(';')[0];return d}
 try{
  for(const role of ['admin','teacher','student'])await call(role,'/login',{demoRole:role});const users=(await call('admin','/users')).users;
  const course=(await call('admin','/courses',{title:'Builder test'},201)).id,other=(await call('admin','/courses',{title:'Other course'},201)).id;
  await call('admin','/courses/'+course+'/members',{userId:users.find(u=>u.role==='teacher').id,active:true});
  const exam=(await call('teacher','/courses/'+course+'/exams',{title:'Linked exam',questions:[{prompt:'Pick',options:['A','B'],correct:0}],opensAt:new Date().toISOString(),closesAt:new Date(Date.now()+86400000).toISOString(),durationMinutes:20,status:'published'},201)).id;
  const doc={title:'Styles',blocks:[{id:'text',kind:'text',title:'Text',body:'Python text',textMarks:[{start:0,end:6,fontSize:24}],fontSize:16},{id:'list',kind:'text',title:'List',body:'one\ntwo',variant:'list'}],exercise:{prompt:'Practice',starter:''},quiz:[],metadata:{summary:'Meaningful variable names',keywords:'Python',difficulty:'beginner',durationMinutes:20},references:['https://docs.python.org/3/'],examId:exam};
  await call('teacher','/courses/'+course+'/lessons',{...doc,metadata:{difficulty:'invalid'}},400);
  const lesson=await call('teacher','/courses/'+course+'/lessons',doc,201);assert.deepEqual((await call('teacher','/lessons/'+lesson.id)).content.blocks[0].textMarks,doc.blocks[0].textMarks);
  await call('admin','/courses/'+other+'/lessons',doc,400);
  await call('teacher','/courses/'+course+'/lessons',{...doc,blocks:[{...doc.blocks[0],textMarks:[{start:4,end:99,fontSize:20}]}]},400);
  const a=await call('teacher','/courses/'+course+'/modules',{title:'A'},201),b=await call('teacher','/courses/'+course+'/modules',{title:'B'},201);let s=await call('teacher','/courses/'+course+'/structure');
  await call('teacher','/courses/'+course+'/organize',{revision:s.revision,order:s.order,chapterOrder:[b.id,a.id],layout:[{lessonId:lesson.id,moduleId:b.id}],prerequisites:[]});s=await call('teacher','/courses/'+course+'/structure');assert.deepEqual(s.modules.map(m=>m.id),[b.id,a.id]);
  await call('teacher','/courses/'+course+'/organize',{revision:s.revision,order:s.order,chapterOrder:[a.id,a.id]},400);
  await call('teacher','/courses/'+course+'/ai/jobs',{lessonId:lesson.id,question:'Explain selected block',focusBlockId:'missing'},400);
  const job=await call('teacher','/courses/'+course+'/ai/jobs',{lessonId:lesson.id,question:'Explain selected block',focusBlockId:'text'},202);const j=(await call('teacher','/courses/'+course+'/ai/jobs')).jobs.find(j=>j.id===job.id);assert.equal(JSON.parse(j.input_json).focusBlockId,'text');assert.equal(JSON.parse(j.input_json).draft.examId,exam);
 }finally{await app.close()}
});
test('reference retrieval rejects private hosts, credentials and redirects',async()=>{
 const {fetchReference}=require('../lib/platform/reference-document');for(const url of ['http://docs.python.org/3/','https://127.0.0.1/','https://docs.python.org.evil.test/','https://user:pass@docs.python.org/','https://docs.python.org:8443/'])await assert.rejects(fetchReference(url));
 const original=global.fetch;try{global.fetch=async(url,options)=>{assert.equal(options.redirect,'error');return new Response('<html><script>ignore this</script><p>Python variables refer to values and make programs readable.</p></html>',{headers:{'content-type':'text/html'}})};const body=await fetchReference('https://docs.python.org/3/');assert.match(body,/Python variables/);assert.doesNotMatch(body,/ignore this/)}finally{global.fetch=original}
});
