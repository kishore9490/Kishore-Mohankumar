import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Postgres via postgres.js — portable across Neon, Supabase, Railway, RDS and a
 * plain local server, so nothing here ties you to one provider.
 *
 * On serverless the connection pool is kept small and idle sockets are closed
 * quickly, because each invocation gets its own instance and a large pool would
 * exhaust the database's connection limit. Use your provider's *pooled*
 * connection string in production.
 */
const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and add your Postgres connection string.',
  )
}

const isServerless = Boolean(process.env.VERCEL)

const globalForDb = globalThis as unknown as { __bidSql?: ReturnType<typeof postgres> }

export const sql =
  globalForDb.__bidSql ??
  postgres(url, {
    max: isServerless ? 1 : 10,
    idle_timeout: isServerless ? 20 : 0,
    prepare: false, // pooled connections (PgBouncer / Neon pooler) do not support prepared statements
  })

if (process.env.NODE_ENV !== 'production') globalForDb.__bidSql = sql

export const db = drizzle(sql, { schema })
export * from './schema'
