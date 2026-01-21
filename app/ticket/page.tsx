'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SupabaseQueueManager, QueueItemClient } from '@/lib/supabaseQueueManager';

export default function TicketPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [peopleBeforeYou, setPeopleBeforeYou] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadQueuePosition = async () => {
    if (!ticketNumber) return;
    
    try {
      const calledTicket = await SupabaseQueueManager.getCalledTicket();
      if (calledTicket) {
        setCurrentTicket(calledTicket.ticketNumber);
      } else {
        setCurrentTicket(null);
      }

      // Get waiting queue to calculate position
      const waitingQueue = await SupabaseQueueManager.getWaitingQueue();
      const myTicket = waitingQueue.find(t => t.ticketNumber === ticketNumber);
      
      if (myTicket) {
        // Count how many people are before me
        const beforeMe = waitingQueue.filter(t => t.ticketNumber < ticketNumber).length;
        setPeopleBeforeYou(beforeMe);
      } else {
        setPeopleBeforeYou(null);
      }
    } catch (err) {
      console.error('Failed to load queue position:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueuePosition();
    setRefreshing(false);
  };

  useEffect(() => {
    if (ticketNumber) {
      // Load initial queue position
      loadQueuePosition();

      // Set up real-time subscription to refresh when queue changes
      const unsubscribe = SupabaseQueueManager.subscribeToQueue(() => {
        loadQueuePosition();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [ticketNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ticket = await SupabaseQueueManager.addTicket(name, phoneNumber, email);
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
              <div className="text-6xl font-bold my-8">#{ticketNumber}</div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">The number of people before you</p>
              <p className="text-2xl font-bold">
                {peopleBeforeYou !== null ? peopleBeforeYou : '-'}
              </p>
              {peopleBeforeYou === 1 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-700 font-medium">
                    ⚠️ Please come to our booth 1D-B32 soon if it is 1 only
                  </p>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
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
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-xs text-gray-600 text-center py-2">
              By signing up, you agree to receive updates from MT2.0 and consent to the use of personal data for the purpose of this web page.
            </div>

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