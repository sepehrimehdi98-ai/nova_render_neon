'use strict';
function validateReplyLanguage(value,input={}){
 const question=String(input.question||'');
 if(require('./response-style').responseStyle(question,input.purpose).language!=='Persian')return value;
 if(/Chinese|Japanese|Korean|چینی|ژاپنی|کره‌ای/i.test(question))return value;
 const prose=[value.answer,...(value.operations||[]).flatMap(o=>[o.block?.title,o.block?.description,...(!['code'].includes(o.block?.kind)?[o.block?.body]:[])])].filter(x=>typeof x==='string').join('\n').replace(/```[\s\S]*?```|`[^`]*`|https?:\/\/\S+/g,'');
 if(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u.test(prose))throw Error('INVALID_AI_RESPONSE');
 if(/هیچ (?:واژه|کلمه) انگلیسی|بدون (?:واژه |کلمه )?انگلیسی|فقط فارسی|no English/i.test(question)&&/[A-Za-z]{2,}/.test(prose))throw Error('INVALID_AI_RESPONSE');
 return value;
}
module.exports={validateReplyLanguage};
