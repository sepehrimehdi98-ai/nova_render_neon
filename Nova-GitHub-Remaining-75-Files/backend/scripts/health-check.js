'use strict';
require('../lib/load-env');
(async()=>{const root=process.env.APP_ORIGIN||'http://127.0.0.1:3002';const response=await fetch(root+'/api/platform/health',{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Readiness returned HTTP '+response.status);const body=await response.json();if(!body.ok)throw new Error('Application is not ready.');console.log('Nova readiness passed.');})().catch(e=>{console.error('Nova readiness failed:',e.message);process.exitCode=1;});
