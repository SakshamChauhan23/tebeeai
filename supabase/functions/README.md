# Confirmation email setup (Supabase + Resend)

This sends an automatic confirmation email, with the booking calendar link,
to whoever fills out the contact form. It runs entirely server side: a
Postgres trigger fires on every new row in `contact_submissions`, which
calls the `send-confirmation-email` Edge Function, which sends the email
through Resend. Nothing in `script.js` needs to change.

**Status: deployed and wired up.** The function is live, the database
trigger is active, and the whole chain (insert → trigger → function →
Resend) has been tested end to end. The only remaining step is finishing
domain verification in Resend (see below) — until then, Resend rejects the
send with a `domain not verified` error, and everything else in the chain
keeps working correctly.

## Remaining step: finish domain verification in Resend

The `tebeeai.online` domain is added in Resend and DKIM is already verified,
but two more DNS records are still pending. Add these wherever your
domain's DNS is managed:

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |

Check status any time at [resend.com/domains](https://resend.com/domains).
Once both show verified, confirmation emails start sending automatically —
no redeploy or code change needed.

## How it's wired up (for reference / rebuilding elsewhere)

1. **Table + policy**: `supabase-schema.sql` creates `contact_submissions`
   with insert-only RLS for the anon role.
2. **Edge Function**: `index.ts` in this folder. Deployed with
   `supabase functions deploy send-confirmation-email`. Reads the Resend
   API key from the `RESEND_API_KEY` secret
   (`supabase secrets set RESEND_API_KEY=...`), never from client code.
3. **Trigger**: also defined in `supabase-schema.sql`. Uses the `pg_net`
   extension to call the deployed function's URL on every `INSERT`,
   passing the new row as `{ "record": {...} }`. This replaces the
   dashboard's Database Webhooks UI with the equivalent SQL, so the whole
   setup is reproducible from one script instead of a manual dashboard step.

## Updating the calendar link or email copy later

Edit `CALENDAR_LINK`, `FROM_EMAIL`, or the `subject`/`html` in `index.ts`,
then redeploy:

```bash
supabase functions deploy send-confirmation-email
```

## Debugging

- Function logs: Supabase dashboard → Edge Functions → send-confirmation-email → Logs.
- Trigger call results: `select * from net._http_response order by id desc limit 5;`
  (run via `supabase db query --linked "..."` or the SQL Editor).
