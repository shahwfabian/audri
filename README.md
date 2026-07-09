# Audri — AI Scholarship Operating System

Audri turns the scholarship grind into one workflow: paste a scholarship (or its link), and Audri researches the funder, studies the prompt, and drafts a genuine, show-don't-tell essay built from the student's real profile — never fabricated.

## Why it exists

Most students lose scholarships not for lack of merit but for lack of time and craft. Audri gives every student a command center: eligibility-first discovery (including the local and state money that's far less competitive), a profile they build once, and an essay engine grounded in a proven admissions-writing methodology.

## Core features

- **Flagship essay generator** — paste a scholarship's full page or just its URL. Audri fetches the page, researches the funding organization's mission from its own website, and writes an essay aligned to what that funder rewards.
- **Show-don't-tell engine** — the writing model is built on the methodology of *Accepted! 50 Successful College Admission Essays*: an in-scene hook, one specific moment, a real growth arc, invisible transitions, and an open-loop ending. It never invents experiences.
- **Eligibility-first discovery** — every U.S. state + DC flagship aid program is built in, alongside national platforms (BigFuture, Scholarships360, Scholarship America, ScholarshipOwl, Bold.org, and more).
- **Recommendation-letter drafts** — students draft a first version to hand to a teacher or employer.
- **Motivation loop** — a daily application goal and streak tracker on the dashboard.
- **Accounts & billing** — email/password accounts (any provider), a free-essay tier, and a Pro upgrade.

## Security & privacy

- Passwords are scrypt-hashed; plaintext is never stored.
- Each student's profile (PII) is **encrypted at rest with AES-256-GCM**.
- Every protected endpoint authenticates with a signed session token and derives identity server-side, so one account can never read or modify another's data.

## Tech stack

- **Next.js** (App Router, React 19) + **TypeScript** (strict, zero errors)
- **Tailwind CSS v4** with a custom design system
- **Zustand** for state, synced to a server-side account store
- **Anthropic API** for all AI features

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment

Set these in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables all AI features |
| `AI_MODEL` | Primary model id |
| `AI_MODEL_FAST` | Cheaper model id for key tests |
| `AUDRI_SECRET` | Master key for PII encryption + session signing (auto-generated if unset) |
| `AUDRI_FREE_ESSAYS` | Free essays before the paywall (default 3) |
| `AUDRI_ACTIVATION_SECRET` | Code that unlocks Pro |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Stripe checkout link for Pro |

## License

Proprietary — all rights reserved.
