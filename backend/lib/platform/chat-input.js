'use strict';
const {createHash}=require('node:crypto');
const purposes=['auto','explanation','example','practice','debug','summary'];
function parseChatInput(question,purpose='auto'){
 if(!purposes.includes(purpose))throw Object.assign(Error('هدف پاسخ معتبر نیست.'),{status:400});
 const matches=String(question).match(/https?:\/\/[^\s<>"'\u060c\u061b]+/g)||[];
 const links=[...new Set(matches.map(x=>x.replace(/[).,;!?\u061f\u06d4]+$/g,'')))].slice(0,3);
 return {purpose,links};
}
async function resolveChatLinks(question,fetcher=require('./reference-document').fetchReference){
 const {links}=parseChatInput(question);const sources=[],notices=[];
 for(const link of links){try{const url=new URL(link);if(url.protocol!=='https:'||url.username||url.password||url.port||!['docs.python.org','peps.python.org','developer.mozilla.org'].includes(url.hostname))throw Error('UNSUPPORTED');const body=await fetcher(url.href);sources.push({id:'link:'+createHash('sha256').update(url.href).digest('hex'),url:url.href,title:url.hostname,text:body.slice(0,6000)});}catch{notices.push('لینک خوانده نشد: '+link+' — لینک عمومی HTTPS از مستندات Python، PEP یا MDN وارد کنید.');}}
 return {sources,notices};
}
module.exports={parseChatInput,resolveChatLinks,purposes};
