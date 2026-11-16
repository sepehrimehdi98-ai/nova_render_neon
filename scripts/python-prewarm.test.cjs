const test=require('node:test'),assert=require('node:assert/strict');
const {observePythonWarmup}=require('../frontend/src/live/python-prewarm.ts');
test('automatic Python warming is limited to one visible box and cancels on unmount',async()=>{
 const original=global.IntersectionObserver,observers=[];let warms=0;
 global.IntersectionObserver=class{constructor(callback){this.callback=callback;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
 try{const a=observePythonWarmup({},()=>warms++),b=observePythonWarmup({},()=>warms++);observers[0].callback([{isIntersecting:false}]);assert.equal(warms,0);observers[0].callback([{isIntersecting:true}]);observers[1].callback([{isIntersecting:true}]);a();await new Promise(r=>setTimeout(r,240));assert.equal(warms,0);observers[1].callback([{isIntersecting:true}]);await new Promise(r=>setTimeout(r,240));assert.equal(warms,1);b();assert.ok(observers.every(o=>o.disconnected))}finally{if(original===undefined)delete global.IntersectionObserver;else global.IntersectionObserver=original}
});
test('Python warm-up leaves unsupported environments on the existing click-to-run path',()=>{const original=global.IntersectionObserver;delete global.IntersectionObserver;try{let warmed=false;const cancel=observePythonWarmup({},()=>warmed=true);cancel();assert.equal(warmed,false)}finally{if(original!==undefined)global.IntersectionObserver=original}});
