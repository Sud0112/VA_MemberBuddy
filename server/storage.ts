import {
  users,
  loyaltyOffers,
  offerRedemptions,
  outreachActions,
  chatConversations,
  workoutPlans,
  churnEmails,
  type User,
  type UpsertUser,
  type LoyaltyOffer,
  type InsertLoyaltyOffer,
  type OfferRedemption,
  type InsertOfferRedemption,
  type OutreachAction,
  type InsertOutreachAction,
  type ChatConversation,
  type InsertChatConversation,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type ChurnEmail,
  type InsertChurnEmail,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllMembers(): Promise<User[]>;
  getAllStaff(): Promise<User[]>;
  
  // Loyalty operations
  getLoyaltyOffers(): Promise<LoyaltyOffer[]>;
  createLoyaltyOffer(offer: InsertLoyaltyOffer): Promise<LoyaltyOffer>;
  deactivateLoyaltyOffer(id: string): Promise<void>;
  getUserRedemptions(userId: string): Promise<OfferRedemption[]>;
  redeemOffer(redemption: InsertOfferRedemption): Promise<OfferRedemption>;
  
  // Member management
  getAtRiskMembers(): Promise<User[]>;
  updateUserLastVisit(userId: string): Promise<void>;
  updateUserLoyaltyPoints(userId: string, points: number): Promise<void>;
  
  // Outreach operations
  createOutreachAction(action: InsertOutreachAction): Promise<OutreachAction>;
  getMemberOutreachHistory(memberId: string): Promise<OutreachAction[]>;
  
  // Chat operations
  getChatConversation(sessionId: string): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(sessionId: string, updates: Partial<ChatConversation>): Promise<void>;
  
  // Workout plans
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  
  // Churn email operations
  createChurnEmail(email: InsertChurnEmail): Promise<ChurnEmail>;
  getPendingChurnEmails(): Promise<ChurnEmail[]>;
  getChurnEmailsByMember(memberId: string): Promise<ChurnEmail[]>;
  approveChurnEmail(emailId: string, staffId: string): Promise<ChurnEmail>;
  rejectChurnEmail(emailId: string, staffId: string): Promise<ChurnEmail>;
  markChurnEmailSent(emailId: string): Promise<ChurnEmail>;
  getRiskLevel(member: User): { level: 'low' | 'medium' | 'high', band: string, percentage: number };
  checkAndCreateChurnEmail(memberId: string): Promise<ChurnEmail | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getAllMembers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "member"))
      .orderBy(users.createdAt);
  }

  async getAllStaff(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "staff"))
      .orderBy(users.createdAt);
  }

  // Loyalty operations
  async getLoyaltyOffers(): Promise<LoyaltyOffer[]> {
    return await db
      .select()
      .from(loyaltyOffers)
      .where(eq(loyaltyOffers.isActive, true))
      .orderBy(loyaltyOffers.points);
  }

  async createLoyaltyOffer(offer: InsertLoyaltyOffer): Promise<LoyaltyOffer> {
    const [newOffer] = await db
      .insert(loyaltyOffers)
      .values(offer)
      .returning();
    return newOffer;
  }

  async deactivateLoyaltyOffer(id: string): Promise<void> {
    await db
      .update(loyaltyOffers)
      .set({ isActive: false })
      .where(eq(loyaltyOffers.id, id));
  }

  async getUserRedemptions(userId: string): Promise<OfferRedemption[]> {
    return await db
      .select()
      .from(offerRedemptions)
      .where(eq(offerRedemptions.userId, userId))
      .orderBy(desc(offerRedemptions.redeemedAt));
  }

  async redeemOffer(redemption: InsertOfferRedemption): Promise<OfferRedemption> {
    const [newRedemption] = await db
      .insert(offerRedemptions)
      .values(redemption)
      .returning();
    
    // Deduct points from user
    await db
      .update(users)
      .set({ 
        loyaltyPoints: sql`${users.loyaltyPoints} - ${redemption.pointsSpent}` 
      })
      .where(eq(users.id, redemption.userId));
    
    return newRedemption;
  }

  // Member management
  async getAtRiskMembers(): Promise<User[]> {
    // Simulate churn risk calculation - members who haven't visited in 5+ days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "member"),
          sql`${users.lastVisit} < ${fiveDaysAgo} OR ${users.lastVisit} IS NULL`
        )
      )
      .orderBy(desc(users.lastVisit));
  }

  async updateUserLastVisit(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastVisit: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserLoyaltyPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ loyaltyPoints: points })
      .where(eq(users.id, userId));
  }

  // Outreach operations
  async createOutreachAction(action: InsertOutreachAction): Promise<OutreachAction> {
    const [newAction] = await db
      .insert(outreachActions)
      .values(action)
      .returning();
    return newAction;
  }

  async getMemberOutreachHistory(memberId: string): Promise<OutreachAction[]> {
    const result = await db
      .select({
        id: outreachActions.id,
        memberId: outreachActions.memberId,
        staffId: outreachActions.staffId,
        actionType: outreachActions.actionType,
        notes: outreachActions.notes,
        createdAt: outreachActions.createdAt,
        staffName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      })
      .from(outreachActions)
      .leftJoin(users, eq(outreachActions.staffId, users.id))
      .where(eq(outreachActions.memberId, memberId))
      .orderBy(desc(outreachActions.createdAt));
    return result as OutreachAction[];
  }

  // Chat operations
  async getChatConversation(sessionId: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId));
    return conversation;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateChatConversation(sessionId: string, updates: Partial<ChatConversation>): Promise<void> {
    await db
      .update(chatConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatConversations.sessionId, sessionId));
  }

  // Workout plans
  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db
      .insert(workoutPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(desc(workoutPlans.createdAt));
  }

  // Churn email operations
  async createChurnEmail(email: InsertChurnEmail): Promise<ChurnEmail> {
    const [newEmail] = await db
      .insert(churnEmails)
      .values(email)
      .returning();
    return newEmail;
  }

  async getPendingChurnEmails(): Promise<ChurnEmail[]> {
    const result = await db
      .select({
        id: churnEmails.id,
        memberId: churnEmails.memberId,
        staffId: churnEmails.staffId,
        subject: churnEmails.subject,
        content: churnEmails.content,
        riskLevel: churnEmails.riskLevel,
        currentRiskBand: churnEmails.currentRiskBand,
        previousRiskBand: churnEmails.previousRiskBand,
        memberProfile: churnEmails.memberProfile,
        status: churnEmails.status,
        approvedBy: churnEmails.approvedBy,
        approvedAt: churnEmails.approvedAt,
        sentAt: churnEmails.sentAt,
        createdAt: churnEmails.createdAt,
        updatedAt: churnEmails.updatedAt,
        memberName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        memberEmail: users.email,
        memberMembershipType: users.membershipType,
      })
      .from(churnEmails)
      .leftJoin(users, eq(churnEmails.memberId, users.id))
      .where(eq(churnEmails.status, "pending"))
      .orderBy(desc(churnEmails.createdAt));
    return result as ChurnEmail[];
  }

  async getChurnEmailsByMember(memberId: string): Promise<ChurnEmail[]> {
    return await db
      .select()
      .from(churnEmails)
      .where(eq(churnEmails.memberId, memberId))
      .orderBy(desc(churnEmails.createdAt));
  }

  async approveChurnEmail(emailId: string, staffId: string): Promise<ChurnEmail> {
    const [updatedEmail] = await db
      .update(churnEmails)
      .set({
        status: "approved",
        approvedBy: staffId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(churnEmails.id, emailId))
      .returning();
    return updatedEmail;
  }

  async rejectChurnEmail(emailId: string, staffId: string): Promise<ChurnEmail> {
    const [updatedEmail] = await db
      .update(churnEmails)
      .set({
        status: "rejected",
        approvedBy: staffId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(churnEmails.id, emailId))
      .returning();
    return updatedEmail;
  }

  async markChurnEmailSent(emailId: string): Promise<ChurnEmail> {
    const [updatedEmail] = await db
      .update(churnEmails)
      .set({
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(churnEmails.id, emailId))
      .returning();
    return updatedEmail;
  }

  // Helper function to determine risk level and band
  getRiskLevel(member: User): { level: 'low' | 'medium' | 'high', band: string, percentage: number } {
    if (!member.lastVisit) return { level: "high", band: "never-visited", percentage: 95 };
    
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(member.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastVisit > 10) return { level: "high", band: "high-risk", percentage: 89 };
    if (daysSinceLastVisit > 7) return { level: "medium", band: "medium-risk", percentage: 76 };
    if (daysSinceLastVisit > 5) return { level: "low", band: "low-risk", percentage: 65 };
    return { level: "low", band: "active", percentage: 25 };
  }

  // Check if member needs a churn prevention email
  async checkAndCreateChurnEmail(memberId: string): Promise<ChurnEmail | null> {
    const member = await this.getUser(memberId);
    if (!member || member.role !== "member") return null;

    const currentRisk = this.getRiskLevel(member);
    
    // Check if there's already a recent email for this risk level
    const recentEmails = await db
      .select()
      .from(churnEmails)
      .where(
        and(
          eq(churnEmails.memberId, memberId),
          eq(churnEmails.currentRiskBand, currentRisk.band),
          sql`${churnEmails.createdAt} > NOW() - INTERVAL '7 days'`
        )
      );

    if (recentEmails.length > 0) return null; // Already sent recently

    // Only create email if member is in a risk band (not active)
    if (currentRisk.band === "active") return null;

    // Generate email using AI service
    const { generateChurnPreventionEmail } = await import("./services/geminiService");
    
    try {
      const emailContent = await generateChurnPreventionEmail(
        member,
        currentRisk.level,
        currentRisk.band
      );

      const emailData: InsertChurnEmail = {
        memberId: member.id,
        subject: emailContent.subject,
        content: emailContent.content,
        riskLevel: currentRisk.level,
        currentRiskBand: currentRisk.band,
        memberProfile: {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          membershipType: member.membershipType,
          joinDate: member.joinDate,
          lastVisit: member.lastVisit,
          loyaltyPoints: member.loyaltyPoints,
        },
        status: "pending",
      };

      return await this.createChurnEmail(emailData);
    } catch (error) {
      console.error("Error creating churn email:", error);
      return null;
    }
  }
}

// Seed data function
export async function seedLoyaltyOffers() {
  const storage = new DatabaseStorage();
  
  // Check if we already have offers
  const existingOffers = await storage.getLoyaltyOffers();
  if (existingOffers.length > 0) return;
  
  // Create attractive loyalty offers
  const offers = [
    {
      title: "Premium Protein Shake",
      description: "High-quality whey protein shake in your choice of flavor - perfect post-workout recovery",
      points: 200,
      category: "Nutrition"
    },
    {
      title: "Personal Training Session",
      description: "One-on-one 60-minute session with our certified personal trainers",
      points: 800,
      category: "Training"
    },
    {
      title: "Wellness Massage (30 min)",
      description: "Relaxing therapeutic massage to help with muscle recovery and stress relief",
      points: 650,
      category: "Wellness"
    },
    {
      title: "Branded Gym Towel",
      description: "High-quality ClubPulse branded microfiber towel - perfect for your workouts",
      points: 150,
      category: "Merchandise"
    },
    {
      title: "Group Fitness Class (5-Pack)",
      description: "Five additional group fitness classes - yoga, pilates, spin, or HIIT",
      points: 400,
      category: "Classes"
    },
    {
      title: "Smoothie Bar Credit",
      description: "£12 credit toward fresh smoothies and healthy snacks at our juice bar",
      points: 300,
      category: "Nutrition"
    },
    {
      title: "Exclusive Workshop Access",
      description: "Access to members-only wellness workshops on nutrition, mindfulness, and fitness",
      points: 500,
      category: "Education"
    },
    {
      title: "Premium Water Bottle",
      description: "Insulated stainless steel water bottle with ClubPulse logo - keeps drinks cold for 24 hours",
      points: 250,
      category: "Merchandise"
    }
  ];
  
  // Create all offers
  for (const offer of offers) {
    await storage.createLoyaltyOffer(offer);
  }
  
  console.log(`✓ Seeded ${offers.length} loyalty offers`);
}

// Seed diverse user personas
export async function seedDummyUsers() {
  const storage = new DatabaseStorage();
  
  // Check if we already have dummy users
  const existingUsers = await storage.getAllUsers();
  if (existingUsers.length > 2) return; // Skip if we already have users beyond system ones
  
  // Create diverse member personas with varied risk levels
  const memberPersonas = [
    // High-risk members (haven't visited in 10+ days)
    {
      id: 'member-sarah-wilson',
      email: 'sarah.wilson@email.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'member' as const,
      membershipType: 'Premium',
      loyaltyPoints: 320,
      joinDate: new Date('2023-02-15'),
      lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      id: 'member-david-chen',
      email: 'david.chen@email.com',
      firstName: 'David',
      lastName: 'Chen',
      role: 'member' as const,
      membershipType: 'Basic',
      loyaltyPoints: 85,
      joinDate: new Date('2024-01-10'),
      lastVisit: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
    {
      id: 'member-emily-taylor',
      email: 'emily.taylor@email.com',
      firstName: 'Emily',
      lastName: 'Taylor',
      role: 'member' as const,
      membershipType: 'Student',
      loyaltyPoints: 45,
      joinDate: new Date('2024-09-01'),
      lastVisit: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    },
    {
      id: 'member-never-visited',
      email: 'alex.parker@email.com',
      firstName: 'Alex',
      lastName: 'Parker',
      role: 'member' as const,
      membershipType: 'Premium',
      loyaltyPoints: 0,
      joinDate: new Date('2024-11-20'),
      lastVisit: null, // Never visited
    },
    
    // Medium-risk members (7-10 days)
    {
      id: 'member-james-brown',
      email: 'james.brown@email.com',
      firstName: 'James',
      lastName: 'Brown',
      role: 'member' as const,
      membershipType: 'Premium',
      loyaltyPoints: 540,
      joinDate: new Date('2022-08-20'),
      lastVisit: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
    {
      id: 'member-lisa-garcia',
      email: 'lisa.garcia@email.com',
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'member' as const,
      membershipType: 'Basic',
      loyaltyPoints: 275,
      joinDate: new Date('2023-05-12'),
      lastVisit: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    },
    
    // Low-risk members (5-7 days)
    {
      id: 'member-michael-johnson',
      email: 'michael.johnson@email.com',
      firstName: 'Michael',
      lastName: 'Johnson',
      role: 'member' as const,
      membershipType: 'Student',
      loyaltyPoints: 180,
      joinDate: new Date('2024-03-15'),
      lastVisit: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      id: 'member-anna-williams',
      email: 'anna.williams@email.com',
      firstName: 'Anna',
      lastName: 'Williams',
      role: 'member' as const,
      membershipType: 'Premium',
      loyaltyPoints: 720,
      joinDate: new Date('2021-11-30'),
      lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago (high risk)
    },
    
    // Active members (recent visits - for comparison)
    {
      id: 'member-tom-davis',
      email: 'tom.davis@email.com',
      firstName: 'Tom',
      lastName: 'Davis',
      role: 'member' as const,
      membershipType: 'Basic',
      loyaltyPoints: 150,
      joinDate: new Date('2024-06-10'),
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: 'member-sophie-miller',
      email: 'sophie.miller@email.com',
      firstName: 'Sophie',
      lastName: 'Miller',
      role: 'member' as const,
      membershipType: 'Premium',
      loyaltyPoints: 420,
      joinDate: new Date('2023-03-15'),
      lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (active)
    },
    {
      id: 'member-rachel-green',
      email: 'rachel.green@email.com', 
      firstName: 'Rachel',
      lastName: 'Green',
      role: 'member' as const,
      membershipType: 'Basic',
      loyaltyPoints: 95,
      joinDate: new Date('2024-08-20'),
      lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (active)
    },
    {
      id: 'member-alex-johnson',
      email: 'alex.johnson@email.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'member' as const,
      membershipType: 'basic' as const,
      loyaltyPoints: 1350,
      joinDate: new Date('2023-09-05'),
      lastVisit: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago (at risk)
    },
    {
      id: 'member-maria-gonzalez',
      email: 'maria.gonzalez@email.com',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      role: 'member' as const,
      membershipType: 'premium' as const,
      loyaltyPoints: 2900,
      joinDate: new Date('2023-05-18'),
      lastVisit: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago (very active)
    },
    {
      id: 'member-ryan-patel',
      email: 'ryan.patel@email.com',
      firstName: 'Ryan',
      lastName: 'Patel',
      role: 'member' as const,
      membershipType: 'student' as const,
      loyaltyPoints: 950,
      joinDate: new Date('2024-02-14'),
      lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      id: 'member-lisa-wong',
      email: 'lisa.wong@email.com',
      firstName: 'Lisa',
      lastName: 'Wong',
      role: 'member' as const,
      membershipType: 'basic' as const,
      loyaltyPoints: 1600,
      joinDate: new Date('2023-12-03'),
      lastVisit: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    },
    {
      id: 'member-carlos-rivera',
      email: 'carlos.rivera@email.com',
      firstName: 'Carlos',
      lastName: 'Rivera',
      role: 'member' as const,
      membershipType: 'premium' as const,
      loyaltyPoints: 3750,
      joinDate: new Date('2022-04-25'),
      lastVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (at risk)
    }
  ];
  
  // Create diverse staff personas
  const staffPersonas = [
    {
      id: 'staff-amanda-smith',
      email: 'amanda.smith@clubpulse.co.uk',
      firstName: 'Amanda',
      lastName: 'Smith',
      role: 'staff' as const,
      membershipType: null,
      loyaltyPoints: 0,
      joinDate: new Date('2021-06-15'),
      lastVisit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'staff-james-martinez',
      email: 'james.martinez@clubpulse.co.uk',
      firstName: 'James',
      lastName: 'Martinez', 
      role: 'staff' as const,
      membershipType: null,
      loyaltyPoints: 0,
      joinDate: new Date('2022-01-20'),
      lastVisit: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: 'staff-priya-singh',
      email: 'priya.singh@clubpulse.co.uk',
      firstName: 'Priya',
      lastName: 'Singh',
      role: 'staff' as const,
      membershipType: null,
      loyaltyPoints: 0,
      joinDate: new Date('2020-09-10'),
      lastVisit: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: 'staff-robert-jones',
      email: 'robert.jones@clubpulse.co.uk',
      firstName: 'Robert',
      lastName: 'Jones',
      role: 'staff' as const,
      membershipType: null,
      loyaltyPoints: 0,
      joinDate: new Date('2023-03-08'),
      lastVisit: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    }
  ];
  
  // Insert all personas
  const allPersonas = [...memberPersonas, ...staffPersonas];
  
  for (const persona of allPersonas) {
    try {
      await storage.upsertUser(persona);
      console.log(`✓ Created persona: ${persona.firstName} ${persona.lastName} (${persona.role})`);
    } catch (error) {
      console.error(`Failed to create persona ${persona.firstName} ${persona.lastName}:`, error);
    }
  }
  
  console.log(`✓ Seeded ${memberPersonas.length} member personas and ${staffPersonas.length} staff personas`);
}

// Seed sample churn emails for demonstration
export async function seedSampleChurnEmails() {
  const storage = new DatabaseStorage();
  
  // Check if we already have churn emails
  try {
    const existingEmails = await storage.getPendingChurnEmails();
    if (existingEmails.length > 0) return;
  } catch (error) {
    // Table might not exist yet, continue
  }

  // Ensure all users exist first
  const existingUsers = await storage.getAllUsers();
  const memberIds = existingUsers.map(user => user.id);
  console.log('Available member IDs for churn emails:', memberIds);
  
  // Sample churn emails for different risk levels
  const sampleEmails = [
    {
      memberId: 'member-sarah-wilson',
      subject: 'We miss you at ClubPulse, Sarah! Let\'s get back on track 💪',
      content: `Dear Sarah Wilson,

We've noticed you haven't visited ClubPulse in a while, and we want to make sure everything is alright. As a valued Premium member, you're important to us!

**Your Current Membership Benefits:**
• 24/7 access to all premium facilities
• Unlimited group fitness classes
• Access to our AI-powered workout recommendations
• Complimentary towel service

**Special Comeback Offer - Just for You:**
To help you get back into your routine, we're offering:
• FREE personal training session (worth £65)
• 50% off next month's supplements
• Priority booking for popular classes

Your wellness journey matters to us. Our team would love to understand any challenges you're facing and help create a plan that works better for your lifestyle.

**Ready to return?** Simply reply to this email or call us at 020 3837 4721.

Stay strong,
The ClubPulse Team

P.S. Don't forget - your membership includes unlimited access to our new meditation room and recovery zone!`,
      riskLevel: 'high',
      currentRiskBand: 'high-risk',
      memberProfile: {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@email.com',
        membershipType: 'Premium',
        joinDate: '2023-02-15',
        lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 320,
      },
      status: 'pending',
    },
    {
      memberId: 'member-david-chen',
      subject: 'Your ClubPulse journey continues, David! 🏃‍♂️',
      content: `Hi David Chen,

Hope you're doing well! We've noticed it's been a little while since your last visit to ClubPulse, and we wanted to reach out.

**What's New at ClubPulse:**
• Fresh morning HIIT classes (perfect for busy schedules!)
• New strength training equipment in the main zone
• Updated nutrition workshops every Saturday morning
• Enhanced AI workout recommendations based on your preferences

**Your Basic Membership Perks:**
As a Basic member, you have access to all these new offerings during your membership hours (06:00-22:00).

**This Month's Special:**
• 20% off personal training packages
• Free fitness assessment to update your goals
• Complimentary smoothie with your next visit

We understand life gets busy sometimes! Our flexible approach is designed to work around your schedule.

**Let's catch up:** Pop in this week and let our team know how we can better support your fitness goals.

Best regards,
Your ClubPulse Family

*Remember: Every step forward counts, no matter how small!*`,
      riskLevel: 'high',
      currentRiskBand: 'high-risk',
      memberProfile: {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@email.com',
        membershipType: 'Basic',
        joinDate: '2024-01-10',
        lastVisit: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 85,
      },
      status: 'pending',
    },
    {
      memberId: 'member-james-brown',
      subject: 'James, let\'s keep your momentum going! 💫',
      content: `Hi James Brown,

We've noticed a slight change in your visit pattern recently. As someone who's been crushing their fitness goals, we want to help you maintain that amazing momentum!

**Your Recent Progress:**
• Premium member since August 2022
• 540 loyalty points earned
• Previously averaging regular visits

**To keep you motivated:**
• NEW: Try our just-launched strength & conditioning masterclasses
• Book a complimentary fitness assessment to update your goals
• 15% off personal training packages this month

Sometimes life gets busy - that's completely normal! Our flexible class schedule and 24/7 access are designed to work around your lifestyle.

**Let's catch up:** Pop in this week for a quick chat with our wellness team. We're here to support your journey!

Best regards,
Your ClubPulse Family

*Remember: Consistency beats perfection. Even 30 minutes counts!*`,
      riskLevel: 'medium',
      currentRiskBand: 'medium-risk',
      memberProfile: {
        firstName: 'James',
        lastName: 'Brown',
        email: 'james.brown@email.com',
        membershipType: 'Premium',
        joinDate: '2022-08-20',
        lastVisit: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 540,
      },
      status: 'pending',
    },
    {
      memberId: 'member-anna-williams',
      subject: 'New classes and features await you, Anna! ✨',
      content: `Hello Anna Williams,

Hope you're doing well! We've added some exciting new features and classes that we think you'll love.

**What's New at ClubPulse:**
• Fresh morning yoga sessions (perfect for starting the day right)
• Advanced strength training equipment in the new zone
• Nutrition workshops every Saturday morning
• Updated AI workout recommendations based on your preferences

**Your Premium Membership Perks:**
As a Premium member, you have full access to all these new offerings at no extra cost!

**This Week's Highlights:**
• Monday: Power Yoga with Sarah (07:00)
• Wednesday: Strength & Conditioning masterclass
• Friday: Nutrition Q&A session

We'd love to see you soon and hear about your current fitness goals. Our team is always here to help you make the most of your membership.

See you soon!
The ClubPulse Team

*Your next visit is going to be amazing - we've got everything ready for you!*`,
      riskLevel: 'high',
      currentRiskBand: 'high-risk',
      memberProfile: {
        firstName: 'Anna',
        lastName: 'Williams',
        email: 'anna.williams@email.com',
        membershipType: 'Premium',
        joinDate: '2021-11-30',
        lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 720,
      },
      status: 'pending',
    },
    {
      memberId: 'member-never-visited',
      subject: 'Welcome to ClubPulse, Alex! Your fitness journey starts here 🚀',
      content: `Dear Alex Parker,

Welcome to the ClubPulse family! We're absolutely thrilled to have you as our newest Premium member.

We noticed you haven't had a chance to visit us yet since joining, and we want to make sure you feel completely comfortable and excited about starting your fitness journey with us.

**Your Premium Membership Includes:**
• 24/7 access to all facilities
• Unlimited group fitness classes
• AI-powered personalised workout plans
• 2 complimentary personal training sessions per month
• Access to our recovery zone and meditation room

**Let's Get You Started:**
• FREE welcome session with one of our fitness consultants
• Complimentary facility tour at your convenience
• No-obligation chat about your fitness goals
• Free ClubPulse starter pack (water bottle, towel, protein shake)

**Ready to begin?** 
Simply call us at 020 3837 4721 or reply to this email. We can arrange a convenient time that works for you - evenings and weekends are absolutely fine!

Our team is here to support you every step of the way. There's no pressure, just genuine care for your wellness journey.

Looking forward to meeting you!

The ClubPulse Welcome Team

*Your membership is active and ready - we can't wait to show you around!*`,
      riskLevel: 'high',
      currentRiskBand: 'never-visited',
      memberProfile: {
        firstName: 'Alex',
        lastName: 'Parker',
        email: 'alex.parker@email.com',
        membershipType: 'Premium',
        joinDate: '2024-11-20',
        lastVisit: null,
        loyaltyPoints: 0,
      },
      status: 'pending',
    },
    {
      memberId: 'member-emily-taylor',
      subject: 'Emily, we want to help you succeed! 💪',
      content: `Dear Emily Taylor,

We hope your studies are going well! As a valued Student member, we wanted to reach out because we've noticed you haven't visited ClubPulse recently.

**Student Membership Benefits:**
• Access to all facilities during off-peak hours (09:00-16:00, 20:00-22:00)
• Unlimited group fitness classes designed around student schedules
• Study-friendly recovery zone perfect for post-workout relaxation
• Budget-friendly membership with maximum value

**Special Student Support:**
We know student life can be overwhelming with exams, assignments, and social commitments. That's exactly why we're here to help!

• FREE stress-relief yoga sessions every Thursday evening
• Quick 20-minute HIIT classes perfect for busy schedules
• Study break workout challenges with your fellow students
• Complimentary nutritional guidance for student budgets

**This Week's Student Special:**
• Free healthy smoothie with your next visit
• Bonus loyalty points for any class attendance
• Access to our quiet study area with Wi-Fi

**Let's get you back on track!** Reply to this email or pop in between classes. Our team understands student life and we're here to make fitness work around YOUR schedule.

Best of luck with your studies!
The ClubPulse Student Support Team

*Remember: A healthy body supports a healthy mind - perfect for exam season!*`,
      riskLevel: 'high',
      currentRiskBand: 'high-risk',
      memberProfile: {
        firstName: 'Emily',
        lastName: 'Taylor',
        email: 'emily.taylor@email.com',
        membershipType: 'Student',
        joinDate: '2024-09-01',
        lastVisit: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 45,
      },
      status: 'pending',
    },
    {
      memberId: 'member-lisa-garcia',
      subject: 'Lisa, let\'s reignite your fitness passion! 🔥',
      content: `Hi Lisa Garcia,

We've noticed it's been a while since your last visit to ClubPulse, and we wanted to personally reach out to you.

**Your Fitness Journey:**
• Basic member since May 2023
• 275 loyalty points earned through consistent effort
• Previously a regular participant in our community

**What's New Since Your Last Visit:**
• Brand new functional training area with latest equipment
• Morning energy boost classes (07:00-08:00) perfect before work
• Updated group fitness schedule with more evening options
• Enhanced changing facilities with better amenities

**Your Basic Membership Includes:**
• Access during all operating hours (06:00-22:00)
• All group fitness classes at no extra charge
• Complimentary fitness consultations
• Full use of all gym equipment and facilities

**This Month's Reconnection Offer:**
• 25% off personal training sessions
• Free fitness assessment to restart your goals
• Complimentary ClubPulse water bottle
• Priority booking for popular classes

**Ready to return?** We'd love to welcome you back with a complimentary catch-up session. Simply call 020 3837 4721 or reply to this email.

Every step back is a step forward!
Your ClubPulse Family

*We believe in you, Lisa - your next workout is going to feel amazing!*`,
      riskLevel: 'medium',
      currentRiskBand: 'medium-risk',
      memberProfile: {
        firstName: 'Lisa',
        lastName: 'Garcia',
        email: 'lisa.garcia@email.com',
        membershipType: 'Basic',
        joinDate: '2023-05-12',
        lastVisit: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        loyaltyPoints: 275,
      },
      status: 'pending',
    },
  ];
  
  // Filter emails to only those for existing members
  const validEmails = sampleEmails.filter(email => memberIds.includes(email.memberId));
  console.log(`Creating ${validEmails.length} out of ${sampleEmails.length} sample emails for existing members`);

  // Create sample emails
  for (const emailData of validEmails) {
    try {
      await storage.createChurnEmail(emailData);
    } catch (error) {
      console.error(`Failed to create sample email for ${emailData.memberProfile.firstName}:`, error);
    }
  }
  
  console.log(`✓ Seeded ${validEmails.length} sample churn emails for staff approval`);
}

export const storage = new DatabaseStorage();
