const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('database pool is bounded per process and rejects invalid resource configuration',()=>{
 function config(value){let options;const sandbox={module:{exports:{}},URL,console,process:{env:{DATABASE_URL:'postgresql://test:test@localhost/test',DATABASE_POOL_MAX:value}},require(name){if(name==='./load-env')return {};if(name==='pg')return {Pool:class{constructor(o){options=o}on(){}}};throw Error(name)}};vm.runInNewContext(fs.readFileSync('lib/database.js','utf8'),sandbox);sandbox.module.exports.getPool();return options;}
 assert.equal(config(undefined).max,5);assert.equal(config('2').max,2);assert.equal(config('2').lock_timeout,5000);
 for(const v of ['0','51','NaN','1.5'])assert.throws(()=>config(v),/DATABASE_POOL_MAX/);
});
test('PostgreSQL schema initialization commits atomically or rolls back and releases connection',async()=>{
 const {openStore}=require('../lib/platform/store');
 for(const fail of [false,true]){const events=[];const client={async query(sql){events.push(sql);if(fail&&sql.includes('CREATE TABLE'))throw Error('schema failure')},release(){events.push('release')}};const pool={async connect(){return client},async end(){}};
 if(fail)await assert.rejects(openStore({url:'postgresql://test',pool}),/schema failure/);else await (await openStore({url:'postgresql://test',pool})).close();
 assert.equal(events[0],'BEGIN');assert.match(events[1],/pg_advisory_xact_lock/);assert.equal(events.at(-2),fail?'ROLLBACK':'COMMIT');assert.equal(events.at(-1),'release');}
});
test('production database TLS verifies certificates and cannot be weakened by URL parameters',()=>{
 function config(env){let options;const sandbox={module:{exports:{}},URL,console,process:{env:{NODE_ENV:'production',DATABASE_URL:'postgresql://test:test@localhost/test?sslmode=no-verify&ssl=false',...env}},require(name){if(name==='./load-env')return {};if(name==='pg')return {Pool:class{constructor(o){options=o}on(){}}};throw Error(name)}};vm.runInNewContext(fs.readFileSync('lib/database.js','utf8'),sandbox);sandbox.module.exports.getPool();return options;}
 assert.throws(()=>config({DATABASE_SSL:'disable'}),/forbidden in production/);
 for(const mode of ['require','verify-full']){const c=config({DATABASE_SSL:mode});assert.equal(c.ssl.rejectUnauthorized,true);assert.equal(new URL(c.connectionString).search,'');}
 assert.equal(config({DATABASE_CA_CERT:'test-ca'}).ssl.ca,'test-ca');
});
