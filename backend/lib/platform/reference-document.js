'use strict';
const hosts=new Set(['docs.python.org','peps.python.org','developer.mozilla.org']);
async function fetchReference(raw){
 const url=new URL(raw);
 if(url.protocol!=='https:'||url.username||url.password||url.port||!hosts.has(url.hostname))throw Error('REFERENCE_HOST_NOT_SUPPORTED');
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000),headers:{accept:'text/html,text/plain'}});
 if(!response.ok||!/^text\/(html|plain)/i.test(response.headers.get('content-type')||''))throw Error('REFERENCE_UNAVAILABLE');
 let size=0;const parts=[];
 for await(const part of response.body){size+=part.length;if(size>524288){await response.body.cancel().catch(()=>{});throw Error('REFERENCE_TOO_LARGE')}parts.push(Buffer.from(part));}
 const body=Buffer.concat(parts).toString('utf8').replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 if(body.length<20)throw Error('REFERENCE_EMPTY');
 return ('Reference URL: '+url.href+'\n'+body).slice(0,16000);
}
module.exports={fetchReference};
