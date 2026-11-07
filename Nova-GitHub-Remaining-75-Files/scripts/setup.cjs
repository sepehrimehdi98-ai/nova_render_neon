const {spawnSync}=require('node:child_process');const path=require('node:path');const root=path.join(__dirname,'..');
for(const dir of ['backend','frontend']){const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['install'],{cwd:path.join(root,dir),stdio:'inherit',shell:process.platform==='win32'});if(r.status)process.exit(r.status);}
for(const task of ['build','build:portals']){const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run',task],{cwd:root,stdio:'inherit',shell:process.platform==='win32'});if(r.status)process.exit(r.status);} 
