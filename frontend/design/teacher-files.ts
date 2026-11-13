import type {Row} from '../src/live/api';
export async function filePayload(file:File):Promise<Row>{
 if(file.size>1500000)throw Error('حداکثر اندازه هر فایل ۱٫۵ مگابایت است.');
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(Error('خواندن فایل ممکن نشد.'));r.onload=()=>resolve({name:file.name,base64:String(r.result).split(',')[1]});r.readAsDataURL(file)});
}
