'use strict';
require('../lib/load-env');
const { openStore } = require('../lib/platform/store');
const { createPlatform } = require('../lib/platform/service');
(async () => { const store = await openStore(); try {
    const platform = await createPlatform(store);
    await platform.bootstrap({ username: process.env.BOOTSTRAP_ADMIN_USERNAME, name: process.env.BOOTSTRAP_ADMIN_NAME, password: process.env.BOOTSTRAP_ADMIN_PASSWORD });
    console.log('Initial platform administrator created. Remove the bootstrap environment variables.');
}
finally {
    await store.close();
} })().catch(() => { console.error('Administrator setup failed. Check private bootstrap settings; an existing admin cannot be overwritten.'); process.exitCode = 1; });
