# Twilio SMS Integration Setup Guide

This guide explains how to set up Twilio SMS notifications for the Queue System.

## Overview

When the admin calls the next customer:
1. The **current customer** receives an SMS: "Hi [Name]! It's your turn now..."
2. The **next customer in line** receives an SMS: "Hi [Name]! You're next in line..."

## Architecture

```
┌─────────────────────┐
│   Admin calls       │
│   "Next" button     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Edge      │  ← Serverless function
│  Function           │  ← Handles Twilio API
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Twilio API        │  ← Sends SMS
│   SMS Service       │
└─────────────────────┘
```

## Step-by-Step Setup

### 1. Get Twilio Credentials

1. Sign up for a free Twilio account at https://www.twilio.com/try-twilio
2. Get your **Account SID** and **Auth Token** from the Twilio Console Dashboard
3. Get a Twilio phone number:
   - Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Choose a number with SMS capabilities
   - Note: Free trial accounts can only send SMS to verified phone numbers

### 2. Configure Supabase Edge Function Secrets

The Twilio credentials need to be stored in Supabase (not GitHub) because Edge Functions run on Supabase servers.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Set the secrets
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Add the following secrets:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Important**: The phone number must be in E.164 format (e.g., `+1234567890`)

### 3. Deploy the Supabase Edge Function

```bash
# Deploy the send-sms function
supabase functions deploy send-sms

# Verify it's deployed
supabase functions list
```

### 4. Test the Integration

#### Test the Edge Function Directly

```bash
curl -i --location --request POST 'https://your-project-id.supabase.co/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"+1234567890","message":"Test message from Queue System"}'
```

#### Test Through the Application

1. Add yourself to the queue with your phone number
2. Have an admin call "Next"
3. You should receive an SMS notification

## Phone Number Format

The system automatically formats phone numbers to E.164 format:
- US numbers: `(123) 456-7890` → `+11234567890`
- Already formatted: `+1234567890` → `+1234567890`

For international numbers, customers should enter them with country code (e.g., `+44...` for UK).

## Troubleshooting

### Edge Function Errors

Check the Edge Function logs:
```bash
supabase functions logs send-sms
```

Or view them in the Supabase Dashboard: **Edge Functions** → **send-sms** → **Logs**

### Common Issues

1. **"Missing Twilio credentials" error**
   - Make sure you've set all three secrets in Supabase
   - Redeploy the function after setting secrets

2. **"Failed to send SMS" error**
   - Verify your Twilio credentials are correct
   - Check your Twilio account balance (free trial has limitations)
   - Ensure the phone number is verified (for trial accounts)

3. **SMS not received**
   - Check Twilio logs at https://www.twilio.com/console/sms/logs
   - Verify the recipient's phone number is correct
   - For trial accounts, verify the recipient's number in Twilio

4. **CORS errors in browser**
   - The Edge Function includes CORS headers
   - Make sure you're calling it through the Supabase client SDK
   - Check browser console for detailed errors

## Security Notes

✅ **Safe practices:**
- Twilio credentials are stored in Supabase Edge Functions (server-side)
- Never exposed to the client
- Not committed to the repository

⚠️ **Important:**
- Don't commit `.env` files with Twilio credentials
- Use GitHub Secrets for Supabase URL/Key only (Twilio goes to Supabase)
- Monitor your Twilio usage to avoid unexpected charges

## Cost Considerations

### Twilio Free Trial
- $15.50 credit
- Can send SMS to verified numbers only
- US/Canada SMS: ~$0.0075 per message
- ~2,000 SMS with trial credit

### Twilio Paid Account
- US/Canada SMS: ~$0.0075-0.01 per message
- International rates vary
- Monitor usage in Twilio Console

### Supabase Edge Functions
- Free tier: 500,000 invocations/month
- More than enough for most queue systems

## Customizing SMS Messages

Edit the messages in `/lib/twilioSMSService.ts`:

```typescript
// Current customer message
const message = `Hi ${name}! It's your turn now. Your ticket number is #${ticketNumber}. Please proceed to the consultation area. - MT2.0 Queuing System`;

// Next customer message
const message = `Hi ${name}! You're next in line. Your ticket number is #${ticketNumber}. Please be ready. - MT2.0 Queuing System`;
```

## Disabling SMS Notifications

If you want to disable SMS notifications temporarily:

1. Comment out the SMS calls in `/lib/supabaseQueueManager.ts`:
```typescript
// await TwilioSMSService.notifyCustomerTurn(...);
// await TwilioSMSService.notifyCustomerNext(...);
```

Or set an environment variable check:
```typescript
const SMS_ENABLED = Deno.env.get('SMS_ENABLED') === 'true';
```

## GitHub Actions Workflow

The workflow file (`.github/workflows/nextjs.yml`) includes comments about Twilio setup but doesn't need Twilio secrets because:
1. The Next.js build is static (no server-side code)
2. Twilio credentials are used by Supabase Edge Functions
3. Edge Functions run on Supabase infrastructure, not GitHub

The workflow only needs:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Summary

✅ **What you need to do:**
1. Get Twilio credentials (Account SID, Auth Token, Phone Number)
2. Set them as Supabase Edge Function secrets
3. Deploy the `send-sms` Edge Function
4. Test by calling "Next" in the admin panel

✅ **What's already done:**
- Edge Function code (`supabase/functions/send-sms/index.ts`)
- SMS service wrapper (`lib/twilioSMSService.ts`)
- Integration in queue manager (`lib/supabaseQueueManager.ts`)
- GitHub Actions workflow updated with comments

🚀 Once configured, SMS notifications will work automatically!
