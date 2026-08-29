import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const env = fs.readFileSync('.env.local','utf8');
const url = env.split('\n').find(l=>l.startsWith('DATABASE_URL='))?.slice(13).trim().replace(/^["']|["']$/g,'');
const sql = neon(url);
try {
  const db = await sql`select current_database() as db`;
  console.log('DATABASE:', db[0].db);
  const t = await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
  console.log('TABLES:', t.map(r=>r.table_name).join(', '));
  const b = await sql`select slug,title,status,price_cents,paddle_price_id from books order by title`;
  console.log('BOOKS:', JSON.stringify(b,null,1));
  const a = await sql`select slug,name from authors`;
  console.log('AUTHORS:', JSON.stringify(a));
  const c = await sql`select slug,name from categories`;
  console.log('CATEGORIES:', JSON.stringify(c));
} catch(e) { console.error('ERR:', e.message); }
