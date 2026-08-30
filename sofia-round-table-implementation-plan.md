# Sofia Round Table Conference Website — Implementation Plan

This plan is intended to be followed in Cursor. Check an item only after its implementation and verification are complete.

## 1. Confirmed project decisions

- [x] Replace the existing WordPress site at `sofia-round-table.narodnichitalishta.bg`.
- [x] Build one scrolling public conference page with anchored navigation.
- [x] Provide Bulgarian and English versions.
- [x] Use 18–19 September 2026 as the conference dates.
- [x] Use Sofia and the `Europe/Sofia` timezone.
- [x] Keep venue and address editable and allow them to remain unpublished until supplied.
- [x] Make all public content editable through an admin panel.
- [x] Support multiple email/password administrator accounts with one permission level.
- [x] Do not provide public account registration.
- [x] Model schedule days, panels, items, breaks, speakers, ordering, and confirmation status as structured records.
- [x] Do not implement Word or CSV importing.
- [x] Do not create speaker profile pages, biographies, or speaker photographs.
- [x] Do not implement registration, contact forms, newsletters, downloadable programs, or calendar integrations.
- [x] Use the supplied Word document as the authoritative initial schedule source.
- [x] Preserve the current visual identity while improving responsiveness, hierarchy, accessibility, and schedule usability.

## 2. Hosting decision that must be resolved first

- [x] Confirm that the intended Vercel account is eligible to host this site under the current plan terms.
- [x] Record the decision in `docs/hosting-decision.md` before production deployment.
- [x] If Vercel confirms Hobby eligibility, proceed with the Hobby deployment.
- [x] If Hobby is not eligible, choose Vercel Pro, the Vercel Open Source Program if the project qualifies, or another approved host.
- [ ] Do not change SiteGround DNS until the hosting decision, production deployment, backups, and rollback plan are complete.

Technical domain note: a Vercel Hobby project supports custom domains, including a subdomain. The existing hostname can remain registered and DNS-managed at SiteGround; only the `sofia-round-table` DNS record needs to point to the exact CNAME target displayed by Vercel. Vercel will provision HTTPS after domain verification. Do not guess the CNAME value in advance.

Policy note: Vercel currently describes Hobby as a free plan for personal, non-commercial use. An official NGO conference site is non-commercial but organizational rather than personal, so eligibility should be confirmed instead of assumed.

## 3. Recommended architecture

| Area | Choice |
| --- | --- |
| Application | Latest stable Next.js App Router with Node.js runtime and TypeScript |
| Styling | Tailwind CSS plus a small token-based component layer |
| Public rendering | Server Components with cached database reads and explicit cache invalidation after admin saves |
| Database | Neon PostgreSQL |
| ORM and migrations | Drizzle ORM and Drizzle Kit |
| Authentication | Better Auth with email/password, Drizzle adapter, database sessions, disabled public signup, and rate limiting |
| Validation | Zod schemas shared by forms and server actions |
| Media | Public Vercel Blob store; store only URLs and metadata in PostgreSQL |
| Rich text | Constrained structured content; allow paragraphs, bold, italic, lists, and safe links only |
| Tests | Vitest for units/integration and Playwright for browser flows |
| Deployment | Git repository connected to Vercel; production data in Neon |

### Architecture rules

- [x] Keep all database, authentication, mutation, and secret-handling code server-only.
- [ ] Use the Node.js runtime for authenticated admin and mutation routes.
- [x] Use the Neon serverless driver through Drizzle.
- [ ] Never store image bytes in PostgreSQL.
- [ ] Never write uploads to the Vercel application filesystem because it is not persistent.
- [ ] Use Server Components for public content and Client Components only where interaction requires them.
- [ ] Use server actions or route handlers for mutations, with session checks and Zod validation inside every mutation.
- [ ] Revalidate the public-site cache immediately after a successful content change.
- [x] Keep production schema changes in committed, reviewable migration files; do not use schema push against production.

## 4. URL and language design

