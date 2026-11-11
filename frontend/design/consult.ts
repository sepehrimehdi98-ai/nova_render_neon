import {api,type Row} from '../src/live/api';

export async function consult(course:string,lessonId:string,question:string,publicTopic='',focusBlockId=''){
  const base='/courses/'+course+'/ai/jobs';
  const job=await api(base,{lessonId,question,publicTopic,focusBlockId});
  for(let attempt=0;attempt<200;attempt++){
    const {jobs}=await api(base);
    const current=jobs.find((row:Row)=>row.id===job.id);
    if(current?.status==='completed'){
      const result=JSON.parse(current.result_json);
      const citations=(result.sources||[]).map((source:Row)=>source.url||source.id).join('\n');
      return String(result.answer)+(citations?'\n\nمنابع:\n'+citations:'')+(result.webStatus==='unavailable'?'\nجست‌وجوی وب در دسترس نبود؛ پاسخ از منابع درس تهیه شد.':'');
    }
    if(current && ['failed','blocked'].includes(current.status)){const code=JSON.parse(current.result_json||'{}').error;const errors:Record<string,string>={AI_RATE_LIMITED:'سقف درخواست سرویس AI پر شده است؛ کمی بعد دوباره بفرستید.',AI_TIMEOUT:'زمان پاسخ سرویس تمام شد؛ پرسش کوتاه‌تر را دوباره بفرستید.',INVALID_AI_RESPONSE:'پاسخ سرویس ساختار معتبر نداشت؛ دوباره تلاش کنید.',AI_AUTHENTICATION_FAILED:'کلید سرویس AI معتبر نیست؛ مدیر تنظیمات را بررسی کند.',AI_CREDITS_REQUIRED:'اعتبار سرویس AI کافی نیست؛ مدیر حساب سرویس را بررسی کند.',AI_MODEL_UNAVAILABLE:'مدل انتخاب‌شده فعلاً در دسترس نیست.'};throw Error(errors[code]||'پاسخ آماده نشد؛ وضعیت سرویس را بررسی یا دوباره تلاش کنید.');}
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  return 'درخواست ثبت شد و در صف پردازش است.';
}
