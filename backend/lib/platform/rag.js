'use strict';
const {randomUUID}=require('node:crypto');
async function ragRoutes({q,u,route,req,data,scope,lessonScope,send,res,fail,id,text}){
 const m=route.match(/^\/courses\/([^/]+)\/ai\/(sources|jobs|approve|revoke)$/);if(!m)return null;
 const cid=id(m[1]);await scope(q,u,cid);const teacher=u.role!=='student';
 if(m[2]==='sources'){
  if(!teacher)fail(403,'فقط مدرس و مدیر');
  if(req.method==='GET')return send(res,200,{sources:await q.all('SELECT * FROM nova_ai_sources WHERE course_id=? ORDER BY created_at DESC LIMIT 100',[cid])});
  if(req.method==='POST'){
   const sid=randomUUID(),title=text(data.title,200,1);let body;try{body=data.document?require('./document-index').extract(data.document):text(data.body,16000,20);}catch{fail(400,'فقط متن یا Markdown بین ۲۰ تا ۱۶۰۰۰ نویسه پذیرفته می‌شود.');}
   await q.run('INSERT INTO nova_ai_sources VALUES(?,?,?,?,?,?,?,?)',[sid,cid,u.id,title,body,'pending','{}',new Date().toISOString()]);
   await q.run('INSERT INTO nova_ai_visibility VALUES(?,?)',[sid,0]);await enqueue('review',{sourceId:sid});return send(res,201,{id:sid});
  }
 }
 if(m[2]==='approve'&&req.method==='POST'){
  if(!teacher)fail(403,'فقط مدرس و مدیر');
  const source=await q.one('SELECT * FROM nova_ai_sources WHERE id=? AND course_id=?',[id(data.sourceId),cid]);
  if(!source||source.status!=='reviewed')fail(409,'ابتدا بررسی موفق منبع لازم است.');
  await q.run("UPDATE nova_ai_sources SET status='approved' WHERE id=?",[source.id]);await q.run('INSERT INTO nova_ai_visibility VALUES(?,?) ON CONFLICT(source_id) DO UPDATE SET student_visible=excluded.student_visible',[source.id,data.studentVisible===true?1:0]);await enqueue('index',{sourceId:source.id});return send(res,200,{approved:true});
 }
 if(m[2]==='revoke'&&req.method==='POST'){
  if(!teacher)fail(403,'فقط مدرس و مدیر');
  const sid=id(data.sourceId);const source=await q.one('SELECT id FROM nova_ai_sources WHERE id=? AND course_id=?',[sid,cid]);if(!source)fail(404,'منبع یافت نشد');
  await q.run("UPDATE nova_ai_sources SET status='revoked' WHERE id=?",[sid]);await q.run('DELETE FROM nova_ai_chunks WHERE source_id=?',[sid]);return send(res,200,{revoked:true});
 }
 if(m[2]==='jobs'){
  if(req.method==='GET')return send(res,200,{jobs:await q.all('SELECT id,kind,lesson_id,input_json,status,result_json,created_at FROM nova_ai_jobs WHERE course_id=? AND user_id=? ORDER BY created_at DESC LIMIT 30',[cid,u.id])});
  if(req.method==='POST'){
   const question=text(data.question,4000,3),lessonId=id(data.lessonId);const lesson=await lessonScope(q,u,lessonId);if(lesson.course_id!==cid)fail(403,'درس متعلق به این دوره نیست.');
   const publicTopic=data.publicTopic?text(data.publicTopic,200,3):'';
   const jid=await enqueue(teacher?'author':'tutor',{question,lessonId,publicTopic,...(teacher?{draft:JSON.parse(lesson.draft_json),draftRev:lesson.draft_rev}:{})});return send(res,202,{id:jid});
  }
 }
 fail(405,'روش مجاز نیست.');
 async function enqueue(kind,input){
  if(q.postgres)await q.one('SELECT id FROM nova_users WHERE id=? FOR UPDATE',[u.id]);
  const pending=await q.one("SELECT COUNT(*) AS n FROM nova_ai_jobs WHERE user_id=? AND (status='queued' OR status='running')",[u.id]);
  if(Number(pending.n)>=3)fail(429,'لطفاً منتظر پردازش درخواست‌های قبلی بمانید.');
  const recent=await q.one('SELECT COUNT(*) AS n FROM nova_ai_jobs WHERE user_id=? AND created_at>?',[u.id,new Date(Date.now()-3600000).toISOString()]);if(Number(recent.n)>=30)fail(429,'سقف درخواست ساعتی');
  const jid=randomUUID();await q.run('INSERT INTO nova_ai_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?)',[jid,u.id,cid,input.lessonId||null,kind,JSON.stringify(input),'queued','{}',null,null,new Date().toISOString()]);return jid;
 }
}
module.exports={ragRoutes};
