export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
 const apiKey = process.env.RESEND_API_KEY;
 const from = process.env.EMAIL_FROM;
 if (!apiKey || !from) throw new Error("Transactional email is not configured.");

 const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
   Authorization: "Bearer " + apiKey,
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   from,
   to: [to],
   subject: "Reset your Audri password",
   html: [
    "<p>We received a request to reset your Audri password.</p>",
    '<p><a href="' + resetUrl + '">Reset your password</a></p>',
    "<p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>",
   ].join(""),
  }),
 });
 if (!response.ok) throw new Error("Transactional email provider rejected the request.");
}

