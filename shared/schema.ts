import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("member"), // 'member' or 'staff'
  membershipType: varchar("membership_type").default("basic"), // 'basic', 'premium', 'student'
  loyaltyPoints: integer("loyalty_points").default(1250),
  joinDate: timestamp("join_date").defaultNow(),
  lastVisit: timestamp("last_visit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loyalty offers table
export const loyaltyOffers = pgTable("loyalty_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  category: varchar("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member offer redemptions table
export const offerRedemptions = pgTable("offer_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offerId: uuid("offer_id").references(() => loyaltyOffers.id).notNull(),
  pointsSpent: integer("points_spent").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

// Staff outreach actions table
export const outreachActions = pgTable("outreach_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: varchar("member_id").references(() => users.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  actionType: varchar("action_type").notNull(), // 'call', 'email', 'in-person', 'offer'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email interactions table for tracking email engagement
export const emailInteractions = pgTable("email_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectEmail: varchar("prospect_email").notNull(),
  prospectName: varchar("prospect_name").notNull(),
  interactionType: varchar("interaction_type").notNull(), // 'email_sent', 'link_clicked', 'tour_viewed'
  emailSubject: varchar("email_subject"),
  trackingId: uuid("tracking_id").unique().notNull().defaultRandom(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: varchar("session_id").notNull(),
  messages: jsonb("messages").notNull(), // Array of {role: 'user'|'assistant', content: string}
  isComplete: boolean("is_complete").default(false),
  tourBooked: boolean("tour_booked").default(false),
  contactEmail: varchar("contact_email"),
  contactName: varchar("contact_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table for prospect data from ChatBot
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name"),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  fitnessGoal: varchar("fitness_goal"), // 'weight_loss', 'build_muscle', etc.
  frequency: varchar("frequency"), // '1-2', '3-4', '5+', 'unsure'
  location: varchar("location"), // 'central_london', 'east_london', etc.
  language: varchar("language"), // 'english', 'spanish', 'french'
  sessionId: varchar("session_id").notNull(),
  conversationId: uuid("conversation_id").references(() => chatConversations.id),
  status: varchar("status").notNull().default("new"), // 'new', 'contacted', 'converted', 'lost'
  assignedStaff: varchar("assigned_staff").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout plans table
export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  goals: text("goals").notNull(),
  weeklySchedule: jsonb("weekly_schedule").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Churn prevention emails table
export const churnEmails = pgTable("churn_emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: varchar("member_id").references(() => users.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  riskLevel: varchar("risk_level").notNull(), // 'low', 'medium', 'high'
  currentRiskBand: varchar("current_risk_band").notNull(),
  previousRiskBand: varchar("previous_risk_band"),
  memberProfile: jsonb("member_profile").notNull(), // User data used for personalization
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'sent', 'rejected'
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdOffers: many(loyaltyOffers),
  redemptions: many(offerRedemptions),
  outreachActionsAsMember: many(outreachActions, { relationName: "memberActions" }),
  outreachActionsAsStaff: many(outreachActions, { relationName: "staffActions" }),
  workoutPlans: many(workoutPlans),
  churnEmailsAsMember: many(churnEmails, { relationName: "memberEmails" }),
  churnEmailsAsStaff: many(churnEmails, { relationName: "staffEmails" }),
}));

export const loyaltyOffersRelations = relations(loyaltyOffers, ({ one, many }) => ({
  creator: one(users, {
    fields: [loyaltyOffers.createdBy],
    references: [users.id],
  }),
  redemptions: many(offerRedemptions),
}));

export const offerRedemptionsRelations = relations(offerRedemptions, ({ one }) => ({
  user: one(users, {
    fields: [offerRedemptions.userId],
    references: [users.id],
  }),
  offer: one(loyaltyOffers, {
    fields: [offerRedemptions.offerId],
    references: [loyaltyOffers.id],
  }),
}));

export const outreachActionsRelations = relations(outreachActions, ({ one }) => ({
  member: one(users, {
    fields: [outreachActions.memberId],
    references: [users.id],
    relationName: "memberActions",
  }),
  staff: one(users, {
    fields: [outreachActions.staffId],
    references: [users.id],
    relationName: "staffActions",
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
}));

export const churnEmailsRelations = relations(churnEmails, ({ one }) => ({
  member: one(users, {
    fields: [churnEmails.memberId],
    references: [users.id],
    relationName: "memberEmails",
  }),
  staff: one(users, {
    fields: [churnEmails.staffId],
    references: [users.id],
    relationName: "staffEmails",
  }),
  approver: one(users, {
    fields: [churnEmails.approvedBy],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [leads.conversationId],
    references: [chatConversations.id],
  }),
  assignedStaffMember: one(users, {
    fields: [leads.assignedStaff],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertLoyaltyOfferSchema = createInsertSchema(loyaltyOffers).omit({
  id: true,
  createdAt: true,
});
export type InsertLoyaltyOffer = z.infer<typeof insertLoyaltyOfferSchema>;
export type LoyaltyOffer = typeof loyaltyOffers.$inferSelect;

export const insertOfferRedemptionSchema = createInsertSchema(offerRedemptions).omit({
  id: true,
  redeemedAt: true,
});
export type InsertOfferRedemption = z.infer<typeof insertOfferRedemptionSchema>;
export type OfferRedemption = typeof offerRedemptions.$inferSelect;

export const insertOutreachActionSchema = createInsertSchema(outreachActions).omit({
  id: true,
  createdAt: true,
});
export type InsertOutreachAction = z.infer<typeof insertOutreachActionSchema>;
export type OutreachAction = typeof outreachActions.$inferSelect;

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;

export const insertChurnEmailSchema = createInsertSchema(churnEmails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChurnEmail = z.infer<typeof insertChurnEmailSchema>;
export type ChurnEmail = typeof churnEmails.$inferSelect;

export const insertEmailInteractionSchema = createInsertSchema(emailInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailInteraction = z.infer<typeof insertEmailInteractionSchema>;
export type EmailInteraction = typeof emailInteractions.$inferSelect;

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
