'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SupabaseQueueManager, QueueItemClient } from '@/lib/supabaseQueueManager';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [queue, setQueue] = useState<QueueItemClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, this should be handled securely with Firebase Auth)
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadQueue();
    } else {
      setError('Invalid password');
    }
  };

  const loadQueue = async () => {
    const currentQueue = await SupabaseQueueManager.getWaitingQueue();
    setQueue(currentQueue);
  };

  const handleNext = async () => {
    if (queue.length === 0) return;

    setLoading(true);
    
    try {
      const nextTicket = queue[0];
      const followingTicket = await SupabaseQueueManager.callNext();
      
      await loadQueue();
    } catch (err) {
      console.error('Failed to call next:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (ticketId: string) => {
    setLoading(true);

    try {
      await SupabaseQueueManager.removeTicket(ticketId);
      await loadQueue();
    } catch (err) {
      console.error('Failed to remove ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadQueue();
      
      // Set up real-time subscription
      const unsubscribe = SupabaseQueueManager.subscribeToQueue((updatedQueue) => {
        setQueue(updatedQueue);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="w-full btn-primary">
                Login
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
            }}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">People in Queue</p>
              <p className="text-4xl font-bold">{queue.length}</p>
            </div>
            <button
              onClick={handleNext}
              disabled={loading || queue.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              Call Next
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Queue</h2>
          
          {queue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No one in queue</p>
          ) : (
            <div className="space-y-2">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    index === 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-lg">#{item.ticketNumber}</p>
                    <p className="text-sm text-gray-600">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="text-sm text-blue-600 font-medium mr-2">
                        Next
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={loading}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
