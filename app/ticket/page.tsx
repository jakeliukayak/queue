'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SupabaseQueueManager } from '@/lib/supabaseQueueManager';

export default function TicketPage() {
  const [email, setEmail] = useState('');
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ticket = await SupabaseQueueManager.addTicket(email);
      setTicketNumber(ticket.ticketNumber);
    } catch (err) {
      setError('Failed to get ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (ticketNumber) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Your Ticket</h1>
              <div className="text-6xl font-bold my-8">{ticketNumber}</div>
            </div>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Get a Ticket</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Get Ticket'}
            </button>
          </form>

          <Link href="/" className="block text-center mt-4 text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
