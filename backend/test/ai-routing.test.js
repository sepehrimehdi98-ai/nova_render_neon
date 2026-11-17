'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {provider}=require('../lib/platform/rag-engine');
const {configured}=require('../lib/platform/ai-routing');
const env={AI_PROVIDER:'openrouter',OPENROUTER_CHAT_API_KEY:'chat-test-only',OPENROUTER_CONTENT_API_KEY:'content-test-only',OPENROUTER_API_KEY:'legacy-test-only',OPENROUTER_CHAT_MODEL:'nvidia/nemotron-3.5-lightning:free',OPENROUTER_CONTENT_MODEL:'nvidia/nemotron-3.5-super-vl:free'};
test('task routing pairs models with matching keys while preserving prompts and evidence',async()=>{
 const old=global.fetch,requests=[];try{global.fetch=async(url,opts)=>{requests.push({url,key:opts.headers.authorization,...JSON.parse(opts.body)});return new Response(JSON.stringify({choices:[{message:{content:'{"answer":"ok","citations":[]}'}}]}))};
 const client=provider(env);await client.json('Answer the teacher',{question:'سلام',history:[{answer:'previous'}]});
 await client.forTask('block',{intent:'proposal'}).json('Be a teacher',{question:'Create a code block',evidence:[{id:'doc:1:1',text:'print(8)'}]});
 await client.forTask('tutor',{}).json('Independently check relevance',{draft:{answer:'ok'}});
 await client.forTask('tutor',{documentIds:['doc']}).json('Answer from file',{question:'Summarize',evidence:{sources:[]}});
 assert.deepEqual(requests[0].response_format,{type:'json_object'});assert.equal(requests[0].reasoning.enabled,false);assert.equal(requests[0].model,env.OPENROUTER_CHAT_MODEL);assert.equal(requests[0].key,'Bearer chat-test-only');
 for(const r of requests.slice(1)){assert.equal(r.model,env.OPENROUTER_CONTENT_MODEL);assert.equal(r.key,'Bearer content-test-only')}
 assert.equal(JSON.parse(requests[0].messages[1].content).history[0].answer,'previous');assert.equal(JSON.parse(requests[1].messages[1].content).evidence[0].text,'print(8)');
 assert.match(requests[0].messages[0].content,/untrusted reference data/);assert.equal(client.embeddingModel,'local-keyword-v1');assert.equal((await client.embed(['متغیر']))[0].length,1024);assert.equal(requests.length,4);
 }finally{global.fetch=old}
});
test('transient failure tries Ultra once with its own key; quota and auth never reroute',async()=>{
 const old=global.fetch;try{
 let requests=[];global.fetch=async(url,opts)=>{requests.push({key:opts.headers.authorization,...JSON.parse(opts.body)});if(requests.length===1)return new Response('{}',{status:503});return new Response(JSON.stringify({choices:[{message:{content:'{"answer":"backup"}'}}]}))};
 const result=await provider(env).json('Answer',{question:'Hi'});assert.equal(requests.length,2);assert.equal(requests[1].key,'Bearer legacy-test-only');assert.equal(requests[1].model,'nvidia/nemotron-3-ultra-550b-a55b:free');assert.equal(result.__routing.usedFreeFallback,true);assert.equal(JSON.stringify(result).includes('legacy-test-only'),false);
 for(const status of [401,402,403,429]){let calls=0;global.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:status===429?'daily quota exceeded':'denied'}}),{status})};await assert.rejects(provider(env).json('Answer',{}));assert.equal(calls,1)}
 }finally{global.fetch=old}
});
test('route cooldown is isolated, readiness supports new keys, free guard and opt out remain',async()=>{
 const old=global.fetch;try{let calls=0;global.fetch=async(url,opts)=>{calls++;return opts.headers.authorization==='Bearer chat-test-only'?new Response(JSON.stringify({error:{message:'daily quota exceeded'}}),{status:429}):new Response(JSON.stringify({choices:[{message:{content:'{"answer":"content"}'}}]}))};
 const client=provider(env);await assert.rejects(client.json('Answer',{}),/AI_DAILY_LIMIT/);assert.equal((await client.forTask('document',{}).json('Read file',{})).answer,'content');await assert.rejects(client.json('Answer',{}),/AI_DAILY_LIMIT/);assert.equal(calls,2);
 assert.equal(configured({...env,OPENROUTER_API_KEY:''}),true);assert.throws(()=>provider({...env,OPENROUTER_CONTENT_MODEL:'paid'}),/FREE_MODEL_REQUIRED/);
 calls=0;global.fetch=async()=>{calls++;return new Response('{}',{status:503})};await assert.rejects(provider({...env,OPENROUTER_FREE_FALLBACK:'off'}).json('Answer',{}));assert.equal(calls,1);
 }finally{global.fetch=old}
});
