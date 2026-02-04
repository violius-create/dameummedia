import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Posts router
  posts: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional(), limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role === 'admin') {
          return db.getAllPosts(input.category, input.limit, input.offset);
        }
        return db.getPosts(input.category, input.limit, input.offset);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const post = await db.getPostById(input.id);
        if (!post) return null;
        if (post.status === 'published') return post;
        if (ctx.user?.role === 'admin') return post;
        return null;
      }),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), content: z.string(), category: z.string(), imageUrl: z.string().optional(), videoUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        return db.createPost({
          title: input.title,
          content: input.content,
          category: input.category as any,
          authorId: ctx.user.id,
          imageUrl: input.imageUrl,
          videoUrl: input.videoUrl,
          status: 'published',
        });
      }),
    
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), category: z.string().optional(), imageUrl: z.string().optional(), videoUrl: z.string().optional() }))
      .mutation(({ input }) => db.updatePost(input.id, { title: input.title, content: input.content, category: input.category as any, imageUrl: input.imageUrl, videoUrl: input.videoUrl })),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePost(input.id)),
  }),
  
  // Images router
  images: router({
    upload: adminProcedure
      .input(z.object({ fileName: z.string(), fileData: z.string(), mimeType: z.string(), postId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileKey = `posts/${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          await db.createImage({
            fileName: input.fileName,
            fileKey,
            fileUrl: url,
            fileSize: buffer.length,
            mimeType: input.mimeType,
            uploadedBy: ctx.user.id,
            postId: input.postId,
          });
          
          return {
            fileName: input.fileName,
            fileUrl: url,
            fileKey: fileKey,
          };
        } catch (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload image' });
        }
      }),
    
    getByPostId: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(({ input }) => db.getImagesByPostId(input.postId)),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteImage(input.id)),
  }),
  
  // Reservations router
  reservations: router({
    create: publicProcedure
      .input(z.object({
        clientName: z.string(),
        clientEmail: z.string(),
        clientPhone: z.string().optional(),
        eventName: z.string(),
        eventType: z.enum(['concert', 'film', 'other']),
        venue: z.string().optional(),
        eventDate: z.date().optional(),
        rehearsalTime: z.string().optional(),
        composition: z.string().optional(),
        managerName: z.string().optional(),
        managerPhone: z.string().optional(),
        recordingStaff: z.string().optional(),
        photographyStaff: z.string().optional(),
        audioSettings: z.string().optional(),
        projectMonitor: z.string().optional(),
        paymentMethod: z.string().optional(),
        isPublic: z.number().optional(),
        receiptType: z.string().optional(),
        paidAmount: z.number().optional(),
        unpaidAmount: z.number().optional(),
        description: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createReservation({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          eventName: input.eventName,
          eventType: input.eventType as any,
          venue: input.venue,
          eventDate: input.eventDate,
          rehearsalTime: input.rehearsalTime,
          composition: input.composition,
          managerName: input.managerName,
          managerPhone: input.managerPhone,
          recordingStaff: input.recordingStaff,
          photographyStaff: input.photographyStaff,
          audioSettings: input.audioSettings,
          projectMonitor: input.projectMonitor,
          paymentMethod: input.paymentMethod as any,
          isPublic: input.isPublic,
          receiptType: input.receiptType as any,
          paidAmount: input.paidAmount,
          unpaidAmount: input.unpaidAmount,
          description: input.description,
          status: (input.status || 'pending') as any,
        });
      }),
    
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(({ input }) => db.getReservations(input.limit, input.offset)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getReservationById(input.id)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteReservation(input.id)),
    
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(({ input }) => db.updateReservation(input.id, { status: input.status as any })),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          clientName: z.string().optional(),
          clientEmail: z.string().optional(),
          clientPhone: z.string().optional(),
          eventName: z.string().optional(),
          eventType: z.enum(['concert', 'film', 'other']).optional(),
          venue: z.string().optional(),
          eventDate: z.date().optional(),
          rehearsalTime: z.string().optional(),
          composition: z.string().optional(),
          managerName: z.string().optional(),
          managerPhone: z.string().optional(),
          recordingStaff: z.string().optional(),
          photographyStaff: z.string().optional(),
          audioSettings: z.string().optional(),
          projectMonitor: z.string().optional(),
          paymentMethod: z.enum(['card', 'transfer', 'cash', 'other']).optional(),
          isPublic: z.number().optional(),
          receiptType: z.enum(['individual', 'business', 'other']).optional(),
          paidAmount: z.number().optional(),
          unpaidAmount: z.number().optional(),
          description: z.string().optional(),
          status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
        }),
      }))
      .mutation(({ input }) => db.updateReservation(input.id, input.data)),
  }),

  // Gallery router
  // File upload router
  upload: router({
    uploadFile: adminProcedure
      .input(z.object({ fileName: z.string(), fileData: z.string(), mimeType: z.string() }))
      .mutation(async ({ input }) => {
        try {
          // Convert base64 string to Buffer
          const buffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file key
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const fileKey = `gallery/${timestamp}-${randomSuffix}-${input.fileName}`;
          
          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          return {
            success: true,
            url,
            fileKey,
            fileName: input.fileName,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `파일 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          });
        }
      }),
  }),

  gallery: router({
    list: publicProcedure
      .input(z.object({ category: z.enum(['concert', 'film']).optional(), limit: z.number().default(100), offset: z.number().default(0) }))
      .query(({ input }) => db.getGalleryItems(input.category, input.limit, input.offset)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getGalleryItemById(input.id)),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), type: z.enum(['image', 'video']), category: z.enum(['concert', 'film']), mediaUrl: z.string(), thumbnailUrl: z.string().optional(), fileKey: z.string(), order: z.number().default(0), featured: z.number().default(0) }))
      .mutation(async ({ input, ctx }) => {
        return db.createGalleryItem({
          title: input.title,
          description: input.description,
          type: input.type,
          category: input.category,
          mediaUrl: input.mediaUrl,
          thumbnailUrl: input.thumbnailUrl,
          fileKey: input.fileKey,
          uploadedBy: ctx.user.id,
          order: input.order,
          featured: input.featured,
          status: 'published',
        });
      }),
    
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), order: z.number().optional(), featured: z.number().optional() }))
      .mutation(({ input }) => db.updateGalleryItem(input.id, { title: input.title, description: input.description, order: input.order, featured: input.featured })),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteGalleryItem(input.id)),
  }),

  // Hero Background router
  heroBackground: router({
    getActive: publicProcedure
      .query(async () => {
        return db.getActiveHeroBackground();
      }),
    
    list: adminProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getHeroBackgrounds(input.limit, input.offset);
      }),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), type: z.enum(["image", "video"]), mediaUrl: z.string(), fileKey: z.string(), thumbnailUrl: z.string().optional(), isActive: z.number().optional(), section: z.enum(["main", "section2", "section3"]).optional() }))
      .mutation(async ({ input, ctx }) => {
        // Deactivate other backgrounds in the same section if this one is active
        if (input.isActive === 1) {
          const allBackgrounds = await db.getHeroBackgrounds(1000, 0);
          const currentSection = input.section || "main";
          for (const bg of allBackgrounds) {
            const bgSection = (bg as any).section || "main";
            if (bg.isActive === 1 && bgSection === currentSection) {
              await db.updateHeroBackground(bg.id, { isActive: 0 });
            }
          }
        }
        return db.createHeroBackground({
          title: input.title,
          description: input.description,
          type: input.type,
          mediaUrl: input.mediaUrl,
          fileKey: input.fileKey,
          uploadedBy: ctx.user.id,
          isActive: input.isActive || 1,
          status: "published",
          section: (input.section || "main") as "main" | "section2" | "section3",
        });
      }),
    
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input }) => {
        // If activating this background, deactivate others in the same section
        if (input.isActive === 1) {
          const backgrounds = await db.getHeroBackgrounds(1000, 0);
          const currentBg = backgrounds.find(bg => bg.id === input.id);
          const currentSection = (currentBg as any)?.section || "main";
          for (const bg of backgrounds) {
            const bgSection = (bg as any).section || "main";
            if (bg.id !== input.id && bg.isActive === 1 && bgSection === currentSection) {
              await db.updateHeroBackground(bg.id, { isActive: 0 });
            }
          }
        }
        return db.updateHeroBackground(input.id, { title: input.title, description: input.description, isActive: input.isActive });
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteHeroBackground(input.id)),
  }),

  serviceItems: router({
    getAll: publicProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getServiceItems(input.limit, input.offset);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getServiceItemById(input.id);
      }),
    
    list: adminProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getServiceItems(input.limit, input.offset);
      }),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), type: z.enum(["image", "video"]), mediaUrl: z.string(), fileKey: z.string(), thumbnailUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        return db.createServiceItem({
          title: input.title,
          description: input.description,
          type: input.type,
          mediaUrl: input.mediaUrl,
          fileKey: input.fileKey,
          uploadedBy: ctx.user.id,
          isActive: 1,
          status: "published",
        });
      }),
    
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), isActive: z.number().optional(), mediaUrl: z.string().optional(), fileKey: z.string().optional(), type: z.enum(["image", "video"]).optional() }))
      .mutation(async ({ input }) => {
        return db.updateServiceItem(input.id, { title: input.title, description: input.description, isActive: input.isActive, mediaUrl: input.mediaUrl, fileKey: input.fileKey, type: input.type });
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteServiceItem(input.id)),
  }),

  siteBranding: router({
    get: publicProcedure
      .query(async () => {
        return db.getSiteBranding();
      }),
    
    update: adminProcedure
      .input(z.object({ logoUrl: z.string().optional(), logoFileKey: z.string().optional(), title: z.string().optional(), subtitle: z.string().optional(), instagramUrl: z.string().optional(), youtubeUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getSiteBranding();
        if (existing) {
          return db.updateSiteBranding(existing.id, {
            logoUrl: input.logoUrl,
            logoFileKey: input.logoFileKey,
            title: input.title,
            subtitle: input.subtitle,
            instagramUrl: input.instagramUrl,
            youtubeUrl: input.youtubeUrl,
          });
        } else {
          return db.createOrUpdateSiteBranding({
            logoUrl: input.logoUrl,
            logoFileKey: input.logoFileKey,
            title: input.title,
            subtitle: input.subtitle,
            instagramUrl: input.instagramUrl,
            youtubeUrl: input.youtubeUrl,
            uploadedBy: ctx.user.id,
          });
        }
      }),
  }),

  // Section Titles router
  sectionTitles: router({
    get: publicProcedure
      .input(z.object({ sectionKey: z.string() }))
      .query(async ({ input }) => {
        return db.getSectionTitle(input.sectionKey);
      }),
    
    list: publicProcedure
      .query(async () => {
        return db.getAllSectionTitles();
      }),
    
    update: adminProcedure
      .input(z.object({ sectionKey: z.string(), title: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getSectionTitle(input.sectionKey);
        if (existing) {
          return db.updateSectionTitle(existing.id, {
            title: input.title,
            description: input.description,
            updatedBy: ctx.user.id,
          });
        } else {
          return db.createSectionTitle({
            sectionKey: input.sectionKey,
            title: input.title || '',
            description: input.description,
            updatedBy: ctx.user.id,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
