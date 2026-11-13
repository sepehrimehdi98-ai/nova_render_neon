'use strict';
const {randomUUID}=require('node:crypto');
const MAX_FILE=1500000;
function decodeFile(file){
 if(!file||typeof file.name!=='string'||file.name.length<1||file.name.length>200||/[\x00-\x1f\\/]/.test(file.name)||typeof file.base64!=='string'||file.base64.length>2000000||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.base64))throw Error('INVALID_FILE');
 const buffer=Buffer.from(file.base64,'base64');if(!buffer.length||buffer.length>MAX_FILE)throw Error('FILE_TOO_LARGE');
 const ext=file.name.split('.').pop().toLowerCase();const types={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain',md:'text/markdown',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg'};
 if(!types[ext]||ext==='pdf'&&buffer.subarray(0,5).toString()!=='%PDF-'||ext==='docx'&&buffer.subarray(0,2).toString()!=='PK'||ext==='png'&&buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||['jpg','jpeg'].includes(ext)&&buffer.subarray(0,3).toString('hex')!=='ffd8ff')throw Error('INVALID_FILE');
 return {buffer,name:file.name,mime:types[ext],bytes:buffer.length,ext};
}
async function parseDocument(file){
 const f=decodeFile(file);let pages=[];
 if(f.ext==='pdf'){
  const {PDFParse}=require('pdf-parse');const parser=new PDFParse({data:f.buffer,isEvalSupported:false});
  try{const info=await parser.getInfo();if(info.total>100)throw Error('TOO_MANY_PAGES');const result=await parser.getText();if(result.total>100)throw Error('TOO_MANY_PAGES');pages=result.pages.map(p=>({page:p.num,text:p.text}));}finally{await parser.destroy()}
 }else if(f.ext==='docx'){
  // Reject excessive expanded archives before parsing; never follow embedded external files.
  const zip=await require('jszip').loadAsync(f.buffer);const entries=Object.values(zip.files);if(entries.length>500||entries.some(e=>e._data&&e._data.uncompressedSize>5000000)||entries.reduce((n,e)=>n+(e._data?.uncompressedSize||0),0)>10000000)throw Error('DOCUMENT_TOO_LARGE');
  const result=await require('mammoth').extractRawText({buffer:f.buffer},{externalFileAccess:false});pages=[{page:1,text:result.value}];
 }else if(['txt','md'].includes(f.ext)){pages=[{page:1,text:f.buffer.toString('utf8')}]}else throw Error('DOCUMENT_FORMAT_UNSUPPORTED');
 pages=pages.map(p=>({page:p.page,text:String(p.text).normalize('NFKC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim()}));
 const size=pages.reduce((n,p)=>n+p.text.length,0);if(size<20||size>120000)throw Error('DOCUMENT_TEXT_SIZE');
 return {...f,pages};
}
function extractAnswer(doc,question){
 const pages=JSON.parse(doc.pages_json);const terms=(question.toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu)||[]);const summary=/خلاصه|نکات|summary|summari/i.test(question);const count=/کوتاه|short/i.test(question)?2:4;
 let parts=pages.flatMap(p=>p.text.split(/\n\s*\n|(?<=[.!؟])\s+/).filter(s=>s.trim().length>15).map((text,index)=>({page:p.page,index,text:text.trim(),score:terms.filter(t=>text.toLowerCase().includes(t)).length})));
 if(!summary)parts=parts.filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.page-b.page||a.index-b.index);
 const selected=parts.slice(0,count);return {answer:selected.length?(summary?'گزیدهٔ نکات سند شما':'بخش‌های مرتبط با پرسش شما')+'\n\n'+selected.map(p=>'• '+p.text.slice(0,650)).join('\n\n'):'بخشی مرتبط با این پرسش در متن سند پیدا نشد. پرسش را با واژه‌های موجود در فایل دقیق‌تر کنید.',sources:selected.map(p=>({documentId:doc.id,title:doc.name,page:p.page,unit:doc.mime==='application/pdf'?'صفحه':'بخش',excerpt:p.text.slice(0,650)})),mode:'local',verification:'extractive-not-generative'};
}
async function teacherWorkspace(c){
 const {q,u,route,req,data,url,scope,send,res,fail,id,text}=c;const m=route.match(/^\/courses\/([^/]+)\/(documents|progress|my-progress)(?:\/([^/]+))?(?:\/(chat|messages|jobs|file))?$/);if(!m)return null;
 const cid=id(m[1]);await scope(q,u,cid);if(m[2]==='my-progress'){if(req.method!=='GET'||u.role!=='student')fail(403,'فقط عملکرد شخصی دانش‌آموز');return personalProgress(c,cid);}if(u.role==='student')fail(403,'این بخش فقط برای مدرس و مدیر است.');const reply=(x,status=200)=>send(res,status,x);
 if(m[2]==='progress'){if(req.method!=='GET')fail(405,'روش مجاز نیست.');return progress(c,cid);}
 if(!m[3]){
  if(req.method==='GET')return reply({documents:await q.all('SELECT id,name,mime,bytes,pages_json,created_at FROM nova_documents WHERE course_id=? AND user_id=? ORDER BY created_at DESC LIMIT 50',[cid,u.id]).then(rows=>rows.map(({pages_json,...r})=>({...r,pages:JSON.parse(pages_json).length}))),online:!!(process.env.OPENROUTER_API_KEY||process.env.LIARA_AI_API_KEY)});
  const n=await q.one('SELECT COUNT(*) AS n FROM nova_documents WHERE user_id=? AND course_id=?',[u.id,cid]);if(Number(n.n)>=50)fail(409,'حداکثر ۵۰ سند در هر دوره؛ برای مدیریت اسناد با مدیر تماس بگیرید.');
  if(data.file?.base64?.length>2000000)fail(413,'حجم فایل بیشتر از ۱٫۵ مگابایت است.');let f;try{f=await parseDocument(data.file)}catch{fail(400,'فایل PDF متنی، DOCX، TXT یا Markdown تا ۱٫۵ مگابایت، ۱۰۰ صفحه و ۱۲۰هزار نویسه لازم است. فایل اسکن‌شده نیاز به OCR دارد.');}
  const did=randomUUID();await q.run('INSERT INTO nova_documents VALUES(?,?,?,?,?,?,?,?)',[did,cid,u.id,f.name,f.mime,f.bytes,JSON.stringify(f.pages),new Date().toISOString()]);await q.run('INSERT INTO nova_document_files VALUES(?,?)',[did,f.buffer.toString('base64')]);return reply({id:did,name:f.name,mime:f.mime,bytes:f.bytes,pages:f.pages.length},201);
 }
 const doc=await q.one('SELECT * FROM nova_documents WHERE id=? AND course_id=? AND user_id=?',[id(m[3]),cid,u.id]);if(!doc)fail(404,'سند پیدا نشد.');
 if(m[4]==='file'&&req.method==='GET'){const file=await q.one('SELECT base64 FROM nova_document_files WHERE document_id=?',[doc.id]);if(!file)fail(404,'اصل این فایل قدیمی ذخیره نشده است؛ دوباره بارگذاری کنید.');return reply({file:{name:doc.name,mime:doc.mime,base64:file.base64}});}
 if(m[4]==='messages'&&req.method==='GET')return reply({messages:await q.all("SELECT * FROM nova_document_messages WHERE document_id=? AND user_id=? ORDER BY created_at DESC,CASE WHEN role='user' THEN 0 ELSE 1 END DESC,id DESC LIMIT 100",[doc.id,u.id]).then(rows=>rows.reverse())});
 if(m[4]==='jobs'&&req.method==='GET')return reply({jobs:await q.all("SELECT id,status,result_json FROM nova_ai_jobs WHERE course_id=? AND user_id=? AND kind='document' ORDER BY created_at DESC LIMIT 30",[cid,u.id])});
 if(m[4]!=='chat'||req.method!=='POST')fail(405,'روش مجاز نیست.');if(data.mode!==undefined&&!['local','online'].includes(data.mode))fail(400,'روش پاسخ معتبر نیست.');const question=text(data.question,4000,3);const at=new Date().toISOString();
 if(data.mode==='online'){
  if(!(process.env.OPENROUTER_API_KEY||process.env.LIARA_AI_API_KEY))fail(503,'سرویس AI آنلاین تنظیم نشده؛ استخراج محلی در دسترس است.');
  if(q.postgres)await q.one('SELECT id FROM nova_users WHERE id=? FOR UPDATE',[u.id]);const n=await q.one("SELECT COUNT(*) AS n FROM nova_ai_jobs WHERE user_id=? AND (status='queued' OR status='running' OR created_at>?)",[u.id,new Date(Date.now()-3600000).toISOString()]);if(Number(n.n)>=20)fail(429,'سقف درخواست؛ کمی بعد دوباره تلاش کنید.');
  const jid=randomUUID();await q.run('INSERT INTO nova_ai_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?)',[jid,u.id,cid,null,'document',JSON.stringify({question,documentId:doc.id}),'queued','{}',null,null,at]);await message('user',question,[],'online');return reply({id:jid,status:'queued'},202);
 }
 const result=extractAnswer(doc,question);await message('user',question,[],'local');await message('assistant',result.answer,result.sources,'local');return reply(result);
 async function message(role,body,sources,mode){await q.run('INSERT INTO nova_document_messages VALUES(?,?,?,?,?,?,?,?)',[randomUUID(),doc.id,u.id,role,body,JSON.stringify(sources),mode,new Date(Date.parse(at)+(role==='assistant'?1:0)).toISOString()])}
}
async function progress(c,cid){
 const {q,u,url,send,res,fail,id}=c;let days=Number(url.searchParams.get('days')||30);if(![7,30,90].includes(days))fail(400,'بازه زمانی معتبر نیست.');const since=new Date(Date.now()-days*86400000).toISOString();
 const students=await q.all(`SELECT u.id,u.name,e.status,(SELECT COUNT(*) FROM nova_lessons l WHERE l.course_id=? AND l.status='published') AS lessons,(SELECT COUNT(*) FROM nova_progress p JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=? AND p.user_id=u.id AND p.completed_at IS NOT NULL AND p.version=l.published_version) AS completed,(SELECT AVG(a.score) FROM nova_exam_attempts a JOIN nova_exams x ON x.id=a.exam_id WHERE x.course_id=? AND a.user_id=u.id AND a.submitted_at>=?) AS average,(SELECT SUM(a.accepted_seconds) FROM nova_activity_events a JOIN nova_lessons l ON l.id=a.lesson_id WHERE l.course_id=? AND a.user_id=u.id AND a.created_at>=?) AS activity FROM nova_enrollments e JOIN nova_users u ON u.id=e.user_id WHERE e.course_id=? ORDER BY u.name LIMIT 500`,[cid,cid,cid,since,cid,since,cid]);
 const exams=await q.all('SELECT x.id,x.title,AVG(a.score) AS average,COUNT(a.score) AS attempts FROM nova_exams x LEFT JOIN nova_exam_attempts a ON a.exam_id=x.id AND a.submitted_at>=? WHERE x.course_id=? GROUP BY x.id,x.title ORDER BY x.opens_at,x.id',[since,cid]);
 const completed=students.reduce((n,s)=>n+Number(s.completed),0),total=students.reduce((n,s)=>n+Number(s.lessons),0);const avg=await q.one('SELECT AVG(a.score) AS average FROM nova_exam_attempts a JOIN nova_exams x ON x.id=a.exam_id WHERE x.course_id=? AND a.submitted_at>=?',[cid,since]);
 let selected=null;const sid=url.searchParams.get('student');if(sid){const student=students.find(s=>s.id===id(sid));if(!student)fail(404,'دانش‌آموز در این دوره نیست.');const results=await q.all('SELECT x.id,x.title,a.score,a.submitted_at FROM nova_exams x LEFT JOIN nova_exam_attempts a ON a.exam_id=x.id AND a.user_id=? AND a.submitted_at>=? WHERE x.course_id=? ORDER BY x.opens_at,x.id',[sid,since,cid]);const daily=await q.all('SELECT substr(a.created_at,1,10) AS day,SUM(a.accepted_seconds) AS seconds FROM nova_activity_events a JOIN nova_lessons l ON l.id=a.lesson_id WHERE a.user_id=? AND l.course_id=? AND a.created_at>=? GROUP BY substr(a.created_at,1,10) ORDER BY day',[sid,cid,since]);selected={...student,results,daily};}
 return send(res,200,{students,exams,selected,summary:{average:avg.average,students:students.length,completion:total?completed/total*100:0},days,activityDefinition:'فعالیت ثبت‌شده در صفحه درس؛ معادل حضور یا توجه قطعی نیست.'});
}
async function personalProgress(c,cid){
 const {q,u,url,send,res,fail}=c;if(url.searchParams.has('student'))fail(400,'شناسه دیگری برای عملکرد شخصی پذیرفته نمی‌شود.');const days=Number(url.searchParams.get('days')||30);if(![7,30,90].includes(days))fail(400,'بازه زمانی معتبر نیست.');const since=new Date(Date.now()-days*86400000).toISOString();
 const results=await q.all("SELECT x.id,x.title,CASE WHEN COALESCE(s.show_results,1)=1 THEN a.score ELSE NULL END AS score,a.submitted_at FROM nova_exams x LEFT JOIN nova_exam_settings s ON s.exam_id=x.id LEFT JOIN nova_exam_attempts a ON a.exam_id=x.id AND a.user_id=? AND a.submitted_at>=? WHERE x.course_id=? AND x.status='published' ORDER BY x.opens_at,x.id",[u.id,since,cid]);
 const progress=await q.one("SELECT COUNT(*) AS lessons,(SELECT COUNT(*) FROM nova_progress p JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=? AND l.status='published' AND p.user_id=? AND p.version=l.published_version AND p.completed_at IS NOT NULL) AS completed FROM nova_lessons WHERE course_id=? AND status='published'",[cid,u.id,cid]);
 const daily=await q.all('SELECT substr(a.created_at,1,10) AS day,SUM(a.accepted_seconds) AS seconds FROM nova_activity_events a JOIN nova_lessons l ON l.id=a.lesson_id WHERE a.user_id=? AND l.course_id=? AND a.created_at>=? GROUP BY substr(a.created_at,1,10) ORDER BY day',[u.id,cid,since]);const scores=results.filter(r=>r.score!==null).map(r=>Number(r.score));
 return send(res,200,{selected:{id:u.id,name:u.name,lessons:Number(progress.lessons),completed:Number(progress.completed),average:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,activity:daily.reduce((n,d)=>n+Number(d.seconds),0),results,daily},exams:[],activityDefinition:'زمان ثبت‌شده در صفحه درس؛ اثبات حضور یا توجه قطعی نیست.'});
}
module.exports={teacherWorkspace,decodeFile,parseDocument,extractAnswer};
