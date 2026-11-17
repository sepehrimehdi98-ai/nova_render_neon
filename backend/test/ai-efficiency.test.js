'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {localGreeting,validatedCache}=require('../lib/platform/ai-efficiency');
const {provider}=require('../lib/platform/rag-engine');
const env={AI_PROVIDER:'openrouter',OPENROUTER_CHAT_API_KEY:'chat-efficiency-test',OPENROUTER_CONTENT_API_KEY:'content-efficiency-test'};
test('fixed greetings use zero provider calls and do not replace file, web, proposal or substantive requests',()=>{
 assert.equal(localGreeting('tutor',{question:'Hi!'}).routing.providerCalls,0);assert.match(localGreeting('block',{question:'سلام!'}).answer,/سلام/);assert.equal(localGreeting('conversation',{question:'Thanks!'}).operations.length,0);
 for(const input of [{question:'Explain variables'},{question:'Hi',documentIds:['owned']},{question:'Hi',webSearch:true},{question:'Hi',intent:'proposal'},{question:'Hi',target:'intro'},{question:'Hi',blockTypes:['code']}])assert.equal(localGreeting('block',input),null);
 assert.equal(localGreeting('author',{question:'Hi'}),null);
});
test('validated replies cache only identical private scope/context, expire, clone and evict',()=>{
 let now=0;const cache=validatedCache({clock:()=>now,maxEntries:2,ttlMs:1000}),input={question:'Explain',evidence:[{id:'source-v1'}]},key=cache.key('student-a:course-a','Answer',input),answer={answer:'Validated',operations:[]};
 assert.equal(cache.get(key),null);assert.equal(cache.key('', 'Answer',input),null);cache.put(key,answer);answer.answer='Changed externally';assert.equal(cache.get(key).answer,'Validated');const copy=cache.get(key);copy.answer='Changed clone';assert.equal(cache.get(key).answer,'Validated');
 assert.equal(cache.get(cache.key('student-b:course-a','Answer',input)),null);assert.equal(cache.get(cache.key('student-a:course-a','Answer',{...input,evidence:[{id:'source-v2'}]})),null);now=1000;assert.equal(cache.get(key),null);
 cache.put('a',{answer:'a'});cache.put('b',{answer:'b'});cache.put('c',{answer:'c'});assert.equal(cache.get('a'),null);assert.equal(cache.get('c').answer,'c');
});
test('identical in-flight work coalesces and only validated teacher results are reused',async()=>{
 const old=global.fetch;let calls=0,release;try{
 global.fetch=async()=>{calls++;await new Promise(r=>release=r);return new Response(JSON.stringify({choices:[{message:{content:'{"answer":"A variable refers to a value.","citations":[],"basis":"general"}'}}]}))};
 const client=provider(env).forTask('conversation',{},'teacher-a:course-a'),input={question:'Explain a variable in English',history:[]},a=client.json('Answer',input),b=client.json('Answer',input);assert.equal(calls,1);release();await Promise.all([a,b]);assert.equal(calls,1);
 global.fetch=async()=>{calls++;return new Response(JSON.stringify({choices:[{message:{content:'{"answer":"A variable refers to a value.","citations":[],"basis":"general"}'}}]}))};
 await client.json('Answer',input);assert.equal(calls,2,'unvalidated raw replies are not cached');
 const {jsonWithValidation,validateConversationReply}=require('../lib/platform/builder-ai');await jsonWithValidation(client,'Answer',input,v=>validateConversationReply(v,[],input.question));assert.equal(calls,3);const cached=await jsonWithValidation(client,'Answer',input,v=>validateConversationReply(v,[],input.question));assert.equal(calls,3);assert.equal(cached.__routing.cached,true);
 await provider(env).forTask('conversation',{},'teacher-b:course-a').json('Answer',input);assert.equal(calls,4);
 }finally{global.fetch=old}
});
test('same credential across model routes shares provider cooldown; retries honor Retry-After',async()=>{
 const old=global.fetch;let calls=0;try{global.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:'per minute rate limit'}}),{status:429,headers:{'retry-after':'30'}})};
 const client=provider({...env,OPENROUTER_CHAT_API_KEY:'same-account-test',OPENROUTER_CONTENT_API_KEY:'same-account-test'});await assert.rejects(client.json('Answer',{question:'English'}),/AI_RATE_LIMITED/);await assert.rejects(client.forTask('document',{}).json('Read',{}),e=>e.message==='AI_RATE_LIMITED'&&e.retryAfterSeconds>0);assert.equal(calls,1);
 }finally{global.fetch=old}
});

test('daily circuit recovers after a legitimate quota increase using a counter check, not repeated generation',async()=>{
 const old=global.fetch,state={dailyUntil:0,minuteUntil:0};let calls=0;try{global.fetch=async(url,opts)=>{calls++;if(url.endsWith('/key'))return new Response(JSON.stringify({data:{free_model_daily_requests:{remaining:100}}}));if(calls===1)return new Response(JSON.stringify({error:{message:'daily free-model quota exceeded'}}),{status:429});return new Response(JSON.stringify({choices:[{message:{content:'{"answer":"ok"}'}}]}))};const client=provider({AI_PROVIDER:'openrouter',OPENROUTER_API_KEY:'counter-test',__novaQuotaState:state});await assert.rejects(client.json('Answer',{}),/AI_DAILY_LIMIT/);await assert.rejects(client.json('Answer',{}),/AI_DAILY_LIMIT/);assert.equal(calls,1);state.probeAt=0;assert.equal((await client.json('Answer',{})).answer,'ok');assert.equal(calls,3);assert.equal(state.dailyUntil,0)}finally{global.fetch=old}
});
