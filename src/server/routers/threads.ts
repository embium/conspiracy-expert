import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { zThread } from '@/features/threads/schemas';
import { ExtendedTRPCError } from '@/server/config/errors';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/config/trpc';

export const threadsRouter = createTRPCRouter({
  isThreadOwner: publicProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/threads/{id}/is-owner',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(z.object({ id: z.number() }))
    .output(z.boolean())
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.thread.findUnique({
        where: { id: input.id },
        include: {
          user: true,
        },
      });
      return thread?.userId === ctx.user?.id;
    }),
  getById: publicProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/threads/{id}',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(zThread().pick({ id: true }))
    .output(zThread())
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting thread');
      const thread = await ctx.db.thread.findUnique({
        where: { id: Number(input.id) },
      });

      if (!thread) {
        ctx.logger.warn('Unable to find thread with the provided input');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return thread;
    }),

  getAll: publicProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/threads',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(
      z
        .object({
          cursor: z.number().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zThread()),
        nextCursor: z.number().optional(),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting threads from database');

      const where = {
        title: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.ThreadWhereInput;

      const [total, items] = await ctx.db.$transaction([
        ctx.db.thread.count({
          where,
        }),
        ctx.db.thread.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            title: 'asc',
          },
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),

  create: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/threads',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(
      zThread().pick({
        title: true,
        body: true,
      })
    )
    .output(zThread())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Creating thread');
        return await ctx.db.thread.create({
          data: { ...input, user: { connect: { id: ctx.user.id } } },
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  updateById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'PUT',
        path: '/threads/{id}',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(
      zThread().pick({
        id: true,
        title: true,
        body: true,
      })
    )
    .output(zThread())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Updating thread');
        return await ctx.db.thread.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  removeById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/threads/{id}',
        protect: true,
        tags: ['threads'],
      },
    })
    .input(zThread().pick({ id: true }))
    .output(zThread())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info({ input }, 'Removing thread');
      try {
        return await ctx.db.thread.delete({
          where: { id: input.id },
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),
});
