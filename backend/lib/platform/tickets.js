'use strict';
const {randomUUID}=require('node:crypto');
async function tickets(c){
 const {q,u,route,req,data,url,send,res,fail,id,text,scope,audit}=c;
 if(!route.startsWith('/tickets'))return null;
 if(!['teacher','admin'].includes(u.role))fail(403,'دسترسی به مکاتبات مجاز نیست.');
 const reply=(v,status=200)=>send(res,status,v),now=()=>new Date().toISOString();
 if(route==='/tickets'){
  if(req.method==='GET')return reply({tickets:await q.all(`SELECT t.*,u.name AS teacher_name,(SELECT COUNT(*) FROM nova_ticket_messages m WHERE m.ticket_id=t.id AND m.created_at>COALESCE((SELECT last_read_at FROM nova_ticket_reads r WHERE r.ticket_id=t.id AND r.user_id=?),'') AND m.author_id<>? ${u.role==='teacher'?'AND m.internal=0':''}) AS unread FROM nova_tickets t JOIN nova_users u ON u.id=t.teacher_id ${u.role==='teacher'?'WHERE t.teacher_id=?':''} ORDER BY t.updated_at DESC LIMIT 200`,u.role==='teacher'?[u.id,u.id,u.id]:[u.id,u.id])});
  if(u.role!=='teacher')fail(403,'تیکت توسط مدرس ایجاد می‌شود.');
  const cid=data.courseId?id(data.courseId):null;if(cid)await scope(q,u,cid);
  if(!['content','technical','account','other'].includes(data.category))fail(400,'دسته معتبر نیست.');if(!['normal','high'].includes(data.priority))fail(400,'اولویت معتبر نیست.');
  const recent=await q.one('SELECT COUNT(*) AS n FROM nova_tickets WHERE teacher_id=? AND created_at>?',[u.id,new Date(Date.now()-3600000).toISOString()]);if(Number(recent.n)>=20)fail(429,'سقف ایجاد تیکت ساعتی');
  const tid=randomUUID(),at=now();await q.run('INSERT INTO nova_tickets VALUES(?,?,?,?,?,?,?,?,?,?,1)',[tid,u.id,cid,text(data.subject,200),data.category,data.priority,'open',null,at,at]);await q.run('INSERT INTO nova_ticket_messages VALUES(?,?,?,?,0,?)',[randomUUID(),tid,u.id,text(data.body,10000),at]);await audit(q,u,'ticket.create',tid);return reply({id:tid},201);
 }
 const m=route.match(/^\/tickets\/([^/]+)(?:\/(messages|status|read|assign))?$/);if(!m)return null;
 const ticket=await q.one('SELECT * FROM nova_tickets WHERE id=?'+(q.postgres?' FOR UPDATE':''),[id(m[1])]);if(!ticket)fail(404,'تیکت پیدا نشد.');if(u.role==='teacher'&&ticket.teacher_id!==u.id)fail(404,'تیکت پیدا نشد.');
 if(!m[2]&&req.method==='GET')return reply({ticket,messages:await q.all(`SELECT m.id,m.body,m.internal,m.created_at,u.name,u.role FROM nova_ticket_messages m JOIN nova_users u ON u.id=m.author_id WHERE m.ticket_id=? ${u.role==='teacher'?'AND m.internal=0':''} ORDER BY m.created_at,m.id`,[ticket.id])});
 if(req.method!=='POST')fail(405,'روش مجاز نیست.');
 if(m[2]==='read'){await q.run('INSERT INTO nova_ticket_reads VALUES(?,?,?) ON CONFLICT(ticket_id,user_id) DO UPDATE SET last_read_at=excluded.last_read_at',[ticket.id,u.id,now()]);return reply({ok:true});}
 if(data.revision!==ticket.revision)fail(409,'تیکت تغییر کرده است؛ صفحه را تازه کنید.');
 if(m[2]==='messages'){
  if(ticket.status==='resolved')fail(409,'ابتدا تیکت را بازگشایی کنید.');if(data.internal&&u.role!=='admin')fail(403,'یادداشت داخلی فقط برای مدیر است.');
  await q.run('INSERT INTO nova_ticket_messages VALUES(?,?,?,?,?,?)',[randomUUID(),ticket.id,u.id,text(data.body,10000),data.internal?1:0,now()]);
 }else if(m[2]==='status'){
  const allowed=u.role==='teacher'?['open','resolved']:['open','in_progress','waiting_teacher','resolved'];if(!allowed.includes(data.status))fail(403,'وضعیت مجاز نیست.');await q.run('UPDATE nova_tickets SET status=? WHERE id=?',[data.status,ticket.id]);
 }else if(m[2]==='assign'){
  if(u.role!=='admin')fail(403,'فقط مدیر');await q.run('UPDATE nova_tickets SET assigned_to=? WHERE id=?',[u.id,ticket.id]);
 }else fail(404,'مسیر پیدا نشد.');
 await q.run('UPDATE nova_tickets SET updated_at=?,revision=revision+1 WHERE id=?',[now(),ticket.id]);await audit(q,u,'ticket.'+m[2],ticket.id);return reply({ok:true,revision:ticket.revision+1});
}
module.exports={tickets};
