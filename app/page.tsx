'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">MT2.0 Queuing System</h1>
          <p className="text-gray-600">Schedule a 1-on-1 CV consultation session with our head coach Jake</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/ticket" 
            className="block btn-primary text-center"
          >
            Get a Ticket
          </Link>
          
          <Link 
            href="/admin" 
            className="block btn-secondary text-center"
          >
            Admin Login
          </Link>
        </div>

      </div>
    </main>
  );
}
