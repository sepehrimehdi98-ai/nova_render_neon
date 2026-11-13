'use strict';
const path=require('node:path');const root=path.resolve(__dirname,'..');process.chdir(root);
process.env.NODE_ENV='development';process.env.DATABASE_URL='';process.env.NOVA_LOCAL_DB=path.join(root,'backend/data/nova-platform.sqlite');process.env.HOST='127.0.0.1';process.env.PORT='3003';process.env.APP_ORIGIN='http://127.0.0.1:3003';process.env.APP_ORIGINS='http://127.0.0.1:3101,http://127.0.0.1:3102,http://127.0.0.1:3103';process.env.RENDER_EXTERNAL_URL='';
require('./start.cjs');const {startPortal}=require('./portal-server.cjs');const servers=[];
for(const [role,port] of [['student',3101],['teacher',3102],['admin',3103]]){const s=startPortal({role,port,root:path.join(root,'portals',role,'dist'),upstream:'http://127.0.0.1:3003'});servers.push(s);s.on('listening',()=>console.log(role+' http://127.0.0.1:'+port));}
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>servers.forEach(s=>s.close()));
