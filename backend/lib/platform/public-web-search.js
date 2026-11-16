'use strict';
const {createHash}=require('node:crypto');
const cache=new Map(),inflight=new Map();
const catalog=[
 ['introduction.html','Python values and variables',['variable','number','string','متغیر','رشته','عدد']],
 ['controlflow.html','Python control flow and functions',['loop','for','while','function','if','range','حلقه','تابع','شرط']],
 ['datastructures.html','Python data structures',['list','dict','tuple','set','comprehension','لیست','فهرست','دیکشنری','مجموعه']],
 ['inputoutput.html','Python input and output',['print','input','file','output','چاپ','ورودی','خروجی','فایل']],
 ['errors.html','Python errors and exceptions',['error','exception','try','خطا','استثنا']],
 ['classes.html','Python classes',['class','object','inherit','کلاس','شیء','وراثت']]
];
async function wikiJson(url,fetcher=fetch){const r=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(4500),headers:{'user-agent':'NovaEducation/1.0 (public educational reference search)','accept':'application/json'}});if(!r.ok)throw Error('SEARCH_UNAVAILABLE');let size=0,parts=[];for await(const part of r.body){size+=part.length;if(size>524288)throw Error('SEARCH_RESPONSE_LIMIT');parts.push(Buffer.from(part))}return JSON.parse(Buffer.concat(parts).toString('utf8'));}
function source(url,title,text){return {id:'web:'+createHash('sha256').update(url).digest('hex'),url,title,text:text.slice(0,4000),retrievedAt:new Date().toISOString()};}
async function search(topic,{json=wikiJson,reference=require('./chat-reference').fetchChatReference}={}){
 const query=String(topic).trim().slice(0,200),key=query.toLowerCase();if(!key)return [];
 if(cache.get(key)?.until>Date.now())return cache.get(key).sources.map(s=>({...s}));if(inflight.has(key))return inflight.get(key);
 const work=(async()=>{const lang=/[\u0600-\u06ff]/.test(query)?'fa':'en';const terms=query.replace(/https?:\/\/\S+/g,'').toLowerCase().match(/[\p{L}\p{N}_]+/gu)||[];const stop=new Set(['what','is','a','the','how','to','in','of','explain','please','search','web','internet','and','does','برای','چطور','چیست','را','در','و','درباره','توضیح','بده','این']);const words=terms.filter(t=>t.length>1&&!stop.has(t)).slice(0,9).join(' ');
 const wiki=(async()=>{const url=new URL('https://'+lang+'.wikipedia.org/w/api.php');url.search=new URLSearchParams({action:'query',generator:'search',gsrsearch:words||query,gsrlimit:'2',prop:'extracts',exintro:'1',explaintext:'1',exchars:'3500',format:'json',formatversion:'2'}).toString();const d=await json(url.href);return (d.query?.pages||[]).filter(p=>typeof p.title==='string'&&typeof p.extract==='string'&&p.extract.length>50).map(p=>source('https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(p.title.replaceAll(' ','_')),p.title,p.extract));})();
 const ranked=catalog.map(c=>({c,score:c[2].filter(t=>t.length<=3?/^[a-z]+$/i.test(t)?new RegExp('\\b'+t+'\\b','i').test(key):key.includes(t):key.includes(t)).length})).sort((a,b)=>b.score-a.score);const docs=(async()=>{if(!ranked[0].score)return [];const [path,title]=ranked[0].c,url='https://docs.python.org/3/tutorial/'+path;return [source(url,title,await reference(url))]})();
 const results=await Promise.allSettled([docs,wiki]);const sources=results.flatMap(r=>r.status==='fulfilled'?r.value:[]).slice(0,3);if(!sources.length&&results.every(r=>r.status==='rejected'))throw Error('SEARCH_UNAVAILABLE');if(cache.size>=60)cache.delete(cache.keys().next().value);if(sources.length)cache.set(key,{until:Date.now()+300000,sources});return sources;})();inflight.set(key,work);try{return (await work).map(s=>({...s}))}finally{inflight.delete(key)}
}
module.exports={search,wikiJson,catalog};
