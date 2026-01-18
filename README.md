# Queue System

A modern minimalist queuing system built with Next.js, featuring SMS notifications and admin queue management.

## Features

- **Get a Ticket**: Users can request a queue ticket with their phone number
- **SMS Notifications**: Receive SMS alerts when you're next in line
- **Admin Panel**: Manage the queue, call next customer, and remove tickets
- **Real-time Updates**: Queue status updates automatically
- **Minimalist Design**: Clean, modern interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS (Static Export)
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Database**: Supabase PostgreSQL
- **SMS**: Twilio via Supabase Edge Functions
- **Hosting**: GitHub Pages (frontend) + Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)
- Twilio account (for SMS notifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jakeliukayak/queue.git
cd queue
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application:
```bash
npm run build
```

The build output will be in the `out/` directory, ready for deployment to GitHub Pages or any static hosting platform.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the database to be provisioned
4. Copy your project URL and anon key from Settings → API

### 2. Set Up Database Schema

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create tickets table
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'called', 'completed')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
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

**⚠️ Note**: The above policies allow public access for demo purposes. In production, implement proper authentication and restrict access to authenticated users.

### 3. Enable Real-time Subscriptions

1. Go to Database → Replication in Supabase Dashboard
2. Enable replication for the `tickets` table
3. The app will automatically subscribe to changes

## SMS Notifications Setup (Twilio + Supabase Edge Functions)

### 1. Create Twilio Account

1. Sign up at [Twilio](https://www.twilio.com)
2. Get a phone number capable of sending SMS
3. Copy your Account SID, Auth Token, and phone number

### 2. Deploy Supabase Edge Function

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and link to your project:
```bash
supabase login
supabase link --project-ref your-project-ref
```

Set Twilio credentials as Supabase secrets:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

Deploy the Edge Function:
```bash
supabase functions deploy send-sms
```

The Edge Function is already created in `supabase/functions/send-sms/index.ts` and will be deployed to handle SMS notifications.

## Deployment

### GitHub Pages Deployment

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Under "Build and deployment", select "GitHub Actions" as source

2. **Configure Repository Secrets**
   - Go to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Deploy**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Your app will be live at: `https://[username].github.io/[repository]/`

### Custom Domain (Optional)

1. Go to Settings → Pages → Custom domain
2. Add your domain (e.g., `queue.yourdomain.com`)
3. Configure DNS with a CNAME record pointing to `[username].github.io`
4. Enable "Enforce HTTPS" once certificate is ready

## Admin Access

Default admin password: `admin123`

**⚠️ Important**: Change this in production by implementing proper authentication with Supabase Auth.

## Project Structure

```
queue/
├── app/
│   ├── admin/              # Admin dashboard page
│   ├── ticket/             # Get ticket page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── supabase.ts         # Supabase configuration
│   ├── supabaseQueueManager.ts  # Queue management
│   └── twilio.ts           # Twilio SMS integration (legacy)
├── supabase/
│   └── functions/
│       └── send-sms/       # SMS Edge Function
│           └── index.ts
└── public/                 # Static assets
```

## Troubleshooting

### Build Fails
- Verify Node.js version is 18 or higher
- Ensure environment variables are set correctly
- Run `npm install` to reinstall dependencies
- Clear cache with `rm -rf .next out` and rebuild

### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check that database schema is created
- Review Supabase logs in Dashboard → Logs
- Ensure RLS policies allow the required operations

### Real-time Updates Not Working
- Verify real-time is enabled for the `tickets` table
- Check browser console for WebSocket errors
- Ensure proper permissions in RLS policies

### SMS Not Sending
- Verify Twilio credentials are set as Supabase secrets
- Check Edge Function logs in Supabase Dashboard → Edge Functions
- Ensure phone numbers include country code (e.g., +1234567890)
- Verify Edge Function is deployed: `supabase functions list`

### Admin Panel Issues
- Clear browser cache and cookies
- Check that database schema matches application code
- Verify real-time subscriptions are enabled

## Cost Estimates

### Supabase
- **Free Tier**: 500MB database, 5GB bandwidth, 50K MAU
- **Pro**: $25/month - 8GB database, 50GB bandwidth, 100K MAU

### Twilio SMS
- US: ~$0.0075 per message
- International: Varies by country
- Example: 1000 SMS/month ≈ $7.50

### GitHub Pages
- **Free** for public repositories

## Security Best Practices

1. **Use Supabase Auth** for admin authentication instead of hardcoded passwords
2. **Restrict RLS policies** to authenticated users only
3. **Never commit** `.env.local` or secrets to version control
4. **Set Twilio credentials** as Supabase secrets, not environment variables
5. **Enable HTTPS** for custom domains
6. **Regular backups** of your database

## Features in Development

- [ ] Supabase Authentication for admin
- [ ] Enhanced real-time notifications
- [ ] Queue analytics and reporting
- [ ] Multi-queue support
- [ ] Estimated wait time calculation

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

