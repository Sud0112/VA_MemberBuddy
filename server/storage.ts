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
  
  // Create diverse member personas
  const memberPersonas = [
    {
      id: 'member-sarah-wilson',
      email: 'sarah.wilson@email.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'member' as const,
      membershipType: 'premium' as const,
      loyaltyPoints: 2450,
      joinDate: new Date('2023-03-15'),
      lastVisit: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (at risk)
    },
    {
      id: 'member-michael-chen',
      email: 'michael.chen@email.com', 
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'member' as const,
      membershipType: 'premium' as const,
      loyaltyPoints: 3200,
      joinDate: new Date('2022-08-20'),
      lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (active)
    },
    {
      id: 'member-emily-rodriguez',
      email: 'emily.rodriguez@email.com',
      firstName: 'Emily', 
      lastName: 'Rodriguez',
      role: 'member' as const,
      membershipType: 'basic' as const,
      loyaltyPoints: 1850,
      joinDate: new Date('2024-01-10'),
      lastVisit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (very active)
    },
    {
      id: 'member-david-kim',
      email: 'david.kim@email.com',
      firstName: 'David',
      lastName: 'Kim',
      role: 'member' as const,
      membershipType: 'student' as const,
      loyaltyPoints: 750,
      joinDate: new Date('2024-06-01'),
      lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: 'member-jessica-taylor',
      email: 'jessica.taylor@email.com',
      firstName: 'Jessica',
      lastName: 'Taylor',
      role: 'member' as const,
      membershipType: 'premium' as const,
      loyaltyPoints: 4100,
      joinDate: new Date('2021-11-30'),
      lastVisit: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago (active)
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

export const storage = new DatabaseStorage();
