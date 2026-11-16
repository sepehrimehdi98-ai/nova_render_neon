export function contentStatus(status:string,entity:'course'|'lesson'){
 const labels=entity==='course'?{draft:'دورهٔ پیش‌نویس',published:'دورهٔ منتشرشده',archived:'دورهٔ بایگانی‌شده'}:{draft:'درسِ پیش‌نویس',published:'درسِ منتشرشده',archived:'درسِ بایگانی‌شده'};
 return labels[status as keyof typeof labels]||'وضعیت نامشخص';
}
