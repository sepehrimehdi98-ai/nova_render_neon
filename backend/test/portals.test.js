'use strict';
const test=require('node:test'),assert=require('node:assert/strict');const {once}=require('node:events');const {openStore}=require('../lib/platform/store');const {start}=require('../product-server');const {startPortal}=require('../../scripts/portal-server.cjs');
test('independent portals proxy API and enforce role-specific login, sessions and origins',async()=>{
 const previous=process.env.APP_ORIGINS;const app=await start({port:0,origin:'http://127.0.0.1:3003',demo:true,store:await openStore({filename:':memory:',url:''})});const gateways=[];const urls={};
 try{
 for(const role of ['student','teacher','admin']){const s=startPortal({role,port:0,upstream:'http://127.0.0.1:'+app.server.address().port});gateways.push(s);await once(s,'listening');urls[role]='http://127.0.0.1:'+s.address().port;}
 process.env.APP_ORIGINS=Object.values(urls).join(',');const cookies={};
 async function request(role,path,body,cookie,expected=200,origin=urls[role]){const r=await fetch(urls[role]+'/api/platform'+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{origin,'content-type':'application/json'}),...(cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();assert.equal(r.status,expected,role+path+JSON.stringify(data));return {data,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 for(const role of Object.keys(urls)){const html=await fetch(urls[role]+'/');assert.equal(html.status,200);const markup=await html.text();const asset=markup.match(/src="([^"]+\.js)"/)[1];assert.equal((await fetch(urls[role]+asset)).status,200);assert.equal((await fetch(urls[role]+'/.env')).status,404);const login=await request(role,'/portal/'+role+'/login',{demoRole:role});cookies[role]=login.cookie;assert.equal(login.data.user.role,role);assert.equal((await request(role,'/portal/'+role+'/me',undefined,login.cookie)).data.user.role,role);}
 assert.equal(new Set(Object.values(cookies).map(c=>c.split('=')[0])).size,3);
 for(const role of Object.keys(urls))assert.equal((await request(role,'/portal/'+role+'/me',undefined,Object.values(cookies).join('; '))).data.user.role,role);
 await request('student','/portal/student/login',{demoRole:'admin'},undefined,403);
 await request('teacher','/portal/teacher/login',{demoRole:'student'},undefined,403);
 await request('admin','/portal/admin/login',{demoRole:'teacher'},undefined,403);
 await request('student','/portal/admin/me',undefined,cookies.admin,403);
 await request('student','/portal/student/me',undefined,cookies.teacher,401);
 await request('student','/portal/student/users',undefined,cookies.student,403);
 await request('admin','/portal/admin/users',undefined,cookies.admin);
 await request('teacher','/portal/teacher/tickets',undefined,cookies.teacher);
 await request('student','/portal/student/login',{demoRole:'student'},undefined,403,'https://untrusted.example');
 await request('teacher','/portal/teacher/logout',{},cookies.teacher);
 await request('teacher','/portal/teacher/me',undefined,cookies.teacher,401);
 }finally{for(const s of gateways)await new Promise(resolve=>s.close(resolve));await app.close();if(previous===undefined)delete process.env.APP_ORIGINS;else process.env.APP_ORIGINS=previous;}
});
const {randomUUID}=require('node:crypto');
const {hashPassword}=require('../lib/passwords');
test('password-authenticated portals share publication, submissions and private tickets',async()=>{
 const previous=process.env.APP_ORIGINS,store=await openStore({filename:':memory:',url:''});
 const password='Portal-validation-2026!',passwordHash=await hashPassword(password),users={};
 await store.tx(async q=>{for(const role of ['student','teacher','admin']){users[role]=randomUUID();await q.run('INSERT INTO nova_users(id,username,name,role,password_hash,active,created_at) VALUES(?,?,?,?,?,1,?)',[users[role],role,role,role,passwordHash,new Date().toISOString()]);}});
 const app=await start({port:0,origin:'http://127.0.0.1:3003',demo:false,store}),gateways=[],urls={},cookies={};let checks=0;
 try{
 for(const role of Object.keys(users)){const server=startPortal({role,port:0,upstream:'http://127.0.0.1:'+app.server.address().port});gateways.push(server);await once(server,'listening');urls[role]='http://127.0.0.1:'+server.address().port;}
 process.env.APP_ORIGINS=Object.values(urls).join(',');
 async function call(role,route,body,expected=200){const response=await fetch(urls[role]+'/api/platform/portal/'+role+route,{method:body===undefined?'GET':'POST',headers:{origin:urls[role],'content-type':'application/json',...(cookies[role]?{cookie:cookies[role]}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();assert.equal(response.status,expected,role+route+JSON.stringify(data));checks++;const cookie=response.headers.get('set-cookie');if(cookie){assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.doesNotMatch(cookie,/Domain=/i);cookies[role]=cookie.split(';')[0];}return data;}
 for(const role of Object.keys(users))await call(role,'/login',{username:role,password});
 await call('student','/login',{username:'admin',password},403);
 await call('teacher','/login',{username:'student',password},403);
 await call('admin','/login',{username:'teacher',password},403);
 const cid=(await call('admin','/courses',{title:'Cross-portal validation'},201)).id;
 for(const role of ['teacher','student'])await call('admin',`/courses/${cid}/members`,{userId:users[role],active:true});
 const doc={title:'Verified lesson',blocks:[{id:'text',kind:'text',title:'Learn',body:'Shared content'},{id:'video',kind:'video',title:'Video',body:'',mediaId:'immcuy8dntih'}],exercise:{prompt:'Print Nova',starter:'print("Nova")'},quiz:[{prompt:'Pick Nova',options:['Nova','Other'],correct:0}],passScore:70};
 const lid=(await call('teacher',`/courses/${cid}/lessons`,doc,201)).id;
 await call('student',`/lessons/${lid}`,undefined,403);
 await call('teacher',`/lessons/${lid}/publish`,{draftRev:1});
 await call('admin',`/courses/${cid}/status`,{status:'published'});
 assert.equal((await call('student',`/lessons/${lid}`)).content.title,doc.title);
 await call('teacher',`/lessons/${lid}`,{...doc,title:'Updated lesson',draftRev:1});
 assert.equal((await call('student',`/lessons/${lid}`)).content.title,doc.title);
 await call('teacher',`/lessons/${lid}/publish`,{draftRev:2});
 const published=await call('student',`/lessons/${lid}`);assert.equal(published.content.title,'Updated lesson');assert.equal(published.content.quiz[0].correct,undefined);
 await call('student',`/lessons/${lid}/practice`,{version:published.version,submissionId:randomUUID(),code:'print("Nova")'});
 await call('student',`/lessons/${lid}/quiz`,{version:published.version,attemptId:randomUUID(),answers:[0]});
 const results=(await call('teacher',`/courses/${cid}/results`)).results;assert.equal(Number(results[0].practices),1);assert.equal(results[0].best_score,100);
 const tid=(await call('teacher','/tickets',{courseId:cid,subject:'Verify connection',category:'technical',priority:'normal',body:'Can admin see this?'},201)).id;
 assert.ok((await call('admin','/tickets')).tickets.some(t=>t.id===tid));
 await call('admin',`/tickets/${tid}/messages`,{revision:1,body:'Admin reply'});
 assert.ok((await call('teacher',`/tickets/${tid}`)).messages.some(m=>m.body==='Admin reply'));
 await call('admin',`/tickets/${tid}/messages`,{revision:2,body:'Private admin note',internal:true});
 assert.ok(!(await call('teacher',`/tickets/${tid}`)).messages.some(m=>m.body==='Private admin note'));
 await call('student',`/tickets/${tid}`,undefined,403);
 await call('teacher',`/tickets/${tid}/messages`,{revision:1,body:'Stale'},409);
 await call('admin',`/courses/${cid}/members`,{userId:users.student,active:false});
 await call('student',`/lessons/${lid}`,undefined,403);
 console.log('Cross-portal password workflow HTTP checks: '+checks);
 }finally{for(const s of gateways)await new Promise(resolve=>s.close(resolve));await app.close();if(previous===undefined)delete process.env.APP_ORIGINS;else process.env.APP_ORIGINS=previous;}
});
test('production gateways require an explicit upstream and reject malformed origins',()=>{
 const env=process.env.NODE_ENV,upstream=process.env.API_UPSTREAM;process.env.NODE_ENV='production';delete process.env.API_UPSTREAM;
 try{assert.throws(()=>startPortal({role:'student'}),/API_UPSTREAM is required/);for(const url of ['https://api.example/path','https://api.example/?token=secret','https://api.example/#fragment','https://user:pass@api.example'])assert.throws(()=>startPortal({role:'student',upstream:url}),/HTTP\(S\) origin/);}
 finally{if(env===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=env;if(upstream===undefined)delete process.env.API_UPSTREAM;else process.env.API_UPSTREAM=upstream;}
});
