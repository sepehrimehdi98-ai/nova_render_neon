const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const {startPortal}=require('../scripts/portal-server.cjs');
test('Render gateway validates exact browser origin before forwarding API writes',async()=>{
 let received=[];const upstream=http.createServer((req,res)=>{received.push(req.headers.origin);res.setHeader('Content-Type','application/json');res.end('{}');});
 await new Promise(r=>upstream.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+upstream.address().port;
 const portal=startPortal({role:'teacher',port:0,upstream:url,publicOrigin:'https://teacher-demo.onrender.com'});await new Promise(r=>portal.once('listening',r));const base='http://127.0.0.1:'+portal.address().port;
 try{
 for(const origin of [undefined,'https://evil.test','https://teacher-demo.onrender.com.evil.test']){const r=await fetch(base+'/api/platform/tickets',{method:'POST',headers:origin?{origin}:{},body:'{}'});assert.equal(r.status,403);}
 assert.equal(received.length,0);
 const good=await fetch(base+'/api/platform/tickets',{method:'POST',headers:{origin:'https://teacher-demo.onrender.com'},body:'{}'});assert.equal(good.status,200);assert.equal(received[0],url);
 }finally{await new Promise(r=>portal.close(r));await new Promise(r=>upstream.close(r));}
});
