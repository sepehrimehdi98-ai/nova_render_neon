const test=require('node:test'),assert=require('node:assert/strict');
const {provider,cosine}=require('../lib/platform/rag-engine');
const env={AI_PROVIDER:'openrouter',OPENROUTER_API_KEY:'test-secret'};
test('OpenRouter routing, authentication, JSON and safe failures',async()=>{
 const original=global.fetch;const requests=[];
 try{
 global.fetch=async(url,opts)=>{requests.push({url,...opts});return new Response(JSON.stringify({choices:[{message:{content:'```json\n{"answer":"ok"}\n```'}}]}));};
 const client=provider(env);assert.equal((await client.json('Explain',{})).answer,'ok');
 assert.equal(requests[0].url,'https://openrouter.ai/api/v1/chat/completions');
 assert.equal(requests[0].headers.authorization,'Bearer test-secret');
 const body=JSON.parse(requests[0].body);assert.ok(body.model.endsWith(':free'));assert.equal(body.provider.allow_fallbacks,false);
 await assert.rejects(client.json('',{},true),/WEB_NOT_CONFIGURED/);
 assert.throws(()=>provider({...env,OPENROUTER_CHAT_MODEL:'paid-model'}),/FREE_MODEL_REQUIRED/);
 assert.throws(()=>provider({...env,OPENROUTER_API_KEY:''}),/AI_NOT_CONFIGURED/);
 global.fetch=async()=>new Response('{}',{status:429});await assert.rejects(client.json('',{}),/AI_RATE_LIMITED/);
 global.fetch=async()=>new Response(JSON.stringify({error:{message:'secret'}}));await assert.rejects(client.json('',{}),/AI_PROVIDER_UNAVAILABLE/);
 global.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'invalid json'}}]}));await assert.rejects(client.json('',{}));
 }finally{global.fetch=original;}
});
test('Free RAG ranks Persian and Python keywords locally',async()=>{
 const client=provider(env);const vectors=await client.embed(['print متغیر','print متغیر مقدار','حلقه range']);
 assert.equal(client.embeddingModel,'local-keyword-v1');assert.ok(cosine(vectors[0],vectors[1])>cosine(vectors[0],vectors[2]));
 assert.deepEqual((await client.embed(['print متغیر']))[0],vectors[0]);
 await assert.rejects(provider({...env,OPENROUTER_EMBEDDING_MODEL:'paid'}).embed(['hello']),/PAID_EMBEDDINGS_DISABLED/);
});
test('Hosted seed refuses default passwords before connecting',async()=>{
 const old=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try{await assert.rejects(require('../scripts/demo-seed').seed(),/Hosted seed requires/);}finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old;}
});
test('Seeded lessons persist and OpenRouter RAG completes student and teacher jobs',async()=>{
 const fs=require('node:fs'),path=require('node:path');
 const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'nova-ai-test-'));
 const oldDb=process.env.NOVA_LOCAL_DB,original=global.fetch;
 process.env.NOVA_LOCAL_DB=path.join(dir,'test.sqlite');let store;
 try{
 await require('../scripts/demo-seed').seed();
 await require('../scripts/demo-seed').seed();
 store=await require('../lib/platform/store').openStore();
 const users=await store.tx(q=>q.all('SELECT * FROM nova_users'));
 const lessons=await store.tx(q=>q.all('SELECT * FROM nova_lessons'));
 assert.equal(users.length,3);assert.equal(lessons.length,3);
 const lesson=lessons[0];let calls=0;
 global.fetch=async(url,opts)=>{
  calls++;const payload=JSON.parse(opts.body),input=JSON.parse(payload.messages[1].content);
  assert.ok(!opts.body.includes('gradingTests'));assert.ok(!opts.body.includes('"correct":'));
  const result=input.draft?{accepted:true,feedback:'Supported'}:{answer:'A variable stores a value.',citations:[input.evidence.sources[0].id],needsTeacher:false};
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(result)}}]}));
 };
 for(const role of ['student','teacher']){
  const uid=users.find(u=>u.role===role).id,id=require('node:crypto').randomUUID();
  await store.tx(q=>q.run('INSERT INTO nova_ai_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?)',[id,uid,lesson.course_id,lesson.id,role==='student'?'tutor':'author',JSON.stringify({lessonId:lesson.id,question:'Explain variables'}),'queued','{}',null,null,new Date().toISOString()]));
  await require('../lib/platform/rag-engine').processAi(store,{client:provider(env)});
  const job=await store.tx(q=>q.one('SELECT * FROM nova_ai_jobs WHERE id=?',[id]));
  assert.equal(job.status,'completed');assert.equal(JSON.parse(job.result_json).answer,'A variable stores a value.');
 }
 assert.equal(calls,4);
 }finally{global.fetch=original;if(store)await store.close();if(oldDb===undefined)delete process.env.NOVA_LOCAL_DB;else process.env.NOVA_LOCAL_DB=oldDb;fs.rmSync(dir,{recursive:true,force:true});}
});
