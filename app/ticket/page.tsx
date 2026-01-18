'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QueueManager } from '@/lib/queueManager';

export default function TicketPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const ticket = QueueManager.addTicket(phoneNumber);
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
              <p className="text-gray-600">
                You will receive an SMS notification when you&apos;re next in line
              </p>
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
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US)
              </p>
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
