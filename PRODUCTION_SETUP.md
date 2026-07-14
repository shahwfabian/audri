# Audri production setup

The application code supports production storage, subscription billing, recovery email, monitoring, and health checks. The external services below must be provisioned before accepting payments.

## 1. Database

1. Create a Supabase project.
2. Run supabase/migrations/202607130001_audri_production.sql in the SQL editor.
3. Run supabase/migrations/202607130002_email_verification.sql.
4. Set NEXT_PUBLIC_SUPABASE_URL.
5. Set SUPABASE_SERVICE_ROLE_KEY only in the server environment.
6. Confirm anonymous and authenticated browser roles cannot query customer tables.

If data/users.json contains real customer accounts, run npm run migrate:users after configuring the database. Keep the same AUDRI_SECRET during migration.

The application refuses to use the local JSON account store when NODE_ENV is production.

## 2. Encryption and scheduler secrets

Set a stable AUDRI_SECRET with at least 32 random bytes. If local customer records already exist, use the value stored in data/.secret so existing encrypted profiles remain readable. Never commit or paste that value into a ticket.

Set a different random value for CRON_SECRET. Configure the hosting scheduler to send it as the bearer credential.

## 3. Managed AI

1. Set ANTHROPIC_API_KEY only in the server environment.
2. Set AI_MODEL and AI_MODEL_FAST to approved production model IDs.
3. Enable provider billing, a monthly spend limit, and usage alerts.
4. Confirm no AI credential is exposed as a NEXT_PUBLIC variable or sent by the browser.
5. Test generation through a normal customer account. Customers never provide an API key.

## 4. Stripe

1. Create the Audri Pro recurring product at the approved monthly price.
2. Copy its price ID to STRIPE_PRO_PRICE_ID.
3. Set STRIPE_SECRET_KEY.
4. Create a webhook for /api/billing/webhook.
5. Subscribe the webhook to checkout completion and customer subscription events.
6. Copy the signing secret to STRIPE_WEBHOOK_SECRET.
7. Enable the Stripe customer portal.
8. Complete one test checkout, one cancellation, and one failed-payment test.

Manual activation is disabled by default. Keep AUDRI_ALLOW_MANUAL_ACTIVATION false.

## 5. Transactional email

1. Create a transactional email provider account and verify the sending domain.
2. Configure the provider as custom SMTP in Supabase.
3. Update the Magic link or OTP template to display the one-time code.
4. Set AUDRI_REQUIRE_EMAIL_VERIFICATION true.
5. Complete one signup verification and one password recovery test.

## 6. Monitoring

Create a Sentry project. Set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN. Configure an alert for new production errors and elevated request failures.

## 7. Hosting

1. Set NEXT_PUBLIC_APP_URL to the HTTPS production origin.
2. Add every variable from .env.example through the host's encrypted environment settings.
3. Set DISABLE_SCRAPE_SCHEDULER true when the hosting cron owns ingestion.
4. Deploy from a commit that passed CI.
5. Confirm /api/health returns HTTP 200.
6. Verify signup, recovery, generation, checkout, cancellation, export, and deletion on the production domain.

## 8. Business review

Have qualified counsel review the Terms and Privacy Policy. Publish a monitored support address. Confirm the policy for minors, refunds, retention, and backup deletion.

Do not accept public payments until these external checks are complete.
