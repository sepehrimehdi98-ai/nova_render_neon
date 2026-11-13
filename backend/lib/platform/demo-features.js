'use strict';
const {randomUUID}=require('node:crypto');
function clientIp(req){
 const peer=req.socket?.remoteAddress||'local';
 const trusted=(process.env.NOVA_TRUSTED_PROXIES||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(!trusted.includes(peer))return peer;
 const forwarded=String(req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim());
 const chain=[...forwarded,peer];while(chain.length>1&&trusted.includes(chain.at(-1)))chain.pop();
 const ip=chain.at(-1);return require('node:net').isIP(ip)?ip:peer;
}
async function lockIdentity(q,uid){if(q.postgres)await q.one('SELECT id FROM nova_users WHERE id=? FOR UPDATE',[uid]);}
const stamp=()=>new Date().toISOString();
function examScore(questions,answers){const total=questions.reduce((n,x)=>n+(x.points||1),0);return Math.round(100*questions.reduce((n,x,i)=>n+(answers[i]===x.correct?(x.points||1):0),0)/total)}
async function finishExpired(q,eid){
 const exam=await q.one('SELECT questions_json FROM nova_exams WHERE id=?',[eid]);const questions=JSON.parse(exam.questions_json);
 const attempts=await q.all('SELECT id,answers_json FROM nova_exam_attempts WHERE exam_id=? AND submitted_at IS NULL AND deadline<=?',[eid,stamp()]);
 for(const a of attempts){const answers=JSON.parse(a.answers_json);const score=examScore(questions,answers);await q.run('UPDATE nova_exam_attempts SET score=?,submitted_at=? WHERE id=? AND submitted_at IS NULL',[score,stamp(),a.id]);}
}

async function demoRoutes(c){
 const {q,u,route,req,data,url,scope,lessonScope,send,res,fail,id,text,integer,audit,demo}=c;
 const reply=(v,status=200)=>send(res,status,v);
 const sample=route.match(/^\/sample-state\/(students|tickets|profile|python-note)$/);
 if(sample){
   const section=sample[1];
   const role=['students','tickets'].includes(section)?'admin':'student';
   if(u.role!==role)fail(403,'دسترسی مجاز نیست.');
   if(req.method==='GET'){
     const row=await q.one('SELECT value_json,revision FROM nova_portal_samples WHERE user_id=? AND section=?',[u.id,section]);
     return reply(row?{value:JSON.parse(row.value_json),revision:row.revision}:{value:null,revision:0});
   }
   const revision=integer(data.revision,0,2147483646);
   const encoded=JSON.stringify(data.value);
   if(!encoded||encoded.length>60000)fail(400,'اندازه داده معتبر نیست.');
   const result=await q.one('INSERT INTO nova_portal_samples(user_id,section,value_json,revision) SELECT ?,?,?,1 WHERE ?=0 OR EXISTS (SELECT 1 FROM nova_portal_samples WHERE user_id=? AND section=?) ON CONFLICT(user_id,section) DO UPDATE SET value_json=excluded.value_json,revision=nova_portal_samples.revision+1 WHERE nova_portal_samples.revision=? RETURNING revision',[u.id,section,encoded,revision,u.id,section,revision]);
   if(!result)fail(409,'اطلاعات تغییر کرده است. صفحه را تازه کنید.');
   return reply(result);
 }
 const staff=()=>{if(u.role==='student')fail(403,'فقط مدرس و مدیر مجاز هستند.');};
 if(route==='/capabilities'&&req.method==='GET')return reply({demo,ai:!!(process.env.AI_PROVIDER==='openrouter'?process.env.OPENROUTER_API_KEY:(process.env.LIARA_AI_API_KEY&&process.env.LIARA_AI_CHAT_MODEL)),grading:!!process.env.NOVA_GRADER_IMAGE,python:'browser-worker',assistant:'local-lesson-search',exams:true,media:true});
 if(route==='/my/analysis'&&req.method==='GET'){
  const courses=await q.all("SELECT c.id,c.title FROM nova_courses c JOIN nova_enrollments e ON e.course_id=c.id WHERE e.user_id=? AND e.status='active' AND c.status='published'",[u.id]);
  const rows=[];for(const co of courses){const lessons=await q.all("SELECT l.id,l.published_version,v.content_json,p.completed_at,(SELECT MAX(a.score) FROM nova_attempts a WHERE a.user_id=? AND a.lesson_id=l.id AND a.version=l.published_version) AS score FROM nova_lessons l JOIN nova_versions v ON v.lesson_id=l.id AND v.version=l.published_version LEFT JOIN nova_progress p ON p.lesson_id=l.id AND p.version=l.published_version AND p.user_id=? WHERE l.course_id=? AND l.status='published'",[u.id,u.id,co.id]);rows.push({...co,lessons:lessons.map(({content_json,...l})=>({...l,title:JSON.parse(content_json).title}))});}
  const activity=await q.all('SELECT substr(created_at,1,10) AS day,SUM(accepted_seconds) AS seconds FROM nova_activity_events WHERE user_id=? GROUP BY substr(created_at,1,10) ORDER BY day DESC LIMIT 30',[u.id]);return reply({courses:rows,activity});
 }
 const applyMatch=route.match(/^\/lessons\/([^/]+)\/ai-apply$/);
 if(applyMatch&&req.method==='POST'){staff();const lesson=await lessonScope(q,u,applyMatch[1],true);if(data.draftRev!==lesson.draft_rev)fail(409,'پیش‌نویس تغییر کرده است.');const job=await q.one("SELECT * FROM nova_ai_jobs WHERE id=? AND user_id=? AND lesson_id=? AND kind='author' AND status='completed'",[id(data.jobId),u.id,lesson.id]);if(!job)fail(404,'پیشنهاد تأییدشده پیدا نشد.');const input=JSON.parse(job.input_json),result=JSON.parse(job.result_json);if(input.draftRev!==lesson.draft_rev)fail(409,'پیشنهاد مربوط به نسخه قدیمی است؛ دوباره مشورت کنید.');if(!result.answer||result.verification==='withheld')fail(409,'پاسخ قابل اعمال نیست.');const doc=JSON.parse(lesson.draft_json);doc.blocks.push({id:randomUUID(),kind:'note',title:'پیشنهاد دستیار — نیازمند بازبینی مدرس',body:result.answer});const clean=require('./service').validateLesson(doc);await q.run('UPDATE nova_lessons SET draft_json=?,draft_rev=draft_rev+1 WHERE id=?',[JSON.stringify(clean),lesson.id]);await audit(q,u,'lesson.ai-apply',lesson.id);return reply({draftRev:lesson.draft_rev+1});}
 let revisionMatch=route.match(/^\/lessons\/([^/]+)\/versions$/);
 if(revisionMatch){staff();const lesson=await lessonScope(q,u,revisionMatch[1],true);if(req.method==='GET')return reply({versions:(await q.all('SELECT version,content_json,published_at FROM nova_versions WHERE lesson_id=? ORDER BY version DESC',[lesson.id])).map(v=>({version:v.version,title:JSON.parse(v.content_json).title,publishedAt:v.published_at}))});if(data.draftRev!==lesson.draft_rev)fail(409,'پیش‌نویس تغییر کرده است.');const version=await q.one('SELECT content_json FROM nova_versions WHERE lesson_id=? AND version=?',[lesson.id,integer(data.version,1,1000000)]);if(!version)fail(404,'نسخه پیدا نشد.');await q.run('UPDATE nova_lessons SET draft_json=?,draft_rev=draft_rev+1 WHERE id=?',[version.content_json,lesson.id]);await audit(q,u,'lesson.restore-draft',lesson.id);return reply({draftRev:lesson.draft_rev+1});}
 if(route==='/media'){
  if(req.method==='GET'){
   if(u.role==='student')fail(403,'فقط مدرس و مدیر');
   return reply({media:await q.all(`SELECT m.id,m.course_id,m.owner_id,m.title,m.mime,m.status,m.reason,m.created_at,u.name AS owner FROM nova_media m JOIN nova_users u ON u.id=m.owner_id ${u.role==='admin'?'':"WHERE m.owner_id=? OR (m.status='approved' AND m.course_id IN(SELECT course_id FROM nova_teachers WHERE user_id=?))"} ORDER BY m.created_at DESC LIMIT 100`,u.role==='admin'?[]:[u.id,u.id])});
  }
  staff();const cid=id(data.courseId);await scope(q,u,cid,true);
  const title=text(data.title,200),mime=text(data.mime,80);if(!['image/png','image/jpeg','image/webp','video/mp4','video/webm','application/pdf'].includes(mime))fail(400,'نوع فایل مجاز نیست.');
  if(typeof data.content!=='string'||data.content.length>8000000||!data.content.length||!/^[A-Za-z0-9+/]+={0,2}$/.test(data.content))fail(400,'فایل حداکثر ۶ مگابایت باشد.');
  const bytes=Buffer.from(data.content,'base64');if(bytes.length>6000000)fail(413,'فایل بیش از حد بزرگ است.');
  const hex=bytes.subarray(0,12).toString('hex');const valid=mime==='image/png'?hex.startsWith('89504e470d0a1a0a'):mime==='image/jpeg'?hex.startsWith('ffd8ff'):mime==='image/webp'?bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP':mime==='video/mp4'?bytes.subarray(4,8).toString()==='ftyp':mime==='video/webm'?hex.startsWith('1a45dfa3'):bytes.subarray(0,5).toString()==='%PDF-';
  if(!valid)fail(400,'محتوای فایل با نوع آن یکسان نیست.');
  const mid=randomUUID();await q.run('INSERT INTO nova_media(id,course_id,owner_id,title,mime,content_base64,status,reason,created_at) VALUES(?,?,?,?,?,?,?,\'\',?)',[mid,cid,u.id,title,mime,data.content,u.role==='admin'?'approved':'pending',stamp()]);await audit(q,u,'media.upload',mid);return reply({id:mid,url:'/api/platform/files/'+mid},201);
 }
 let m=route.match(/^\/media\/([^/]+)\/review$/);
 if(m&&req.method==='POST'){
  if(u.role!=='admin')fail(403,'فقط مدیر مجاز است.');const status=data.approved===true?'approved':'rejected',reason=text(data.reason||'',1000,status==='rejected'?1:0);const row=await q.one('SELECT id FROM nova_media WHERE id=?',[id(m[1])]);if(!row)fail(404,'رسانه پیدا نشد.');await q.run('UPDATE nova_media SET status=?,reason=? WHERE id=?',[status,reason,row.id]);await audit(q,u,'media.'+status,row.id);return reply({ok:true});
 }
 m=route.match(/^\/files\/([^/]+)$/);
 if(m&&req.method==='GET'){
  const row=await q.one('SELECT * FROM nova_media WHERE id=?',[id(m[1])]);if(!row)fail(404,'فایل پیدا نشد.');await scope(q,u,row.course_id);if(u.role==='student'&&row.status!=='approved'||u.role==='teacher'&&row.owner_id!==u.id&&row.status!=='approved')fail(403,'فایل هنوز تأیید نشده است.');
  const bytes=Buffer.from(row.content_base64,'base64');let start=0,end=bytes.length-1,status=200;
  if(req.headers.range){const r=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!r||Number(r[1])>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return {streamed:true};}start=Number(r[1]);end=r[2]?Math.min(Number(r[2]),end):end;if(end<start)fail(416,'بازه معتبر نیست.');status=206;}
  const headers={'Content-Type':row.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Content-Length':end-start+1,'Content-Disposition':row.mime==='application/pdf'?'attachment; filename="document.pdf"':'inline'};if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${bytes.length}`;
  res.writeHead(status,headers);res.end(bytes.subarray(start,end+1));return {streamed:true};
 }
 m=route.match(/^\/courses\/([^/]+)\/library$/);
 if(m){const cid=id(m[1]);await scope(q,u,cid,req.method==='POST');if(req.method==='GET')return reply({items:await q.all('SELECT id,title,body,updated_at FROM nova_library WHERE course_id=? ORDER BY updated_at DESC',[cid])});staff();const lid=data.id?id(data.id):randomUUID();if(data.id&&!await q.one('SELECT id FROM nova_library WHERE id=? AND course_id=?',[lid,cid]))fail(404,'مورد پیدا نشد.');if(data.remove){await q.run('DELETE FROM nova_library WHERE id=? AND course_id=?',[lid,cid]);return reply({ok:true});}await q.run('INSERT INTO nova_library VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,updated_at=excluded.updated_at',[lid,cid,text(data.title),text(data.body,16000),u.id,stamp()]);return reply({id:lid});}
 m=route.match(/^\/lessons\/([^/]+)\/local-chat$/);
 if(m){const lesson=await lessonScope(q,u,m[1]);if(req.method==='GET')return reply({messages:await q.all('SELECT id,question,answer,created_at FROM nova_local_chat WHERE user_id=? AND lesson_id=? ORDER BY created_at DESC LIMIT 30',[u.id,lesson.id])});const question=text(data.question,4000,3);const {purpose}=require('./chat-input').parseChatInput(question,data.purpose||'auto');const linked=await require('./chat-input').resolveChatLinks(question);const v=await q.one('SELECT content_json FROM nova_versions WHERE lesson_id=? AND version=?',[lesson.id,lesson.published_version]);if(!v)fail(409,'ابتدا درس را منتشر کنید.');const doc=JSON.parse(v.content_json);const tokens=question.toLowerCase().split(/\s+/).filter(t=>t.length>2);const blocks=doc.blocks.filter(b=>['heading','text','note','code','explanation','summary','exercise'].includes(b.kind)).map(b=>({...b,score:tokens.filter(t=>(b.title+' '+b.body).toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score);const chosen=blocks.filter(b=>b.score>0||(purpose==='example'||purpose==='debug')&&b.kind==='code'||purpose==='summary'&&b.kind==='heading'||purpose==='practice'&&b.kind==='exercise').slice(0,3);let answer=chosen.length?chosen.map(b=>(b.title?b.title+'\n':'')+b.body).join('\n\n'):'در متن این درس نتیجه‌ای پیدا نشد. واژه‌های دقیق‌تر بنویسید یا از مدرس کمک بگیرید.';if(linked.sources.length)answer+='\n\nگزیده لینک‌های پیام:\n'+linked.sources.map(s=>s.title+'\n'+s.text.slice(0,2500)).join('\n\n');if(linked.notices.length)answer+='\n\n'+linked.notices.join('\n');await q.run('INSERT INTO nova_local_chat VALUES(?,?,?,?,?,?)',[randomUUID(),u.id,lesson.id,question,answer,stamp()]);return reply({answer,mode:'local-search',source:doc.title});}
 m=route.match(/^\/courses\/([^/]+)\/exams$/);
 if(m){const cid=id(m[1]);await scope(q,u,cid,req.method==='POST');if(req.method==='GET'){
 for(const exam of await q.all('SELECT id FROM nova_exams WHERE course_id=?',[cid]))await finishExpired(q,exam.id);
 const rows=await q.all(`SELECT e.*,s.module_id AS moduleId,COALESCE(s.show_results,1) AS showResults,a.id AS attempt_id,a.score,a.started_at,a.deadline,a.submitted_at FROM nova_exams e LEFT JOIN nova_exam_settings s ON s.exam_id=e.id LEFT JOIN nova_exam_attempts a ON a.exam_id=e.id AND a.user_id=? WHERE e.course_id=? ${u.role==='student'?"AND e.status='published'":''} ORDER BY e.opens_at`,[u.id,cid]);return reply({exams:rows.map(({questions_json,...e})=>({...e,questions:u.role==='student'?undefined:JSON.parse(questions_json),score:u.role==='student'&&!Number(e.showResults)?null:e.score,questionCount:JSON.parse(questions_json).length,totalPoints:JSON.parse(questions_json).reduce((n,x)=>n+(x.points||1),0)}))});}
 staff();const title=text(data.title),questions=data.questions;if(!Array.isArray(questions)||!questions.length||questions.length>50)fail(400,'۱ تا ۵۰ سؤال لازم است.');const cleaned=questions.map(x=>{if(!x||!Array.isArray(x.options)||x.options.length<2||x.options.length>6)fail(400,'گزینه‌ها معتبر نیستند.');const points=Number(x.points??1);if(!Number.isFinite(points)||points<0.25||points>100||points*4%1)fail(400,'بارم باید مضرب ۰٫۲۵ و بین ۰٫۲۵ تا ۱۰۰ باشد.');if(x.difficulty&&!['easy','medium','hard'].includes(x.difficulty))fail(400,'سطح دشواری معتبر نیست.');let imageUrl='';if(x.imageUrl){try{const img=new URL(x.imageUrl);if(img.protocol!=='https:'||img.username||img.password)throw Error();imageUrl=img.href;}catch{fail(400,'نشانی تصویر HTTPS لازم است.');}}return {prompt:text(x.prompt,1000),options:x.options.map(o=>text(o,500)),correct:integer(x.correct,0,x.options.length-1),points,code:x.code?text(x.code,5000):'',explanation:x.explanation?text(x.explanation,2000):'',difficulty:x.difficulty||'easy',imageUrl};});
 const moduleId=data.moduleId?id(data.moduleId):null;if(moduleId&&!await q.one('SELECT id FROM nova_modules WHERE id=? AND course_id=?',[moduleId,cid]))fail(400,'فصل متعلق به این دوره نیست.');if(data.showResults!==undefined&&typeof data.showResults!=='boolean')fail(400,'نمایش نتیجه معتبر نیست.');
 async function settings(eid){await q.run('INSERT INTO nova_exam_settings VALUES(?,?,?) ON CONFLICT(exam_id) DO UPDATE SET module_id=excluded.module_id,show_results=excluded.show_results',[eid,moduleId,data.showResults===false?0:1]);}
 
 const opens=new Date(data.opensAt),closes=new Date(data.closesAt);if(!Number.isFinite(+opens)||!Number.isFinite(+closes)||closes<=opens)fail(400,'بازه زمانی معتبر نیست.');const duration=integer(data.durationMinutes,1,240),pass=integer(data.passScore??70,1,100);if(!['draft','published'].includes(data.status))fail(400,'وضعیت آزمون معتبر نیست.');
 if(data.id){const old=await q.one('SELECT * FROM nova_exams WHERE id=? AND course_id=?',[id(data.id),cid]);if(!old)fail(404,'آزمون پیدا نشد.');if(old.revision!==data.revision)fail(409,'آزمون تغییر کرده است.');if(await q.one('SELECT id FROM nova_exam_attempts WHERE exam_id=? LIMIT 1',[old.id]))fail(409,'پس از شروع شرکت‌کنندگان امکان ویرایش نیست.');await q.run('UPDATE nova_exams SET title=?,questions_json=?,opens_at=?,closes_at=?,duration_minutes=?,pass_score=?,status=?,revision=revision+1 WHERE id=?',[title,JSON.stringify(cleaned),opens.toISOString(),closes.toISOString(),duration,pass,data.status,old.id]);await settings(old.id);await audit(q,u,'exam.update',old.id);return reply({id:old.id});}
 const eid=randomUUID();await q.run('INSERT INTO nova_exams VALUES(?,?,?,?,?,?,?,?,?,1,?,?)',[eid,cid,title,JSON.stringify(cleaned),opens.toISOString(),closes.toISOString(),duration,pass,data.status,u.id,stamp()]);await settings(eid);await audit(q,u,'exam.create',eid);return reply({id:eid},201);
 }
 m=route.match(/^\/exams\/([^/]+)\/(start|attempt|save|submit|results|status|visibility)$/);
 if(m){const exam=await q.one('SELECT * FROM nova_exams WHERE id=?'+(q.postgres?' FOR UPDATE':''),[id(m[1])]);if(!exam)fail(404,'آزمون پیدا نشد.');await scope(q,u,exam.course_id);const action=m[2];
 if(action==='results'&&req.method==='GET'){staff();await finishExpired(q,exam.id);return reply({results:await q.all('SELECT a.id,u.name,u.username,a.started_at,a.deadline,a.score,a.submitted_at FROM nova_exam_attempts a JOIN nova_users u ON u.id=a.user_id WHERE a.exam_id=? ORDER BY u.name',[exam.id])});}
 if(action==='status'&&req.method==='POST'){staff();if(!['draft','published','archived'].includes(data.status))fail(400,'وضعیت معتبر نیست.');await q.run('UPDATE nova_exams SET status=?,revision=revision+1 WHERE id=?',[data.status,exam.id]);return reply({ok:true});}
 if(action==='visibility'&&req.method==='POST'){staff();if(typeof data.showResults!=='boolean')fail(400,'نمایش نتیجه معتبر نیست.');await q.run('INSERT INTO nova_exam_settings VALUES(?,NULL,?) ON CONFLICT(exam_id) DO UPDATE SET show_results=excluded.show_results',[exam.id,data.showResults?1:0]);return reply({ok:true});}
 if(u.role!=='student')fail(403,'فقط دانش‌آموز شرکت می‌کند.');if(exam.status!=='published')fail(403,'آزمون منتشر نشده است.');const questions=JSON.parse(exam.questions_json);let a=await q.one('SELECT * FROM nova_exam_attempts WHERE exam_id=? AND user_id=?',[exam.id,u.id]);
 async function finalize(){const answers=JSON.parse(a.answers_json);const score=examScore(questions,answers);await q.run('UPDATE nova_exam_attempts SET score=?,submitted_at=? WHERE id=? AND submitted_at IS NULL',[score,stamp(),a.id]);a={...a,score,submitted_at:stamp()};}
 if(a&&!a.submitted_at&&Date.now()>=Date.parse(a.deadline))await finalize();
 if(action==='start'&&req.method==='POST'&&!a){if(Date.now()<Date.parse(exam.opens_at)||Date.now()>=Date.parse(exam.closes_at))fail(409,'اکنون خارج از زمان آزمون است.');a={id:randomUUID(),exam_id:exam.id,user_id:u.id,started_at:stamp(),deadline:new Date(Math.min(Date.now()+exam.duration_minutes*60000,Date.parse(exam.closes_at))).toISOString(),answers_json:'[]',score:null,submitted_at:null};await q.run('INSERT INTO nova_exam_attempts VALUES(?,?,?,?,?,?,?,?)',Object.values(a));}
 if(!a)fail(404,'ابتدا آزمون را شروع کنید.');
 let attemptState=await q.one('SELECT * FROM nova_exam_attempt_state WHERE attempt_id=?',[a.id])||{revision:0,bookmarks_json:'[]'};
 
 if(['save','submit'].includes(action)&&req.method==='POST'&&!a.submitted_at){if(!Array.isArray(data.answers)||data.answers.length>questions.length)fail(400,'پاسخ‌ها معتبر نیستند.');if(data.revision!==undefined&&data.revision!==Number(attemptState.revision))fail(409,'پاسخ‌ها در پنجره دیگری تغییر کرده‌اند؛ صفحه را دوباره دریافت کنید.');const marks=data.bookmarks??JSON.parse(attemptState.bookmarks_json);if(!Array.isArray(marks)||marks.length>questions.length||new Set(marks).size!==marks.length||marks.some(i=>!Number.isInteger(i)||i<0||i>=questions.length))fail(400,'علامت‌گذاری سؤال معتبر نیست.');attemptState={revision:Number(attemptState.revision)+1,bookmarks_json:JSON.stringify(marks)};await q.run('INSERT INTO nova_exam_attempt_state VALUES(?,?,?) ON CONFLICT(attempt_id) DO UPDATE SET revision=excluded.revision,bookmarks_json=excluded.bookmarks_json',[a.id,attemptState.revision,attemptState.bookmarks_json]);const answers=questions.map((x,i)=>data.answers[i]===null||data.answers[i]===undefined?null:integer(data.answers[i],0,x.options.length-1));a.answers_json=JSON.stringify(answers);await q.run('UPDATE nova_exam_attempts SET answers_json=? WHERE id=?',[a.answers_json,a.id]);if(action==='submit')await finalize();}
 const setting=await q.one('SELECT s.*,m.title AS module_title FROM nova_exam_settings s LEFT JOIN nova_modules m ON m.id=s.module_id WHERE s.exam_id=?',[exam.id]);const show=setting?.show_results!==0;
 return reply({serverNow:stamp(),attempt:{id:a.id,deadline:a.deadline,answers:JSON.parse(a.answers_json),score:show?a.score:null,submittedAt:a.submitted_at,timedOut:Boolean(a.submitted_at&&Date.parse(a.submitted_at)>=Date.parse(a.deadline)),revision:Number(attemptState.revision),bookmarks:JSON.parse(attemptState.bookmarks_json)},exam:{id:exam.id,title:exam.title,courseId:exam.course_id,moduleTitle:setting?.module_title||'',durationMinutes:exam.duration_minutes,totalPoints:questions.reduce((n,x)=>n+(x.points||1),0),showResults:show,passScore:exam.pass_score,questions:questions.map(({correct,explanation,...x})=>x)}});
 }
 return null;
}
module.exports={demoRoutes,clientIp,lockIdentity};
