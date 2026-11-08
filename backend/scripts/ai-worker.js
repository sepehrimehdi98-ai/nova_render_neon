'use strict';
require('../lib/load-env');
const {openStore}=require('../lib/platform/store');
const {processAi,provider}=require('../lib/platform/rag-engine');
(async()=>{const client=provider(),store=await openStore({migrate:false});let stop=false,idle=1500;process.on('SIGINT',()=>stop=true);process.on('SIGTERM',()=>stop=true);try{do{const worked=await processAi(store,{client});if(process.argv.includes('--once'))break;idle=worked?1500:Math.min(idle*2,60000);if(!worked)await new Promise(r=>setTimeout(r,idle));}while(!stop);}finally{await store.close();}})().catch(()=>{console.error('AI worker stopped; check private configuration and database availability.');process.exitCode=1;});