- [ ] Serve Bulgarian at `/`.
- [ ] Serve English at `/en`.
- [ ] Use identical anchors on both pages: `#home`, `#about`, `#program`, `#organizers`, and `#venue` when venue content is published.
- [ ] Add an always-visible BG/EN language switcher that preserves the current section anchor.
- [ ] Set the correct document `lang` value for each language.
- [ ] Add canonical and `hreflang` metadata for Bulgarian and English.
- [ ] Redirect `/about-us` and `/about-us/` permanently to `/#about`.
- [ ] Redirect `/schedule` and `/schedule/` permanently to `/#program`.
- [ ] Verify that legacy paths return permanent redirects without loops.
- [ ] Keep `/admin` and all admin child routes out of search results.
- [ ] Keep `/api/auth/*` reserved for Better Auth.

## 5. Target repository structure

~~~text
src/
  app/
    (public)/
      page.tsx
      en/page.tsx
    admin/
      login/page.tsx
      (protected)/
        layout.tsx
        page.tsx
        content/page.tsx
        schedule/page.tsx
        media/page.tsx
        users/page.tsx
    api/
      auth/[...all]/route.ts
      blob/upload/route.ts
    robots.ts
    sitemap.ts
  components/
    public/
    admin/
    ui/
  db/
    index.ts
    schema/
    queries/
    mutations/
  lib/
    auth.ts
    auth-client.ts
    cache.ts
    env.ts
    i18n.ts
    permissions.ts
    validation/
  styles/
  types/
drizzle/
public/
  brand/
scripts/
  seed-content.ts
  create-admin.ts
tests/
docs/
~~~

- [x] Create this structure or document any deliberate deviation in the repository README.
- [ ] Keep reusable UI components independent from database query code.
- [ ] Keep Bulgarian and English field handling typed rather than passing arbitrary language strings throughout the app.

## 6. Database model

### Authentication tables

- [x] Generate the Better Auth schema for `user`, `session`, `account`, and `verification` using the Drizzle adapter.
- [x] Add an `active` or equivalent server-owned field that allows an administrator account to be disabled.
- [x] Ensure email addresses are unique and normalized.
- [ ] Do not expose a public signup endpoint or signup UI.

### Application tables

- [x] Create a singleton `site_settings` table for dates, timezone, venue, address, map URL, public links, social links, and display options.
- [x] Create `content_sections` with a stable slug, Bulgarian and English headings/content, sort order, visibility, and timestamps.
- [x] Create `navigation_items` with Bulgarian and English labels, anchor or external URL, sort order, and visibility.
- [x] Create `media_assets` with Blob URL, Blob pathname, MIME type, dimensions, Bulgarian and English alt text, creator, and timestamps.
- [x] Create `partners` with name, media reference, URL, sort order, and visibility.
- [x] Create `schedule_days` with date, Bulgarian and English titles/subtitles, sort order, and visibility.
- [x] Create `schedule_panels` with day reference, start/end times, Bulgarian and English titles/descriptions, sort order, and visibility.
- [x] Create `schedule_items` with day reference, optional panel reference, start/end times, item type, Bulgarian and English title/description, status, sort order, and visibility.
- [x] Create lightweight `speakers` with Bulgarian and English name and affiliation/title only; do not add biographies, photos, or public profile slugs.
- [x] Create `schedule_item_speakers` as an ordered many-to-many relation.
- [x] Create `audit_log` for administrator, action, entity type, entity ID, timestamp, and a non-sensitive summary.
- [x] Add foreign keys and intentional delete behavior to every relation.
- [x] Add indices for day ordering, panel ordering, item ordering, visible content queries, and normalized user email.
- [x] Use PostgreSQL `date` for conference days and `time` for local schedule times.
- [x] Validate that 18–19 September 2026 render consistently in the `Europe/Sofia` timezone.

### Suggested schedule enums

- [x] Define item types for `registration`, `opening`, `talk`, `roundtable`, `panel`, `discussion`, `break`, `lunch`, `visit`, and `closing`.
- [x] Define public status values for `confirmed`, `to_be_confirmed`, and `cancelled`.
- [ ] Display status as a translated badge and never embed “to be confirmed” only inside free text.

## 7. Phase 0 — Inputs and safeguards

