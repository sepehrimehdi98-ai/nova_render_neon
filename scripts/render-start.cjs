'use strict';
require('../backend/lib/load-env');
process.env.APP_ORIGIN ||= process.env.RENDER_EXTERNAL_URL;
process.env.HOST = '0.0.0.0';
process.env.PORT ||= '10000';
process.env.NODE_ENV = 'production';
let stage = 'configuration';
const report = value => { stage = value; console.info(JSON.stringify({event:'nova_startup',stage})); };
report(stage);
// Fail promptly even when a driver or remote service never settles its promise.
const startupDeadline = setTimeout(() => {
  console.error(JSON.stringify({event:'nova_startup_failed',stage,code:'STARTUP_TIMEOUT'}));
  process.exit(1);
}, 60000);
(async () => {
  let worker;
  if(process.env.OPENROUTER_API_KEY) require('../backend/lib/platform/rag-engine').provider();
  const app = await require('../backend/product-server').start({onStartup:report});
  clearTimeout(startupDeadline);
  console.info(JSON.stringify({event:'nova_listening',address:app.server.address()}));
  if(process.env.OPENROUTER_API_KEY) {
    worker=require('node:child_process').fork(require('node:path').join(__dirname,'../backend/scripts/ai-worker.js'),[],{stdio:'inherit'});
    worker.on('exit',()=>{console.error('AI worker exited; restarting service.');app.close().finally(()=>process.exit(1));});
    app.server.on('request',(req,res)=>{if(req.method!=='POST')return;res.once('finish',()=>{if((res.statusCode===202||res.statusCode===201&&req.url.includes('/ai/sources'))&&worker?.connected)worker.send({type:'nova:ai-work'},()=>{});});});
  }
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => {
    if(worker){worker.removeAllListeners('exit');worker.kill(signal);}
    app.close().then(() => process.exit(0)).catch(() => process.exit(1));
  });
})().catch(error => {
  clearTimeout(startupDeadline);
  const candidate=error.code || error.message;
  const code=/^[A-Z0-9_]{2,64}$/.test(candidate||'')?candidate:'STARTUP_CONFIGURATION_OR_DATABASE_ERROR';
  console.error(JSON.stringify({event:'nova_startup_failed',stage,code}));
  // A failed pg pool can keep the event loop alive after initialization fails.
  process.exit(1);
});
