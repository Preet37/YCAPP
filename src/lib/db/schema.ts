import {
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
  boolean,
  integer,
  primaryKey,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

export const sessionTypeEnum = pgEnum("session_type", [
  "keynote",
  "breakout",
  "partner_meeting",
  "expo",
  "after_party",
  "other",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  name: text("name").notNull(),
  linkedinUrl: text("linkedin_url"),
  photoUrl: text("photo_url"),
  headline: text("headline"),
  buildingText: text("building_text"),
  lookingForText: text("looking_for_text"),
  embedding: vector("embedding", { dimensions: 1536 }),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: sessionTypeEnum("type").notNull().default("other"),
});

export const userSessions = pgTable(
  "user_sessions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.sessionId] })]
);

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageBlobUrl: text("image_blob_url").notNull(),
  modelResponseJson: text("model_response_json"),
  status: verificationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matchDigests = pgTable("match_digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  matchedUserId: uuid("matched_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: real("score").notNull(),
  sessionOverlapCount: integer("session_overlap_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
