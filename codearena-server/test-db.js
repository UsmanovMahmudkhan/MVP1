const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    user: 'codearena',
    host: 'localhost',
    database: 'codearena_db',
    password: 'codearena_password',
    port: 5432,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL successfully!');
        return client.end();
    })
    .catch(err => {
        console.error('Connection error', err.stack);
        process.exit(1);
    });
