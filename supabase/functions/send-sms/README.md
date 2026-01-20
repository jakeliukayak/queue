# Send SMS Supabase Edge Function

This Edge Function sends SMS notifications via Twilio.

## Purpose

Sends SMS notifications to customers in the queue system when:
1. It's their turn (they've been called)
2. They're next in line (following customer)

## Environment Variables (Secrets)

Required secrets (set via `supabase secrets set` or Supabase Dashboard):

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (E.164 format, e.g., +1234567890)

## API

### Endpoint

`POST https://your-project-id.supabase.co/functions/v1/send-sms`

### Request

```json
{
  "to": "+1234567890",
  "message": "Your message here"
}
```

### Response (Success)

```json
{
  "success": true,
  "messageSid": "SM..."
}
```

### Response (Error)

```json
{
  "error": "Error description",
  "details": "Additional details"
}
```

## Deployment

```bash
supabase functions deploy send-sms
```

## Testing

```bash
curl -i --location --request POST 'https://your-project-id.supabase.co/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"+1234567890","message":"Test message"}'
```

## Logs

View logs:
```bash
supabase functions logs send-sms
```

Or in Supabase Dashboard: Edge Functions → send-sms → Logs

## See Also

- [TWILIO_SETUP.md](/TWILIO_SETUP.md) - Complete setup instructions
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
