// Email notification service using Resend via Supabase Edge Function
import { supabase } from './supabase';

export class EmailService {
  /**
   * Send an email notification
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param htmlContent - HTML content of the email
   */
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: htmlContent,
        },
      });

      if (error) {
        console.error('Failed to send email:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send notification when customer is 3rd in line
   * @param name - Customer name
   * @param email - Customer email
   * @param ticketNumber - Customer ticket number
   */
  static async notifyPosition3(
    name: string,
    email: string,
    ticketNumber: number
  ): Promise<boolean> {
    const subject = `You're 3rd in Line - Ticket #${ticketNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .ticket-number { font-size: 48px; font-weight: bold; color: #1f2937; text-align: center; margin: 20px 0; }
            .message { font-size: 16px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MT2.0 Queuing System</h1>
            </div>
            <div class="content">
              <p class="message">Hi ${name},</p>
              <p class="message">Great news! You're getting close. You are currently <strong>3rd in line</strong>.</p>
              <div class="ticket-number">#${ticketNumber}</div>
              <p class="message">Please be ready for your CV consultation session with our head coach Jake. You'll receive another notification when you're next in line.</p>
              <p class="message">Thank you for your patience!</p>
            </div>
            <div class="footer">
              <p>MT2.0 Queuing System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, htmlContent);
  }

  /**
   * Send notification when customer is next in line
   * @param name - Customer name
   * @param email - Customer email
   * @param ticketNumber - Customer ticket number
   */
  static async notifyNextInLine(
    name: string,
    email: string,
    ticketNumber: number
  ): Promise<boolean> {
    const subject = `You're Next! - Ticket #${ticketNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; border: 2px solid #22c55e; }
            .ticket-number { font-size: 48px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
            .message { font-size: 16px; margin: 20px 0; }
            .alert { background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MT2.0 Queuing System</h1>
            </div>
            <div class="content">
              <p class="message">Hi ${name},</p>
              <div class="alert">
                <strong>🎉 You're next in line!</strong>
              </div>
              <div class="ticket-number">#${ticketNumber}</div>
              <p class="message">Please be ready to proceed to the consultation area. Your session with our head coach Jake will begin shortly.</p>
              <p class="message">Thank you for waiting!</p>
            </div>
            <div class="footer">
              <p>MT2.0 Queuing System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, htmlContent);
  }
}
