import {api,type Row} from '../src/live/api';

export async function consult(course:string,lessonId:string,question:string){
  const base='/courses/'+course+'/ai/jobs';
  const job=await api(base,{lessonId,question});
  for(let attempt=0;attempt<200;attempt++){
    const {jobs}=await api(base);
    const current=jobs.find((row:Row)=>row.id===job.id);
    if(current?.status==='completed')return String(JSON.parse(current.result_json).answer);
    if(current && ['failed','blocked'].includes(current.status))throw Error('پاسخ آماده نشد. تنظیمات سرویس هوش مصنوعی را بررسی کنید.');
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  return 'درخواست ثبت شد و در صف پردازش است.';
}
