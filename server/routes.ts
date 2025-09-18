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
  app.post('/api/user/toggle-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;

      if (!role || !['member', 'staff'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "member" or "staff"' });
      }

      const updatedUser = await storage.upsertUser({
        id: userId,
        role,
        updatedAt: new Date()
      });

      res.json({ message: 'Role updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error toggling user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

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

  // Email sending endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, phone, fitnessGoal, frequency, location, language, sessionId } = req.body;

      // In a real application, you would save this to a database
      console.log("New lead captured:", {
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

      res.json({ success: true, message: "Lead saved successfully" });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(500).json({ success: false, error: "Failed to save lead" });
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

  const httpServer = createServer(app);
  return httpServer;
}