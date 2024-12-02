import type { User } from "src/generated/homeLambdasClient/models/User";
import config from "src/app/config";

/**
 * To get the severa user id when logged in, if severaUserId is not found, it will return the test user severa id
 *
 * @param user
 * @returns user severaUserId or testUserSeveraId
 */
export const getSeveraUserId = (user: User | undefined): string => {
  return user?.attributes?.severaUserId ?? config.user.testUserSeveraId ?? "";
};
