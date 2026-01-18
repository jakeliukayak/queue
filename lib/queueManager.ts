// Client-side queue management using localStorage
// In production, this would be replaced with Firebase Realtime Database

export interface QueueItem {
  id: string;
  ticketNumber: number;
  phoneNumber: string;
  status: 'waiting' | 'called' | 'completed';
  timestamp: number;
}

const QUEUE_KEY = 'queue_data';
const TICKET_NUMBER_KEY = 'current_ticket_number';

export class QueueManager {
  private static getQueue(): QueueItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private static saveQueue(queue: QueueItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  private static getCurrentTicketNumber(): number {
    if (typeof window === 'undefined') return 1;
    const num = localStorage.getItem(TICKET_NUMBER_KEY);
    return num ? parseInt(num, 10) : 1;
  }

  private static saveTicketNumber(num: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TICKET_NUMBER_KEY, num.toString());
  }

  static addTicket(phoneNumber: string): QueueItem {
    const queue = this.getQueue();
    const ticketNumber = this.getCurrentTicketNumber();
    
    const ticket: QueueItem = {
      id: `ticket-${Date.now()}-${Math.random()}`,
      ticketNumber,
      phoneNumber,
      status: 'waiting',
      timestamp: Date.now(),
    };
    
    queue.push(ticket);
    this.saveQueue(queue);
    this.saveTicketNumber(ticketNumber + 1);
    
    return ticket;
  }

  static getWaitingQueue(): QueueItem[] {
    const queue = this.getQueue();
    return queue
      .filter(item => item.status === 'waiting')
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  static removeTicket(ticketId: string): boolean {
    const queue = this.getQueue();
    const index = queue.findIndex(item => item.id === ticketId);
    
    if (index !== -1) {
      queue.splice(index, 1);
      this.saveQueue(queue);
      return true;
    }
    
    return false;
  }

  static updateTicketStatus(
    ticketId: string,
    status: 'waiting' | 'called' | 'completed'
  ): boolean {
    const queue = this.getQueue();
    const ticket = queue.find(item => item.id === ticketId);
    
    if (ticket) {
      ticket.status = status;
      this.saveQueue(queue);
      return true;
    }
    
    return false;
  }

  static callNext(): QueueItem | null {
    const waitingQueue = this.getWaitingQueue();
    
    if (waitingQueue.length === 0) {
      return null;
    }
    
    const nextTicket = waitingQueue[0];
    this.updateTicketStatus(nextTicket.id, 'called');
    
    // Get the ticket after this one to notify
    const followingTicket = waitingQueue.length > 1 ? waitingQueue[1] : null;
    
    // Remove the called ticket after a short delay
    setTimeout(() => {
      this.removeTicket(nextTicket.id);
    }, 1000);
    
    return followingTicket;
  }
}
