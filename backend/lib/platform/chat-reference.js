'use strict';
const net=require('node:net'),https=require('node:https'),dns=require('node:dns').promises;
function publicAddress(address){const family=net.isIP(address);if(family===4){const [a,b,c]=address.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===100&&b>=64&&b<=127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);}if(family===6){const first=parseInt(address.split(':')[0],16);return first>=0x2000&&first<=0x3fff&&first!==0x2001&&first!==0x2002;}return false;}
function chatUrl(raw){const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.port||url.href.length>2000||net.isIP(url.hostname.replace(/^\[|\]$/g,''))||!url.hostname.includes('.')||/(^|\.)(localhost|local|internal|test|invalid|example)\.?$/i.test(url.hostname))throw Error('UNSAFE_CHAT_LINK');return url;}
async function fetchFreshReference(raw,{lookup=dns.lookup.bind(dns),request=https.request,redirects=0}={}){
 const url=chatUrl(raw);let timer;const addresses=await Promise.race([lookup(url.hostname,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('REFERENCE_TIMEOUT')),8000)})]).finally(()=>clearTimeout(timer));if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw Error('UNSAFE_CHAT_LINK');const address=addresses.find(a=>a.family===4)||addresses[0];
 const body=await new Promise((resolve,reject)=>{const req=request(url,{method:'GET',agent:false,lookup:(_host,options,callback)=>{if(options?.all)callback(null,[address]);else callback(null,address.address,address.family)},headers:{accept:'text/html,text/plain','accept-encoding':'identity'},timeout:8000},res=>{if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location){res.resume();resolve({redirect:res.headers.location});return}if(res.statusCode!==200||!/^text\/(html|plain)/i.test(res.headers['content-type']||'')){res.resume();reject(Error('REFERENCE_UNAVAILABLE'));return}let size=0;const parts=[];res.on('data',part=>{size+=part.length;if(size>524288){req.destroy(Error('REFERENCE_TOO_LARGE'));return}parts.push(Buffer.from(part))});res.on('error',reject);res.on('end',()=>resolve(Buffer.concat(parts).toString('utf8')))});const deadline=setTimeout(()=>req.destroy(Error('REFERENCE_TIMEOUT')),8000);deadline.unref?.();req.on('close',()=>clearTimeout(deadline));req.on('timeout',()=>req.destroy(Error('REFERENCE_TIMEOUT')));req.on('error',reject);req.end()});
 if(body&&typeof body==='object'&&body.redirect){if(redirects>=2)throw Error('REFERENCE_REDIRECT_LIMIT');const next=chatUrl(new URL(body.redirect,url).href);if(next.hostname!==url.hostname)throw Error('UNSAFE_CHAT_REDIRECT');if(!next.hash)next.hash=url.hash;return fetchFreshReference(next.href,{lookup,request,redirects:redirects+1});}
 const selected=referenceSection(body,url.hash);
 const text=selected.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();if(text.length<20)throw Error('REFERENCE_EMPTY');return text.slice(0,16000);
}
function referenceSection(html,hash){
 if(!hash)return html;
 let id;try{id=decodeURIComponent(hash.slice(1))}catch{return html}
 if(!id||id.length>200)return html;
 const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const match=new RegExp('\\b(?:id|name)\\s*=\\s*["\']'+escaped+'["\']','i').exec(html);
 return match?html.slice(Math.max(0,html.lastIndexOf('<',match.index))):html;
}
function referenceCache(fetcher,clock=Date.now){
 const cache=new Map(),publicHosts=new Set(['docs.python.org','developer.mozilla.org','en.wikipedia.org','fa.wikipedia.org']);
 return async function(raw,deps){
  const url=chatUrl(raw);if(deps||url.search||!publicHosts.has(url.hostname))return fetcher(raw,deps);
  const key=url.href,existing=cache.get(key);if(existing&&existing.until>clock())return existing.promise;
  if(cache.size>=32)cache.delete(cache.keys().next().value);
  const record={until:clock()+120000};record.promise=Promise.resolve().then(()=>fetcher(url.href)).catch(error=>{if(cache.get(key)===record)cache.delete(key);throw error});cache.set(key,record);return record.promise;
 };
}
const fetchChatReference=referenceCache(fetchFreshReference);
module.exports={fetchChatReference,chatUrl,publicAddress,referenceCache,referenceSection,fetchFreshReference};
