import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, posts, images, reservations, comments, galleryItems, heroBackgrounds, serviceItems, siteBranding, sectionTitles, footerSettings, boardLayoutSettings, heroTextRotation, informationItems, reservationFormLabels, Post, InsertPost, Image, InsertImage, Reservation, InsertReservation, Comment, InsertComment, GalleryItem, InsertGalleryItem, HeroBackground, InsertHeroBackground, ServiceItem, InsertServiceItem, SiteBranding, InsertSiteBranding, SectionTitle, InsertSectionTitle, FooterSettings, InsertFooterSettings, BoardLayoutSettings, InsertBoardLayoutSettings, HeroTextRotation, InsertHeroTextRotation, InformationItem, InsertInformationItem, ReservationFormLabels, InsertReservationFormLabels } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Post queries
export async function getPosts(category?: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const query = category 
    ? db.select().from(posts).where(and(eq(posts.category, category as any), eq(posts.status, 'published'))).orderBy(desc(posts.createdAt)).limit(limit).offset(offset)
    : db.select().from(posts).where(eq(posts.status, 'published')).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
  
  return query;
}

export async function getAllPosts(category?: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const query = category 
    ? db.select().from(posts).where(eq(posts.category, category as any)).orderBy(desc(posts.createdAt)).limit(limit).offset(offset)
    : db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
  
  return query;
}

export async function getPostsCount(category?: string) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = category
    ? await db.select({ count: sql<number>`count(*)` }).from(posts).where(and(eq(posts.category, category as any), eq(posts.status, 'published')))
    : await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, 'published'));
  
  return result[0]?.count ?? 0;
}

export async function getAllPostsCount(category?: string) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = category
    ? await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.category, category as any))
    : await db.select({ count: sql<number>`count(*)` }).from(posts);
  
  return result[0]?.count ?? 0;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(posts).values(post);
  const insertId = (result as any)[0]?.insertId;
  if (insertId) {
    return { id: insertId };
  }
  return result;
}

export async function updatePost(id: number, post: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Filter out undefined values to avoid SQL errors
  const updateData = Object.fromEntries(
    Object.entries(post).filter(([, value]) => value !== undefined)
  ) as Partial<InsertPost>;
  
  await db.update(posts).set(updateData).where(eq(posts.id, id));
  
  // Return the updated post
  return getPostById(id);
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(posts).where(eq(posts.id, id));
}

// Image queries
export async function createImage(image: InsertImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(images).values(image);
}

export async function getImagesByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(images).where(eq(images.postId, postId));
}

export async function deleteImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(images).where(eq(images.id, id));
}

// Reservation queries
export async function createReservation(reservation: InsertReservation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reservations).values(reservation);
  // Get the inserted reservation with its ID
  const insertedId = (result as any).insertId || result[0]?.insertId;
  if (insertedId) {
    return await getReservationById(insertedId);
  }
  throw new Error("Failed to create reservation");
}

export async function getReservations(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(limit).offset(offset);
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateReservation(id: number, reservation: Partial<InsertReservation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(reservations).set(reservation).where(eq(reservations.id, id));
}

export async function deleteReservation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(reservations).where(eq(reservations.id, id));
}

export async function deleteReservationsBulk(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(reservations).where(inArray(reservations.id, ids));
}

// Comment queries
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(comments).values(comment);
}

export async function getCommentsByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(comments).where(and(eq(comments.postId, postId), eq(comments.status, 'approved'))).orderBy(desc(comments.createdAt));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(comments).where(eq(comments.id, id));
}

// Gallery queries
export async function getGalleryItems(category?: string, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const query = category
    ? db.select().from(galleryItems).where(and(eq(galleryItems.category, category as any), eq(galleryItems.status, 'published'))).orderBy(galleryItems.order, desc(galleryItems.createdAt)).limit(limit).offset(offset)
    : db.select().from(galleryItems).where(eq(galleryItems.status, 'published')).orderBy(galleryItems.order, desc(galleryItems.createdAt)).limit(limit).offset(offset);
  
  return query;
}

export async function getGalleryItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createGalleryItem(item: InsertGalleryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(galleryItems).values(item);
}

export async function updateGalleryItem(id: number, item: Partial<InsertGalleryItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(galleryItems).set(item).where(eq(galleryItems.id, id));
}

export async function deleteGalleryItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(galleryItems).where(eq(galleryItems.id, id));
}

