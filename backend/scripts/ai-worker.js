'use strict';
require('../lib/load-env');
const {openStore}=require('../lib/platform/store');
const {processAi,provider}=require('../lib/platform/rag-engine');
const {workerOptions,wakeSignal,runAiWorker}=require('../lib/platform/ai-runner');
(async()=>{const options=workerOptions(),client=provider(),store=await openStore({migrate:false}),controller=new AbortController(),wake=wakeSignal();let wakeTimer;
 const stop=()=>{controller.abort();wake.wake()},message=m=>{if(m?.type==='nova:ai-work'){clearTimeout(wakeTimer);wakeTimer=setTimeout(()=>wake.wake(),100)}};process.on('SIGINT',stop);process.on('SIGTERM',stop);process.on('message',message);
 try{if(process.argv.includes('--once'))await processAi(store,{client});else await runAiWorker({store,client,processJob:processAi,signal:controller.signal,wake,...options})}finally{clearTimeout(wakeTimer);process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);process.removeListener('message',message);await store.close()}
})().catch(()=>{console.error('AI worker stopped; check private configuration and database availability.');process.exitCode=1});
