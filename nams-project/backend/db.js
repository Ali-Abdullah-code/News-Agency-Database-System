const oracledb = require('oracledb');

// Enable Thick mode for Oracle 11g compatibility
try {
    oracledb.initOracleClient();
} catch (err) {
    console.error('Error initializing Oracle Client (Thick mode):', err);
}

async function getConnection() {
    return await oracledb.getConnection({
        user:          'nams_admin',
        password:      'Admin@1234',
        connectString: 'localhost/XE'   // Oracle 11g XE default
    });
}

module.exports = { getConnection };
