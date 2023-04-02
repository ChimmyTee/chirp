// For some reason this has to be a type import
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// using this to filter out the data returned from usersList
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  // Apparently this is a promise query
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Ctrl + Shift + P to restart typeScript server.
    // Because typing prisma. doesn't give us the intellisense we needed.
    // return ctx.prisma.post.findMany();
    const posts = await ctx.prisma.post.findMany({
      // ctrl + space to find options available, with help of typeSafety
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    console.log(users);

    return posts.map((post) => ({
      post,
      author: users.find((user) => user.id === post.authorId),
    }));

  }),
});
