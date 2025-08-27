const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT ?? 5432),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

module.exports = pool;
