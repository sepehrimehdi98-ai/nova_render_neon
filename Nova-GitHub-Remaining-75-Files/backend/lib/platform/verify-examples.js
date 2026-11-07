'use strict';
const {runDocker}=require('./grader');
async function verifyExamples(draft,runner=runDocker){
 const fences=[...draft.answer.matchAll(/```([^\n`]*)\n([\s\S]*?)```/g)];
 const code=fences.filter(m=>['','python','py','python3'].includes(m[1].trim().toLowerCase())).map(m=>m[2]);
 if(!code.length)return {accepted:true,status:'no_python_blocks',checks:[]};
 if(code.length>3||code.some(c=>c.length>4000))return {accepted:false,status:'example_limit',checks:[]};
 if(!Array.isArray(draft.examples)||draft.examples.length!==code.length)return {accepted:false,status:'missing_example_contract',checks:[]};
 const checks=[];
 for(let i=0;i<code.length;i++){
  const example=draft.examples[i];
  if(!example||typeof example.stdin!=='string'||example.stdin.length>2000||typeof example.stdout!=='string'||example.stdout.length>4000)return {accepted:false,status:'invalid_example_contract',checks:[]};
  try{const result=await runner(code[i],example.stdin);const normalize=s=>String(s||'').replace(/\r\n/g,'\n').trimEnd();checks.push({index:i,passed:result.ok===true&&normalize(result.stdout)===normalize(example.stdout),reason:result.reason});}
  catch{return {accepted:false,status:'execution_unavailable',checks};}
 }
 return {accepted:checks.every(c=>c.passed),status:'executed',checks};
}
module.exports={verifyExamples};
