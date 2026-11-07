'use strict';
require('../lib/load-env');
const {getPool}=require('../lib/database');
(async()=>{const pool=getPool();try{
 const {rows:[state]}=await pool.query("SELECT current_setting('server_version') AS version, current_setting('max_connections')::int AS max_connections, pg_database_size(current_database())::text AS database_bytes, (SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) AS tls, (SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname=current_database()) AS connections");
 const {rows}=await pool.query("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename LIKE 'nova_%'");
 const expected=[...require('../lib/platform/store').schema.matchAll(/CREATE TABLE IF NOT EXISTS (nova_\w+)\(/g)].map(m=>m[1]);
 const missing=expected.filter(name=>!rows.some(row=>row.tablename===name));
 console.log(JSON.stringify({reachable:true,...state,poolMax:pool.options.max,missingTables:missing},null,2));
 if(missing.length || process.env.NODE_ENV==='production' && state.tls!==true)process.exitCode=1;
 }finally{await pool.end();}})().catch(()=>{console.error('Database check failed. Verify private connection settings, TLS trust, network access and migrations. Credentials were not printed.');process.exitCode=1;});
