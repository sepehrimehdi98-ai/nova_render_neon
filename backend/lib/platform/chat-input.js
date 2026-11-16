'use strict';
const {createHash}=require('node:crypto');
const purposes=['auto','explanation','example','practice','debug','summary'];
function parseChatInput(question,purpose='auto'){
 if(!purposes.includes(purpose))throw Object.assign(Error('هدف پاسخ معتبر نیست.'),{status:400});
 const matches=String(question).match(/https?:\/\/[^\s<>"'\u060c\u061b]+/g)||[];
 const links=[...new Set(matches.map(x=>{let link=x.replace(/[.,;!?\u061f\u06d4]+$/g,'');while(link.endsWith(')')&&(link.match(/\)/g)||[]).length>(link.match(/\(/g)||[]).length)link=link.slice(0,-1);return link}))].slice(0,3);
 return {purpose,links};
}
async function resolveChatLinks(question,fetcher=require('./chat-reference').fetchChatReference){
 const {links}=parseChatInput(question);const sources=[],notices=[];
 const resolved=await Promise.all(links.map(async link=>{try{const url=require('./chat-reference').chatUrl(link);const body=await fetcher(url.href);return {source:{id:'link:'+createHash('sha256').update(url.href).digest('hex'),url:url.href,title:url.hostname,text:body.slice(0,6000)}};}catch{return {notice:'لینک خوانده نشد: '+link+' — صفحه باید عمومی، متنی و قابل دسترسی با HTTPS باشد. می‌توانید متن آن را هم در گفتگو بفرستید.'};}}));for(const item of resolved){if(item.source)sources.push(item.source);if(item.notice)notices.push(item.notice);}
 return {sources,notices};
}
function responseLanguage(question){return require('./response-style').responseStyle(question).language}
module.exports={parseChatInput,resolveChatLinks,purposes,responseLanguage};