// Hero Background queries
export async function getActiveHeroBackground() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(heroBackgrounds).where(and(eq(heroBackgrounds.isActive, 1), eq(heroBackgrounds.status, "published"), eq(heroBackgrounds.section, "main"))).orderBy(desc(heroBackgrounds.order)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveHeroBackgroundBySection(section: "main" | "section2" | "section3" | "information") {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(heroBackgrounds).where(and(eq(heroBackgrounds.isActive, 1), eq(heroBackgrounds.status, "published"), eq(heroBackgrounds.section, section))).orderBy(desc(heroBackgrounds.order)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getHeroBackgrounds(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(heroBackgrounds).orderBy(desc(heroBackgrounds.createdAt)).limit(limit).offset(offset);
}

export async function getHeroBackgroundById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(heroBackgrounds).where(eq(heroBackgrounds.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createHeroBackground(background: InsertHeroBackground) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(heroBackgrounds).values(background);
}

export async function updateHeroBackground(id: number, background: Partial<InsertHeroBackground>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(background).filter(([, value]) => value !== undefined)
  ) as Partial<InsertHeroBackground>;
  
  await db.update(heroBackgrounds).set(updateData).where(eq(heroBackgrounds.id, id));
  
  return getHeroBackgroundById(id);
}

export async function deleteHeroBackground(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(heroBackgrounds).where(eq(heroBackgrounds.id, id));
}

// Service Items queries
export async function getServiceItems(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: serviceItems.id,
    itemKey: serviceItems.itemKey,
    title: serviceItems.title,
    description: serviceItems.description,
    type: serviceItems.type,
    mediaUrl: serviceItems.mediaUrl,
    fileKey: serviceItems.fileKey,
    uploadedBy: serviceItems.uploadedBy,
    order: serviceItems.order,
    isActive: serviceItems.isActive,
    createdAt: serviceItems.createdAt,
    updatedAt: serviceItems.updatedAt,
  }).from(serviceItems).orderBy(serviceItems.order, desc(serviceItems.createdAt)).limit(limit).offset(offset);
}

export async function getServiceItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(serviceItems).where(eq(serviceItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createServiceItem(item: InsertServiceItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(serviceItems).values(item);
}

export async function updateServiceItem(id: number, item: Partial<InsertServiceItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(item).filter(([, value]) => value !== undefined)
  ) as Partial<InsertServiceItem>;
  
  await db.update(serviceItems).set(updateData).where(eq(serviceItems.id, id));
  
  return getServiceItemById(id);
}

export async function deleteServiceItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(serviceItems).where(eq(serviceItems.id, id));
}


// Site Branding queries
export async function getSiteBranding() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(siteBranding).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateSiteBranding(branding: InsertSiteBranding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSiteBranding();
  
  if (existing) {
    return db.update(siteBranding).set(branding).where(eq(siteBranding.id, existing.id));
  } else {
    return db.insert(siteBranding).values(branding);
  }
}

export async function updateSiteBranding(id: number, branding: Partial<InsertSiteBranding>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(branding).filter(([, value]) => value !== undefined)
  ) as Partial<InsertSiteBranding>;
  
  await db.update(siteBranding).set(updateData).where(eq(siteBranding.id, id));
  
  return getSiteBranding();
}


// Section Titles queries
export async function getSectionTitle(sectionKey: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sectionTitles).where(eq(sectionTitles.sectionKey, sectionKey)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllSectionTitles() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sectionTitles);
}

export async function createSectionTitle(title: InsertSectionTitle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sectionTitles).values(title);
  return result;
}

export async function updateSectionTitle(id: number, title: Partial<InsertSectionTitle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(title).filter(([, value]) => value !== undefined)
  ) as Partial<InsertSectionTitle>;
  
  await db.update(sectionTitles).set(updateData).where(eq(sectionTitles.id, id));
  
  return getSectionTitle(title.sectionKey || '');
}

export async function updateSectionTitleByKey(sectionKey: string, title: Partial<InsertSectionTitle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(title).filter(([, value]) => value !== undefined)
  ) as Partial<InsertSectionTitle>;
  
  await db.update(sectionTitles).set(updateData).where(eq(sectionTitles.sectionKey, sectionKey));
  
  return getSectionTitle(sectionKey);
}

export async function deleteSectionTitle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(sectionTitles).where(eq(sectionTitles.id, id));
}

// Price Packages functions
export async function getPricePackages() {
  const db = await getDb();
  if (!db) return [];
  
  const { pricePackages } = await import("../drizzle/schema");
  return db.select().from(pricePackages).orderBy(pricePackages.order);
}

