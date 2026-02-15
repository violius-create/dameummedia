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
        // admin_board category is only accessible by admins
        if (input.category === 'admin_board' && ctx.user?.role !== 'admin') {
          return [];
        }
        if (ctx.user?.role === 'admin') {
          return db.getAllPosts(input.category, input.limit, input.offset);
        }
        return db.getPosts(input.category, input.limit, input.offset);
      }),

    count: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        // admin_board category is only accessible by admins
        if (input.category === 'admin_board' && ctx.user?.role !== 'admin') {
          return 0;
        }
        if (ctx.user?.role === 'admin') {
          return db.getAllPostsCount(input.category);
        }
        return db.getPostsCount(input.category);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const post = await db.getPostById(input.id);
        if (!post) return null;
        // admin_board posts are only accessible by admins
        if (post.category === 'admin_board' && ctx.user?.role !== 'admin') return null;
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

    getFeatured: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => db.getFeaturedPost(input.category)),

    setFeatured: adminProcedure
      .input(z.object({ postId: z.number(), category: z.string() }))
      .mutation(({ input }) => db.setFeaturedPost(input.postId, input.category)),

    unsetFeatured: adminProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(({ input }) => db.unsetFeaturedPost(input.postId)),
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
        eventType: z.enum(['photo', 'concert', 'video', 'music_video', 'other']),
        venue: z.string().optional(),
        eventDate: z.date().optional(),
        rehearsalTime: z.string().optional(),
        composition: z.string().optional(),
        managerName: z.string().optional(),
        managerPhone: z.string().optional(),
        recordingStaff: z.string().optional(),
        photographyStaff: z.string().optional(),
        audioSettings: z.string().optional(),
        recordingType: z.string().optional(),
        specialRequirements: z.string().optional(),
        paymentMethod: z.enum(['card', 'transfer', 'cash', 'other', 'full', 'half']).optional(),
        isPublic: z.number().optional(),
        receiptType: z.enum(['issued', 'not_issued', 'cash_receipt']).optional(),
        quotedAmount: z.number().optional(),
        paidAmount: z.number().optional(),
        unpaidAmount: z.number().optional(),
        description: z.string().optional(),
        attachments: z.string().optional(),
        linkUrl: z.string().optional(),
        startTime: z.string().optional(),
        progressStatus: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'payment_completed', 'work_pending', 'in_progress', 'editing', 'completed', 'cancelled']).optional(),
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
          startTime: input.startTime,
          rehearsalTime: input.rehearsalTime,
          composition: input.composition,
          managerName: input.managerName,
          managerPhone: input.managerPhone,
          recordingStaff: input.recordingStaff,
          photographyStaff: input.photographyStaff,
          audioSettings: input.audioSettings,
          recordingType: input.recordingType,
          specialRequirements: input.specialRequirements,
          paymentMethod: input.paymentMethod as any,
          isPublic: input.isPublic,
          receiptType: input.receiptType as any,
          quotedAmount: input.quotedAmount,
          paidAmount: input.paidAmount,
          unpaidAmount: input.unpaidAmount,
          description: input.description,
          attachments: input.attachments,
          linkUrl: input.linkUrl,
          progressStatus: input.progressStatus,
          status: input.status as any,
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
          eventType: z.enum(['photo', 'concert', 'video', 'music_video', 'other']).optional(),
          venue: z.string().optional(),
          eventDate: z.date().optional(),
          rehearsalTime: z.string().optional(),
          composition: z.string().optional(),
          managerName: z.string().optional(),
          managerPhone: z.string().optional(),
          recordingStaff: z.string().optional(),
          photographyStaff: z.string().optional(),
          audioSettings: z.string().optional(),
          recordingType: z.string().optional(),
          specialRequirements: z.string().optional(),
          paymentMethod: z.enum(['card', 'transfer', 'cash', 'other', 'full', 'half']).optional(),
          isPublic: z.number().optional(),
          receiptType: z.enum(['issued', 'not_issued', 'cash_receipt']).optional(),
          quotedAmount: z.number().optional(),
          paidAmount: z.number().optional(),
          unpaidAmount: z.number().optional(),
          description: z.string().optional(),
          attachments: z.string().optional(),
          linkUrl: z.string().optional(),
          startTime: z.string().optional(),
          progressStatus: z.string().optional(),
          status: z.enum(['pending', 'confirmed', 'payment_completed', 'work_pending', 'in_progress', 'editing', 'completed', 'cancelled']).optional(),
        }),
      }))
      .mutation(({ input }) => db.updateReservation(input.id, input.data)),
  }),

  // Reservation form labels router
  reservationFormLabels: router({
    get: publicProcedure.query(async () => {
      return db.getReservationFormLabels();
    }),
    update: adminProcedure
      .input(z.object({
        cat1Label: z.string().optional(),
        cat2Label: z.string().optional(),
        cat3Label: z.string().optional(),
        cat4Label: z.string().optional(),
        cat5Label: z.string().optional(),
        sub1_1Label: z.string().optional(),
        sub1_2Label: z.string().optional(),
        sub1_3Label: z.string().optional(),
        sub2_1Label: z.string().optional(),
        sub2_2Label: z.string().optional(),
        sub2_3Label: z.string().optional(),
        sub2_4Label: z.string().optional(),
        sub2_5Label: z.string().optional(),
        sub3_1Label: z.string().optional(),
        sub3_2Label: z.string().optional(),
        sub3_3Label: z.string().optional(),
        sub3_4Label: z.string().optional(),
        sub4_1Label: z.string().optional(),
        sub4_2Label: z.string().optional(),
        sub4_3Label: z.string().optional(),
        sub4_4Label: z.string().optional(),
        sub4_5Label: z.string().optional(),
        sub4_6Label: z.string().optional(),
        progressOption1: z.string().optional(),
        progressOption2: z.string().optional(),
        progressOption3: z.string().optional(),
        progressOption4: z.string().optional(),
        progressOption5: z.string().optional(),
        progressOption6: z.string().optional(),
        // Radio/checkbox option labels
        eventTypeOption1: z.string().optional(),
        eventTypeOption2: z.string().optional(),
        eventTypeOption3: z.string().optional(),
        eventTypeOption4: z.string().optional(),
        eventTypeOption5: z.string().optional(),
        recordingTypeOption1: z.string().optional(),
        recordingTypeOption2: z.string().optional(),
        recordingTypeOption3: z.string().optional(),
        recordingTypeOption4: z.string().optional(),
        recordingTypeOption5: z.string().optional(),
        recordingTypeOption6: z.string().optional(),
        specialReqOption1: z.string().optional(),
        specialReqOption2: z.string().optional(),
        specialReqOption3: z.string().optional(),
        specialReqOption4: z.string().optional(),
        isPublicOption1: z.string().optional(),
        isPublicOption2: z.string().optional(),
        paymentMethodOption1: z.string().optional(),
        paymentMethodOption2: z.string().optional(),
        paymentMethodOption3: z.string().optional(),
        receiptTypeOption1: z.string().optional(),
        receiptTypeOption2: z.string().optional(),
        receiptTypeOption3: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.updateReservationFormLabels({ ...input, updatedBy: ctx.user.id });
      }),
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
    
    getActiveBySection: publicProcedure
      .input(z.enum(["main", "section2", "section3", "information"]))
      .query(async ({ input }) => {
        return db.getActiveHeroBackgroundBySection(input);
      }),
    
    list: adminProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getHeroBackgrounds(input.limit, input.offset);
      }),
    
    create: adminProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), type: z.enum(["image", "video"]), mediaUrl: z.string(), fileKey: z.string(), thumbnailUrl: z.string().optional(), isActive: z.number().optional(), overlayOpacity: z.number().optional(), section: z.enum(["main", "section2", "section3", "information"]).optional() }))
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
          overlayOpacity: input.overlayOpacity || 40,
          status: "published",
          section: (input.section || "main") as "main" | "section2" | "section3" | "information",
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
      .input(z.object({ logoUrl: z.string().optional(), logoFileKey: z.string().optional(), title: z.string().optional(), subtitle: z.string().optional(), instagramUrl: z.string().optional(), youtubeUrl: z.string().optional(), heroFadeStart: z.number().min(0).max(100).optional(), heroFadeEnd: z.number().min(0).max(100).optional(), instagramDisplayCount: z.number().min(1).max(50).optional() }))
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
            heroFadeStart: input.heroFadeStart,
            heroFadeEnd: input.heroFadeEnd,
            instagramDisplayCount: input.instagramDisplayCount,
          });
        } else {
          return db.createOrUpdateSiteBranding({
            logoUrl: input.logoUrl,
            logoFileKey: input.logoFileKey,
            title: input.title,
            subtitle: input.subtitle,
            instagramUrl: input.instagramUrl,
            youtubeUrl: input.youtubeUrl,
            heroFadeStart: input.heroFadeStart,
            heroFadeEnd: input.heroFadeEnd,
            instagramDisplayCount: input.instagramDisplayCount,
            uploadedBy: ctx.user.id,
          });
        }
      }),
  }),

  // Prices router
  prices: router({
    getPackages: publicProcedure
      .query(async () => {
        return db.getPricePackages();
      }),
    
    getAddOns: publicProcedure
      .query(async () => {
        return db.getPriceAddOns();
      }),
    
    updatePackage: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), displayName: z.string().optional(), description: z.string().optional(), basePrice: z.number().optional(), cameraCount: z.string().optional(), cameraType: z.string().optional(), microphoneCount: z.string().optional(), microphoneType: z.string().optional(), operatorCount: z.string().optional(), targetAudience: z.string().optional() }))
      .mutation(async ({ input }) => {
        return db.updatePricePackage(input.id, input);
      }),
    
    updateAddOn: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), price: z.number().optional() }))
      .mutation(async ({ input }) => {
        return db.updatePriceAddOn(input.id, input);
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
      .input(z.object({ sectionKey: z.string(), title: z.string().optional(), description: z.string().optional(), thumbnailGap: z.number().optional(), thumbnailWidth: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getSectionTitle(input.sectionKey);
        if (existing) {
          return db.updateSectionTitle(existing.id, {
            title: input.title,
            description: input.description,
            thumbnailGap: input.thumbnailGap,
            thumbnailWidth: input.thumbnailWidth,
            updatedBy: ctx.user.id,
          });
        } else {
          return db.createSectionTitle({
            sectionKey: input.sectionKey,
            title: input.title || '',
            description: input.description,
            thumbnailGap: input.thumbnailGap,
            thumbnailWidth: input.thumbnailWidth,
            updatedBy: ctx.user.id,
          });
        }
      }),
  }),

  // Footer Settings router
  footerSettings: router({
    get: publicProcedure
      .query(async () => {
        return db.getFooterSettings();
      }),
    
    update: adminProcedure
      .input(z.object({ companyName: z.string().optional(), copyrightText: z.string().optional(), address: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), businessNumber: z.string().optional(), youtubeUrl: z.string().optional(), instagramUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getFooterSettings();
        if (existing) {
          return db.updateFooterSettings(existing.id, {
            companyName: input.companyName,
            copyrightText: input.copyrightText,
            address: input.address,
            phone: input.phone,
            email: input.email,
            businessNumber: input.businessNumber,
            youtubeUrl: input.youtubeUrl,
            instagramUrl: input.instagramUrl,
            updatedBy: ctx.user.id,
          });
        } else {
          return db.createFooterSettings({
            companyName: input.companyName || '담음미디어',
            copyrightText: input.copyrightText || 'All rights reserved.',
            address: input.address,
            phone: input.phone,
            email: input.email,
            businessNumber: input.businessNumber,
            youtubeUrl: input.youtubeUrl,
            instagramUrl: input.instagramUrl,
            updatedBy: ctx.user.id,
          });
        }
      }),
  }),

  // Board Layout Settings router
  boardLayoutSettings: router({
    get: publicProcedure
      .input(z.object({ boardKey: z.string() }))
      .query(async ({ input }) => {
        return db.getBoardLayoutSettings(input.boardKey);
      }),
    
    list: publicProcedure
      .query(async () => {
        return db.getAllBoardLayoutSettings();
      }),
    
    update: adminProcedure
      .input(z.object({ 
        boardKey: z.string(), 
        itemsPerPage: z.number().optional(), 
        displayMode: z.string().optional(), 
        containerWidth: z.string().optional(),
        postWidth: z.string().optional(),
        postHeight: z.string().optional(),
        postMarginTop: z.string().optional(),
        postTitleSize: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getBoardLayoutSettings(input.boardKey);
        if (existing) {
          return db.updateBoardLayoutSettings(existing.id, {
            itemsPerPage: input.itemsPerPage,
            displayMode: input.displayMode,
            containerWidth: input.containerWidth,
            postWidth: input.postWidth,
            postHeight: input.postHeight,
            postMarginTop: input.postMarginTop,
            postTitleSize: input.postTitleSize,
            updatedBy: ctx.user.id,
          });
        } else {
          return db.createBoardLayoutSettings({
            boardKey: input.boardKey,
            itemsPerPage: input.itemsPerPage || 12,
            displayMode: input.displayMode || 'gallery',
            containerWidth: input.containerWidth || 'container',
            postWidth: input.postWidth || 'auto',
            postHeight: input.postHeight || 'auto',
            postMarginTop: input.postMarginTop || '0',
            postTitleSize: input.postTitleSize || 'base',
            updatedBy: ctx.user.id,
          });
        }
      }),
  }),

  // Instagram Posts router (manual feed management)
  instagramPosts: router({
    list: publicProcedure
      .input(z.object({ onlyActive: z.boolean().default(true) }))
      .query(({ input }) => db.getInstagramPosts(input.onlyActive)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getInstagramPostById(input.id)),

    create: adminProcedure
      .input(z.object({
        imageUrl: z.string(),
        fileKey: z.string().optional(),
        postUrl: z.string().optional(),
        caption: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.number().default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createInstagramPost({
          imageUrl: input.imageUrl,
          fileKey: input.fileKey,
          postUrl: input.postUrl,
          caption: input.caption,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
          uploadedBy: ctx.user.id,
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        fileKey: z.string().optional(),
        postUrl: z.string().optional(),
        caption: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateInstagramPost(id, data);
      }),

     delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteInstagramPost(input.id)),
  }),

  // Information Items
  informationItems: router({
    list: publicProcedure
      .query(async () => {
        return db.getInformationItems();
      }),
    getBySection: publicProcedure
      .input(z.object({ sectionKey: z.string() }))
      .query(async ({ input }) => {
        return db.getInformationItemBySection(input.sectionKey);
      }),
    upsert: adminProcedure
      .input(z.object({
        sectionKey: z.string(),
        title: z.string(),
        items: z.string(), // JSON array of strings
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.upsertInformationItem({
          ...input,
          updatedBy: ctx.user.id,
        });
      }),
  }),

  // Hero Text Rotation
  heroTextRotation: router({
    get: publicProcedure
      .query(async () => {
        return db.getHeroTextRotation();
      }),
    update: adminProcedure
      .input(z.object({
        text1Title: z.string(),
        text1Description: z.string(),
        text2Title: z.string(),
        text2Description: z.string(),
        text3Title: z.string(),
        text3Description: z.string(),
        intervalMs: z.number().min(500).max(30000),
        animationType: z.string().default("fadeSlideUp"),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.upsertHeroTextRotation({
          ...input,
          updatedBy: ctx.user.id,
        });
      }),
  }),
});
export type AppRouter = typeof appRouter;
