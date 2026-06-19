import { config } from "./config.js";

// Pluggable mailer. MVP dev driver just logs the link (and remembers it so the dev flow can
// complete without a real inbox). To go live, wire AWS SES here behind the SES_FROM env var.
const lastLinks = new Map(); // email -> last verification url (dev convenience only)

export async function sendVerificationEmail(email, url) {
  if (config.isProd && process.env.SES_FROM) {
    // TODO (production): send via AWS SES.
    //   import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
    //   await ses.send(new SendEmailCommand({ FromEmailAddress: process.env.SES_FROM, ... }));
    // Left as a clear extension point so the rest of the flow is provider-agnostic.
    console.warn("[mailer] SES not yet wired; verification link for", email, "=>", url);
  } else {
    console.log(`[mailer] (dev) verification link for ${email}: ${url}`);
  }
  lastLinks.set(email, url);
}

// Dev-only: lets the local flow surface the link without a real inbox. Never exposed in prod.
export function devLastLink(email) {
  return lastLinks.get(email) || null;
}
