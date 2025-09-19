import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, seedLoyaltyOffers, seedDummyUsers } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertLoyaltyOfferSchema,
  insertOfferRedemptionSchema,
  insertOutreachActionSchema,
  insertChatConversationSchema,
  insertWorkoutPlanSchema,
  insertLeadSchema,
} from "@shared/schema";
import {
  generateRetentionStrategies,
  generateLoyaltyOffers,
  sendMessageToChat,
  generateWorkoutPlan,
  generateSalesEmail,
} from "./services/geminiService";
import { EmailService } from "./services/emailService";
import { EmailTrackingService } from "./services/emailTrackingService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Role toggle endpoint for testing personas
  // REMOVED: /api/user/toggle-role endpoint due to security vulnerability
  // This endpoint allowed privilege escalation where any user could change their role to staff
  // Role changes should only be done by administrators through secure admin interfaces

  // Loyalty offers endpoints
  app.get('/api/loyalty-offers', isAuthenticated, async (req, res) => {
    try {
      const offers = await storage.getLoyaltyOffers();
      res.json(offers);
    } catch (error) {
      console.error("Error fetching loyalty offers:", error);
      res.status(500).json({ message: "Failed to fetch loyalty offers" });
    }
  });

  app.post('/api/loyalty-offers', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const offerData = insertLoyaltyOfferSchema.parse({
        ...req.body,
        createdBy: user.id,
      });

      const offer = await storage.createLoyaltyOffer(offerData);
      res.json(offer);
    } catch (error) {
      console.error("Error creating loyalty offer:", error);
      res.status(500).json({ message: "Failed to create loyalty offer" });
    }
  });

  app.delete('/api/loyalty-offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      await storage.deactivateLoyaltyOffer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating loyalty offer:", error);
      res.status(500).json({ message: "Failed to deactivate loyalty offer" });
    }
  });

  // Offer redemption endpoints
  app.get('/api/user/redemptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const redemptions = await storage.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Error fetching user redemptions:", error);
      res.status(500).json({ message: "Failed to fetch redemptions" });
    }
  });

  app.post('/api/offers/:offerId/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'member') {
        return res.status(403).json({ message: "Member access required" });
      }

      const offers = await storage.getLoyaltyOffers();
      const offer = offers.find(o => o.id === req.params.offerId);

      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      if ((user.loyaltyPoints || 0) < offer.points) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Check if already redeemed
      const userRedemptions = await storage.getUserRedemptions(userId);
      const alreadyRedeemed = userRedemptions.some(r => r.offerId === offer.id);

      if (alreadyRedeemed) {
        return res.status(400).json({ message: "Offer already redeemed" });
      }

      const redemptionData = insertOfferRedemptionSchema.parse({
        userId,
        offerId: offer.id,
        pointsSpent: offer.points,
      });

      const redemption = await storage.redeemOffer(redemptionData);
      res.json(redemption);
    } catch (error) {
      console.error("Error redeeming offer:", error);
      res.status(500).json({ message: "Failed to redeem offer" });
    }
  });

  // Member management endpoints (Staff only)
  app.get('/api/staff/at-risk-members', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const atRiskMembers = await storage.getAtRiskMembers();
      res.json(atRiskMembers);
    } catch (error) {
      console.error("Error fetching at-risk members:", error);
      res.status(500).json({ message: "Failed to fetch at-risk members" });
    }
  });

  app.get('/api/staff/member/:memberId/outreach-history', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const history = await storage.getMemberOutreachHistory(req.params.memberId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching outreach history:", error);
      res.status(500).json({ message: "Failed to fetch outreach history" });
    }
  });

  app.post('/api/staff/outreach-action', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const actionData = insertOutreachActionSchema.parse({
        ...req.body,
        staffId: user.id,
      });

      const action = await storage.createOutreachAction(actionData);
      res.json(action);
    } catch (error) {
      console.error("Error creating outreach action:", error);
      res.status(500).json({ message: "Failed to create outreach action" });
    }
  });

  // AI-powered endpoints
  app.post('/api/ai/retention-strategies', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { memberProfile } = req.body;
      if (!memberProfile) {
        return res.status(400).json({ message: "Member profile is required" });
      }

      const strategies = await generateRetentionStrategies(memberProfile);
      res.json({ strategies });
    } catch (error) {
      console.error("Error generating retention strategies:", error);
      res.status(500).json({ message: "Failed to generate retention strategies" });
    }
  });

  app.post('/api/ai/generate-loyalty-offers', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { targetCriteria } = req.body;
      if (!targetCriteria) {
        return res.status(400).json({ message: "Target criteria is required" });
      }

      const offers = await generateLoyaltyOffers(targetCriteria);
      res.json(offers);
    } catch (error) {
      console.error("Error generating loyalty offers:", error);
      res.status(500).json({ message: "Failed to generate loyalty offers" });
    }
  });

  app.post('/api/ai/workout-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'member') {
        return res.status(403).json({ message: "Member access required" });
      }

      const { goals, healthData } = req.body;
      if (!goals) {
        return res.status(400).json({ message: "Goals are required" });
      }
      if (!healthData) {
        return res.status(400).json({ message: "Health data is required" });
      }

      const workoutPlan = await generateWorkoutPlan(goals, healthData);

      // Save to database
      const planData = insertWorkoutPlanSchema.parse({
        userId,
        title: workoutPlan.planTitle,
        goals: `${goals} | Health Profile: Age ${healthData.age}, Fitness Level: ${healthData.fitnessLevel}, Experience: ${healthData.exerciseExperience}${healthData.medicalConditions ? ', Medical Notes: ' + healthData.medicalConditions : ''}`,
        weeklySchedule: workoutPlan.weeklySchedule,
      });

      await storage.createWorkoutPlan(planData);

      res.json(workoutPlan);
    } catch (error) {
      console.error("Error generating workout plan:", error);
      res.status(500).json({ message: "Failed to generate workout plan" });
    }
  });

  // Churn email endpoints
  app.get('/api/staff/churn-emails', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const emails = await storage.getPendingChurnEmails();
      res.json(emails);
    } catch (error) {
      console.error("Error fetching churn emails:", error);
      res.status(500).json({ message: "Failed to fetch churn emails" });
    }
  });

  app.post('/api/staff/churn-emails/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const email = await storage.approveChurnEmail(req.params.id, user.id);
      res.json(email);
    } catch (error) {
      console.error("Error approving churn email:", error);
      res.status(500).json({ message: "Failed to approve churn email" });
    }
  });

  app.post('/api/staff/churn-emails/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const email = await storage.rejectChurnEmail(req.params.id, user.id);
      res.json(email);
    } catch (error) {
      console.error("Error rejecting churn email:", error);
      res.status(500).json({ message: "Failed to reject churn email" });
    }
  });

  app.post('/api/staff/churn-emails/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const email = await storage.markChurnEmailSent(req.params.id);
      res.json(email);
    } catch (error) {
      console.error("Error marking churn email as sent:", error);
      res.status(500).json({ message: "Failed to mark churn email as sent" });
    }
  });

  app.post('/api/staff/churn-emails/generate', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { memberId } = req.body;
      if (!memberId) {
        return res.status(400).json({ message: "Member ID is required" });
      }

      const email = await storage.checkAndCreateChurnEmail(memberId);
      res.json(email);
    } catch (error) {
      console.error("Error generating churn email:", error);
      res.status(500).json({ message: "Failed to generate churn email" });
    }
  });

  // Chatbot endpoints
  app.post('/api/chat/message', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and session ID are required" });
      }

      // Get existing conversation or create new one
      let conversation = await storage.getChatConversation(sessionId);
      if (!conversation) {
        conversation = await storage.createChatConversation({
          sessionId,
          messages: [],
        });
      }

      const response = await sendMessageToChat(message, conversation.messages as any[]);

      // Update conversation with new messages
      const updatedMessages = [
        ...conversation.messages as any[],
        { role: 'user', content: message },
        { role: 'assistant', content: response.content }
      ];

      await storage.updateChatConversation(sessionId, {
        messages: updatedMessages,
        contactEmail: response.contactEmail || conversation.contactEmail,
        contactName: response.contactName || conversation.contactName,
        tourBooked: response.tourBooked || conversation.tourBooked,
      });

      res.json(response);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Dashboard metrics endpoint
  app.get('/api/staff/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const atRiskMembers = await storage.getAtRiskMembers();

      // Mock metrics for demo (in production, these would be calculated from real data)
      const metrics = {
        totalMembers: 2847,
        atRiskMembers: atRiskMembers.length,
        churnRate: "3.2%",
        outreachToday: 8,
      };

      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Sales email generation endpoint
  app.post('/api/ai/sales-email', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { prompt, systemInstruction, model } = req.body;

      if (!prompt || !systemInstruction) {
        return res.status(400).json({ message: "Prompt and system instruction are required" });
      }

      const emailContent = await generateSalesEmail(prompt, systemInstruction, model);
      res.json(emailContent);
    } catch (error) {
      console.error("Error generating sales email:", error);
      res.status(500).json({ message: "Failed to generate sales email" });
    }
  });

  // AI Chat endpoint for churn analysis
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Create a contextual conversation for churn analysis
      const conversationHistory = [
        {
          role: 'system',
          content: `You are a Customer Churn Analysis AI assistant for a premium health and wellness club. 
          Your role is to help staff with customer retention insights, churn prevention strategies, and data analysis.
          Be professional, analytical, and provide actionable recommendations.
          
          Context: ${context || 'general_churn_analysis'}`
        }
      ];

      const result = await sendMessageToChat(message, conversationHistory);
      res.json({ response: result.content });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  // Lead capture endpoint - PUBLIC route for ChatBot (no authentication required)
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, phone, fitnessGoal, frequency, location, language, sessionId } = req.body;

      if (!name || !email) {
        return res.status(400).json({ 
          success: false, 
          error: "Name and email are required" 
        });
      }

      // Save lead to dedicated leads table
      const leadData = insertLeadSchema.parse({
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: email.toLowerCase(),
        phone,
        fitnessGoal,
        frequency,
        location,
        language,
        sessionId,
        status: 'new'
      });

      // Use direct DB insert for now (TODO: add to storage interface)  
      const { db } = await import('./db');
      const { leads } = await import('@shared/schema');
      const [savedLead] = await db.insert(leads).values(leadData).returning();

      // Save the conversation data with lead details
      const conversationData = {
        sessionId,
        messages: [{
          role: 'system',
          content: `Lead captured: ${name} (${email}) - Fitness Goal: ${fitnessGoal}, Frequency: ${frequency}, Location: ${location}, Language: ${language}`
        }],
        isComplete: true,
        contactEmail: email,
        contactName: name,
        tourBooked: false
      };

      // Save or update the conversation
      const existingConversation = await storage.getChatConversation(sessionId);
      if (existingConversation) {
        await storage.updateChatConversation(sessionId, conversationData);
      } else {
        await storage.createChatConversation(conversationData);
      }

      console.log("New lead saved to CRM:", {
        id: savedLead.id,
        name,
        email,
        phone,
        fitnessGoal,
        frequency,
        location,
        language,
        sessionId,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        success: true, 
        message: "Lead saved to CRM successfully",
        leadId: savedLead.id
      });
    } catch (error) {
      console.error("Error saving lead to CRM:", error);
      res.status(500).json({ success: false, error: "Failed to save lead to CRM" });
    }
  });

  // Staff notifications endpoint - shows new leads and other alerts
  app.get('/api/staff/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const notifications = [];

      // Get recent leads from dedicated leads table
      const { db } = await import('./db');
      const { leads } = await import('@shared/schema');
      const { sql, gte } = await import('drizzle-orm');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLeads = await db.select().from(leads).where(
        gte(leads.createdAt, twentyFourHoursAgo)
      ).orderBy(sql`${leads.createdAt} DESC`);

      // Add lead notifications
      recentLeads.forEach(lead => {
        notifications.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: 'New Lead Captured! 🎯',
          message: `${lead.firstName} ${lead.lastName} (${lead.email}) just completed a chat conversation and is interested in membership.`,
          timestamp: lead.createdAt,
          read: false,
          urgent: true,
          leadId: lead.id
        });
      });

      // Get at-risk members for notifications
      const atRiskMembers = await storage.getAtRiskMembers();
      const criticalMembers = atRiskMembers.slice(0, 3); // Show only top 3 most critical

      criticalMembers.forEach((member, index) => {
        notifications.push({
          id: `risk-${member.id}`,
          type: 'alert',
          title: 'Member At Risk',
          message: `${member.firstName} ${member.lastName} hasn't visited recently. Consider outreach.`,
          timestamp: new Date(Date.now() - (index + 1) * 60 * 60 * 1000),
          read: false,
          urgent: index === 0, // Mark first one as urgent
          memberId: member.id
        });
      });

      // Add some general business notifications
      notifications.push({
        id: 'business-1',
        type: 'milestone',
        title: 'Revenue Milestone',
        message: 'Monthly revenue target exceeded by 12%! Great work team.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      });

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/send-email', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { to, subject, content, prospectName } = req.body;

      if (!to || !subject || !content || !prospectName) {
        return res.status(400).json({
          message: "Email address, subject, content, and prospect name are required"
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return res.status(400).json({ message: "Invalid email address format" });
      }

      const result = await EmailService.sendSalesEmail({
        to,
        subject,
        content,
        prospectName
      });

      if (result.success) {
        res.json({
          success: true,
          messageId: result.messageId,
          message: "Email sent successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to send email"
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Email service status endpoint
  app.get('/api/email/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const status = EmailService.getEmailServiceStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching email service status:", error);
      res.status(500).json({ message: "Failed to fetch email service status" });
    }
  });

  // Email tracking endpoints
  app.get('/api/track/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;

      // Log the link click
      await EmailTrackingService.logLinkClicked(trackingId, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      // Redirect to virtual tour page with tracking parameter
      res.redirect(`/virtual-tour?track=${trackingId}`);
    } catch (error) {
      console.error("Error tracking email click:", error);
      // Still redirect to home page even if tracking fails
      res.redirect('/');
    }
  });

  // Virtual tour endpoint
  app.get('/api/virtual-tour/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;

      // Log the tour view
      await EmailTrackingService.logTourViewed(trackingId, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      // Get prospect information
      const interaction = await EmailTrackingService.getEmailInteractionByTrackingId(trackingId);

      if (interaction) {
        res.json({
          success: true,
          prospectName: interaction.prospectName,
          prospectEmail: interaction.prospectEmail,
          trackingId,
          message: 'Virtual tour tracking recorded'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Tracking ID not found'
        });
      }
    } catch (error) {
      console.error("Error tracking virtual tour:", error);
      res.status(500).json({
        success: false,
        message: 'Failed to track virtual tour'
      });
    }
  });

  // Get prospect engagement data
  app.get('/api/prospect/:email/engagement', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { email } = req.params;
      const summary = await EmailTrackingService.getProspectEngagementSummary(email);
      const interactions = await EmailTrackingService.getEmailInteractionsByProspect(email);

      res.json({
        summary,
        interactions
      });
    } catch (error) {
      console.error("Error fetching prospect engagement:", error);
      res.status(500).json({ message: "Failed to fetch engagement data" });
    }
  });

  // Member notifications endpoint - generates personalized notifications based on real data
  app.get('/api/member/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'member') {
        return res.status(403).json({ message: "Member access required" });
      }

      const notifications = [];
      const now = new Date();

      // Loyalty points milestone notifications
      const loyaltyPoints = user.loyaltyPoints || 0;
      if (loyaltyPoints >= 500) {
        notifications.push({
          id: `loyalty-milestone-${user.id}`,
          type: 'milestone',
          title: 'VIP Status Achieved! 👑',
          message: `Congratulations! You've earned ${loyaltyPoints} loyalty points and achieved VIP status. Exclusive rewards await you!`,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        });
      } else if (loyaltyPoints >= 250) {
        notifications.push({
          id: `loyalty-progress-${user.id}`,
          type: 'achievement',
          title: 'Points Milestone! 🎯',
          message: `Amazing progress! You've earned ${loyaltyPoints} loyalty points. Keep it up to unlock more rewards!`,
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: false
        });
      } else if (loyaltyPoints >= 100) {
        notifications.push({
          id: `loyalty-reward-${user.id}`,
          type: 'reward',
          title: 'Points Earned! 💰',
          message: `You've earned ${loyaltyPoints} loyalty points! Redeem them for exclusive rewards in the members area.`,
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: true
        });
      }

      // Membership type specific notifications
      if (user.membershipType === 'Premium') {
        notifications.push({
          id: `premium-perk-${user.id}`,
          type: 'reward',
          title: 'Premium Member Perks! ⭐',
          message: 'As a Premium member, you have access to exclusive classes and 24/7 gym access. Book your sessions now!',
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true
        });
      } else if (user.membershipType === 'Student') {
        notifications.push({
          id: `student-discount-${user.id}`,
          type: 'reward',
          title: 'Student Discount Applied! 🎓',
          message: 'Your student membership is active with special pricing. Make the most of your fitness journey!',
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          read: true
        });
      }

      // Visit-based notifications
      const daysSinceLastVisit = user.lastVisit 
        ? Math.floor((now.getTime() - new Date(user.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      if (daysSinceLastVisit === null) {
        notifications.push({
          id: `welcome-${user.id}`,
          type: 'milestone',
          title: 'Welcome to Member Buddy! 🚀',
          message: 'Your fitness journey starts here! Book your first session and get started with personalized workout plans.',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          read: false
        });
      } else if (daysSinceLastVisit >= 7) {
        notifications.push({
          id: `comeback-${user.id}`,
          type: 'alert',
          title: 'We miss you! 💪',
          message: `It's been ${daysSinceLastVisit} days since your last visit. Come back and continue your fitness journey!`,
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: false
        });
      } else if (daysSinceLastVisit <= 1) {
        notifications.push({
          id: `streak-${user.id}`,
          type: 'achievement',
          title: 'Great Consistency! 🔥',
          message: 'You\'re maintaining an excellent workout routine! Keep up the amazing work.',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: false
        });
      }

      // General fitness notifications
      notifications.push({
        id: `weekly-challenge-${user.id}`,
        type: 'milestone',
        title: 'Weekly Challenge Available! 💪',
        message: 'New weekly fitness challenge is now available. Complete it to earn bonus loyalty points!',
        timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000), // 18 hours ago
        read: false
      });

      // Sort by timestamp (newest first) and limit to 5 most recent
      notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recentNotifications = notifications.slice(0, 5);

      res.json(recentNotifications);
    } catch (error) {
      console.error("Error fetching member notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Simple demo authentication endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: "Email and password are required" 
        });
      }

      // Simple demo password - for security, use proper hashing in production
      const demoPassword = "demo123";
      if (password !== demoPassword) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid password. Use 'demo123' for all users." 
        });
      }

      // Look up user in database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: "User not found. Try a staff email like amanda.smith@clubpulse.co.uk" 
        });
      }

      // Return user data for successful login
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          membershipType: user.membershipType
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}