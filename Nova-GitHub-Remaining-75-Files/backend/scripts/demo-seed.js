'use strict';
require('../lib/load-env');
const {openStore}=require('../lib/platform/store');
const {hashPassword}=require('../lib/passwords');
const {randomUUID}=require('node:crypto');
const fs=require('node:fs');const path=require('node:path');
async function seed(){
 const hosted=process.env.NODE_ENV==='production'||!!process.env.DATABASE_URL;
 if(hosted&&(process.env.NOVA_SEED_CONFIRM!=='empty-demo-database'||!process.env.NOVA_SEED_PASSWORD||process.env.NOVA_SEED_PASSWORD.length<16))throw Error('Hosted seed requires NOVA_SEED_CONFIRM=empty-demo-database and NOVA_SEED_PASSWORD with at least 16 characters.');
 const store=await openStore();
 try{
 if(await store.tx(q=>q.one('SELECT id FROM nova_users LIMIT 1')))return console.log('Existing database preserved; no demo data inserted.');
 const pass=await hashPassword(hosted?process.env.NOVA_SEED_PASSWORD:'NovaDemo-2026!');const ids={admin:randomUUID(),teacher:randomUUID(),student:randomUUID(),course:randomUUID()};
 await store.tx(async q=>{
 const date=new Date().toISOString();
 for(const role of ['admin','teacher','student'])await q.run('INSERT INTO nova_users VALUES(?,?,?,?,?,1,?)',[ids[role],role,{admin:'مدیر نوا',teacher:'سارا احمدی',student:'آرین رضایی'}[role],role,pass,date]);
 await q.run('INSERT INTO nova_courses VALUES(?,?,?,?,?,?)',[ids.course,'پایتون مقدماتی','از اولین برنامه تا حلقه‌ها؛ یک مسیر عملی و ذخیره‌شونده','published',ids.admin,date]);
 await q.run('INSERT INTO nova_teachers VALUES(?,?)',[ids.course,ids.teacher]);await q.run("INSERT INTO nova_enrollments VALUES(?,?,'active')",[ids.course,ids.student]);
 let videoId;const video=path.join(__dirname,'../../assets/demo.mp4');if(fs.existsSync(video)){videoId=randomUUID();await q.run("INSERT INTO nova_media VALUES(?,?,?,?,?,?,'approved','',?)",[videoId,ids.course,ids.admin,'نمونه پخش ویدیو — گل (CC0، MDN)','video/mp4',fs.readFileSync(video).toString('base64'),date]);}
 const moduleId=randomUUID();await q.run('INSERT INTO nova_modules VALUES(?,?,?,0)',[moduleId,ids.course,'شروع یادگیری']);
 const samples=[{title:'اولین برنامه و متغیرها',body:'در پایتون با print می‌توانیم متن را چاپ کنیم. متغیر نامی برای نگهداری یک مقدار است. برای مثال name = "Nova" مقدار Nova را در متغیر name ذخیره می‌کند.',code:'name = "Nova"\nprint("Hello", name)',prompt:'نام خود را در متغیر name ذخیره کنید و آن را چاپ کنید.',question:'کدام دستور متن را چاپ می‌کند؟',options:['print("Hello")','input = Hello','show Hello'],correct:0},{title:'شرط‌ها و تصمیم‌گیری',body:'دستور if زمانی اجرا می‌شود که شرط درست باشد. با else می‌توانیم حالت دیگر را تعریف کنیم. تورفتگی در پایتون بخش‌های یک بلوک را مشخص می‌کند.',code:'score = 85\nif score >= 70:\n    print("Passed")\nelse:\n    print("Try again")',prompt:'برنامه‌ای بنویسید که زوج یا فرد بودن عدد ۸ را نمایش دهد.',question:'برای مقایسه برابری کدام عملگر استفاده می‌شود؟',options:['=','==','!='],correct:1},{title:'حلقه‌ها و تکرار',body:'حلقه for برای پیمایش مجموعه یا تکرار به کار می‌رود. range(1, 6) اعداد یک تا پنج را تولید می‌کند؛ عدد انتهایی در بازه نیست.',code:'for number in range(1, 6):\n    print(number)',prompt:'اعداد زوج صفر تا ده را چاپ کنید.',question:'range(3) چند عدد تولید می‌کند؟',options:['۲','۳','۴'],correct:1}];
 for(let i=0;i<samples.length;i++){
 const s=samples[i],lid=randomUUID();const blocks=[{id:randomUUID(),kind:'heading',title:s.title,body:''},...(videoId?[{id:randomUUID(),kind:'video',title:'نمونه پخش ویدیو؛ مدرس می‌تواند ویدیوی آموزشی بارگذاری کند',body:'این فیلم کوتاه فقط برای آزمایش پخش محلی است.',sourceUrl:'/api/platform/files/'+videoId}]:[{id:randomUUID(),kind:'video',title:'ویدیوی آموزشی را از رسانه‌ها بارگذاری کنید',body:'',mediaId:'DEMO00000001'}]),{id:randomUUID(),kind:'text',title:'مفهوم درس',body:s.body},{id:randomUUID(),kind:'code',title:'مثال قابل اجرا',body:s.code},{id:randomUUID(),kind:'note',title:'تمرین عملی',body:'پس از اجرای مثال، کد را تغییر دهید و نتیجه را ببینید.'}];
 const doc={title:s.title,blocks,exercise:{prompt:s.prompt,starter:'# کد خود را اینجا بنویسید\n',gradingTests:[]},quiz:[{prompt:s.question,options:s.options,correct:s.correct}],passScore:70};
 await q.run("INSERT INTO nova_lessons VALUES(?,?,?,?,1,1,'published',?)",[lid,ids.course,i,JSON.stringify(doc),ids.teacher]);await q.run('INSERT INTO nova_versions VALUES(?,1,?,?,?)',[lid,JSON.stringify(doc),ids.teacher,date]);await q.run('INSERT INTO nova_lesson_layout VALUES(?,?)',[lid,moduleId]);
 }
 const questions=samples.map(s=>({prompt:s.question,options:s.options,correct:s.correct}));await q.run("INSERT INTO nova_exams VALUES(?,?,?,?,?,?,?,?,?,1,?,?)",[randomUUID(),ids.course,'ارزیابی مقدماتی پایتون',JSON.stringify(questions),new Date(Date.now()-86400000).toISOString(),new Date(Date.now()+30*86400000).toISOString(),30,70,'published',ids.teacher,date]);
 await q.run('INSERT INTO nova_library VALUES(?,?,?,?,?,?)',[randomUUID(),ids.course,'راهنمای تمرین پایتون','هر روز یک مثال را اجرا کنید، یک مقدار را تغییر دهید و تفاوت خروجی را بررسی کنید.\nprint برای چاپ، if برای تصمیم و for برای تکرار است.',ids.teacher,date]);
 });console.log('Demo ready. Accounts: admin / teacher / student. Use the configured seed password (local default only for SQLite).');
 }finally{await store.close();}
}
if(require.main===module)seed().catch(e=>{console.error(e.message);process.exitCode=1});module.exports={seed};