- [x] Obtain the final Bulgarian public copy.
- [ ] Obtain human-reviewed English translations for all public content and schedule fields.
- [ ] Obtain the venue name, address, optional map link, and publication timing when available.
- [x] Confirm the final list of administrator email addresses.
- [x] Confirm the logo and partner-image usage rights.
- [x] Export a complete SiteGround backup of WordPress files and database.
- [ ] Record the current DNS records and TTL for the conference subdomain.
- [ ] Save the old DNS target in the private launch runbook for rollback.
- [x] Inventory all current visual assets and record their source and intended replacement filename.
- [x] Treat `EUROPEAN_ROUND_TABLE_BG_V7.docx` as the schedule source and preserve a read-only copy.

### Current visual assets to migrate

- [ ] Migrate the Народни читалища logo from the current header/footer.
- [ ] Migrate the current Bridge Makers conference hero artwork.
- [ ] Migrate the ENCC logo.
- [ ] Migrate the Sofia municipality crest.
- [ ] Migrate the European Parliament logo.
- [ ] Migrate any remaining partner/funder marks visible in the hero artwork or organizer section.
- [ ] Create descriptive Bulgarian and English alt text for meaningful images.
- [ ] Use empty alt text for purely decorative duplicate marks.

## 8. Phase 1 — Project foundation

- [ ] Create a Git repository and protect the production branch from accidental force pushes.
- [x] Initialize the latest stable Next.js application with App Router, TypeScript, ESLint, Tailwind CSS, and a `src` directory.
- [x] Select one package manager and commit its lockfile.
- [x] Set the supported Node.js version in `package.json` and Vercel settings.
- [x] Enable strict TypeScript settings.
- [x] Add formatting and lint scripts.
- [x] Add `typecheck`, `test`, `test:e2e`, `build`, `db:generate`, `db:migrate`, `db:seed`, and `admin:create` scripts.
- [x] Add CI that runs lint, typecheck, unit tests, and production build on each pull request.
- [x] Create `.env.example` with names and descriptions but no real secrets.
- [x] Confirm `.env*`, database dumps, and local upload files are ignored by Git.
- [x] Add a README with setup, migration, seeding, admin creation, testing, deployment, and rollback instructions.

## 9. Phase 2 — Neon and migrations

- [ ] Create the Neon project in an EU region where available and appropriate.
- [ ] Create separate production and development database branches if the selected Neon plan permits them.
- [ ] Obtain pooled/serverless connection strings for the intended environments.
- [ ] Configure `DATABASE_URL` locally and separately in Vercel Preview and Production.
- [x] Install Drizzle ORM, Drizzle Kit, and the Neon serverless driver.
- [x] Implement the server-only database client.
- [x] Implement all schemas and relations from Section 6.
- [x] Generate the initial SQL migration and review it before applying it.
- [ ] Apply migrations to development first.
- [ ] Run a clean-database migration test.
- [ ] Apply reviewed migrations to production only during deployment.
- [x] Document Neon free-plan limits and scale-to-zero behavior in the operations guide.

## 10. Phase 3 — Authentication and administrator management

- [ ] Install and configure Better Auth with the Drizzle adapter.
- [ ] Enable email/password sign-in.
- [ ] Set `disableSignUp: true` for email/password authentication.
- [ ] Store `BETTER_AUTH_SECRET` only in local secret storage and Vercel environment variables.
- [ ] Set trusted production origins explicitly.
- [ ] Use secure, HTTP-only, same-site cookies in production.
- [ ] Enable authentication rate limiting and verify trusted proxy/IP configuration for Vercel.
- [ ] Add server guards for every `/admin` page and admin mutation.
- [ ] Redirect unauthenticated users to `/admin/login`.
- [ ] Redirect authenticated users away from the login page to the dashboard.
- [ ] Create a secure `admin:create` script that prompts locally for email, display name, and password.
- [ ] Create the first administrator outside the public web UI.
- [ ] Add an authenticated Users screen for listing, creating, disabling, and re-enabling accounts.
- [ ] Allow users to change their own password.
- [ ] Allow another active administrator to set a temporary password when email reset is not configured.
- [ ] Prevent disabling the last active administrator.
- [ ] Prevent accidental self-disablement without explicit confirmation.
- [ ] Record account-management actions in the audit log without passwords or tokens.
- [ ] Test invalid login, disabled account, expired session, logout, password change, and protected-route access.

