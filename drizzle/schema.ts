import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Post table for various board types (공지사항, 포트폴리오, 후기)
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["notice", "portfolio", "review", "concert", "film"]).notNull(),
  authorId: int("authorId").notNull(),
  imageUrl: text("imageUrl"),
  videoUrl: text("videoUrl"),
  viewCount: int("viewCount").default(0),
  featured: int("featured").default(0), // 1 for featured posts
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// Image table for managing uploaded images
export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy").notNull(),
  postId: int("postId"), // Optional: link to post
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

// Reservation table
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventType: mysqlEnum("eventType", ["concert", "film", "other"]).notNull(),
  venue: varchar("venue", { length: 255 }),
  eventDate: timestamp("eventDate"),
  rehearsalTime: varchar("rehearsalTime", { length: 100 }),
  composition: text("composition"),
  managerName: varchar("managerName", { length: 255 }),
  managerPhone: varchar("managerPhone", { length: 20 }),
  recordingStaff: varchar("recordingStaff", { length: 255 }),
  photographyStaff: varchar("photographyStaff", { length: 255 }),
  audioSettings: text("audioSettings"),
  projectMonitor: varchar("projectMonitor", { length: 255 }),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "transfer", "cash", "other"]),
  isPublic: int("isPublic").default(1),
  receiptType: mysqlEnum("receiptType", ["individual", "business", "other"]),
  paidAmount: int("paidAmount").default(0),
  unpaidAmount: int("unpaidAmount").default(0),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

// Comment table for posts
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// Gallery table for Concert Live and Making Film galleries
export const galleryItems = mysqlTable("galleryItems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  category: mysqlEnum("category", ["concert", "film"]).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"), // For videos
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  uploadedBy: int("uploadedBy").notNull(),
  order: int("order").default(0), // For custom ordering
  featured: int("featured").default(0), // 1 for featured items
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

// Hero background management table
export const heroBackgrounds = mysqlTable("heroBackgrounds", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  thumbnailUrl: text("thumbnailUrl"), // For videos
  uploadedBy: int("uploadedBy").notNull(),
  isActive: int("isActive").default(1), // 1 for active background
  order: int("order").default(0), // For custom ordering
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeroBackground = typeof heroBackgrounds.$inferSelect;
export type InsertHeroBackground = typeof heroBackgrounds.$inferInsert;


// Service items table for main page service sections
export const serviceItems = mysqlTable("serviceItems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  thumbnailUrl: text("thumbnailUrl"), // For videos
  uploadedBy: int("uploadedBy").notNull(),
  order: int("order").default(0), // For custom ordering
  isActive: int("isActive").default(1), // 1 for active item
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = typeof serviceItems.$inferInsert;
