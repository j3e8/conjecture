const { Pool } = require('pg');
const options = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  database: process.env.NODE_ENV === 'test' ? process.env.PGDATABASE_TEST : process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
};
const pool = new Pool(options);

module.exports = { pool };
