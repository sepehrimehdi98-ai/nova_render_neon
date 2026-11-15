'use strict';
function builderContext(input){
 const editing=input.intent==='proposal'||input.intent==='summary'||input.target||input.blockTypes?.length||/\b(add|edit|rewrite|create|change|update|review|improve)\b|اضافه|افزود|ویرایش|تغییر|بازنویسی|بساز|بررسی کل/i.test(input.question||'');
 if(editing)return input.blocks;
 const terms=[...new Set((String(input.question||'').toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu)||[]))].slice(0,24);
 return (input.blocks||[]).map((b,index)=>({b,index,score:terms.filter(t=>(b.title+' '+b.body).toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,12).sort((a,b)=>a.index-b.index).map(({b})=>({id:b.id,kind:b.kind,title:b.title,body:String(b.body||'').slice(0,1500),...(b.description?{description:b.description.slice(0,400)}:{})}));
}
module.exports={builderContext};
