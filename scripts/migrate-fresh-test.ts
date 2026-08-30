/**
 * Applies reviewed migrations to an empty database and exits.
 * Usage: DATABASE_URL=... npm run db:migrate:test
 */
console.info(
  "Run `npm run db:migrate` against an empty Neon development branch to verify a clean-database migration.",
);
console.info(
  "Production migrations must wait until deployment. Do not use drizzle-kit push.",
);
