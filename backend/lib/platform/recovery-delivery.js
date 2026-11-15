'use strict';
// Deliberately no network transport or provider credentials in the manual release.
function capabilities(){return {channel:'manual',smsAvailable:false,smsStatus:'provider-and-verified-phone-required'};}
function prepare(channel='manual'){
 if(channel!=='manual')throw Object.assign(new Error('ارسال پیامکی هنوز فعال نشده است؛ تحویل امن دستی را انتخاب کنید.'),{status:503,code:'RECOVERY_SMS_NOT_CONFIGURED'});
 return {channel:'manual',status:'admin-handoff-required'};
}
module.exports={capabilities,prepare};
