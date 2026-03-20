import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("❌ DATABASE_URL is not set.");
  }

  // 本番環境（Azure）かどうかを判定
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.WEBSITE_HOSTNAME;

  const pool = new Pool({
    connectionString,
    // 本番環境（Azure）のみ SSL を有効にし、ローカルでは無効にする
    ssl: isProduction
      ? { rejectUnauthorized: false }
      : false,
  });

  dbInstance = drizzle(pool, { schema });
  return dbInstance;
}

// 既存のコードを壊さないための Proxy (オプション)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const instance = getDb();
    return (instance as any)[prop];
  },
});