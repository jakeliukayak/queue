# Queue System

A modern minimalist queuing system built with Next.js, featuring SMS notifications and admin queue management.

## Features

- **Get a Ticket**: Users can request a queue ticket with their phone number
- **SMS Notifications**: Receive SMS alerts when you're next in line
- **Admin Panel**: Manage the queue, call next customer, and remove tickets
- **Real-time Updates**: Queue status updates automatically
- **Minimalist Design**: Clean, modern interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (designed to work with Firebase Functions)
- **Database**: Firebase Firestore/Realtime Database (mock store included)
- **SMS**: Twilio (integration ready)
- **Hosting**: GitHub Pages (frontend), Firebase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (for production)
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

Edit `.env.local` and add your Firebase and Twilio credentials.

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the static site:
```bash
npm run build
```

The build output will be in the `out` directory, ready for deployment to GitHub Pages.

## Deployment

### Frontend (GitHub Pages)

1. Build the project: `npm run build`
2. Deploy the `out` directory to GitHub Pages
3. Configure your repository settings to serve from the `gh-pages` branch or `docs` folder

### Backend (Firebase Functions)

For production deployment with Firebase:

1. Set up Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Initialize Firebase Functions: `firebase init functions`
3. Move API routes to Firebase Functions
4. Configure Firestore/Realtime Database for queue storage
5. Set up Twilio credentials in Firebase environment config
6. Deploy: `firebase deploy`

## Admin Access

Default admin password: `admin123`

**Important**: Change this in production by implementing proper authentication with Firebase Auth.

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
│   ├── firebase.ts     # Firebase configuration
│   ├── twilio.ts       # Twilio SMS integration
│   └── queueStore.ts   # Mock queue store
└── components/         # Reusable components
```

## Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore or Realtime Database
3. Copy your Firebase config to `.env.local`
4. Update `lib/firebase.ts` with your configuration

### Twilio Setup

1. Create a Twilio account
2. Get a phone number capable of sending SMS
3. Copy your Account SID, Auth Token, and phone number to `.env.local`
4. Update `lib/twilio.ts` for production use

## Features in Development

- [ ] Firebase Authentication for admin
- [ ] Persistent queue storage with Firestore
- [ ] Real-time SMS notifications
- [ ] Queue analytics and reporting
- [ ] Multi-queue support
- [ ] Estimated wait time calculation

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
