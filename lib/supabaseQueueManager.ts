// Supabase-based queue management
import { supabase, QueueItem } from './supabase';

export interface QueueItemClient {
  id: string;
  ticketNumber: number;
  email: string;
  status: 'waiting' | 'called' | 'completed';
  timestamp: number;
}

// Convert Supabase format to client format
function toClientFormat(item: QueueItem): QueueItemClient {
  return {
    id: item.id,
    ticketNumber: item.ticket_number,
    email: item.email,
    status: item.status,
    timestamp: new Date(item.timestamp).getTime(),
  };
}

export class SupabaseQueueManager {
  // Add a new ticket to the queue
  static async addTicket(email: string): Promise<QueueItemClient> {
    // Get the current max ticket number
    const { data: maxTicket } = await supabase
      .from('tickets')
      .select('ticket_number')
      .order('ticket_number', { ascending: false })
      .limit(1)
      .single();

    const nextTicketNumber = (maxTicket?.ticket_number || 0) + 1;

    // Insert the new ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ticket_number: nextTicketNumber,
        email: email,
        status: 'waiting',
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding ticket:', error);
      throw new Error(`Failed to add ticket: ${error.message || 'Unknown database error'}`);
    }

    return toClientFormat(data);
  }

  // Get all waiting tickets
  static async getWaitingQueue(): Promise<QueueItemClient[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'waiting')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
      return [];
    }

    return (data || []).map(toClientFormat);
  }

  // Remove a ticket from the queue
  static async removeTicket(ticketId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (error) {
      console.error('Error removing ticket:', error);
      return false;
    }

    return true;
  }

  // Update ticket status
  static async updateTicketStatus(
    ticketId: string,
    status: 'waiting' | 'called' | 'completed'
  ): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }

    return true;
  }

  // Call the next customer in line
  static async callNext(): Promise<QueueItemClient | null> {
    const waitingQueue = await this.getWaitingQueue();

    if (waitingQueue.length === 0) {
      return null;
    }

    const nextTicket = waitingQueue[0];
    await this.updateTicketStatus(nextTicket.id, 'called');

    // Get the ticket after this one to notify
    const followingTicket = waitingQueue.length > 1 ? waitingQueue[1] : null;

    // Remove the called ticket after a brief delay to allow UI updates
    const TICKET_REMOVAL_DELAY_MS = 1000;
    setTimeout(async () => {
      await this.removeTicket(nextTicket.id);
    }, TICKET_REMOVAL_DELAY_MS);

    return followingTicket;
  }

  // Subscribe to real-time queue changes
  static subscribeToQueue(callback: (queue: QueueItemClient[]) => void) {
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        async () => {
          const queue = await this.getWaitingQueue();
          callback(queue);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
