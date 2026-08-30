const task = process.argv[2] ?? "unknown";

console.error(
  `npm run db:${task} is not available yet. Drizzle, Neon, and migrations are Phase 2.`,
);
process.exit(1);
