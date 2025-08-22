import {
  users,
  loyaltyOffers,
  offerRedemptions,
  outreachActions,
  chatConversations,
  workoutPlans,
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
      description: "$15 credit toward fresh smoothies and healthy snacks at our juice bar",
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
      email: 'amanda.smith@clubpulse.com',
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
      email: 'james.martinez@clubpulse.com',
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
      email: 'priya.singh@clubpulse.com',
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
      email: 'robert.jones@clubpulse.com',
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
