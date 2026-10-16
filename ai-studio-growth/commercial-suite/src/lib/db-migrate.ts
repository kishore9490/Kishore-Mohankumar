import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { MIGRATIONS } from "@/lib/generated/migrations";

/**
 * Applies pending Prisma migrations using the app's own database connection — for hosts where the
 * `prisma migrate deploy` CLI cannot run (no terminal, blocked engine binaries). Records each migration
 * in `_prisma_migrations` exactly like the CLI does, so later `migrate deploy` runs stay consistent.
 */
export async function applyPendingMigrations(db: PrismaClient): Promise<{ applied: string[] }> {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS `_prisma_migrations` (`id` VARCHAR(36) PRIMARY KEY NOT NULL, `checksum` VARCHAR(64) NOT NULL, `finished_at` DATETIME(3), `migration_name` VARCHAR(255) NOT NULL, `logs` TEXT, `rolled_back_at` DATETIME(3), `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
  const done = await db.$queryRawUnsafe<{ migration_name: string }[]>(
    "SELECT `migration_name` FROM `_prisma_migrations` WHERE `finished_at` IS NOT NULL AND `rolled_back_at` IS NULL",
  );
  const applied: string[] = [];
  for (const { name, sql } of MIGRATIONS) {
    if (done.some((d) => d.migration_name === name)) continue;
    const checksum = createHash("sha256").update(sql).digest("hex");
    const statements = sql
      .split("\n")
      .filter((l) => !l.trim().startsWith("--"))
      .join("\n")
      .split(/;\s*(?:\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);
    const id = randomUUID();
    await db.$executeRawUnsafe("INSERT INTO `_prisma_migrations` (`id`, `checksum`, `migration_name`, `started_at`) VALUES (?, ?, ?, NOW(3))", id, checksum, name);
    for (const stmt of statements) await db.$executeRawUnsafe(stmt);
    await db.$executeRawUnsafe("UPDATE `_prisma_migrations` SET `finished_at` = NOW(3), `applied_steps_count` = 1 WHERE `id` = ?", id);
    applied.push(name);
  }
  return { applied };
}
