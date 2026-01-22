// Supabase-based queue management
import { supabase, QueueItem } from './supabase';
import { TwilioSMSService } from './twilioSMSService';
import { EmailService } from './emailService';

export interface QueueItemClient {
  id: string;
  ticketNumber: number;
  name: string;
  phoneNumber: string;
  email: string;
  status: 'waiting' | 'called' | 'completed';
  timestamp: number;
}

// Convert Supabase format to client format
function toClientFormat(item: QueueItem): QueueItemClient {
  return {
    id: item.id,
    ticketNumber: item.ticket_number,
    name: item.name,
    phoneNumber: item.phone_number,
    email: item.email,
    status: item.status,
    timestamp: new Date(item.timestamp).getTime(),
  };
}

export class SupabaseQueueManager {
  // Add a new ticket to the queue
  static async addTicket(name: string, phoneNumber: string, email: string): Promise<QueueItemClient> {
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
        name,
        phone_number: phoneNumber,
        email,
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

    // Send SMS notification to the customer being called
    try {
      const formattedPhone = TwilioSMSService.formatPhoneNumber(nextTicket.phoneNumber);
      await TwilioSMSService.notifyCustomerTurn(
        nextTicket.name,
        formattedPhone,
        nextTicket.ticketNumber
      );
    } catch (error) {
      console.error('Failed to send SMS to current customer:', error);
      // Continue execution even if SMS fails
    }

    // Get the ticket after this one (will become position 1 - next in line)
    const followingTicket = waitingQueue.length > 1 ? waitingQueue[1] : null;

    // Send notifications to the next customer in line (position 1)
    if (followingTicket) {
      try {
        const formattedPhone = TwilioSMSService.formatPhoneNumber(followingTicket.phoneNumber);
        await TwilioSMSService.notifyCustomerNext(
          followingTicket.name,
          formattedPhone,
          followingTicket.ticketNumber
        );
      } catch (error) {
        console.error('Failed to send SMS to next customer:', error);
        // Continue execution even if SMS fails
      }

      // Send email notification to next customer (position 1)
      try {
        await EmailService.notifyNextInLine(
          followingTicket.name,
          followingTicket.email,
          followingTicket.ticketNumber
        );
      } catch (error) {
        console.error('Failed to send email to next customer:', error);
        // Continue execution even if email fails
      }
    }

    // Get the ticket at position 3 (index 2)
    const position3Ticket = waitingQueue.length > 2 ? waitingQueue[2] : null;

    // Send email notification to customer at position 3
    if (position3Ticket) {
      try {
        await EmailService.notifyPosition3(
          position3Ticket.name,
          position3Ticket.email,
          position3Ticket.ticketNumber
        );
      } catch (error) {
        console.error('Failed to send email to position 3 customer:', error);
        // Continue execution even if email fails
      }
    }

    // Mark the called ticket as completed after a brief delay to allow UI updates
    const TICKET_COMPLETION_DELAY_MS = 1000;
    setTimeout(async () => {
      try {
        const success = await this.updateTicketStatus(nextTicket.id, 'completed');
        if (!success) {
          console.error('Failed to mark ticket as completed');
        }
      } catch (error) {
        console.error('Failed to mark ticket as completed:', error);
      }
    }, TICKET_COMPLETION_DELAY_MS);

    return followingTicket;
  }

  // Get the most recently called ticket
  static async getCalledTicket(): Promise<QueueItemClient | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'called')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return toClientFormat(data);
  }

  // Search for tickets by phone number
  static async searchByPhone(phoneNumber: string): Promise<QueueItemClient[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error searching by phone:', error);
      return [];
    }

    return (data || []).map(toClientFormat);
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
