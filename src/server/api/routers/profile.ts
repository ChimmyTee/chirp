// For some reason this has to be a type import
// import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

// using this to filter out the data returned from usersList
// const filterUserForClient = (user: User) => {
//   return {
//     id: user.id,
//     username: user.username,
//     profileImageUrl: user.profileImageUrl,
//   };
// };

// This router is used to fetch Profile User's name into our App.
// don't forget to add the router to the root.
// export const profileRouter = createTRPCRouter({
//     getUserByUsername: publicProcedure
//         .input(z.object({ username: z.string() }))
//         .query(async ({ input }) => {
//             const [user] = await clerkClient.users.getUserList({
//                 username: [input.username],
//             });

//             if (!user) {
//                 throw new TRPCError({
//                     code: "INTERNAL_SERVER_ERROR",
//                     message: "User not found",
//                 });
//             }

//             return filterUserForClient(user);
//         }),
// });

export const profileRouter = createTRPCRouter({
    getUserByID: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            const [user] = await clerkClient.users.getUserList({
                userId: [input.userId],
            });

            if (!user) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "User not found",
                });
            }

            return filterUserForClient(user);
        }),
});
