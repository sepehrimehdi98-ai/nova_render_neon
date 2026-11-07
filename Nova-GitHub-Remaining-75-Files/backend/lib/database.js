'use strict';

require('./load-env');

let pool;

function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is required for persistent backend storage.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }
  // Lazy loading lets the UI and offline tests run without opening a DB connection.
  const { Pool } = require('pg');
  const sslMode = process.env.DATABASE_SSL || 'require';
  if (!['require', 'verify-full', 'disable'].includes(sslMode)) {
    const error = new Error('DATABASE_SSL must be require, verify-full, or disable.');
    error.code = 'INVALID_DATABASE_SSL_MODE';
    throw error;
  }
  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && sslMode === 'disable') {
    const error = new Error('DATABASE_SSL=disable is forbidden in production.');
    error.code = 'INSECURE_DATABASE_TRANSPORT';
    throw error;
  }
  const ca = process.env.DATABASE_CA_CERT;
  // pg connection-string SSL parameters can override the explicit TLS object.
  const connection = new URL(process.env.DATABASE_URL);
  for (const key of ['sslmode','sslcert','sslkey','sslrootcert','ssl']) connection.searchParams.delete(key);
  const poolMax = Number(process.env.DATABASE_POOL_MAX || (process.env.VERCEL ? 1 : 5));
  if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 50) throw Object.assign(new Error('DATABASE_POOL_MAX must be an integer from 1 to 50.'), {code:'INVALID_DATABASE_POOL_MAX'});
  pool = new Pool({
    connectionString: connection.toString(),
    statement_timeout: 15000,
    idle_in_transaction_session_timeout: 20000,
    // Budget this limit across every web replica and background worker.
    max: poolMax,
    application_name: process.env.DATABASE_APPLICATION_NAME || 'nova',
    keepAlive: true,
    lock_timeout: 5000,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: sslMode === 'disable' ? false : { rejectUnauthorized: true, ...(ca ? { ca } : {}) }
  });
  pool.on('error', error => console.error('Unexpected PostgreSQL pool error:', /^[A-Z0-9_]{2,40}$/.test(error.code || '') ? error.code : 'DATABASE_UNAVAILABLE'));
  return pool;
}

async function query(text, values = []) {
  return getPool().query(text, values);
}

async function transaction(work) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getPool, query, transaction };
