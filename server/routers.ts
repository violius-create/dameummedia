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
      .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), imageUrl: z.string().optional(), videoUrl: z.string().optional() }))
      .mutation(({ input }) => db.updatePost(input.id, { title: input.title, content: input.content, imageUrl: input.imageUrl, videoUrl: input.videoUrl })),
    
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
          
          return db.createImage({
            fileName: input.fileName,
            fileKey,
            fileUrl: url,
            fileSize: buffer.length,
            mimeType: input.mimeType,
            uploadedBy: ctx.user.id,
            postId: input.postId,
          });
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
      .input(z.object({ clientName: z.string(), clientEmail: z.string(), clientPhone: z.string().optional(), eventDate: z.date().optional(), eventType: z.string(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return db.createReservation({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          eventDate: input.eventDate,
          eventType: input.eventType as any,
          description: input.description,
          status: 'pending',
        });
      }),
    
    list: adminProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(({ input }) => db.getReservations(input.limit, input.offset)),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getReservationById(input.id)),
    
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(({ input }) => db.updateReservation(input.id, { status: input.status as any })),
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
});

export type AppRouter = typeof appRouter;
