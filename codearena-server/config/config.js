require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USER || 'codearena',
    password: process.env.POSTGRES_PASSWORD || 'codearena_password',
    database: process.env.POSTGRES_DB || 'codearena_db',
    host: 'localhost',
    dialect: 'postgres',
  },
  test: {
    username: process.env.POSTGRES_USER || 'codearena',
    password: process.env.POSTGRES_PASSWORD || 'codearena_password',
    database: 'codearena_test',
    host: 'localhost',
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
  },
};
