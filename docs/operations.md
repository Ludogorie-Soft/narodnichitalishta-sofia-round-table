# Operations guide

## Neon (PostgreSQL)

The public site and admin panel read and write conference content in Neon. Use the **pooled / serverless** connection string (`-pooler` host) as `DATABASE_URL`.

### Recommended setup

1. Create a Neon project in an **EU region** if one is available (for example Frankfurt or similar). Development is on `aws-eu-central-1`.
2. On the Free plan, create a **development branch** besides production (the plan allows 10 branches per project).
3. Put the development branch connection string in local `.env.local`.
4. Put Preview and Production strings in Vercel as separate environment values. Do not reuse the production database for Preview.

### Free plan limits (confirm on [Neon plans](https://neon.com/docs/introduction/plans) if they change)

| Resource | Free plan |
| --- | --- |
| Price | $0 / month |
| Projects | 100 |
| Branches | 10 per project |
| Compute | 100 CU-hours per project per month |
| Autoscaling | Up to 2 CU |
| Scale to zero | After **5 minutes** of inactivity; cannot be disabled on Free |
| Storage | 0.5 GB per project |
| Public network transfer | 5 GB / month |
| Instant restore | 6 hours (capped at 1 GB of change history) |

If monthly compute or network transfer is exhausted, Neon suspends compute until the next billing cycle. If storage exceeds 0.5 GB, writes that would grow storage fail until space is freed or the plan is upgraded.

### Scale-to-zero

After five minutes idle, the compute suspends. The next request waits for a cold start (often under a second, sometimes a few seconds). The public conference page should tolerate that delay. Do not keep a connection open just to avoid scale-to-zero; the Free plan compute budget is 100 CU-hours per month.

### Migrations

- Generate SQL with `npm run db:generate`.
- Review the file under `drizzle/` before applying it.
- Apply to the **development** branch with `npm run db:migrate`.
- Apply the same reviewed files to production only during a deployment.
- Never use `drizzle-kit push` against production.

### Monitoring

Watch Neon’s project dashboard for storage, CU-hours, and transfer. Set a calendar reminder before the conference to confirm the database is not near Free-plan caps.
