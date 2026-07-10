// Supabase Edge Function: sends a confirmation email (with the booking
// calendar link) to whoever just submitted the contact form.
//
// Triggered by a Supabase Database Webhook on INSERT into
// public.contact_submissions. See supabase/functions/README.md for the
// full setup: Resend account, secrets, deploy, and webhook wiring.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "TebeeAI <hello@tebeeai.online>";
const CALENDAR_LINK = "https://calendar.app.google/FwZYdaGaT1cmJYLZA";

serve(async req => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), { status: 500 });
  }

  let record;
  try {
    const payload = await req.json();
    record = payload.record ?? payload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
  }

  const trimmedName = typeof record?.name === "string" ? record.name.trim() : "";
  const greetingName = trimmedName || "valued client";
  const email = record?.email;

  if (!email || typeof email !== "string") {
    return new Response(JSON.stringify({ error: "Missing submitter email" }), { status: 400 });
  }

  const subject = "Thank You for Reaching Out to TebeeAI";
  const html = `
    <p>Dear ${greetingName},</p>
    <p>Thank you for taking the time to reach out to TebeeAI. We have received your enquiry and truly appreciate the opportunity to learn a little more about your business.</p>
    <p>Our team will review what you have shared and respond to you personally very soon.</p>
    <p>Should you wish to move things along sooner, we would be glad to welcome you to a short 15 minute walkthrough, at whatever time suits you best:</p>
    <p><a href="${CALENDAR_LINK}">${CALENDAR_LINK}</a></p>
    <p>Thank you again for considering TebeeAI. We look forward to speaking with you soon.</p>
    <p>Warm regards,<br>The TebeeAI Team</p>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html })
  });

  const data = await resendRes.json();

  if (!resendRes.ok) {
    return new Response(JSON.stringify({ error: data }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
});
