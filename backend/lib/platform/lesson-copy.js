'use strict';
// Normalize presentation only. Code, evidence IDs and internal quotation marks remain intact.
function lessonProse(text){
 if(typeof text!=='string')return text;
 let fenced=false;
 return text.split('\n').map(line=>{
  if(/^\s*```/.test(line)){fenced=!fenced;return line;}
  if(fenced)return line;
  let clean=line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/^\s*(?:[-*•]|\d+[.)]|[۰-۹]+[.)])\s+/, '').replace(/^\s*>\s?/, '');
  clean=clean.replace(/\*\*([^*\n]+)\*\*/g,'$1').replace(/__([^_\n]+)__/g,'$1');
  if(/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(clean))return '';
  return clean;
 }).join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
function cleanLessonProposal(value){
 if(!value||!Array.isArray(value.operations))return value;
 return {...value,answer:value.operations.length?lessonProse(value.answer):value.answer,operations:value.operations.map(operation=>{
  if(!operation.block)return operation;
  const block={...operation.block};
  for(const field of ['title','description','feedback','explanation'])if(typeof block[field]==='string')block[field]=lessonProse(block[field]);
  if(block.kind!=='code'&&typeof block.body==='string')block.body=lessonProse(block.body);

  return {...operation,block};
 })};
}
module.exports={lessonProse,cleanLessonProposal};
