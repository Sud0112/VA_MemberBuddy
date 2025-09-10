import { db } from "../db";
import { emailInteractions, type EmailInteraction, type InsertEmailInteraction } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class EmailTrackingService {
  // Create email interaction record
  static async createEmailInteraction(interaction: InsertEmailInteraction): Promise<EmailInteraction> {
    const [created] = await db
      .insert(emailInteractions)
      .values(interaction)
      .returning();
    return created;
  }

  // Get all interactions for a prospect
  static async getEmailInteractionsByProspect(email: string): Promise<EmailInteraction[]> {
    return await db
      .select()
      .from(emailInteractions)
      .where(eq(emailInteractions.prospectEmail, email))
      .orderBy(desc(emailInteractions.createdAt));
  }

  // Get interaction by tracking ID
  static async getEmailInteractionByTrackingId(trackingId: string): Promise<EmailInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(emailInteractions)
      .where(eq(emailInteractions.trackingId, trackingId));
    return interaction;
  }

  // Update email interaction
  static async updateEmailInteraction(id: string, updates: Partial<EmailInteraction>): Promise<void> {
    await db
      .update(emailInteractions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailInteractions.id, id));
  }

  // Log when an email is sent
  static async logEmailSent(
    prospectEmail: string, 
    prospectName: string, 
    subject: string, 
    trackingId: string,
    metadata: any = {}
  ): Promise<EmailInteraction> {
    return await this.createEmailInteraction({
      prospectEmail,
      prospectName,
      interactionType: 'email_sent',
      emailSubject: subject,
      trackingId,
      metadata,
    });
  }

  // Log when a link is clicked
  static async logLinkClicked(trackingId: string, metadata: any = {}): Promise<void> {
    const interaction = await this.getEmailInteractionByTrackingId(trackingId);
    if (interaction) {
      // Create new interaction for link click
      await this.createEmailInteraction({
        prospectEmail: interaction.prospectEmail,
        prospectName: interaction.prospectName,
        interactionType: 'link_clicked',
        emailSubject: interaction.emailSubject,
        trackingId,
        metadata: { ...(interaction.metadata as any), ...metadata },
      });
    }
  }

  // Log when virtual tour is viewed
  static async logTourViewed(trackingId: string, metadata: any = {}): Promise<void> {
    const interaction = await this.getEmailInteractionByTrackingId(trackingId);
    if (interaction) {
      // Create new interaction for tour view
      await this.createEmailInteraction({
        prospectEmail: interaction.prospectEmail,
        prospectName: interaction.prospectName,
        interactionType: 'tour_viewed',
        emailSubject: interaction.emailSubject,
        trackingId,
        metadata: { ...(interaction.metadata as any), ...metadata },
      });
    }
  }

  // Generate tracking URL for emails
  static generateTrackingUrl(trackingId: string, baseUrl: string = ''): string {
    return `${baseUrl}/?track=${trackingId}`;
  }

  // Get engagement summary for a prospect
  static async getProspectEngagementSummary(email: string): Promise<{
    totalInteractions: number;
    emailsSent: number;
    linksClicked: number;
    toursViewed: number;
    lastInteraction?: Date;
  }> {
    const interactions = await this.getEmailInteractionsByProspect(email);
    
    const summary = {
      totalInteractions: interactions.length,
      emailsSent: interactions.filter(i => i.interactionType === 'email_sent').length,
      linksClicked: interactions.filter(i => i.interactionType === 'link_clicked').length,
      toursViewed: interactions.filter(i => i.interactionType === 'tour_viewed').length,
      lastInteraction: interactions.length > 0 ? interactions[0].createdAt || undefined : undefined,
    };

    return summary;
  }
}