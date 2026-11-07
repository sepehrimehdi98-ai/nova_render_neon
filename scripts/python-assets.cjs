const fs=require('node:fs');const path=require('node:path');
const target=process.argv[2]?path.resolve(process.argv[2],'python'):path.join(__dirname,'../backend/dist/python');fs.mkdirSync(target,{recursive:true});
const source=path.join(__dirname,'../frontend/node_modules/pyodide');
for(const name of fs.readdirSync(source)){if(/\.(wasm|zip|js|mjs|json)$/.test(name)&&!name.includes('package'))fs.copyFileSync(path.join(source,name),path.join(target,name));}
console.log('Offline Python assets copied.');
