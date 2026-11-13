'use strict';
const test=require('node:test'),assert=require('node:assert/strict');const {parseChatInput,resolveChatLinks}=require('../lib/platform/chat-input');
test('inline chat links and response purpose are bounded and untrusted URLs never reach fetcher',async()=>{
 assert.equal(parseChatInput('Give an example','example').purpose,'example');assert.throws(()=>parseChatInput('x','system-override'),/هدف/);assert.deepEqual(parseChatInput('See https://docs.python.org/3/tutorial/ and https://docs.python.org/3/tutorial/.').links,['https://docs.python.org/3/tutorial/']);let calls=[];
 const result=await resolveChatLinks('https://docs.python.org/3/tutorial/ https://127.0.0.1/admin https://user:password@docs.python.org/ https://evil.example/ https://developer.mozilla.org/en-US/docs/Web/JavaScript',async link=>{calls.push(link);return 'Documentation text for '+link});
 assert.equal(calls.length,1,'only first three message links considered; only allowlisted public link fetched');assert.equal(result.sources.length,1);assert.equal(result.notices.length,2);assert.match(result.sources[0].id,/^link:/);
 const mdn=await resolveChatLinks('Explain https://developer.mozilla.org/en-US/docs/Web/JavaScript',async()=> 'JavaScript documentation');assert.equal(mdn.sources[0].title,'developer.mozilla.org');
});
