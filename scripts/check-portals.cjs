'use strict';
// Read-only screen probes apart from creation and revocation of the test sessions.
const assert = require('node:assert/strict');
async function checkRole(role, port) {
  const prefix = 'NOVA_TEST_' + role.toUpperCase() + '_';
  const origin = process.env[prefix + 'ORIGIN'] || 'http://127.0.0.1:' + port;
  const local = new URL(origin).hostname === '127.0.0.1';
  assert.equal(new URL(origin).origin, origin);
  assert(local || new URL(origin).protocol === 'https:');
  const username = process.env[prefix+'USERNAME'] || (local && role);
  const password = process.env[prefix+'PASSWORD'] || (local && 'NovaDemo-2026!');
  assert(username && password, 'Set staging test credentials for ' + role);
  let cookie='', checks=0;
  async function request(path, data, expected=200) {
    const response=await fetch(origin+'/api/platform/portal/'+role+path,{
      method:data===undefined?'GET':'POST',redirect:'error',signal:AbortSignal.timeout(15000),
      headers:{origin,'content-type':'application/json',cookie},body:JSON.stringify(data)
    });
    assert.equal(response.status,expected,role+' '+path+' returned '+response.status);
    if(path==='/login')cookie=response.headers.get('set-cookie').split(';')[0];
    checks++;
    return response.json();
  }
  await request('/login',{username,password});
  try {
    assert.equal((await request('/me')).user.role,role);
    const {courses}=await request('/courses');
    assert(courses.length,'Assign a test course to '+role);
    const course='/courses/'+courses[0].id;
    const data=await request(course);
    for(const path of ['/capabilities',course+'/exams',course+'/library',course+'/structure',course+'/ai/jobs'])await request(path);
    if(role==='student'){
      for(const path of ['/profile','/profile/details','/notes','/my/analysis'])await request(path);
      assert(data.lessons.length,'Publish a lesson for the staging student');
      const lesson='/lessons/'+data.lessons[0].id;
      for(const path of [lesson,lesson+'/submissions',lesson+'/grading',lesson+'/local-chat','/lesson-note?lessonId='+data.lessons[0].id])await request(path);
      await request('/tickets',undefined,403);
    }else{
      for(const path of ['/tickets','/media',course+'/analysis',course+'/ai/sources'])await request(path);
      if(role==='admin')for(const path of ['/users','/admin/recovery','/admin/operations','/workers',course+'/members'])await request(path);
    }
  } finally {await request('/logout',{});}
  await request('/me',undefined,401);
  console.log(role+' passed '+checks+' portal API checks');
}
(async()=>{for(const [role,port] of Object.entries({student:3101,teacher:3102,admin:3103}))await checkRole(role,port)})().catch(e=>{console.error(e.message);process.exitCode=1});
