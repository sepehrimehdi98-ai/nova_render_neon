'use strict';
function documentEvidence(documents,question){
 const terms=[...new Set((question.toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu)||[]))];
 return documents.flatMap(d=>JSON.parse(d.pages_json).map(p=>({...p,score:terms.filter(t=>p.text.toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score||a.page-b.page).slice(0,3).map(p=>({id:'doc:'+d.id+':'+p.page,documentId:d.id,title:d.name,page:p.page,text:p.text.slice(0,2200)})));
}
function validateBuilderReply(value,input,evidence){
 const result=require('./lesson-studio').validateProposal(value);
 const citations=value.citations||[];
 if(!Array.isArray(citations)||citations.length>30||citations.some(id=>!evidence.some(e=>e.id===id))||value.basis==='sources'&&!citations.length)throw Error('INVALID_AI_RESPONSE');
 for(const o of result.operations){if(o.action==='update'&&!input.blocks.some(b=>b.id===o.target&&b.kind===o.block.kind))throw Error('INVALID_AI_RESPONSE');if(o.action==='add'&&input.blockTypes?.length&&!input.blockTypes.includes(o.block.kind))throw Error('INVALID_AI_RESPONSE');}
 if(input.intent==='summary'&&(!result.operations.length||result.operations.some(o=>o.block.kind!=='summary')))throw Error('INVALID_AI_RESPONSE');
 if(input.intent==='proposal'&&!result.operations.length)throw Error('INVALID_AI_RESPONSE');
 return {...result,sources:evidence.filter(e=>citations.includes(e.id)).map(({text,...s})=>({...s,excerpt:text.slice(0,650)})),verification:'source-ids-checked; teacher-review-required; code-not-executed'};
}
module.exports={documentEvidence,validateBuilderReply};
