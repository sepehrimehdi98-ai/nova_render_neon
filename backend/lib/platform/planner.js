'use strict';
const {randomUUID}=require('node:crypto');
async function plannerRoutes({q,u,route,req,data,url,scope,send,res,fail,id,text}){
 if(route!=='/planner')return null;
 if(!['student','teacher'].includes(u.role))fail(403,'برنامه‌ریز برای دبیر و دانش‌آموز است.');
 const reply=(body,status=200)=>send(res,status,body);
 if(req.method==='GET'){
  const from=url.searchParams.get('from')||new Date().toISOString(),to=url.searchParams.get('to')||new Date(Date.now()+7*86400000).toISOString();
  if(!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(to))||Date.parse(to)<=Date.parse(from)||Date.parse(to)-Date.parse(from)>32*86400000)fail(400,'بازه برنامه حداکثر ۳۲ روز است.');
  const start=new Date(from).toISOString(),end=new Date(to).toISOString();
  const personal=await q.all("SELECT p.*,c.title AS course_title FROM nova_planner p LEFT JOIN nova_courses c ON c.id=p.course_id WHERE p.user_id=? AND p.status!='cancelled' AND ((p.starts_at<? AND p.ends_at>?) OR (p.status='pending' AND p.ends_at<=?)) ORDER BY p.starts_at LIMIT 500",[u.id,end,start,start]);
  const courses=await q.all(u.role==='teacher'?"SELECT c.id,c.title FROM nova_courses c JOIN nova_teachers t ON t.course_id=c.id WHERE t.user_id=? AND c.status!='archived'":"SELECT c.id,c.title FROM nova_courses c JOIN nova_enrollments e ON e.course_id=c.id WHERE e.user_id=? AND e.status='active' AND c.status='published'",[u.id]);
  const events=[];for(const course of courses){for(const e of await q.all('SELECT * FROM nova_class_events WHERE course_id=? AND starts_at<? AND ends_at>? ORDER BY starts_at LIMIT 100',[course.id,end,start]))events.push({...e,source:'course',priority:'normal',status:'pending',course_title:course.title});for(const e of await q.all("SELECT x.id,x.title,x.closes_at FROM nova_exams x WHERE x.course_id=? AND x.status='published' AND x.closes_at>? AND x.closes_at<?"+(u.role==='student'?" AND NOT EXISTS(SELECT 1 FROM nova_exam_attempts a WHERE a.exam_id=x.id AND a.user_id=? AND a.submitted_at IS NOT NULL)":"")+" ORDER BY x.closes_at LIMIT 100",u.role==='student'?[course.id,start,end,u.id]:[course.id,start,end]))events.push({id:e.id,title:e.title,kind:'exam',source:'exam',course_id:course.id,course_title:course.title,starts_at:e.closes_at,ends_at:e.closes_at,priority:'high',status:'pending'});}
  return reply({items:[...personal.map(p=>({...p,source:'personal'})),...events].sort((a,b)=>a.starts_at.localeCompare(b.starts_at)),courses,serverNow:new Date().toISOString()});
 }
 if(req.method!=='POST')fail(405,'روش مجاز نیست.');
 let current=null;if(data.id){current=await q.one('SELECT * FROM nova_planner WHERE id=? AND user_id=?',[id(data.id),u.id]);if(!current)fail(404,'برنامه پیدا نشد.');if(current.revision!==data.revision)fail(409,'برنامه تغییر کرده است؛ دوباره دریافت کنید.');}
 const title=text(data.title,200,1),details=text(data.details||'',2000,0),kind=data.kind,priority=data.priority,status=data.status||'pending';
 if(!['study','practice','task'].includes(kind)||!['low','normal','high'].includes(priority)||!['pending','done','cancelled'].includes(status))fail(400,'نوع، اولویت یا وضعیت معتبر نیست.');
 const starts=new Date(data.startsAt),ends=new Date(data.endsAt);if(!Number.isFinite(+starts)||!Number.isFinite(+ends)||ends<=starts||starts.getUTCFullYear()<2020||ends.getUTCFullYear()>2100||ends-starts>32*86400000)fail(400,'زمان پایان باید بعد از شروع و بازه حداکثر ۳۲ روز باشد.');
 const cid=data.courseId?id(data.courseId):null;if(cid)await scope(q,u,cid);
 if(current){const changed=await q.run('UPDATE nova_planner SET course_id=?,title=?,details=?,kind=?,starts_at=?,ends_at=?,priority=?,status=?,revision=revision+1 WHERE id=? AND user_id=? AND revision=?',[cid,title,details,kind,starts.toISOString(),ends.toISOString(),priority,status,current.id,u.id,current.revision]);if((q.postgres?changed.rowCount:changed.changes)===0)fail(409,'برنامه هم‌زمان تغییر کرد؛ دوباره دریافت کنید.');return reply({id:current.id,revision:current.revision+1});}
 if(Number((await q.one('SELECT COUNT(*) AS n FROM nova_planner WHERE user_id=?',[u.id])).n)>=2000)fail(409,'حداکثر برنامه‌های این حساب ثبت شده است.');const pid=randomUUID();await q.run('INSERT INTO nova_planner VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[pid,u.id,cid,title,details,kind,starts.toISOString(),ends.toISOString(),priority,status,1,new Date().toISOString()]);return reply({id:pid,revision:1},201);
}
module.exports={plannerRoutes};
