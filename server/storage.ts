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

export const storage = new DatabaseStorage();
