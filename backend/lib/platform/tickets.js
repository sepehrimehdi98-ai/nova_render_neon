'use strict';
const {randomUUID}=require('node:crypto');
async function tickets(c){
 const {q,u,route,req,data,send,res,fail,id,text,scope,audit}=c;if(!route.startsWith('/tickets'))return null;if(!['teacher','admin'].includes(u.role))fail(403,'دسترسی به مکاتبات مجاز نیست.');const reply=(v,status=200)=>send(res,status,v),now=()=>new Date().toISOString();
 async function attachments(ticketId,messageId,internal){
  if(data.attachments===undefined)return;if(!Array.isArray(data.attachments)||data.attachments.length>3)fail(400,'حداکثر ۳ پیوست مجاز است.');let total=0;
  for(const input of data.attachments){let file;try{file=require('./teacher-workspace').decodeFile(input)}catch{fail(400,'پیوست معتبر PNG، JPG، PDF، DOCX یا متن تا ۱٫۵ مگابایت لازم است.');}total+=file.bytes;if(total>1800000)fail(413,'مجموع پیوست‌ها بیش از ۱٫۸ مگابایت است.');await q.run('INSERT INTO nova_ticket_attachments VALUES(?,?,?,?,?,?,?)',[randomUUID(),ticketId,messageId,file.name,file.mime,file.bytes,file.buffer.toString('base64')]);}
 }
 if(route==='/tickets'){
  if(req.method==='GET')return reply({tickets:await q.all(`SELECT t.*,u.name AS teacher_name,(SELECT body FROM nova_ticket_messages m WHERE m.ticket_id=t.id ${u.role==='teacher'?'AND m.internal=0':''} ORDER BY m.created_at DESC LIMIT 1) AS preview,(SELECT COUNT(*) FROM nova_ticket_messages m WHERE m.ticket_id=t.id AND m.created_at>COALESCE((SELECT last_read_at FROM nova_ticket_reads r WHERE r.ticket_id=t.id AND r.user_id=?),'') AND m.author_id<>? ${u.role==='teacher'?'AND m.internal=0':''}) AS unread FROM nova_tickets t JOIN nova_users u ON u.id=t.teacher_id ${u.role==='teacher'?'WHERE t.teacher_id=?':''} ORDER BY t.updated_at DESC LIMIT 200`,u.role==='teacher'?[u.id,u.id,u.id]:[u.id,u.id])});
  if(u.role!=='teacher')fail(403,'تیکت توسط مدرس ایجاد می‌شود.');const cid=data.courseId?id(data.courseId):null;if(cid)await scope(q,u,cid);if(!['content','technical','account','other'].includes(data.category)||!['normal','high'].includes(data.priority))fail(400,'دسته یا اولویت معتبر نیست.');
  const recent=await q.one('SELECT COUNT(*) AS n FROM nova_tickets WHERE teacher_id=? AND created_at>?',[u.id,new Date(Date.now()-3600000).toISOString()]);if(Number(recent.n)>=20)fail(429,'سقف ایجاد تیکت ساعتی');
  const tid=randomUUID(),mid=randomUUID(),at=now();await q.run('INSERT INTO nova_tickets VALUES(?,?,?,?,?,?,?,?,?,?,1)',[tid,u.id,cid,text(data.subject,200),data.category,data.priority,'open',null,at,at]);await q.run('INSERT INTO nova_ticket_messages VALUES(?,?,?,?,0,?)',[mid,tid,u.id,text(data.body,10000),at]);await attachments(tid,mid,false);await audit(q,u,'ticket.create',tid);return reply({id:tid},201);
 }
 const m=route.match(/^\/tickets\/([^/]+)(?:\/(messages|status|read|assign|attachments)(?:\/([^/]+))?)?$/);if(!m)return null;
 const ticket=await q.one('SELECT * FROM nova_tickets WHERE id=?'+(q.postgres?' FOR UPDATE':''),[id(m[1])]);if(!ticket||u.role==='teacher'&&ticket.teacher_id!==u.id)fail(404,'تیکت پیدا نشد.');
 if(m[2]==='attachments'&&m[3]&&req.method==='GET'){const f=await q.one(`SELECT a.* FROM nova_ticket_attachments a JOIN nova_ticket_messages m ON m.id=a.message_id WHERE a.id=? AND a.ticket_id=? ${u.role==='teacher'?'AND m.internal=0':''}`,[id(m[3]),ticket.id]);if(!f)fail(404,'پیوست پیدا نشد.');return reply({file:f});}
 if(!m[2]&&req.method==='GET'){
  const messages=await q.all(`SELECT m.id,m.body,m.internal,m.created_at,u.name,u.role FROM nova_ticket_messages m JOIN nova_users u ON u.id=m.author_id WHERE m.ticket_id=? ${u.role==='teacher'?'AND m.internal=0':''} ORDER BY m.created_at,m.id`,[ticket.id]);const files=await q.all(`SELECT a.id,a.message_id,a.name,a.mime,a.bytes FROM nova_ticket_attachments a JOIN nova_ticket_messages m ON m.id=a.message_id WHERE a.ticket_id=? ${u.role==='teacher'?'AND m.internal=0':''}`,[ticket.id]);return reply({ticket,messages:messages.map(m=>({...m,attachments:files.filter(f=>f.message_id===m.id)}))});
 }
 if(req.method!=='POST')fail(405,'روش مجاز نیست.');if(m[2]==='read'){await q.run('INSERT INTO nova_ticket_reads VALUES(?,?,?) ON CONFLICT(ticket_id,user_id) DO UPDATE SET last_read_at=excluded.last_read_at',[ticket.id,u.id,now()]);return reply({ok:true});}if(data.revision!==ticket.revision)fail(409,'تیکت تغییر کرده است؛ صفحه را تازه کنید.');
 if(m[2]==='messages'){
  if(ticket.status==='resolved')fail(409,'ابتدا تیکت را بازگشایی کنید.');if(data.internal&&u.role!=='admin')fail(403,'یادداشت داخلی فقط برای مدیر است.');const mid=randomUUID();await q.run('INSERT INTO nova_ticket_messages VALUES(?,?,?,?,?,?)',[mid,ticket.id,u.id,text(data.body,10000),data.internal?1:0,now()]);await attachments(ticket.id,mid,data.internal);
 }else if(m[2]==='status'){const allowed=u.role==='teacher'?['open','resolved']:['open','in_progress','waiting_teacher','resolved'];if(!allowed.includes(data.status))fail(403,'وضعیت مجاز نیست.');await q.run('UPDATE nova_tickets SET status=? WHERE id=?',[data.status,ticket.id]);}
 else if(m[2]==='assign'){if(u.role!=='admin')fail(403,'فقط مدیر');await q.run('UPDATE nova_tickets SET assigned_to=? WHERE id=?',[u.id,ticket.id]);}else fail(404,'مسیر پیدا نشد.');
 await q.run('UPDATE nova_tickets SET updated_at=?,revision=revision+1 WHERE id=?',[now(),ticket.id]);await audit(q,u,'ticket.'+m[2],ticket.id);return reply({ok:true,revision:ticket.revision+1});
}
module.exports={tickets};
