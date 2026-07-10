/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts, used to seed the scholarship DB
 * and register the nightly scrape cron.
 */
export async function register() {
 if (process.env.NEXT_RUNTIME === "nodejs") {
 const { startScheduler } = await import("./lib/scheduler");
 startScheduler();
 }
}
