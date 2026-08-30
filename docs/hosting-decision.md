# Hosting decision

**Status:** Confirmed for development and production deployment planning  
**Date:** 30 August 2026  
**Confirmed by:** Project owner (in implementation session)

## Decision

Host the replacement conference site on **Vercel Hobby** (the current free plan).

This decision is recorded before any production deployment and before any SiteGround DNS change.

## Scope of hosting

| Resource | Choice | Notes |
| --- | --- | --- |
| Application hosting | Vercel Hobby | Next.js App Router, Git-connected project |
| Custom hostname | `sofia-round-table.narodnichitalishta.bg` | Remains registered and DNS-managed at SiteGround |
| Database | Neon PostgreSQL | Separate from Vercel compute; free-plan limits to be documented in the operations guide |
| Media | Vercel Blob (public store) | Image bytes must not be stored in PostgreSQL or on the Vercel filesystem |
| DNS cutover | Deferred | Do not change SiteGround DNS until production deployment, backups, and the rollback plan are complete |

## Domain and DNS rules

- The apex domain, mail records, and unrelated subdomains stay on SiteGround.
- Only the `sofia-round-table` DNS record will later point at the **exact** CNAME target shown by Vercel. That value must not be guessed in advance.
- Vercel Hobby supports custom domains, including this subdomain. HTTPS is provisioned by Vercel after domain verification.
- Until cutover, the production Git deployment will be verified on the temporary `*.vercel.app` URL.

## Eligibility record

Vercel currently describes Hobby as a free plan for **personal, non-commercial** use. This site is an official NGO conference page: non-commercial for visitors, but organizational rather than a typical personal project.

The project owner confirmed on 30 August 2026 that the intended Vercel account **is eligible** to host this site under the current Hobby / Fair Use terms, and that we should proceed with Hobby rather than Vercel Pro, the Open Source Program, or another host.

Reference:

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

Fair Use still treats some cases as commercial (for example paid client work, advertising, donations, or being paid to create/host the site). If Vercel later classifies this deployment as ineligible, move to Pro or another approved host **before** changing SiteGround DNS.

## What this decision does not authorize

- Changing SiteGround DNS
- Guessing or publishing a CNAME target
- Putting secrets in `NEXT_PUBLIC_*` variables
- Applying unreviewed schema changes to production
- Deleting the existing WordPress site before a defined rollback window

## Next step after this document is approved

Phase 0 — gather remaining content, assets, administrator list, WordPress backup, and DNS records. Project scaffolding (Phase 1) can start once this hosting record is accepted.
