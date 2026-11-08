const test=require('node:test'),assert=require('node:assert/strict');
const {openStore}=require('../lib/platform/store');
const {provider,processAi}=require('../lib/platform/rag-engine');
const {extract,syncSource}=require('../lib/platform/document-index');
const {randomUUID}=require('node:crypto');
test('Document processing and index synchronize revisions and reject revoked sources',async()=>{
 assert.throws(()=>extract({mime:'application/pdf',text:'x'.repeat(30)}),/FORMAT/);
 assert.throws(()=>extract({mime:'text/plain',text:'short'}),/SIZE/);
 assert.equal(extract({mime:'text/markdown',text:'a'.repeat(25)+'\r\nhello'}),'a'.repeat(25)+'\nhello');
 const store=await openStore({filename:':memory:',url:''});
 const uid=randomUUID(),cid=randomUUID(),sid=randomUUID(),date=new Date().toISOString();
 try{
 await store.tx(async q=>{await q.run('INSERT INTO nova_users VALUES(?,?,?,?,?,1,?)',[uid,'indexteacher','Teacher','teacher','hash',date]);await q.run('INSERT INTO nova_courses VALUES(?,?,?,?,?,?)',[cid,'Course','','published',uid,date]);await q.run('INSERT INTO nova_ai_sources VALUES(?,?,?,?,?,?,?,?)',[sid,cid,uid,'Document','print variable '.repeat(300),'approved','{}',date]);});
 let calls=0;const real=provider({AI_PROVIDER:'openrouter',OPENROUTER_API_KEY:'test'});const client={embeddingModel:real.embeddingModel,embed:async texts=>{calls++;return real.embed(texts);}};
 let source=await store.tx(q=>q.one('SELECT * FROM nova_ai_sources WHERE id=?',[sid]));const first=await syncSource(store,source,client);assert.ok(first.length>1);await syncSource(store,source,client);assert.equal(calls,1);
 await store.tx(q=>q.run('UPDATE nova_ai_sources SET body=? WHERE id=?',['Updated document explains variables and print.',sid]));source=await store.tx(q=>q.one('SELECT * FROM nova_ai_sources WHERE id=?',[sid]));const next=await syncSource(store,source,client);assert.equal(next.length,1);assert.notEqual(first[0].id,next[0].id);
 await store.tx(q=>q.run("UPDATE nova_ai_sources SET status='revoked' WHERE id=?",[sid]));
 // Changed stale work must not repopulate the index after revocation.
 const stale={...source,body:'Another version about variables and print.'};assert.deepEqual(await syncSource(store,stale,client),[]);
 }finally{await store.close();}
});
test('Web evidence uses provider annotations, allowlisted HTTPS URLs and explicit cost opt-in',async()=>{
 const original=global.fetch;let request;
 try{
 const env={AI_PROVIDER:'openrouter',OPENROUTER_API_KEY:'test',AI_WEB_ENABLED:'true'};
 await assert.rejects(provider(env).search('Python loops'),/WEB_NOT_CONFIGURED/);
 global.fetch=async(url,opts)=>{request=JSON.parse(opts.body);return new Response(JSON.stringify({choices:[{message:{content:'Untrusted generated summary is not evidence',annotations:[{type:'url_citation',url_citation:{url:'https://docs.python.org/3/tutorial/',title:'Python',content:'Official tutorial excerpt about loops and iteration.'}},{type:'url_citation',url_citation:{url:'https://evil.test/',content:'Untrusted site content about programming.'}},{type:'url_citation',url_citation:{url:'https://docs.python.org/no-content',title:'No excerpt'}}]}}]}));};
 const sources=await provider({...env,OPENROUTER_FREE_ONLY:'false'}).search('Python loops');assert.equal(sources.length,1);assert.equal(request.messages[1].content,'Python loops');assert.equal(request.plugins[0].max_results,3);assert.match(sources[0].url,/docs.python.org/);
 }finally{global.fetch=original;}
});
