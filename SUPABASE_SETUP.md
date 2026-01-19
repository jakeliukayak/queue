# Supabase Backend Integration Guide

This guide explains how to integrate the queuing system with Supabase for production deployment.

## Architecture

- **Frontend**: Next.js application
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Database**: Supabase PostgreSQL for queue storage

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the database to be provisioned (this takes a few minutes)
4. Note your project URL and anon key from the project settings

### 2. Set Up Database Schema

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create tickets table
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number INTEGER NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'called', 'completed')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_timestamp ON tickets(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Enable read access for all users" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON tickets
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON tickets
  FOR DELETE USING (true);
```

**Note**: The above policies allow public access for demo purposes. In production, you should implement proper authentication and restrict access to authenticated users or admin roles.

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find your Supabase URL and anon key in:
- Dashboard → Settings → API

### 4. Enable Real-time Subscriptions (Optional)

To enable real-time updates for the admin dashboard:

1. Go to Database → Replication in Supabase Dashboard
2. Enable replication for the `tickets` table
3. The app will automatically subscribe to changes

### 5. Security Recommendations for Production

1. **Row Level Security**: Update RLS policies to restrict access:

```sql
-- Only allow authenticated users to manage tickets
DROP POLICY IF EXISTS "Enable read access for all users" ON tickets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON tickets;
DROP POLICY IF EXISTS "Enable update access for all users" ON tickets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON tickets;

-- Create more restrictive policies
CREATE POLICY "Authenticated users can read tickets" ON tickets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tickets" ON tickets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets" ON tickets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tickets" ON tickets
  FOR DELETE TO authenticated USING (true);
```

2. **Supabase Auth**: Implement Supabase Authentication for the admin panel:

```typescript
import { supabase } from '@/lib/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'secure-password',
});

// Sign out
await supabase.auth.signOut();
```

3. **Environment Variables**: Never commit `.env.local` to version control.

### 6. Testing Your Setup

1. Start the development server:
```bash
npm run dev
```

2. Test ticket creation at http://localhost:3000/ticket
3. Test admin dashboard at http://localhost:3000/admin
4. Verify real-time updates work in the admin panel

## Real-time Features

The application uses Supabase's real-time subscriptions to automatically update the admin dashboard when:
- A new ticket is created
- A ticket status is updated
- A ticket is removed

No polling is required - updates are pushed instantly via WebSocket.

## Cost Considerations

### Supabase Free Tier
- 500MB database space
- 5GB bandwidth
- 2GB file storage
- 50,000 monthly active users
- Unlimited API requests

### Supabase Pro ($25/month)
- 8GB database space
- 50GB bandwidth
- 100GB file storage
- 100,000 monthly active users
- Daily backups

## Monitoring

- **Database**: Monitor in Supabase Dashboard → Database → Performance
- **API Logs**: Check API logs in Dashboard → Logs
- **Real-time**: Monitor real-time connections in Dashboard → Database → Replication

## Troubleshooting

### Real-time not working
1. Check if replication is enabled for the `tickets` table
2. Verify your anon key is correct
3. Check browser console for WebSocket errors

### Cannot insert tickets
1. Verify RLS policies allow the operation
2. Check if table schema matches the application code
3. Review Supabase logs for errors

## Migration from Firebase

If you're migrating from Firebase:

1. Export your Firebase data
2. Transform to match Supabase schema
3. Import using Supabase SQL or API
4. Update all Firebase references to Supabase
5. Test thoroughly before switching production

## Next Steps

1. Implement Supabase Auth for secure admin access
2. Implement queue analytics using Supabase queries
3. Set up scheduled functions for cleanup tasks
4. Configure database backups

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
