'use strict';
const http=require('node:http'),https=require('node:https'),fs=require('node:fs'),path=require('node:path');
function startPortal(options={}){
const role=options.role||process.env.PORTAL_ROLE;if(!['student','teacher','admin'].includes(role))throw Error('PORTAL_ROLE must be student, teacher or admin');
const root=path.resolve(options.root||process.env.STATIC_DIRECTORY||path.join(__dirname,'../portals',role,'dist'));
if(process.env.NODE_ENV==='production'&&!options.upstream&&!process.env.API_UPSTREAM)throw Error('API_UPSTREAM is required in production');
const upstream=new URL(options.upstream||process.env.API_UPSTREAM||'http://127.0.0.1:3003');
if(!['http:','https:'].includes(upstream.protocol)||upstream.username||upstream.password||upstream.pathname!=='/'||upstream.search||upstream.hash)throw Error('API_UPSTREAM must be an HTTP(S) origin without credentials');
const publicOrigin=options.publicOrigin||process.env.RENDER_EXTERNAL_URL;
const allowedOrigins=publicOrigin?[publicOrigin,...(process.env.PORTAL_ORIGINS||'').split(',').filter(Boolean)]:[];
for(const origin of allowedOrigins){const parsed=new URL(origin);if(parsed.origin!==origin||parsed.protocol!=='https:')throw Error('Portal origins must be exact HTTPS origins');}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.wasm':'application/wasm','.json':'application/json','.zip':'application/zip'};
const server=http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(process.env.NODE_ENV==='production'){res.setHeader('Strict-Transport-Security','max-age=31536000');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'; connect-src 'self'; media-src 'self' blob: data:; frame-src https://stream.novextech.ir https://kavimo.com https://*.kavimo.com https://kavimo.ir https://*.kavimo.ir; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");}

 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{res.writeHead(400);return res.end()}
 if(pathname==='/healthz'&&['GET','HEAD'].includes(req.method)){
  const ready=fs.existsSync(path.join(root,'index.html'));
  res.writeHead(ready?200:503,{'Content-Type':'application/json','Cache-Control':'no-store'});
  return res.end(req.method==='HEAD'?undefined:JSON.stringify({ready,role}));
 }
 if(pathname.startsWith('/api/platform/')){
  let rest=pathname.slice('/api/platform'.length);const portal=rest.match(/^\/portal\/(student|teacher|admin)(?=\/)/);if(portal&&portal[1]!==role){res.writeHead(403);return res.end(JSON.stringify({error:'Wrong portal'}))}if(!portal)rest='/portal/'+role+rest;
  // On Render, validate the browser's own portal origin before rewriting it
  // for the backend. This avoids circular Blueprint dependencies.
  if(publicOrigin&&!['GET','HEAD','OPTIONS'].includes(req.method)&&!allowedOrigins.includes(req.headers.origin)){res.writeHead(403,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Origin not allowed'}));}
  const headers={...req.headers,host:upstream.host};
  if(publicOrigin&&req.headers.origin){if(!allowedOrigins.includes(req.headers.origin)){res.writeHead(403);return res.end();}headers.origin=upstream.origin;}
delete headers['x-forwarded-for'];delete headers['x-forwarded-host'];delete headers['forwarded'];
  // The backend may trust this gateway address explicitly; never forward a client-supplied chain.
  headers['x-forwarded-for']=req.socket.remoteAddress;
  const transport=upstream.protocol==='https:'?https:http;
  const proxy=transport.request(new URL('/api/platform'+rest+new URL(req.url,'http://local').search,upstream),{method:req.method,headers,timeout:30000},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res)});
  proxy.on('timeout',()=>proxy.destroy());proxy.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'ارتباط با سرویس برقرار نشد.'}))});req.on('aborted',()=>proxy.destroy());req.pipe(proxy);return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 if(pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);return res.end()}
 const target=path.resolve(root,'.'+pathname);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 const file=fs.existsSync(target)&&fs.statSync(target).isFile()?target:!path.extname(pathname)?path.join(root,'index.html'):null;
 if(!file||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin'});if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
});server.listen(options.port??Number(process.env.PORT||3101),process.env.HOST||'127.0.0.1');return server;
}
if(require.main===module){const server=startPortal();server.on('listening',()=>console.log('Nova portal listening on '+JSON.stringify(server.address())));}
module.exports={startPortal};
