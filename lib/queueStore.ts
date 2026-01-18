// Mock queue store (in production, this would be Firebase Realtime Database or Firestore)
interface QueueItem {
  id: string;
  ticketNumber: number;
  phoneNumber: string;
  status: 'waiting' | 'called' | 'completed';
  timestamp: number;
}

class QueueStore {
  private queue: QueueItem[] = [];
  private currentTicketNumber = 1;

  addTicket(phoneNumber: string): QueueItem {
    const ticket: QueueItem = {
      id: `ticket-${Date.now()}-${Math.random()}`,
      ticketNumber: this.currentTicketNumber++,
      phoneNumber,
      status: 'waiting',
      timestamp: Date.now(),
    };
    this.queue.push(ticket);
    return ticket;
  }

  getQueue(): QueueItem[] {
    return this.queue.filter(item => item.status === 'waiting');
  }

  getNextTicket(): QueueItem | null {
    const waitingTickets = this.getQueue();
    return waitingTickets.length > 0 ? waitingTickets[0] : null;
  }

  removeTicket(ticketId: string): boolean {
    const index = this.queue.findIndex(item => item.id === ticketId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  updateTicketStatus(ticketId: string, status: 'waiting' | 'called' | 'completed'): boolean {
    const ticket = this.queue.find(item => item.id === ticketId);
    if (ticket) {
      ticket.status = status;
      return true;
    }
    return false;
  }
}

// Export a singleton instance
export const queueStore = new QueueStore();