## 11. Phase 4 — Media storage

- [ ] Create a public Vercel Blob store for public site images.
- [ ] Configure Blob credentials separately in Preview and Production.
- [ ] Implement authenticated uploads through a protected server route or signed client-upload flow.
- [ ] Accept JPEG, PNG, WebP, and AVIF for administrator uploads.
- [ ] Reject SVG uploads unless a separate sanitization pipeline is implemented.
- [ ] Enforce a conservative file-size limit and document it in the admin UI.
- [ ] Validate file signatures and MIME types server-side rather than trusting extensions.
- [ ] Require Bulgarian and English alt text before a meaningful image can be published.
- [ ] Store image metadata only after Blob upload succeeds.
- [ ] Prevent deletion of a Blob still referenced by content or partners.
- [ ] Require explicit confirmation before deleting an unused media asset.
- [ ] Use responsive image optimization while preserving crisp logo rendering.
- [ ] Monitor Blob usage against the selected Vercel plan limits.

## 12. Phase 5 — Seed and migrate content

- [ ] Build an idempotent seed script; running it twice must not duplicate records.
- [ ] Seed event title, subtitle, dates, Sofia, timezone, hero, about text, organizers, funders, footer, and social links from the current site.
- [ ] Seed both language fields only with approved copy.
- [ ] If English copy is not approved, mark it incomplete in admin and do not silently publish machine-generated translations.
- [ ] Map the supplied Word schedule into seed data during development; do not build a production import feature.
- [ ] Seed Day 1, Day 2, all three panels, opening items, breaks, lunch, visits, closing, and every timed item.
- [ ] Normalize repeated speakers where appropriate.
- [ ] Preserve confirmation status as structured data.
- [ ] Compare the seeded Bulgarian program line by line with the Word source.
- [ ] Verify chronological order and detect overlaps.
- [ ] Add a development-only report for missing translations, invalid times, and orphaned relations.

## 13. Phase 6 — Public visual system

- [ ] Self-host Wix Madefor Display and Wix Madefor Text, including Cyrillic subsets and licenses.
- [ ] Use Wix Madefor Display for headings and Wix Madefor Text for body content.
- [ ] Define tokens for white, near-black `#333333`, conference dark green, conference pink, restrained orange, muted gray, borders, focus ring, spacing, radii, and shadows.
- [ ] Sample exact green, pink, and orange values from approved source artwork instead of estimating them.
- [ ] Preserve the black Народни читалища branding and current clean white presentation.
- [ ] Preserve generous whitespace but remove the excessive vertical gaps on the current pages.
- [ ] Use a centered content width suitable for long Bulgarian and English text.
- [ ] Build a sticky header with the NGO logo, section links, external ecosystem links, and BG/EN switcher.
- [ ] Collapse navigation to an accessible mobile menu.
- [ ] Keep the conference hero artwork prominent and responsive.
- [ ] Add textual date and Sofia location near the hero so critical information is not image-only.
- [ ] Build reusable section-heading, partner-logo, status-badge, and callout components.
- [ ] Normalize partner-logo visual size without distorting aspect ratios.
- [ ] Build a compact footer with NGO summary, social links, copyright, and external links.
- [ ] Add visible keyboard focus styles.
- [ ] Respect reduced-motion preferences.

## 14. Phase 7 — Public sections

- [ ] Build the Hero section with event name, theme, dates, Sofia, and optional venue/address.
- [ ] Build the Introduction section from current homepage content.
- [ ] Build the About/Organizers section with ENCC, Фондация „Народни читалища“, Sofia municipality, European Parliament, and funding context.
- [ ] Build the Program section from structured schedule data.
- [ ] Build the Partners/Funders section from editable partner records.
- [ ] Build the Venue section so it can be hidden until venue data is entered.
- [ ] Build the Footer from editable settings and navigation records.
- [ ] Ensure hidden or incomplete sections leave no empty whitespace or broken navigation links.
- [ ] Ensure anchor links land below the sticky header.

