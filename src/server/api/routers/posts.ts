import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    // Ctrl + Shift + P to restart typeScript server.
    // Because typing prisma. doesn't give us the intellisense we needed.
    return ctx.prisma.post.findMany();
  }),
});
