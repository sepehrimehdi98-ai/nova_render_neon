'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {start}=require('../product-server'),{openStore}=require('../lib/platform/store');
test('saved administrative reports read actual writes, paginate and exclude private/security data',async()=>{
 const store=await openStore({filename:':memory:',url:''}),app=await start({port:0,demo:true,store}),base='http://127.0.0.1:'+app.server.address().port,cookies={};
 async function call(role,path,body,status=200){const r=await fetch(base+'/api/platform'+path,{method:body===undefined?'GET':'POST',headers:{origin:'http://127.0.0.1:3003',cookie:cookies[role]||'','content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}),d=await r.json();assert.equal(r.status,status,path+' '+JSON.stringify(d));if(r.headers.get('set-cookie'))cookies[role]=r.headers.get('set-cookie').split(';')[0];return d}
 try{for(const r of ['admin','teacher','student'])await call(r,'/login',{demoRole:r});for(const role of ['teacher','student'])await call(role,'/admin/data',undefined,403);
 const cid=(await call('admin','/courses',{title:'دوره ذخیره‌شده واقعی'},201)).id;
 const lesson=await call('admin','/courses/'+cid+'/lessons',{title:'درس ذخیره‌شده واقعی',blocks:[{id:'text',kind:'text',body:'Actual saved lesson body, not report metadata.'}],exercise:{prompt:''},quiz:[]},201);
 await call('student','/notes',{body:'PRIVATE NOTE NEVER EXPORTED'});
 const tickets=await call('teacher','/tickets',{subject:'Saved data report test',body:'Private ticket message',category:'technical',priority:'normal'},201);
 for(const dataset of ['courses','lessons','tickets','activity']){const d=await call('admin','/admin/data?dataset='+dataset);assert.equal(d.dataset,dataset);assert.ok(d.records.length);assert.ok(!JSON.stringify(d).includes('PRIVATE NOTE NEVER EXPORTED'));for(const r of d.records)for(const key of ['password_hash','draft_json','body','content','cookie','token','base64'])assert.ok(!Object.hasOwn(r,key));if(dataset==='lessons'){const l=d.records.find(l=>l.id===lesson.id);assert.equal(l.title,'درس ذخیره‌شده واقعی');assert.equal(l.block_count,1)}if(dataset==='tickets')assert.ok(d.records.some(t=>t.id===tickets.id));}
 await store.tx(async q=>{for(let i=0;i<105;i++)await q.run('INSERT INTO nova_courses SELECT ?,?,?,status,created_by,created_at FROM nova_courses WHERE id=?',['report-'+i,'Page '+i,'',cid])});
 const page=await call('admin','/admin/data'),next=await call('admin','/admin/data?offset='+page.nextOffset);assert.equal(page.records.length,100);assert.equal(next.records.length,6);assert.equal(next.nextOffset,null);assert.equal(new Set([...page.records,...next.records].map(r=>r.id)).size,106);
 for(const query of ['dataset=__proto__','dataset=nova_users','offset=-1','offset=1%20OR%201=1'])await call('admin','/admin/data?'+query,undefined,400);
 await call('admin','/admin/data',{},405);
 }finally{await app.close()}
});
