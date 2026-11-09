'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {once}=require('node:events');
const {startPortal}=require('./portal-server.cjs');
test('all portal health checks survive an unavailable API and detect missing builds',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nova-health-'));
 fs.writeFileSync(path.join(root,'index.html'),'<html>Nova</html>');
 try{for(const role of ['student','teacher','admin']){
  const server=startPortal({role,root,port:0,upstream:'http://127.0.0.1:1'});await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try{
   const response=await fetch(base+'/healthz');assert.equal(response.status,200);assert.deepEqual(await response.json(),{ready:true,role});
   assert.equal((await fetch(base+'/api/platform/health')).status,502);
   fs.renameSync(path.join(root,'index.html'),path.join(root,'index.saved'));
   assert.equal((await fetch(base+'/healthz')).status,503);
   fs.renameSync(path.join(root,'index.saved'),path.join(root,'index.html'));
  }finally{await new Promise(r=>server.close(r));}
 }}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('startup exits on a stalled database and does not log credentials on failures',async()=>{
 const script=fs.readFileSync(path.join(__dirname,'render-start.cjs'),'utf8');
 for(const failure of [null,Object.assign(new Error('postgres://private:secret@db'),{code:'28P01'})]){
  let deadline,exitCode;const logs=[];
  const context={process:{env:{RENDER_EXTERNAL_URL:'https://api.example'},exit:code=>{exitCode=code;}},console:{info:v=>logs.push(v),error:v=>logs.push(v)},setTimeout:fn=>{deadline=fn;return 1;},clearTimeout:()=>{},require:name=>{
   if(name.endsWith('load-env'))return {};
   if(name.endsWith('product-server'))return {start:({onStartup})=>{onStartup('database_connect_and_migrate');return failure?Promise.reject(failure):new Promise(()=>{});}};
   throw Error('Unexpected module');
  }};
  vm.runInNewContext(script,context);await new Promise(r=>setImmediate(r));
  if(!failure)deadline();
  assert.equal(exitCode,1);assert.ok(logs.some(v=>v.includes(failure?'28P01':'STARTUP_TIMEOUT')));assert.ok(logs.some(v=>v.includes('database_connect_and_migrate')));assert.ok(logs.every(v=>!v.includes('secret')));
 }
});
