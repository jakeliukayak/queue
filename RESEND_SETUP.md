# Resend Email Setup Guide

This guide explains how to set up email notifications using Resend for the MT2.0 Queuing System.

## Overview

The system uses Resend to send email notifications to customers when:
- They reach position 3 in the queue
- They are next in line (position 1)

## Getting Started with Resend

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
   - Free tier includes: 3,000 emails/month, 100 emails/day
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the left sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "MT2.0 Queue Production")
5. Select the appropriate permissions:
   - ✅ **Sending access** (required)
6. Copy the API key (starts with `re_`)
   - ⚠️ **Important**: Save this key securely - it won't be shown again!

### 3. Configure Supabase Edge Function

Since this is a static Next.js export, emails are sent via a Supabase Edge Function.

#### Step 1: Set the Secret in Supabase

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

#### Step 2: Deploy the Edge Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

### 4. Email Domain Setup (Optional but Recommended)

By default, emails are sent from `onboarding@resend.dev`. For production:

1. **Add Your Domain** in Resend:
   - Go to **Domains** in Resend dashboard
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)
   
2. **Verify DNS Records**:
   - Add the provided DNS records to your domain
   - Wait for verification (usually 5-10 minutes)

3. **Update the Edge Function**:
   - Edit `supabase/functions/send-email/index.ts`
   - Change the `from` field:
     ```typescript
     from: 'MT2.0 Queue <noreply@yourdomain.com>',
     ```

## Email Templates

The system includes two email templates:

### Position 3 Notification
- **Subject**: "You're 3rd in Line - Ticket #XXX"
- **Content**: Friendly notification that customer is approaching their turn
- **Triggered**: When a customer reaches position 3 in queue

### Next in Line Notification
- **Subject**: "You're Next! - Ticket #XXX"
- **Content**: Alert notification that customer is next to be called
- **Triggered**: When a customer reaches position 1 in queue

## Customizing Email Templates

Email templates are defined in `lib/emailService.ts`:

```typescript
// lib/emailService.ts
export class EmailService {
  static async notifyPosition3(name: string, email: string, ticketNumber: number) {
    // Customize the HTML content here
  }
  
  static async notifyNextInLine(name: string, email: string, ticketNumber: number) {
    // Customize the HTML content here
  }
}
```

### Tips for Customization:
- Keep emails mobile-friendly (max width 600px)
- Use inline CSS for better email client compatibility
- Test emails in multiple clients (Gmail, Outlook, etc.)
- Include alt text for images
- Keep subject lines under 50 characters

## Testing

### Test Email Sending

1. **Test in Development**:
   ```bash
   # Run the edge function locally
   supabase functions serve send-email --env-file .env.local
   ```

2. **Send a Test Email**:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/send-email \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<h1>Test</h1><p>This is a test email.</p>"
     }'
   ```

3. **Test the Queue Flow**:
   - Add at least 3 tickets to the queue
   - Call the first ticket from admin panel
   - Verify that:
     - Position 3 customer receives email
     - Position 1 customer receives email

## Monitoring

### Check Email Delivery

1. **Resend Dashboard**:
   - Log in to [resend.com](https://resend.com)
   - Go to **Emails** to see sent emails
   - View delivery status, opens, and clicks

2. **Supabase Logs**:
   ```bash
   # View edge function logs
   supabase functions logs send-email
   ```

### Common Issues

#### Emails Not Sending

1. **Check API Key**:
   ```bash
   # Verify secret is set
   supabase secrets list
   ```

2. **Check Function Deployment**:
   ```bash
   # Redeploy if needed
   supabase functions deploy send-email
   ```

3. **Check Logs**:
   ```bash
   supabase functions logs send-email --tail
   ```

#### Emails Going to Spam

- Set up domain verification (see step 4 above)
- Add SPF, DKIM, and DMARC records
- Avoid spam trigger words in subject/content
- Include an unsubscribe option (recommended for production)

## Rate Limits

**Free Tier**:
- 3,000 emails/month
- 100 emails/day
- Rate limit: 10 requests/second

**Paid Plans**:
- Starting at $20/month for 50,000 emails
- See [resend.com/pricing](https://resend.com/pricing)

## Security Best Practices

1. **Protect Your API Key**:
   - Never commit API keys to version control
   - Use Supabase secrets for production
   - Rotate keys regularly

2. **Validate Email Addresses**:
   - The system validates email format during ticket creation
   - Consider adding email verification for production

3. **Rate Limiting**:
   - Monitor usage in Resend dashboard
   - Implement additional rate limiting if needed

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

## Next Steps

After setting up Resend:

1. ✅ Test email notifications in development
2. ✅ Set up domain verification for production
3. ✅ Customize email templates to match your branding
4. ✅ Monitor email delivery and engagement
5. ✅ Consider adding email preferences for customers
