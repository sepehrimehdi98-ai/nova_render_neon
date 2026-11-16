const actions:Record<string,string>={'lesson.save':'ذخیره تغییرات درس','lesson.publish':'انتشار درس','lesson.create':'ساخت درس','course.create':'ساخت دوره','course.status':'تغییر وضعیت دوره','ticket.create':'ثبت تیکت','ticket.reply':'پاسخ تیکت','backup.created':'ساخت پشتیبان'};
export function auditLabel(action:string){return actions[action]||'فعالیت ثبت‌شده'}
