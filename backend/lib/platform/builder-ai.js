'use strict';
function needsCitation(question,evidence){return evidence.length>0&&/(according (?:only )?to|from (?:this|the|these|my|selected|uploaded)|selected (?:file|document)|uploaded (?:file|document)|بر اساس|براساس|این (?:سند|فایل)|فایل پیوست|سند پیوست)/i.test(question||'');}
function validateConversationReply(value,evidence,question){if(!value||typeof value.answer!=='string'||!value.answer.trim()||value.answer.length>16000||!Array.isArray(value.citations)||value.citations.length>30||value.citations.some(id=>!evidence.some(e=>e.id===id))||(value.basis==='sources'||needsCitation(question,evidence))&&!value.citations.length)throw Error('INVALID_AI_RESPONSE');return value;}
async function jsonWithValidation(client,instruction,input,validate){for(let attempt=0;attempt<2;attempt++){try{const value=await client.json(instruction+(attempt?' The previous attempt failed response-shape or citation validation. Return the requested JSON shape exactly, and cite only exact provided evidence IDs. Do not invent IDs.':''),input);try{validate(value)}catch{throw Error('INVALID_AI_RESPONSE')}Object.defineProperty(value,'__attempts',{value:attempt+1,enumerable:false});return value;}catch(error){if(error.message!=='INVALID_AI_RESPONSE'||attempt===1)throw error;}}}
function documentEvidence(documents,question){
 const stop=new Set(['the','and','this','that','file','document','selected','uploaded','according','from','what','please','only','این','فایل','سند','براساس','اساس','لطفاً']);
 const terms=[...new Set((question.toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu)||[]))].filter(t=>!stop.has(t)).slice(0,32);
 const excerpt=text=>{if(text.length<=2200)return text;let best=0,score=-1;for(let i=0;i<text.length;i+=1600){const chunk=text.slice(i,i+2200).toLowerCase(),n=terms.filter(t=>chunk.includes(t)).length;if(n>score){score=n;best=i}}return text.slice(best,best+2200)};
 return documents.flatMap(d=>JSON.parse(d.pages_json).map(p=>({...p,score:terms.filter(t=>p.text.toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score||a.page-b.page).slice(0,3).map(p=>({id:'doc:'+d.id+':'+p.page,documentId:d.id,title:d.name,page:p.page,text:excerpt(p.text)})));
}
function validateBuilderReply(value,input,evidence){
 const result=require('./lesson-studio').validateProposal(value);
 const citations=value.citations||[];
 if(!Array.isArray(citations)||citations.length>30||citations.some(id=>!evidence.some(e=>e.id===id))||(value.basis==='sources'||needsCitation(input.question,evidence))&&!citations.length)throw Error('INVALID_AI_RESPONSE');
 for(const o of result.operations){if(o.action==='update'&&!input.blocks.some(b=>b.id===o.target&&b.kind===o.block.kind))throw Error('INVALID_AI_RESPONSE');if(o.action==='add'&&input.blockTypes?.length&&!input.blockTypes.includes(o.block.kind))throw Error('INVALID_AI_RESPONSE');}
 if(input.intent==='summary'&&(!result.operations.length||result.operations.some(o=>o.block.kind!=='summary')))throw Error('INVALID_AI_RESPONSE');
 if(input.intent==='proposal'&&!result.operations.length)throw Error('INVALID_AI_RESPONSE');
 return {...result,sources:evidence.filter(e=>citations.includes(e.id)).map(({text,...s})=>({...s,excerpt:text.slice(0,650)})),verification:'source-ids-checked; teacher-review-required; code-not-executed'};
}
module.exports={documentEvidence,validateBuilderReply,validateConversationReply,jsonWithValidation};
