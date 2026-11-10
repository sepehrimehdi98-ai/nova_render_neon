'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validateLesson,studentContent}=require('../lib/platform/service');
const doc={title:'Cover test',blocks:[],exercise:{prompt:'Practice',starter:''},quiz:[],passScore:70};
test('lesson covers survive lesson validation and student filtering without executable markup',()=>{
 for(const cover of [{kind:'element',element:'python',color:'#6847b2'},{kind:'image',url:'https://example.com/cover.png',alt:'Lesson cover'}]){
  const clean=validateLesson({...doc,cover});assert.deepEqual(clean.cover,cover);assert.deepEqual(studentContent(clean).cover,cover);
 }
 assert.equal(validateLesson(doc).cover,null);
 for(const cover of [{kind:'image',url:'javascript:alert(1)'},{kind:'image',url:'https://user:password@example.com/a'},{kind:'element',element:'<script>',color:'#6847b2'},{kind:'element',element:'python',color:'red;display:none'}])assert.throws(()=>validateLesson({...doc,cover}));
});
