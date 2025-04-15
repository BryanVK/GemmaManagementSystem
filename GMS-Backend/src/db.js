// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',          // sesuaikan dengan config kamu
  host: 'localhost',
  database: 'client_db', // ganti nama DB kamu
  password: '563Bryan.',      // ganti password sesuai
  port: 5432,
});

export const query = (text, params) => pool.query(text, params);
