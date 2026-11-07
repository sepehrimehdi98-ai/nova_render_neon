'use strict';
require('../backend/lib/load-env');
process.env.APP_ORIGIN ||= process.env.RENDER_EXTERNAL_URL;
process.env.HOST = '0.0.0.0';
process.env.PORT ||= '10000';
process.env.NODE_ENV = 'production';
(async () => {
  let worker;
  if(process.env.OPENROUTER_API_KEY) require('../backend/lib/platform/rag-engine').provider();
  const app = await require('../backend/product-server').start();
  if(process.env.OPENROUTER_API_KEY) {
    worker=require('node:child_process').fork(require('node:path').join(__dirname,'../backend/scripts/ai-worker.js'),[],{stdio:'inherit'});
    worker.on('exit',()=>{console.error('AI worker exited; restarting service.');app.close().finally(()=>process.exit(1));});
  }
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => {
    if(worker){worker.removeAllListeners('exit');worker.kill(signal);}
    app.close().then(() => process.exit(0)).catch(() => process.exit(1));
  });
})().catch(error => {
  console.error('Nova startup failed:', error.code || 'Check deployment configuration');
  process.exitCode = 1;
});
