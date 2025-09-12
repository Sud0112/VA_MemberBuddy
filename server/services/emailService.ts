import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import { EmailTrackingService } from './emailTrackingService';
import { v4 as uuidv4 } from 'uuid';

// Initialize email services with API keys from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailData {
  to: string;
  subject: string;
  content: string;
  prospectName: string;
}

type EmailProvider = 'sendgrid' | 'resend' | 'test';

export class EmailService {
  private static getAvailableProvider(): { provider: EmailProvider; configured: boolean } {
    console.log('🔧 Email Service Configuration Check:');
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'configured ✅' : 'not set ❌');
    console.log('  SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'configured ✅' : 'not set ❌');
    
    if (process.env.RESEND_API_KEY) {
      console.log('  Selected provider: Resend');
      return { provider: 'resend', configured: true };
    }
    if (process.env.SENDGRID_API_KEY) {
      console.log('  Selected provider: SendGrid');
      return { provider: 'sendgrid', configured: true };
    }
    console.log('  Selected provider: Test mode');
    return { provider: 'test', configured: false };
  }

  static async sendSalesEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string; trackingId?: string }> {
    const { provider, configured } = this.getAvailableProvider();
    
    try {
      // Generate unique tracking ID
      const trackingId = uuidv4();
      
      // Create tracking URLs
      const baseUrl = process.env.REPLIT_DOMAIN ? `https://${process.env.REPLIT_DOMAIN}` : 'http://localhost:5000';
      const trackingUrl = `${baseUrl}/api/track/${trackingId}`;
      const virtualTourUrl = `${baseUrl}/api/virtual-tour/${trackingId}`;
      
      // Replace placeholders in email content with tracking links
      const processedContent = emailData.content
        .replace(/\[Virgin Active Virtual Tour Link\]/g, virtualTourUrl)
        .replace(/\[PROSPECT_NAME\]/g, emailData.prospectName)
        .replace(/\[UNSUBSCRIBE_LINK\]/g, 'https://www.virginactive.com/unsubscribe')
        .replace(/\[HOME_PAGE_LINK\]/g, trackingUrl);

      // Add home page link if not already present
      const enhancedContent = processedContent.includes(trackingUrl) ? processedContent : 
        `${processedContent}\n\nExplore Virgin Active: ${trackingUrl}`;

      const result = await (async () => {
        switch (provider) {
          case 'resend':
            return await this.sendWithResend(emailData, enhancedContent);
          case 'sendgrid':
            return await this.sendWithSendGrid(emailData, enhancedContent);
          case 'test':
          default:
            return await this.sendTestEmail(emailData, enhancedContent);
        }
      })();

      // Log email interaction if sending was successful
      if (result.success) {
        await EmailTrackingService.logEmailSent(
          emailData.to,
          emailData.prospectName,
          emailData.subject,
          trackingId,
          {
            provider,
            messageId: result.messageId,
            timestamp: new Date().toISOString(),
          }
        );
      }

      return {
        ...result,
        trackingId
      };
    } catch (error: any) {
      console.error(`Email service error (${provider}):`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  private static async sendWithResend(emailData: EmailData, processedContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!resend) {
      return {
        success: false,
        error: 'Resend not configured. Please set RESEND_API_KEY environment variable.'
      };
    }

    const { data, error } = await resend.emails.send({
      from: 'Virgin Active <no-reply@virginactive.com>',
      to: emailData.to,
      subject: emailData.subject,
      text: processedContent,
      html: this.convertToHtml(processedContent),
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send email via Resend'
      };
    }

    return {
      success: true,
      messageId: data?.id
    };
  }

  private static async sendWithSendGrid(emailData: EmailData, processedContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const msg = {
      to: emailData.to,
      from: {
        email: 'no-reply@virginactive.com',
        name: 'Virgin Active Sales Team'
      },
      subject: emailData.subject,
      text: processedContent,
      html: this.convertToHtml(processedContent),
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      }
    };

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string
    };
  }

  private static async sendTestEmail(emailData: EmailData, processedContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Simulate email sending for testing/demo purposes
    console.log('📧 TEST EMAIL MODE - Email would be sent:');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Content: ${processedContent.substring(0, 100)}...`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `test-${Date.now()}`
    };
  }

  private static convertToHtml(textContent: string): string {
    // Convert text email to HTML with Virgin Active branding
    const lines = textContent.split('\n');
    const htmlLines = lines.map(line => {
      if (line.trim() === '') return '<br>';
      if (line.startsWith('Subject:')) {
        return `<h2 style="color: #e60012; font-family: Arial, sans-serif;">${line.replace('Subject:', '').trim()}</h2>`;
      }
      return `<p style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${line}</p>`;
    });

    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #e60012; padding: 20px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">VIRGIN ACTIVE</h1>
        </div>
        <div style="padding: 20px;">
          ${htmlLines.join('')}
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px; border-top: 3px solid #e60012;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © Virgin Active. This email was sent from our Sales Team.<br>
            <a href="https://www.virginactive.com/unsubscribe" style="color: #e60012;">Unsubscribe</a> | 
            <a href="https://www.virginactive.com/privacy" style="color: #e60012;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `;
  }

  static getEmailServiceStatus(): { provider: EmailProvider; configured: boolean; description: string } {
    const { provider, configured } = this.getAvailableProvider();
    
    const descriptions = {
      'resend': configured ? 'Resend configured ✅' : 'Resend not configured',
      'sendgrid': configured ? 'SendGrid configured ✅' : 'SendGrid not configured', 
      'test': 'Test mode - emails will be logged but not sent'
    };
    
    return {
      provider,
      configured,
      description: descriptions[provider]
    };
  }
}