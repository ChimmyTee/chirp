import type { User } from "@clerk/nextjs/dist/api";

// Because we use this function in multiple areas of our components or routers.
// we decided to break it out into a helper.
export const filterUserForClient = (user: User) => {
    return {
      id: user.id,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
    };
  };
  