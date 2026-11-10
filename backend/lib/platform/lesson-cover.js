'use strict';
const elements=['python','code','book','science'];
function validateCover(value){
 if(value==null)return null;
 if(value.kind==='image'){
  let url;try{url=new URL(value.url)}catch{throw Error('INVALID_LESSON_COVER')}
  if(url.protocol!=='https:'||url.username||url.password||url.href.length>2000)throw Error('INVALID_LESSON_COVER');
  return {kind:'image',url:url.href,alt:typeof value.alt==='string'?value.alt.trim().slice(0,200):''};
 }
 if(value.kind==='element'&&elements.includes(value.element)&&/^#[0-9a-f]{6}$/i.test(value.color||''))return {kind:'element',element:value.element,color:value.color.toLowerCase()};
 throw Error('INVALID_LESSON_COVER');
}
module.exports={validateCover};
