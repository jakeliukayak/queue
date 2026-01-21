'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SupabaseQueueManager, QueueItemClient } from '@/lib/supabaseQueueManager';

interface QueueItemWithPosition extends QueueItemClient {
  position: number | null;
}

export default function SearchPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [results, setResults] = useState<QueueItemWithPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const getPosition = (ticket: QueueItemClient, allTickets: QueueItemClient[]): number | null => {
    if (ticket.status !== 'waiting') {
      return null;
    }

    // Count how many waiting tickets have lower ticket numbers
    const position = allTickets.filter(
      (t) => t.status === 'waiting' && t.ticketNumber < ticket.ticketNumber
    ).length;

    return position + 1;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);

    await performSearch();
  };

  const performSearch = async () => {
    try {
      const tickets = await SupabaseQueueManager.searchByPhone(phoneNumber);
      
      // Get all waiting tickets to calculate positions
      const waitingQueue = await SupabaseQueueManager.getWaitingQueue();
      
      // Add position information
      const ticketsWithPositions: QueueItemWithPosition[] = tickets.map((ticket) => ({
        ...ticket,
        position: getPosition(ticket, waitingQueue),
      }));

      setResults(ticketsWithPositions);
    } catch (err) {
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await performSearch();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      waiting: 'bg-blue-100 text-blue-800',
      called: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6">Search Reservation</h1>

          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(123) 456-7890"
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
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searched && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Search Results</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 flex items-center gap-1"
                >
                  🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reservations found for this phone number.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please check the phone number and try again.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-2xl font-bold">#{result.ticketNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold">{result.name}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold">{result.email}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-semibold">{result.phoneNumber}</p>
                        </div>

                        {result.position !== null && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-600 font-medium">
                              The number of people before you
                            </p>
                            <p className="text-3xl font-bold text-blue-700">
                              {result.position - 1}
                            </p>
                            {result.position === 1 && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm text-yellow-700 font-medium">
                                  ⚠️ Please come to our booth 1D-B32 soon if it is 1 only
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {result.status === 'called' && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700">
                              🔔 Your turn! Please proceed to the consultation area.
                            </p>
                          </div>
                        )}

                        {result.status === 'completed' && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">
                              ✅ Consultation completed. Thank you!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
