# Audri

Audri is an AI scholarship workspace. A student can research a scholarship, build a reusable profile, and produce an essay draft grounded in information they supplied.

## Core workflow

- Email and password accounts
- Encrypted student profile and workspace storage
- Scholarship discovery and eligibility filtering
- Story extraction from student material
- Scholarship and funder research
- Essay strategy, drafting, critique, and revision
- Recommendation letter drafting
- Application status tracking
- Free usage quota and Stripe subscription support

AI output must be reviewed by the student before submission.

## Technology

- Next.js 16 with React 19
- TypeScript in strict mode
- Tailwind CSS
- Supabase PostgreSQL for production records
- Stripe for subscriptions
- Anthropic for AI features
- Sentry for error monitoring
- Resend for recovery email

Local development uses an encrypted file-backed account store when the production database is not configured. Production refuses that fallback.

## Development

1. Install dependencies with npm install.
2. Copy .env.example to .env.local.
3. Configure the AI key and model identifiers.
4. Start the app with npm run dev.

Run these checks before merging:

- npm run lint
- npm test
- npm run build

## Production

Follow PRODUCTION_SETUP.md. Apply the database migration before deploying and confirm /api/health returns HTTP 200.

## License

Proprietary. All rights reserved.
