// Twilio SMS notification service using Supabase Edge Function
import { supabase } from './supabase';

export class TwilioSMSService {
  /**
   * Send an SMS notification to a phone number
   * @param phoneNumber - The recipient's phone number (E.164 format recommended, e.g., +1234567890)
   * @param message - The message to send
   */
  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: phoneNumber,
          message: message,
        },
      });

      if (error) {
        console.error('Failed to send SMS:', error);
        return false;
      }

      console.log('SMS sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send notification when it's the customer's turn
   * @param name - Customer name
   * @param phoneNumber - Customer phone number
   * @param ticketNumber - Customer ticket number
   */
  static async notifyCustomerTurn(
    name: string,
    phoneNumber: string,
    ticketNumber: number
  ): Promise<boolean> {
    const message = `Hi ${name}! It's your turn now. Your ticket number is #${ticketNumber}. Please proceed to the consultation area. - MT2.0 Queuing System`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send notification when customer is next in line
   * @param name - Customer name
   * @param phoneNumber - Customer phone number
   * @param ticketNumber - Customer ticket number
   */
  static async notifyCustomerNext(
    name: string,
    phoneNumber: string,
    ticketNumber: number
  ): Promise<boolean> {
    const message = `Hi ${name}! You're next in line. Your ticket number is #${ticketNumber}. Please be ready. - MT2.0 Queuing System`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Format phone number to E.164 format if needed
   * This is a simple helper - in production, use a library like libphonenumber-js
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // If it already starts with +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add + and assume US country code if 10 digits
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Default: just add + prefix
    return `+${digits}`;
  }
}
