// For some reason this has to be a type import
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// using this to filter out the data returned from usersList
// got turned into a helper file now when used at profile router.
// kept it here for future reference.
// const filterUserForClient = (user: User) => {
//   return {
//     id: user.id,
//     username: user.username,
//     profileImageUrl: user.profileImageUrl,
//   };
// };

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "5 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  // Apparently this is a promise query
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Ctrl + Shift + P to restart typeScript server.
    // Because typing prisma. doesn't give us the intellisense we needed.
    // return ctx.prisma.post.findMany();
    const posts = await ctx.prisma.post.findMany({
      // ctrl + space to find options available, with help of typeSafety
      // best place to order posts.
      take: 100,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    console.log(users);

    // return posts.map((post) => ({
    //   post,
    //   author: users.find((user) => user.id === post.authorId),
    // }));

    // return posts.map((post) => {
    //   const author = users.find((user) => user.id === post.authorId);

    //   if (!author || !author.username) {
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: "Author for post no found",
    //     });
    //   }
    //   return {
    //     post,
    //     author: {
    //       ...author,
    //       username: author.username,
    //     },
    //   };
    // });

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post no found",
        });
      }
      return {
        post,
        author: {
          ...author,
          username: author.id,
        },
      };
    });
  }),
  // declaring a privateProcedure to be used on this posts objects.
  // privateProcedures means, the user has to exist, publicProcedure doesn't care which will throw an error.
  // This is especially important to ensure that user is always authenicated.
  // Here we have to use Zod to validate our inputs
  create: privateProcedure
    .input(z.object({ content: z.string().min(4, { message: "Must be 4 or more characters long" }).max(280) }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
