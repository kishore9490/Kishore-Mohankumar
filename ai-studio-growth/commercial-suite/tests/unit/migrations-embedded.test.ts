import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MIGRATIONS } from "@/lib/generated/migrations";

describe("embedded migrations", () => {
  it("match prisma/migrations (run `node scripts/embed-migrations.mjs` if this fails)", () => {
    const dir = path.join(process.cwd(), "prisma", "migrations");
    const names = readdirSync(dir).filter((n) => existsSync(path.join(dir, n, "migration.sql"))).sort();
    expect(MIGRATIONS.map((m) => m.name)).toEqual(names);
    for (const m of MIGRATIONS) expect(m.sql).toBe(readFileSync(path.join(dir, m.name, "migration.sql"), "utf8"));
  });
});
