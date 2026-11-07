'use strict';
const metrics = { startedAt: new Date().toISOString(), requests: 0, errors: 0, slowRequests: 0, lastErrorAt: null };
function record(status, duration) { metrics.requests++; if (status >= 500) {
    metrics.errors++;
    metrics.lastErrorAt = new Date().toISOString();
} if (duration > 1000)
    metrics.slowRequests++; }
module.exports = { record, snapshot: () => ({ ...metrics, uptimeSeconds: Math.floor(process.uptime()) }) };
