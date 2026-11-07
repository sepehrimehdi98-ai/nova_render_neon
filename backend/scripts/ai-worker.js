'use strict';
require('../lib/load-env');
const {openStore}=require('../lib/platform/store');
const {processAi,provider}=require('../lib/platform/rag-engine');
(async()=>{const client=provider(),store=await openStore({migrate:false});let stop=false;process.on('SIGINT',()=>stop=true);process.on('SIGTERM',()=>stop=true);try{do{const worked=await processAi(store,{client});if(process.argv.includes('--once'))break;if(!worked)await new Promise(r=>setTimeout(r,1500));}while(!stop);}finally{await store.close();}})().catch(()=>{console.error('AI worker stopped; check private configuration and database availability.');process.exitCode=1;});