export async function getPricePackageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { pricePackages } = await import("../drizzle/schema");
  const result = await db.select().from(pricePackages).where(eq(pricePackages.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function updatePricePackage(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pricePackages } = await import("../drizzle/schema");
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  );
  
  await db.update(pricePackages).set(updateData).where(eq(pricePackages.id, id));
  return getPricePackageById(id);
}

// Price Add-ons functions
export async function getPriceAddOns() {
  const db = await getDb();
  if (!db) return [];
  
  const { priceAddOns } = await import("../drizzle/schema");
  return db.select().from(priceAddOns).orderBy(priceAddOns.order);
}

export async function getPriceAddOnById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { priceAddOns } = await import("../drizzle/schema");
  const result = await db.select().from(priceAddOns).where(eq(priceAddOns.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function updatePriceAddOn(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { priceAddOns } = await import("../drizzle/schema");
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  );
  
  await db.update(priceAddOns).set(updateData).where(eq(priceAddOns.id, id));
  return getPriceAddOnById(id);
}

// Footer Settings queries
export async function getFooterSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(footerSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createFooterSettings(settings: InsertFooterSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(footerSettings).values(settings);
  return getFooterSettings();
}

export async function updateFooterSettings(id: number, settings: Partial<InsertFooterSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(settings).filter(([, value]) => value !== undefined)
  ) as Partial<InsertFooterSettings>;
  
  await db.update(footerSettings).set(updateData).where(eq(footerSettings.id, id));
  
  return getFooterSettings();
}

// Board Layout Settings queries
export async function getBoardLayoutSettings(boardKey: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(boardLayoutSettings).where(eq(boardLayoutSettings.boardKey, boardKey)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllBoardLayoutSettings() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(boardLayoutSettings);
}

export async function createBoardLayoutSettings(settings: InsertBoardLayoutSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(boardLayoutSettings).values(settings);
  return getBoardLayoutSettings(settings.boardKey);
}

export async function updateBoardLayoutSettings(id: number, settings: Partial<InsertBoardLayoutSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData = Object.fromEntries(
    Object.entries(settings).filter(([, value]) => value !== undefined)
  ) as Partial<InsertBoardLayoutSettings>;
  
  await db.update(boardLayoutSettings).set(updateData).where(eq(boardLayoutSettings.id, id));
  
  const result = await db.select().from(boardLayoutSettings).where(eq(boardLayoutSettings.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Instagram Posts queries
import { instagramPosts, InstagramPost, InsertInstagramPost } from "../drizzle/schema";
import { asc } from "drizzle-orm";

export async function getInstagramPosts(onlyActive = true) {
  const db = await getDb();
  if (!db) return [];

  if (onlyActive) {
    return db.select().from(instagramPosts)
      .where(eq(instagramPosts.isActive, 1))
      .orderBy(asc(instagramPosts.sortOrder), desc(instagramPosts.createdAt));
  }
  return db.select().from(instagramPosts)
    .orderBy(asc(instagramPosts.sortOrder), desc(instagramPosts.createdAt));
}

export async function getInstagramPostById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(instagramPosts).where(eq(instagramPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createInstagramPost(post: InsertInstagramPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(instagramPosts).values(post);
  const insertedId = (result as any)[0]?.insertId;
  if (insertedId) {
    return getInstagramPostById(insertedId);
  }
  return null;
}

export async function updateInstagramPost(id: number, post: Partial<InsertInstagramPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData = Object.fromEntries(
    Object.entries(post).filter(([, value]) => value !== undefined)
  ) as Partial<InsertInstagramPost>;

  await db.update(instagramPosts).set(updateData).where(eq(instagramPosts.id, id));
  return getInstagramPostById(id);
}

export async function deleteInstagramPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(instagramPosts).where(eq(instagramPosts.id, id));
}


// Featured Posts queries
export async function getFeaturedPost(category: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(posts)
    .where(and(
      eq(posts.category, category as any),
      eq(posts.featured, 1),
      eq(posts.status, 'published')
    ))
    .orderBy(desc(posts.updatedAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function setFeaturedPost(postId: number, category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // First, unset all featured posts in this category
  await db.update(posts)
    .set({ featured: 0 })
    .where(and(
      eq(posts.category, category as any),
      eq(posts.featured, 1)
    ));

  // Then set the new featured post
  await db.update(posts)
    .set({ featured: 1 })
    .where(eq(posts.id, postId));

  return getPostById(postId);
}

export async function unsetFeaturedPost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts)
    .set({ featured: 0 })
    .where(eq(posts.id, postId));

  return getPostById(postId);
}


// ========== Hero Text Rotation ==========
export async function getHeroTextRotation() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(heroTextRotation).limit(1);
  return rows[0] || null;
}

export async function upsertHeroTextRotation(data: {
  text1Title: string;
  text1Description: string;
  text2Title: string;
  text2Description: string;
  text3Title: string;
  text3Description: string;
  intervalMs: number;
  animationType: string;
  updatedBy: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(heroTextRotation).limit(1);
  if (existing.length > 0) {
    await db.update(heroTextRotation).set(data).where(eq(heroTextRotation.id, existing[0].id));
    return { ...existing[0], ...data };
  } else {
    const result = await db.insert(heroTextRotation).values(data);
    return { id: result[0].insertId, ...data };
  }
}


// ========== Information Items ==========
export async function getInformationItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(informationItems);
}

export async function getInformationItemBySection(sectionKey: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(informationItems).where(eq(informationItems.sectionKey, sectionKey)).limit(1);
  return rows[0] || null;
}

export async function upsertInformationItem(data: {
  sectionKey: string;
  title: string;
  items: string;
  description?: string;
  updatedBy: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(informationItems).where(eq(informationItems.sectionKey, data.sectionKey)).limit(1);
  if (existing.length > 0) {
    await db.update(informationItems).set(data).where(eq(informationItems.id, existing[0].id));
    return { ...existing[0], ...data };
  } else {
    const result = await db.insert(informationItems).values(data);
    return { id: result[0].insertId, ...data };
  }
}

// Reservation form labels queries
export async function getReservationFormLabels() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(reservationFormLabels).limit(1);
  if (result.length > 0) return result[0];
  
  // Return default labels if none exist
  return {
    id: 0,
    cat1Label: '담당자 정보',
    cat2Label: '행사 정보',
    cat3Label: '작업 내용',
    cat4Label: '결제 정보',
    cat5Label: '프로그램 및 요청사항',
    sub1_1Label: '담당자 성함',
    sub1_2Label: '연락처',
    sub1_3Label: '이메일',
    sub2_1Label: '행사명',
    sub2_2Label: '장소',
    sub2_3Label: '행사 날짜',
    sub2_4Label: '시작 시간',
    sub2_5Label: '리허설 시간',
    sub3_1Label: '분류',
    sub3_2Label: '촬영 유형',
    sub3_3Label: '특수 요청',
    sub3_4Label: '공개 여부',
    sub4_1Label: '결제 방식',
    sub4_2Label: '계산서 발행',
    sub4_3Label: '견적액',
    sub4_4Label: '결제된 금액',
    sub4_5Label: '미납 금액',
    sub4_6Label: '진행상황',
    progressOption1: '접수중',
    progressOption2: '예약완료',
    progressOption3: '준비중',
    progressOption4: '작업중',
    progressOption5: '작업완료',
    progressOption6: '취소',
    eventTypeOption1: '사진 촬영',
    eventTypeOption2: '공연 촬영',
    eventTypeOption3: '영상 제작',
    eventTypeOption4: '뮤직비디오 제작',
    eventTypeOption5: '기타',
    recordingTypeOption1: 'Photo',
    recordingTypeOption2: 'Solo',
    recordingTypeOption3: 'Recording',
    recordingTypeOption4: 'Simple',
    recordingTypeOption5: 'Basic',
    recordingTypeOption6: 'Professional',
    specialReqOption1: '드론',
    specialReqOption2: '짐벌',
    specialReqOption3: '지미집',
    specialReqOption4: '기타',
    isPublicOption1: '허용',
    isPublicOption2: '불허',
    paymentMethodOption1: '카드',
    paymentMethodOption2: '계좌이체',
    paymentMethodOption3: '현금',
    receiptTypeOption1: '발행',
    receiptTypeOption2: '미발행',
    receiptTypeOption3: '간이영수증',
    updatedBy: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateReservationFormLabels(data: Partial<InsertReservationFormLabels> & { updatedBy: number }) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(reservationFormLabels).limit(1);
  if (existing.length > 0) {
    await db.update(reservationFormLabels).set(data).where(eq(reservationFormLabels.id, existing[0].id));
    return { ...existing[0], ...data };
  } else {
    const result = await db.insert(reservationFormLabels).values(data as InsertReservationFormLabels);
    return { id: result[0].insertId, ...data };
  }
}


// ===== Local Auth (Username/Password) =====

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(data: {
  username: string;
  name: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate a unique openId for local users (prefix with "local_")
  const openId = `local_${data.username}_${Date.now()}`;

  const result = await db.insert(users).values({
    openId,
    username: data.username,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "local",
    role: "user",
    lastSignedIn: new Date(),
  });

  return { id: result[0].insertId, openId };
}
