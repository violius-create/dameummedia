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
  category: mysqlEnum("category", ["notice", "portfolio", "review", "concert", "film", "admin_board"]).notNull(),
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
  eventType: mysqlEnum("eventType", ["photo", "concert", "video", "music_video", "other"]).notNull(),
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
  recordingType: varchar("recordingType", { length: 100 }),
  specialRequirements: text("specialRequirements"),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "transfer", "cash", "other", "full", "half"]),
  isPublic: int("isPublic").default(1),
  receiptType: mysqlEnum("receiptType", ["issued", "not_issued", "cash_receipt"]),
  quotedAmount: int("quotedAmount").default(0),
  paidAmount: int("paidAmount").default(0),
  unpaidAmount: int("unpaidAmount").default(0),
  description: text("description"),
  attachments: text("attachments"), // JSON array of file URLs
  status: mysqlEnum("status", ["pending", "confirmed", "payment_completed", "work_pending", "in_progress", "editing", "completed", "cancelled"]).default("pending").notNull(),
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
  description: text("description"), // Section description text
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  uploadedBy: int("uploadedBy").notNull(),
  section: mysqlEnum("section", ["main", "section2", "section3", "information"]).default("main").notNull(), // Section identifier
  isActive: int("isActive").default(1), // 1 for active background
  overlayOpacity: int("overlayOpacity").default(40), // Overlay opacity (0-100)
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
  itemKey: varchar("itemKey", { length: 100 }).unique(), // classy_live_filming, profile_music_video, planned_shooting
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(), // S3 file key
  uploadedBy: int("uploadedBy").notNull(),
  order: int("order").default(0), // For custom ordering
  isActive: int("isActive").default(1), // 1 for active item
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = typeof serviceItems.$inferInsert;

