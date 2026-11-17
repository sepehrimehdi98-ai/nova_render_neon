'use strict';
const {createHash}=require('node:crypto');
function localGreeting(kind,input={}){
 if(!['tutor','conversation','block'].includes(kind)||input.documentIds?.length||input.links?.length||input.webSearch||input.publicTopic||input.target||input.blockTypes?.length||input.intent&&input.intent!=='auto')return null;
 const style=require('./response-style').responseStyle(input.question,input.purpose);
 if(!style.greeting)return null;
 const thanks=/thanks|thank you|ممنون|مرسی/i.test(input.question);
 const answer=style.language==='Persian'?(thanks?'خواهش می‌کنم. هر وقت پرسش دیگری داشتید، همین‌جا بنویسید.':kind==='block'?'سلام! درباره تدریس مشورت کنیم یا برای درس محتوا بسازیم؟ خواسته‌تان را بنویسید.':'سلام! پرسش خود را بنویسید؛ می‌توانید درباره برنامه‌نویسی بپرسید یا فایل و لینک بفرستید.'):(thanks?'You’re welcome. Send another question whenever you’re ready.':kind==='block'?'Hello! What would you like to discuss or create for this lesson?':'Hello! What would you like to learn? You can ask a programming question or attach a file or link.');
 return {answer,operations:[],citations:[],basis:'general',needsTeacher:false,sources:[],linkNotices:[],webStatus:'not_requested',verification:'deterministic-greeting; no generated facts',routing:{requestedModel:null,servedModel:'local-greeting',providerCalls:0}};
}
function validatedCache({clock=Date.now,ttlMs=120000,maxEntries=64}={}){
 const entries=new Map();
 const key=(scope,instruction,data)=>scope?createHash('sha256').update(JSON.stringify([scope,instruction,data])).digest('hex'):null;
 function clone(value,cached){const copy=structuredClone(value);if(value.__routing)Object.defineProperty(copy,'__routing',{value:{...value.__routing,...(cached?{cached:true}: {})},enumerable:false});return copy;}
 return {key,get(k){const item=k&&entries.get(k);if(!item)return null;if(item.until<=clock()){entries.delete(k);return null}return clone(item.value,true)},put(k,value){if(!k||Buffer.byteLength(JSON.stringify(value))>64000)return;if(entries.size>=maxEntries&&!entries.has(k))entries.delete(entries.keys().next().value);entries.set(k,{until:clock()+ttlMs,value:clone(value,false)})},delete:k=>entries.delete(k)};
}
module.exports={localGreeting,validatedCache};