## 15. Phase 8 — Schedule experience

- [ ] Make the schedule the strongest information hierarchy on the page.
- [ ] Add an accessible Day 1 / Day 2 selector while keeping both days available to search engines and no-JavaScript users.
- [ ] Display the full date, weekday, and local timezone for each day.
- [ ] Group schedule items under visually distinct panel headings.
- [ ] Use a time rail or compact time column on desktop.
- [ ] Use full-width session cards with time first on mobile.
- [ ] Distinguish breaks, lunch, registration, and visits without reducing legibility.
- [ ] Display `За потвърждение` and its approved English equivalent as a consistent badge.
- [ ] Display cancelled items clearly unless an administrator hides them.
- [ ] Keep speaker name and affiliation/title inline; do not link to profiles.
- [ ] Allow long descriptions to wrap naturally and avoid fixed heights.
- [ ] Use expandable mobile descriptions only if title, time, status, and speakers remain visible.
- [ ] Use semantic headings and ordered content that remain understandable without styling.
- [ ] Verify all schedule controls by keyboard and announce state changes to assistive technology.

## 16. Phase 9 — Admin panel

- [ ] Build a focused admin shell with desktop sidebar and mobile navigation.
- [ ] Show environment and signed-in user clearly.
- [ ] Build a dashboard with translation warnings, venue status, schedule issues, and recent audit activity.
- [ ] Build a General screen for dates, timezone, venue, address, map, public links, and social links.
- [ ] Build a Content screen for hero, introduction, about, organizers, partners, and footer.
- [ ] Use side-by-side BG and EN fields on wide screens and labeled stacked fields on mobile.
- [ ] Add a constrained rich-text editor with no raw HTML entry.
- [ ] Sanitize external links and allow safe schemes only.
- [ ] Build a Media screen for upload, preview, alt text, usage references, and safe deletion.
- [ ] Build a Partners screen for name, logo, URL, visibility, and order.
- [ ] Build a Schedule screen for days, panels, items, speakers, times, types, status, visibility, and order.
- [ ] Support accessible move-up/move-down ordering; add drag-and-drop only if keyboard accessible.
- [ ] Prevent an end time earlier than a start time.
- [ ] Warn about overlaps within the same day and panel.
- [ ] Warn when required English or Bulgarian fields are missing.
- [ ] Add an authenticated preview in both languages before saving.
- [ ] Make MVP saves publish immediately only after an explicit Save action; do not imply a draft workflow.
- [ ] Show clear success and validation messages without losing entered data.
- [ ] Revalidate public content after each successful save.
- [ ] Record create, update, reorder, visibility, and delete actions.
- [ ] Require confirmation for destructive actions.

## 17. Phase 10 — Internationalization, SEO, and accessibility

- [ ] Keep UI translations in typed locale dictionaries.
- [ ] Keep administrator-entered Bulgarian and English content in explicit database fields.
- [ ] Add language-specific title and description metadata.
- [ ] Add Open Graph metadata with an approved conference image.
- [ ] Generate `robots.txt` and `sitemap.xml` through Next.js metadata files.
- [ ] Add Event JSON-LD with name, dates, Sofia, organizer, image, language, and venue only when known.
- [ ] Validate Event JSON-LD after venue information is published.
- [ ] Exclude `/admin` and authentication routes from indexing.
- [ ] Add landmarks and a working skip link.
- [ ] Keep heading levels logical and sequential.
- [ ] Meet WCAG AA contrast for text, badges, controls, and focus states.
- [ ] Add labels and error associations to every admin control.

## 18. Phase 11 — Security and integrity

