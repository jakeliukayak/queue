# MT2.0 Queuing System

A modern minimalist queuing system for scheduling 1-on-1 CV consultation sessions with head coach Jake, built with Next.js and real-time queue management.

## Features

- **Get a Ticket**: Users can request a queue ticket with their email
- **Admin Panel**: Manage the queue, call next customer, and remove tickets
- **Real-time Updates**: Queue status updates automatically
- **Minimalist Design**: Clean, modern interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS (Static Export)
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Database**: Supabase PostgreSQL
- **Hosting**: GitHub Pages (frontend) + Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

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

Edit `.env.local` and add your Supabase credentials.

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

## Deployment

### Production Deployment

For production deployment with GitHub Pages + Supabase:

1. Set up Supabase project at [supabase.com](https://supabase.com)
2. Create the database schema (see SUPABASE_SETUP.md)
3. Add Supabase credentials to GitHub repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Enable GitHub Pages in repository settings
5. Push to main branch to trigger automatic deployment

The application will automatically build and deploy to GitHub Pages. The frontend is served as static files from GitHub Pages, while all backend operations use Supabase directly from the client.

**📖 See the complete step-by-step guide**: [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)

Also see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Admin Access

Default admin password: `admin123`

**Important**: Change this in production by implementing proper authentication with Supabase Auth.

## Project Structure

```
queue/
├── app/
│   ├── admin/          # Admin dashboard page
│   ├── ticket/         # Get ticket page
│   ├── api/            # API routes
│   │   ├── tickets/    # Create ticket endpoint
│   │   └── queue/      # Queue management endpoints
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── lib/
│   ├── supabase.ts        # Supabase configuration
│   └── supabaseQueueManager.ts  # Queue management with Supabase
└── components/         # Reusable components
```

## Configuration

### Supabase Setup

1. Create a Supabase project
2. Set up the database schema (see SUPABASE_SETUP.md)
3. Copy your Supabase URL and anon key to `.env.local`
4. Update `lib/supabase.ts` with your configuration

## Features in Development

- [ ] Supabase Authentication for admin
- [ ] Enhanced real-time notifications
- [ ] Queue analytics and reporting
- [ ] Multi-queue support
- [ ] Estimated wait time calculation

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
