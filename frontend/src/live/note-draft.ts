export const NOTE_LIMIT=10000;
export type NoteDraft={v:1;body:string;revision:number|null};
export function noteKey(userId:string,lessonId:string){return 'nova:lesson-note:'+userId+':'+lessonId}
export function parseDraft(raw:string|null):NoteDraft|null{
 if(raw===null)return null;
 try{const value=JSON.parse(raw);if(value?.v===1&&typeof value.body==='string'&&value.body.length<=NOTE_LIMIT&&(value.revision===null||Number.isSafeInteger(value.revision)&&value.revision>=0))return value}catch{}
 // Older releases stored unwrapped plain text. Oversized entries are never silently truncated.
 if(raw.length>NOTE_LIMIT)throw Error('LOCAL_NOTE_TOO_LARGE');
 return {v:1,body:raw,revision:null};
}
export function storeDraft(storage:Pick<Storage,'setItem'>,key:string,body:string,revision:number|null){
 if(body.length>NOTE_LIMIT)throw Error('NOTE_TOO_LARGE');
 storage.setItem(key,JSON.stringify({v:1,body,revision} satisfies NoteDraft));
}
