const test=require('node:test'),assert=require('node:assert/strict');
const {noteKey,parseDraft,storeDraft}=require('../frontend/src/live/note-draft.ts');
test('note drafts preserve literal text, legacy content and revisions without hiding storage failures',()=>{
 assert.notEqual(noteKey('student-a','lesson'),noteKey('student-b','lesson'));assert.notEqual(noteKey('student-a','lesson-a'),noteKey('student-a','lesson-b'));
 const text='<script>literal</script>\n فارسی 😀';let saved;storeDraft({setItem:(key,value)=>saved=value},'key',text,4);assert.deepEqual(parseDraft(saved),{v:1,body:text,revision:4});assert.equal(parseDraft(text).body,text);assert.equal(parseDraft(null),null);
 assert.throws(()=>storeDraft({setItem:()=>{throw Error('QuotaExceededError')}},'key',text,1),/Quota/);assert.throws(()=>storeDraft({setItem:()=>{}},'key','x'.repeat(10001),0),/LARGE/);assert.throws(()=>parseDraft('x'.repeat(10001)),/LARGE/);
});