- [ ] Validate environment variables at startup and fail safely when required values are missing.
- [ ] Verify a session inside every mutation, not only in middleware.
- [ ] Keep authorization server-owned; never trust a client-provided role or user ID.
- [ ] Use parameterized ORM queries only.
- [ ] Sanitize stored rich text and link protocols before rendering.
- [ ] Add Content Security Policy, Referrer Policy, X-Content-Type-Options, and frame-ancestor protections.
- [ ] Restrict accepted origins for authenticated actions.
- [ ] Avoid exposing stack traces, database errors, or secrets to browsers.
- [ ] Redact secrets and personal data from logs.
- [ ] Apply login and sensitive mutation rate limits.
- [ ] Add dependency and secret scanning in CI where available.
- [ ] Test protected mutations without a session and with a disabled account.
- [ ] Document account recovery when only one administrator remains.

## 19. Phase 12 — Testing and quality gates

### Automated tests

- [ ] Unit-test locale selection, date/time formatting, validation, status labels, safe links, and ordering.
- [ ] Integration-test database queries and mutations against an isolated database or development branch.
- [ ] Test migration up from an empty database.
- [ ] Test idempotent content seeding.
- [ ] Test authentication, disabled accounts, protected routes, and public signup rejection.
- [ ] Test media validation and referenced-media deletion protection.
- [ ] Add Playwright tests for Bulgarian home, English home, language switching, anchors, legacy redirects, admin login, content edit, schedule edit, and logout.

### Manual checks

- [ ] Compare Bulgarian schedule content against every entry in the Word document.
- [ ] Have a fluent reviewer approve all English copy.
- [ ] Test current Chrome, Firefox, Safari, and Edge.
- [ ] Test representative phone, tablet, laptop, and wide desktop widths.
- [ ] Test keyboard-only navigation and common screen-reader landmarks.
- [ ] Test slow-network and Neon cold-start behavior.
- [ ] Run Lighthouse on Bulgarian and English pages.
- [ ] Resolve serious accessibility, performance, SEO, and best-practice findings.
- [ ] Confirm no layout shift from logos, hero artwork, or fonts.
- [ ] Confirm no horizontal scrolling at 320 CSS pixels.
- [ ] Confirm the schedule handles long Bulgarian and English text.
- [ ] Confirm all external and social links.

### Required CI gate

- [ ] Require lint to pass.
- [ ] Require TypeScript checking to pass.
- [ ] Require unit/integration tests to pass.
- [ ] Require the production build to pass.
- [ ] Require critical Playwright smoke tests to pass against preview.

## 20. Phase 13 — Vercel deployment

- [ ] Create the Vercel project from the production Git repository.
- [ ] Select the confirmed eligible Vercel plan.
- [ ] Configure the expected Node.js version and production branch.
- [ ] Configure Preview and Production environment variables separately.
- [ ] Add `DATABASE_URL`.
- [ ] Add `BETTER_AUTH_SECRET`.
- [ ] Add `BETTER_AUTH_URL=https://sofia-round-table.narodnichitalishta.bg` for production.
- [ ] Add `NEXT_PUBLIC_SITE_URL=https://sofia-round-table.narodnichitalishta.bg` for production.
- [ ] Add Blob credentials using the Vercel Blob integration.
- [ ] Do not put secrets in `NEXT_PUBLIC_*` variables.
- [ ] Deploy a preview and complete the test checklist.
- [ ] Apply reviewed production migrations.
- [ ] Seed production content once.
- [ ] Create the first production administrator securely.
- [ ] Deploy production to the temporary Vercel URL.
- [ ] Verify languages, admin, edits, media, schedule, redirects, headers, sitemap, robots, and JSON-LD on the temporary deployment.
- [ ] Confirm free-plan usage limits and alerts for Vercel, Blob, and Neon.

## 21. Phase 14 — SiteGround DNS cutover