// Site branding table for managing main logo and title
export const siteBranding = mysqlTable("siteBranding", {
  id: int("id").autoincrement().primaryKey(),
  logoUrl: text("logoUrl"), // Logo image URL
  logoFileKey: varchar("logoFileKey", { length: 255 }), // S3 file key for logo
  title: varchar("title", { length: 255 }).default("담음미디어").notNull(), // Main title
  subtitle: varchar("subtitle", { length: 255 }).default("Professional Media Production").notNull(), // Subtitle
  instagramUrl: varchar("instagramUrl", { length: 255 }).default("https://instagram.com"), // Instagram URL
  youtubeUrl: varchar("youtubeUrl", { length: 255 }).default("https://youtube.com"), // YouTube URL
  heroFadeStart: int("heroFadeStart").default(20), // Hero fade start percentage (0-100, default 20%)
  heroFadeEnd: int("heroFadeEnd").default(60), // Hero fade end percentage (0-100, default 60%)
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteBranding = typeof siteBranding.$inferSelect;
export type InsertSiteBranding = typeof siteBranding.$inferInsert;

// Section titles table for managing page section titles
export const sectionTitles = mysqlTable("sectionTitles", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 100 }).unique().notNull(), // concert_live, making_film, information, price, reservation
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"), // Optional description for the section
  thumbnailGap: int("thumbnailGap").default(24), // Gap between thumbnails in pixels (default: 24px = gap-6)
  thumbnailWidth: int("thumbnailWidth").default(280), // Width of thumbnails in pixels (default: 280px)
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SectionTitle = typeof sectionTitles.$inferSelect;
export type InsertSectionTitle = typeof sectionTitles.$inferInsert;

// Footer settings table for managing footer content
export const footerSettings = mysqlTable("footerSettings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).default("담음미디어").notNull(),
  copyrightText: varchar("copyrightText", { length: 255 }).default("All rights reserved.").notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  businessNumber: varchar("businessNumber", { length: 50 }),
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FooterSettings = typeof footerSettings.$inferSelect;
export type InsertFooterSettings = typeof footerSettings.$inferInsert;

// Board layout settings table for managing board/gallery display options
export const boardLayoutSettings = mysqlTable("boardLayoutSettings", {
  id: int("id").autoincrement().primaryKey(),
  boardKey: varchar("boardKey", { length: 100 }).unique().notNull(), // concert_live, making_film, reservation
  itemsPerPage: int("itemsPerPage").default(12).notNull(),
  displayMode: varchar("displayMode", { length: 50 }).default("gallery").notNull(), // gallery, list
  containerWidth: varchar("containerWidth", { length: 50 }).default("container").notNull(), // container, container-wide, full
  // New layout settings for individual post items
  postWidth: varchar("postWidth", { length: 50 }).default("auto"), // auto, full, 1/2, 1/3, 1/4
  postHeight: varchar("postHeight", { length: 50 }).default("auto"), // auto, or specific value like "300px"
  postMarginTop: varchar("postMarginTop", { length: 50 }).default("0"), // e.g., "0", "1rem", "2rem"
  postTitleSize: varchar("postTitleSize", { length: 50 }).default("base"), // xs, sm, base, lg, xl, 2xl
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BoardLayoutSettings = typeof boardLayoutSettings.$inferSelect;
export type InsertBoardLayoutSettings = typeof boardLayoutSettings.$inferInsert;

// Price packages table for managing pricing tiers
export const pricePackages = mysqlTable("pricePackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Simple, Economy, Professional
  displayName: varchar("displayName", { length: 255 }).notNull(), // Display name with Korean
  description: text("description"), // Package description
  basePrice: int("basePrice").notNull(), // Base price in KRW
  cameraCount: varchar("cameraCount", { length: 100 }), // e.g., "5~6"
  cameraType: varchar("cameraType", { length: 255 }), // e.g., "4K Camera"
  microphoneCount: varchar("microphoneCount", { length: 100 }), // e.g., "2"
  microphoneType: varchar("microphoneType", { length: 255 }), // e.g., "Stereo Recording Mic"
  operatorCount: varchar("operatorCount", { length: 100 }), // e.g., "1~2"
  targetAudience: text("targetAudience"), // Target audience description
  order: int("order").default(0), // Display order
  isActive: int("isActive").default(1), // 1 for active package
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricePackage = typeof pricePackages.$inferSelect;
export type InsertPricePackage = typeof pricePackages.$inferInsert;

// Price add-ons table for managing additional services
export const priceAddOns = mysqlTable("priceAddOns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Stereo Recording"
  description: text("description"), // Description
  price: int("price").notNull(), // Price in KRW
  category: varchar("category", { length: 100 }).notNull(), // e.g., "recording", "photography"
  order: int("order").default(0), // Display order
  isActive: int("isActive").default(1), // 1 for active add-on
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceAddOn = typeof priceAddOns.$inferSelect;
export type InsertPriceAddOn = typeof priceAddOns.$inferInsert;

// Instagram posts table for manual Instagram feed management
export const instagramPosts = mysqlTable("instagramPosts", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: text("imageUrl").notNull(), // S3 uploaded image URL
  fileKey: varchar("fileKey", { length: 255 }), // S3 file key
  postUrl: varchar("postUrl", { length: 500 }), // Link to original Instagram post
  caption: text("caption"), // Optional caption / description
  sortOrder: int("sortOrder").default(0).notNull(), // Display order (lower = first)
  isActive: int("isActive").default(1).notNull(), // 1 = visible, 0 = hidden
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstagramPost = typeof instagramPosts.$inferSelect;
export type InsertInstagramPost = typeof instagramPosts.$inferInsert;

// Hero text rotation settings for managing rotating text on section 1
export const heroTextRotation = mysqlTable("heroTextRotation", {
  id: int("id").autoincrement().primaryKey(),
  text1Title: varchar("text1Title", { length: 500 }).default("Professional Media Production").notNull(),
  text1Description: varchar("text1Description", { length: 500 }).default("Record, Mixing, Mastering and Videos"),
  text2Title: varchar("text2Title", { length: 500 }).default(""),
  text2Description: varchar("text2Description", { length: 500 }).default(""),
  text3Title: varchar("text3Title", { length: 500 }).default(""),
  text3Description: varchar("text3Description", { length: 500 }).default(""),
  intervalMs: int("intervalMs").default(2000).notNull(), // Rotation interval in milliseconds
  animationType: varchar("animationType", { length: 50 }).default("fadeSlideUp").notNull(), // Animation type for text transition
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeroTextRotation = typeof heroTextRotation.$inferSelect;
export type InsertHeroTextRotation = typeof heroTextRotation.$inferInsert;

// Information page items table for managing about/experience/achievements content
export const informationItems = mysqlTable("informationItems", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 100 }).notNull(), // about, experiences, achievements, dramaWorks
  title: varchar("title", { length: 255 }).notNull(), // Section title
  items: text("items").notNull(), // JSON array of strings
  description: text("description"), // Optional section description
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InformationItem = typeof informationItems.$inferSelect;
export type InsertInformationItem = typeof informationItems.$inferInsert;
