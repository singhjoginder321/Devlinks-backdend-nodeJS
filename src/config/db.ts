// config/db.ts
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const client = new Client({
  user: process.env.PG_USER || 'defaultUser',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'defaultDatabase',
  password: process.env.PG_PASSWORD || 'defaultPassword',
  port: parseInt(process.env.PG_PORT || '5432', 1234),
});

export default client;