- [ ] Reduce the existing subdomain TTL at least one normal TTL period before launch when SiteGround permits it.
- [ ] Confirm the latest WordPress file/database backup can be restored.
- [ ] Record the final old DNS value immediately before changing it.
- [ ] Add `sofia-round-table.narodnichitalishta.bg` to Vercel before editing DNS.
- [ ] Copy the exact verification and CNAME instructions shown by Vercel.
- [ ] In SiteGround DNS Zone Editor, change only the `sofia-round-table` record required for this hostname.
- [ ] Remove or replace conflicting A, AAAA, or CNAME records only after confirming the exact conflict.
- [ ] Do not change the apex domain, mail records, or unrelated subdomains.
- [ ] Wait for Vercel verification and automatic TLS.
- [ ] Verify the exact HTTPS URL through public DNS.
- [ ] Verify `/`, `/en`, `/about-us`, `/schedule`, `/admin/login`, assets, and API routes after cutover.
- [ ] Verify there are no mixed-content warnings.
- [ ] Verify the certificate covers the exact conference subdomain.
- [ ] Keep WordPress intact and non-public for a defined rollback window.

### Rollback procedure

- [ ] If the new site has a critical failure, restore the recorded old DNS value.
- [ ] Verify WordPress and its database before announcing rollback completion.
- [ ] Do not delete Neon, Blob, or Vercel resources during investigation.
- [ ] Document the incident and required fix before a second cutover.

## 22. Phase 15 — Handover and operations

- [ ] Provide administrator instructions in the preferred team language.
- [ ] Document login, password change, account management, content editing, schedule editing, media, and venue publishing.
- [ ] Document how to update both languages together.
- [ ] Document Neon content export and Blob asset inventory procedures.
- [ ] Document restoration of the last known-good deployment.
- [ ] Document Vercel, Neon, and Blob quota monitoring.
- [ ] Document dependency updates and safe migrations.
- [ ] Transfer repository, Vercel, Neon, and DNS access to approved NGO accounts.
- [ ] Remove temporary developer access and credentials after handover.
- [ ] Review the admin workflow after organizers update the schedule once.

## 23. Definition of done

- [ ] The existing conference subdomain serves the new application over valid HTTPS.
- [ ] Bulgarian and English one-page experiences are complete and approved.
- [ ] All public content is editable by authenticated administrators.
- [ ] Multiple email/password administrators have the same permission level.
- [ ] Public signup is impossible.
- [ ] The full Word schedule is represented accurately as structured data.
- [ ] The schedule is clear on mobile and desktop.
- [ ] No speaker profiles, public forms, newsletter, registration, import, download, or calendar features were added.
- [ ] Venue and address can be added later without deployment.
- [ ] Legacy `/about-us` and `/schedule` URLs redirect successfully.
- [ ] Automated tests and production build pass.
- [ ] Accessibility and security checks have no unresolved critical findings.
- [ ] Backups, rollback steps, admin instructions, and ownership handover are complete.

## 24. Explicitly out of scope for version 1

- [x] Attendee registration or ticketing.
- [x] Public contact forms.
- [x] Newsletter subscriptions.
- [x] Downloadable program generation.
- [x] “Add to calendar” integration.
- [x] Word/CSV schedule imports.
- [x] Speaker biographies, portraits, and profile pages.
- [x] Multiple administrator roles or granular permissions.
- [x] A general-purpose page builder.
- [x] Public comments or user accounts.

## 25. Reference links

- Current site: <https://sofia-round-table.narodnichitalishta.bg/>
- Current About page: <https://sofia-round-table.narodnichitalishta.bg/about-us/>
- Current Schedule page: <https://sofia-round-table.narodnichitalishta.bg/schedule/>
- Vercel custom domains: <https://vercel.com/docs/domains/working-with-domains/add-a-domain>
- Vercel Hobby plan: <https://vercel.com/docs/plans/hobby>
- Vercel Fair Use Guidelines: <https://vercel.com/docs/limits/fair-use-guidelines>
- Vercel SSL: <https://vercel.com/docs/domains/working-with-ssl>
- Vercel Blob: <https://vercel.com/docs/vercel-blob>
- Neon with Next.js: <https://neon.com/docs/guides/nextjs>
- Neon with Drizzle: <https://neon.com/docs/guides/drizzle>
- Neon plans: <https://neon.com/docs/introduction/plans>
- Next.js internationalization: <https://nextjs.org/docs/app/guides/internationalization>
- Better Auth email/password: <https://better-auth.com/docs/authentication/email-password>
- Better Auth Drizzle adapter: <https://better-auth.com/docs/adapters/drizzle>

