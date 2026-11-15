import {api,type Row} from '../src/live/api';

export async function extractFromFiles(course:string,lessonId:string,question:string,documentIds:string[]){const r=await api('/courses/'+course+'/ai/extract',{lessonId,question,documentIds});const english=!/[\u0600-\u06ff]/.test(question);return (english?'Direct file excerpts · not an AI-generated answer\nOnline AI is unavailable. Relevant text from your file is shown below.':'استخراج مستقیم از فایل · پاسخ تولیدشده با AI نیست\nسرویس آنلاین در دسترس نیست؛ بخش‌های مرتبط فایل شما نمایش داده می‌شود.')+'\n\n'+r.answer+'\n\n'+r.sources.map((s:Row)=>s.title+' · '+s.page).join('\n');}

export async function consult(course:string,lessonId:string,question:string,publicTopic='',focusBlockId='',purpose='auto',documentIds:string[]=[]) {
  const base='/courses/'+course+'/ai/jobs';
  const job=await api(base,{lessonId,question,publicTopic,focusBlockId,purpose,documentIds});
  for(let attempt=0;attempt<300;attempt++){
    const {jobs}=await api(base+'?jobId='+encodeURIComponent(job.id));
    const current=jobs.find((row:Row)=>row.id===job.id);
    if(current?.status==='completed'){
      const result=JSON.parse(current.result_json);
      const citations=(result.sources||[]).map((source:Row)=>(source.url||source.title||'محتوای درس')+(source.page?' · '+source.page:'')).join('\n');
      return String(result.answer)+(result.linkNotices?.length?'\n\n'+result.linkNotices.join('\n'):'')+(citations?'\n\n'+(/[\u0600-\u06ff]/.test(question)?'منابع:':'Sources:')+'\n'+citations:'')+(result.webStatus==='unavailable'?'\nجست‌وجوی وب در دسترس نبود؛ فقط منابع نمایش‌داده‌شده و دانش عمومی در دسترس بودند.':'');
    }
    if(current && ['failed','blocked'].includes(current.status)){const code=JSON.parse(current.result_json||'{}').error;
 if(documentIds.length&&['AI_DAILY_LIMIT','AI_RATE_LIMITED','AI_PROVIDER_UNAVAILABLE','AI_TIMEOUT'].includes(code)){return extractFromFiles(course,lessonId,question,documentIds);}
const errors:Record<string,string>={AI_DAILY_LIMIT:'سهمیه روزانه سرویس رایگان AI تمام شده است. پس از بازنشانی سهمیه دوباره تلاش کنید؛ فایل و پیام شما حفظ شده‌اند.',AI_RATE_LIMITED:'سقف درخواست سرویس AI پر شده است؛ کمی بعد دوباره بفرستید.',AI_TIMEOUT:'زمان پاسخ سرویس تمام شد؛ پرسش کوتاه‌تر را دوباره بفرستید.',INVALID_AI_RESPONSE:'پاسخ سرویس ساختار معتبر نداشت؛ دوباره تلاش کنید.',AI_AUTHENTICATION_FAILED:'کلید سرویس AI معتبر نیست؛ مدیر تنظیمات را بررسی کند.',AI_CREDITS_REQUIRED:'اعتبار سرویس AI کافی نیست؛ مدیر حساب سرویس را بررسی کند.',AI_MODEL_UNAVAILABLE:'مدل انتخاب‌شده فعلاً در دسترس نیست.'};throw Error(errors[code]||'پاسخ آماده نشد؛ وضعیت سرویس را بررسی یا دوباره تلاش کنید.');}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  return 'درخواست ثبت شد و در صف پردازش است.';
}
