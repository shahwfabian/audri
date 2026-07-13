# Audri demo and resume guide

## The link to use

Do not put `http://localhost:3000` on a resume. Localhost is only available on the computer running Audri.

Deploy Audri to an HTTPS address first, then use that public URL on the resume and portfolio. A Vercel project connected to the GitHub repository is the simplest fit for this Next.js application. Complete the server configuration in `PRODUCTION_SETUP.md` before sharing the deployment.

## Before recording or presenting

1. Use a fictional demo student. Never expose a real student's private profile in a recording.
2. Open the production URL in a clean browser window and sign in before the presentation.
3. Confirm `/api/health` returns a healthy response.
4. Confirm the server has its AI credential and model IDs. Customers should never enter an AI key.
5. Create one complete profile, one saved scholarship, and one saved essay in advance.
6. Keep the saved essay available as a fallback if a live provider request is slow.
7. Hide bookmarks, notifications, passwords, environment variables, and browser developer tools before recording.

## 90-second demo script

**0:00 to 0:15 | Problem**

"Scholarship applications force students to repeat the same personal information, research each sponsor, and rewrite similar essays. Audri turns that work into one reusable application workspace."

**0:15 to 0:30 | Student profile**

Open My Profile and show education, goals, achievements, and story material. Explain that the student's own information grounds later drafts.

**0:30 to 0:45 | Scholarship workflow**

Open Paste & Analyze. Paste a fictional scholarship description or a safe public scholarship URL. Show how Audri identifies the prompt, eligibility, deadline, and selection priorities.

**0:45 to 1:00 | Voice catalogue**

Open Voice & tone. Search or browse the catalogue, select a deliberate stance, emotional texture, and register, then apply it. Point out that the catalogue supports 1,440 combinations rather than a random tone search.

**1:00 to 1:15 | Generate**

Generate a draft and explain that AI runs through Audri's server. The customer does not create or paste a provider key. Remind viewers that students review and revise every draft before submission.

**1:15 to 1:30 | Workspace value**

Show the saved essay, dashboard, application tracking, Story Vault, and gap analysis. Finish with: "Audri helps a student move from scattered scholarship tabs to a repeatable application system."

## Resume project entry

**Audri | Full-stack AI Scholarship Workspace**

Next.js, React, TypeScript, Tailwind CSS, Supabase, Anthropic, Zod, Sentry

- Built a full-stack scholarship workspace that turns reusable student profiles and scholarship requirements into grounded essay drafts, recommendation material, and application plans.
- Designed a searchable voice catalogue with 20 writer stances, 12 emotional textures, and 6 registers, giving users 1,440 deliberate writing combinations.
- Hardened server APIs with HTTP-only sessions, encrypted production persistence, schema validation, quota and rate enforcement, SSRF protection, customer-safe failures, and server-managed AI credentials.
- Added production health checks, error monitoring hooks, CI validation, and 23 automated security and product-experience tests.

Only list the technologies and results you can explain in an interview. Do not claim customer counts, revenue, awards, or conversion improvements until those numbers are real.

## Portfolio description

Audri is an AI scholarship workspace for building a reusable student profile, evaluating opportunities, developing authentic story material, and drafting application content. I built the product end to end, including authenticated server APIs, encrypted production storage, scholarship workflows, a 1,440-option voice system, customer quotas, and production readiness checks.

## Strong interview talking points

- Why AI credentials belong on the server and never in customer settings.
- How authenticated quotas are reserved and finalized without trusting browser-provided identity.
- How the voice catalogue converts a vague tone request into explicit, searchable writing dimensions.
- How the local encrypted store supports development while production refuses to run without the configured database.
- Why a saved demo result is necessary even when the live AI path is working.

## Public deployment checklist

1. Push the audited branch to GitHub.
2. Import the repository into Vercel.
3. Provision Supabase and apply the migration listed in `PRODUCTION_SETUP.md`.
4. Add all server secrets through Vercel's encrypted environment settings.
5. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS URL.
6. Deploy and verify signup, onboarding, profile editing, scholarship analysis, generation, saving, export, and deletion.
7. Use the public HTTPS URL on the resume only after those checks pass.

Stripe setup and a monitored support email remain separate launch requirements. They are not required for a private portfolio demo, but payments should not be enabled until both are complete.
