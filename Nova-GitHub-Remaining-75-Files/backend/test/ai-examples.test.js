const test=require('node:test'),assert=require('node:assert/strict');const {verifyExamples}=require('../lib/platform/verify-examples');
test('AI examples require isolated execution and matching expected output',async()=>{
 const draft={answer:'```python\nprint(int(input())*2)\n```',examples:[{stdin:'7',stdout:'14'}]};
 const good=await verifyExamples(draft,async(code,stdin)=>{assert.match(code,/input/);assert.equal(stdin,'7');return {ok:true,stdout:'14\n',reason:'executed'}});assert.equal(good.accepted,true);
 assert.equal((await verifyExamples(draft,async()=>({ok:true,stdout:'wrong'}))).accepted,false);
 assert.equal((await verifyExamples(draft,async()=>({ok:false,reason:'timeout'}))).accepted,false);
 assert.equal((await verifyExamples(draft,async()=>{throw Error('No Docker')})).status,'execution_unavailable');
 assert.equal((await verifyExamples({answer:draft.answer},()=>{throw Error('must not run')})).status,'missing_example_contract');
 assert.equal((await verifyExamples({answer:'A conceptual explanation'},()=>{throw Error('must not run')})).status,'no_python_blocks');
});
