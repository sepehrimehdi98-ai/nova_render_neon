'use strict';
// Explicit report columns only. Never export raw tables or private note/session data.
const reports={
 courses:{from:'nova_courses c',select:'c.id,c.title,c.status,c.created_at',order:'c.created_at DESC,c.id'},
 lessons:{from:'nova_lessons l JOIN nova_courses c ON c.id=l.course_id',select:'l.id,l.course_id,c.title AS course_title,l.status,l.draft_rev,l.published_version,l.draft_json',order:'c.title,l.position,l.id'},
 tickets:{from:'nova_tickets t JOIN nova_users u ON u.id=t.teacher_id',select:'t.id,t.subject AS title,t.status,t.priority,t.created_at,u.name AS owner_name,u.role AS owner_role,t.course_id',order:'t.created_at DESC,t.id'},
 activity:{from:'nova_audit a JOIN nova_users u ON u.id=a.actor_id',select:'a.id,a.action,a.target_id,a.created_at,u.name AS actor_name,u.role AS actor_role',order:'a.created_at DESC,a.id'}
};
async function adminDataRoutes({q,u,route,req,url,send,res,fail}){
 if(route!=='/admin/data')return null;
 if(u.role!=='admin')fail(403,'فقط مدیر به گزارش اطلاعات ذخیره‌شده دسترسی دارد.');
 if(req.method!=='GET')fail(405,'روش مجاز نیست.');
 const dataset=url.searchParams.get('dataset')||'courses',report=reports[dataset];
 if(!Object.hasOwn(reports,dataset))fail(400,'نوع گزارش معتبر نیست.');
 const raw=url.searchParams.get('offset')||'0';if(!/^\d{1,9}$/.test(raw))fail(400,'صفحه گزارش معتبر نیست.');const offset=Number(raw),limit=100;
 const counts={};for(const [name,r]of Object.entries(reports))counts[name]=Number((await q.one('SELECT COUNT(*) AS n FROM '+r.from)).n);
 const rows=await q.all('SELECT '+report.select+' FROM '+report.from+' ORDER BY '+report.order+' LIMIT ? OFFSET ?',[limit,offset]);
 const records=rows.map(({draft_json,...row})=>{if(!draft_json)return row;const doc=JSON.parse(draft_json);return {...row,title:doc.title,block_count:doc.blocks.length}});
 return send(res,200,{schema:'nova-admin-report-v1',dataset,storage:q.postgres?'postgresql':'sqlite-local',generatedAt:new Date().toISOString(),counts,records,total:counts[dataset],offset,limit,nextOffset:offset+records.length<counts[dataset]?offset+records.length:null,scope:'administrative-metadata; excludes private notes, messages, passwords, keys and sessions'});
}
module.exports={adminDataRoutes};
