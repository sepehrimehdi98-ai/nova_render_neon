'use strict';
require('../lib/load-env');
const {openStore}=require('../lib/platform/store');
(async()=>{const store=await openStore();await store.close();console.log('Nova course platform schema initialized.');})().catch(e=>{console.error('Platform migration failed:',e.code||'storage unavailable');process.exitCode=1;});
