'use strict';
require('./lib/load-env');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { openStore } = require('./lib/platform/store');
const { createPlatform } = require('./lib/platform/service');
async function start({ port = Number(process.env.PORT || 3003), host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'), store: providedStore, origin = process.env.APP_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:3003'), demo = process.env.NOVA_DEMO_MODE === 'true' } = {}) {
    const parsed = new URL(origin);
    if (parsed.origin !== origin)
        throw new Error('APP_ORIGIN must be an exact origin without a trailing slash.');
    if (process.env.NODE_ENV === 'production' && (demo || parsed.protocol !== 'https:' || !process.env.DATABASE_URL))
        throw new Error('Production requires HTTPS APP_ORIGIN, PostgreSQL and demo mode disabled.');
    if (process.env.NODE_ENV === 'production' && (process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_USERNAME || process.env.BOOTSTRAP_ADMIN_NAME || process.env.ADMIN_RECOVERY_PASSWORD || process.env.ADMIN_RECOVERY_USERNAME)) throw new Error('Remove bootstrap environment variables before starting the server.');
    for(const allowed of (process.env.APP_ORIGINS||'').split(',').filter(Boolean)){const u=new URL(allowed);if(u.origin!==allowed||(process.env.NODE_ENV==='production'&&u.protocol!=='https:'))throw Error('APP_ORIGINS must contain exact HTTPS origins in production.');}
    const store = providedStore || await openStore();
    if (demo && store.postgres)
        throw new Error('Local role access cannot be enabled against PostgreSQL.');
    const platform = await createPlatform(store, { demo, origin });
    const root = path.join(__dirname, 'dist'), types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.py': 'text/plain', '.zip': 'application/zip' };
    const server = http.createServer((req, res) => {const started=Date.now();const requestId=require('node:crypto').randomUUID();res.setHeader('X-Request-ID',requestId);res.once('finish',()=>{const duration=Date.now()-started;require('./lib/platform/monitor').record(res.statusCode,duration);if(res.statusCode>=500||duration>1000)console.info(JSON.stringify({event:'nova_request',requestId,status:res.statusCode,durationMs:duration}));});
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000');
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'; connect-src 'self'; media-src 'self' blob: data:;  frame-src https://stream.novextech.ir https://kavimo.com https://*.kavimo.com https://kavimo.ir https://*.kavimo.ir; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
        }
        let route; try { route=decodeURIComponent(new URL(req.url,origin).pathname); } catch {res.writeHead(400);return res.end('Bad URL');}
        if(route.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);return res.end('Not found');}
        if(route==='/api/platform/live'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({alive:true}));}
        if (route.startsWith('/api/platform/')) {
            platform.handler(req, res).catch(() => { if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'خطای داخلی سرور.' }));
            }
            else
                res.end(); });
            return;
        }
        if (route.startsWith('/api/')) {
            res.writeHead(404);
            return res.end('Not found');
        }
        if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
        const target=path.resolve(root,'.'+route);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
        const entry=path.join(target,'index.html');const file=fs.existsSync(entry)&&fs.statSync(entry).isFile()?entry:fs.existsSync(target)&&fs.statSync(target).isFile()?target:!path.extname(route)?path.join(root,'index.html'):null;
        if(!file||!fs.existsSync(file)){res.writeHead(404);return res.end('Build the frontend first: npm run build');}
        res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control',path.basename(file)==='index.html'?'no-cache':'public, max-age=3600');
        if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
    });
    server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
    return { server, store, platform, async close() { await new Promise(resolve => server.close(resolve)); await store.close(); } };
}
if (require.main === module)
    start().then(app => { console.log('Nova product server listening on ' + JSON.stringify(app.server.address())); const stop = () => app.close().then(() => process.exit(0)); process.on('SIGINT', stop); process.on('SIGTERM', stop); }).catch(e => { console.error('Nova startup failed:', e.message); process.exitCode = 1; });
module.exports = { start };
