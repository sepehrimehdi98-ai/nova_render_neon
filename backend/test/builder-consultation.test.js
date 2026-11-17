'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {openStore}=require('../lib/platform/store'),{start}=require('../product-server'),{processAi}=require('../lib/platform/rag-engine'),{documentEvidence,validateBuilderReply}=require('../lib/platform/builder-ai');
test('teacher source answers get one bounded repair while ordinary greetings need no citation',async()=>{
 const late=documentEvidence([{id:'late',name:'Long text',pages_json:JSON.stringify([{page:1,text:'Unrelated introduction. '.repeat(700)+' Workshop mascot Copper Finch.'}])}],'What is the workshop mascot in the uploaded file?');assert.match(late[0].text,/Copper Finch/);assert.ok(late[0].text.length<=2200);
 const {jsonWithValidation,validateConversationReply}=require('../lib/platform/builder-ai'),evidence=[{id:'doc:owned:1',text:'Silver Lynx',title:'Club'}];let calls=0;
 const client={json:async()=>{calls++;return {answer:'Silver Lynx',basis:'sources',citations:[calls===1?'invented':'doc:owned:1']}}};
 const answer=await jsonWithValidation(client,'Answer with citations',{},v=>validateConversationReply(v,evidence,'According to the selected document'));assert.equal(calls,2);assert.equal(answer.__attempts,2);assert.deepEqual(answer.citations,['doc:owned:1']);
 assert.throws(()=>validateConversationReply({answer:'Silver Lynx',basis:'general',citations:[]},evidence,'According to the selected document'));
 assert.equal(validateConversationReply({answer:'Hello!',basis:'general',citations:[]},evidence,'Hi').answer,'Hello!');
 calls=0;await assert.rejects(jsonWithValidation({json:async()=>{calls++;throw Error('AI_RATE_LIMITED')}},'',{},()=>{}),/AI_RATE_LIMITED/);assert.equal(calls,1);
});
test('builder consultation supports normal replies, isolates lessons, restores saved conversations and gates summaries/citations',async()=>{
 const previous={AI_PROVIDER:process.env.AI_PROVIDER,OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY};process.env.AI_PROVIDER='openrouter';process.env.OPENROUTER_API_KEY='mock-only';
 const store=await openStore({filename:':memory:',url:''}),app=await start({port:0,demo:true,store}),base='http://127.0.0.1:'+app.server.address().port,cookies={};
 async function call(role,path,body,status=200){const r=await fetch(base+'/api/platform'+path,{method:body===undefined?'GET':'POST',headers:{origin:'http://127.0.0.1:3003','content-type':'application/json',cookie:cookies[role]||''},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,status,path+' '+JSON.stringify(d));if(r.headers.get('set-cookie'))cookies[role]=r.headers.get('set-cookie').split(';')[0];return d;}
 try{for(const role of ['admin','teacher','student'])await call(role,'/login',{demoRole:role});const users=(await call('admin','/users')).users,cid=(await call('admin','/courses',{title:'Consultation verification'},201)).id;await call('admin','/courses/'+cid+'/members',{userId:users.find(u=>u.role==='teacher').id,active:true});const endpoint='/courses/'+cid+'/builder-chat',a=randomUUID(),b=randomUUID(),blocks=[{id:'text-1',kind:'text',title:'Variables',body:'Variables hold values.'}];
 async function send(conversationId,question,check,result={answer:'A helpful ordinary reply.',operations:[],citations:[],basis:'general'},extra={}){const job=await call('teacher',endpoint,{conversationId,question,blocks,...extra},202);await processAi(store,{client:{json:async(instruction,input)=>{if(extra.intent==='summary'){assert.match(instruction,/student-facing improvement tip in the summary body itself/);assert.match(instruction,/Follow the explicit teacher description/);assert.match(instruction,/1-2 sentences to introduce a proposal/);}check(input);return result}}});return (await call('teacher',endpoint+'?conversationId='+conversationId)).jobs.find(j=>j.id===job.id);}
 assert.equal((await send(a,'Hello, can we discuss teaching?',input=>assert.equal(input.history.length,0))).status,'completed');
 assert.equal((await send(b,'Unrelated lesson',input=>assert.equal(input.history.length,0))).status,'completed');
 assert.equal((await send(a,'What did we discuss?',input=>{assert.equal(input.history.length,1);assert.match(input.history[0].question,/Hello/)})).status,'completed');
 const lesson=await call('teacher','/courses/'+cid+'/lessons',{title:'Consultation draft',blocks,exercise:{prompt:''},quiz:[]},201);await call('teacher',endpoint,{action:'bind',conversationId:a,lessonId:lesson.id});assert.equal((await call('teacher',endpoint+'?lessonId='+lesson.id+'&conversationId='+b)).jobs.length,2);assert.equal((await call('admin',endpoint+'?lessonId='+lesson.id)).jobs.length,0);
 const follow=await send(a,'Continue the saved lesson discussion',input=>assert.equal(input.history.length,2),undefined,{lessonId:lesson.id});assert.equal(follow.status,'completed');
 const summary=await send(a,'Summarize the lesson',input=>assert.equal(input.intent,'summary'),{answer:'Please review this summary.',operations:[{action:'add',block:{kind:'summary',title:'Lesson summary',body:'Variables hold values. Choose meaningful names.'}}],citations:[],basis:'general'},{intent:'summary',blockTypes:['summary'],lessonId:lesson.id});assert.equal(summary.status,'completed');assert.equal(JSON.parse(summary.result_json).operations[0].block.kind,'summary');assert.equal((await call('teacher','/lessons/'+lesson.id)).draftRev,1,'AI never auto-applies a proposal');
 const forged=await send(a,'Explain this source',()=>{},{answer:'Unsupported claim.',operations:[],citations:['invented-page'],basis:'sources'});assert.equal(forged.status,'blocked');assert.equal(JSON.parse(forged.result_json).error,'INVALID_AI_RESPONSE');
 const afterFailure=await send(a,'Continue after the unavailable response',input=>assert.ok(input.history.some(h=>h.question==='Explain this source')));assert.equal(afterFailure.status,'completed');
 const interrupted=await call('teacher',endpoint,{conversationId:a,question:'Resume after worker restart',blocks},202);await processAi(store,{client:{json:async()=>{throw Error('AI_WORKER_STOPPING')}}});assert.equal((await call('teacher',endpoint+'?conversationId='+a)).jobs.find(j=>j.id===interrupted.id).status,'queued');await processAi(store,{client:{json:async()=>({answer:'The interrupted request resumed.',operations:[]})}});assert.equal((await call('teacher',endpoint+'?conversationId='+a)).jobs.find(j=>j.id===interrupted.id).status,'completed');
 await call('teacher',endpoint,{conversationId:'bad',question:'Hello',blocks},400);await call('student',endpoint,undefined,403);
 const pages=[{page:1,text:'Introduction unrelated to loops.'},{page:9,text:'Copper Finch workshop mascot. A loop repeats a sequence.'}];const evidence=documentEvidence([{id:'d',name:'Workshop',pages_json:JSON.stringify(pages)}],'Copper Finch mascot');assert.equal(evidence[0].page,9);assert.equal(validateBuilderReply({answer:'The mascot is Copper Finch.',operations:[],citations:['doc:d:9'],basis:'sources'},{blocks:[]},evidence).sources[0].page,9);
 assert.throws(()=>validateBuilderReply({answer:'No changes',operations:[]},{blocks:[],intent:'summary'},[]));assert.throws(()=>validateBuilderReply({answer:'Fake URL',operations:[{action:'add',block:{kind:'video',sourceUrl:'https://bad.example'}}]},{blocks:[]},[]));
 }finally{await app.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

test('lesson proposals remove decorative markup while preserving code, quotations and citation checks',()=>{
 const {cleanLessonProposal,lessonProse}=require('../lib/platform/lesson-copy');
 const code='name = "Nova"\n# Keep this Python comment\nprint(name)\nvalue = -2';
 const raw={answer:'## Key points\n- **Variables** store values.\n\n### Improvement\n- Add one comparison.',operations:[{action:'add',block:{kind:'code',title:'# Example',description:'- **Print** the value.',body:code}},{action:'add',block:{kind:'exercise',title:'Practice',body:'## Task\n- Print "Nova".',starter:code,sampleAnswer:code,feedback:'**Good work**'}},{action:'add',block:{kind:'summary',title:'## Summary',body:'"Variables hold values."\n- Use meaningful names.'}}],citations:[],basis:'general'};
 const clean=cleanLessonProposal(raw);assert.equal(clean.operations[0].block.body,code);assert.equal(clean.operations[1].block.starter,code);assert.equal(clean.operations[1].block.sampleAnswer,code);assert.equal(clean.operations[1].block.body,'Task\nPrint "Nova".');assert.equal(clean.operations[2].block.body,'"Variables hold values."\nUse meaningful names.');assert.ok(!clean.answer.includes('#'));assert.ok(!clean.answer.includes('**'));assert.equal(raw.operations[0].block.title,'# Example','input remains unchanged');
 assert.equal(lessonProse('C# and -2 remain; `a_b` is a name.'),'C# and -2 remain; `a_b` is a name.');assert.equal(lessonProse('```python\n# comment\nprint("Nova")\n```'),'```python\n# comment\nprint("Nova")\n```');
 assert.equal(validateBuilderReply(raw,{blocks:[],intent:'proposal'},[]).operations[0].block.body,code);
 assert.throws(()=>validateBuilderReply({...raw,citations:['forged']},{blocks:[],intent:'proposal'},[]),/INVALID_AI_RESPONSE/);
 assert.equal(cleanLessonProposal({answer:'## Ordinary chat',operations:[]}).answer,'## Ordinary chat');
});

test('ordinary lesson consultation cannot produce unsolicited block operations',async()=>{
 const {allowsBuilderOperations,jsonWithValidation,validateBuilderReply}=require('../lib/platform/builder-ai');
 const input={question:'Hello! Can we discuss teaching before making changes?',blocks:[]};
 const proposal={answer:'Proposed',operations:[{action:'add',block:{kind:'text',body:'A variable refers to a value.'}}],citations:[],basis:'general'};
 assert.equal(allowsBuilderOperations(input),false);assert.throws(()=>validateBuilderReply(proposal,input,[]),/INVALID_AI_RESPONSE/);
 assert.equal(allowsBuilderOperations({question:'Do not change the lesson, explain variables.'}),false);
 assert.equal(allowsBuilderOperations({question:'Add a summary of variables.'}),true);
 assert.equal(allowsBuilderOperations({question:'یک نکته اضافه کن'}),true);
 assert.equal(allowsBuilderOperations({question:'سلام',intent:'proposal',blockTypes:['text']}),true);
 let calls=0;const reply=await jsonWithValidation({json:async()=>++calls===1?proposal:{answer:'Yes, let us discuss the lesson.',operations:[],citations:[],basis:'general'}},'Consultation only',input,v=>validateBuilderReply(v,input,[]));assert.equal(calls,2);assert.equal(reply.operations.length,0);
});

test('Persian output rejects foreign fragments and uses one bounded repair without changing code',async()=>{
 const {validateReplyLanguage}=require('../lib/platform/reply-language'),{jsonWithValidation}=require('../lib/platform/builder-ai');
 assert.throws(()=>validateReplyLanguage({answer:'متغیر را 前に آموزش بده'},{question:'روش تدریس متغیر چیست؟'}),/INVALID_AI_RESPONSE/);
 assert.throws(()=>validateReplyLanguage({answer:'از Random words استفاده کن'},{question:'فقط فارسی پاسخ بده'}),/INVALID_AI_RESPONSE/);
 assert.doesNotThrow(()=>validateReplyLanguage({answer:'کد: `print("你好")`',operations:[{block:{kind:'code',body:'print("你好")'}}]},{question:'یک مثال فارسی برای کد بده'}));
 let calls=0;const answer=await jsonWithValidation({json:async()=>({answer:++calls===1?'متغیر 前に':'متغیر نامی برای اشاره به یک مقدار است.',operations:[]})},'Consult naturally',{question:'متغیر چیست؟'},()=>{});assert.equal(calls,2);assert.ok(!answer.answer.includes('前'));
});
