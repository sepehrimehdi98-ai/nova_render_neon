"use strict";
const {createHash}=require('node:crypto');
const hash=s=>createHash('sha256').update(s).digest('hex');
function extract(document){
 if(!document||!['text/plain','text/markdown'].includes(document.mime)||typeof document.text!=='string')throw Error('DOCUMENT_FORMAT_UNSUPPORTED');
 const text=document.text.normalize('NFKC').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim();
 if(text.length<20||text.length>16000)throw Error('DOCUMENT_SIZE_INVALID');return text;
}
function chunks(body){const result=[];for(let start=0;start<body.length;start+=1600)result.push(body.slice(start,start+1800));return result;}
function cosine(a,b){if(a.length!==b.length)return 0;const norm=Math.hypot(...a)*Math.hypot(...b);return norm?a.reduce((s,x,i)=>s+x*b[i],0)/norm:0;}
function validate(vectors,count){if(!Array.isArray(vectors)||vectors.length!==count||vectors.some(v=>!Array.isArray(v)||!v.length||v.length>8192||v.length!==vectors[0].length||v.some(x=>!Number.isFinite(x))))throw Error('INVALID_EMBEDDINGS');}
async function syncSource(store,source,client){
 const allowed=await store.tx(q=>q.one("SELECT id FROM nova_ai_sources WHERE id=? AND course_id=? AND status='approved'",[source.id,source.course_id]));if(!allowed)return [];
 const model=client.embeddingModel||'configured',digest=hash(source.title+'\n'+source.body),parts=chunks(source.title+'\n'+source.body);
 const previous=await store.tx(q=>q.all('SELECT * FROM nova_ai_chunks WHERE source_id=? AND model=? AND content_hash=?',[source.id,model,digest]));
 if(previous.length===parts.length)return previous;
 const vectors=await client.embed(parts);validate(vectors,parts.length);
 return store.tx(async q=>{
  const current=await q.one('SELECT * FROM nova_ai_sources WHERE id=? AND course_id=?',[source.id,source.course_id]);
  if(!current||current.status!=='approved'||hash(current.title+'\n'+current.body)!==digest)return [];
  await q.run('DELETE FROM nova_ai_chunks WHERE source_id=?',[source.id]);const rows=[];
  for(let i=0;i<parts.length;i++){const row={id:hash(source.id+model+digest+i),course_id:source.course_id,source_id:source.id,content_hash:digest,model,body:parts[i],vector_json:JSON.stringify(vectors[i]),updated_at:new Date().toISOString()};await q.run('INSERT INTO nova_ai_chunks VALUES(?,?,?,?,?,?,?,?)',Object.values(row));rows.push(row);}return rows;
 });
}
async function retrieve(store,{courseId,sources,lesson,question,client}){
 const text=JSON.stringify(lesson),vectors=await client.embed([question,text]);validate(vectors,2);
 const candidates=[{id:'lesson:'+lesson.id+':'+lesson.version,text,score:cosine(vectors[0],vectors[1])}];
 for(const source of sources){for(const row of await syncSource(store,{...source,course_id:courseId},client)){candidates.push({id:'source:'+source.id+':'+row.id,sourceId:source.id,text:row.body,score:cosine(vectors[0],JSON.parse(row.vector_json))});}}
 // Keep the lesson as grounding even when documents rank higher.
 return [candidates[0],...candidates.slice(1).filter(c=>c.score>0).sort((a,b)=>b.score-a.score).slice(0,5)];
}
module.exports={extract,chunks,syncSource,retrieve,validate};
