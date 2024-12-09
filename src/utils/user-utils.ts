import type { User } from "src/generated/homeLambdasClient/models/User";
import config from "src/app/config";
import strings from "src/localization/strings";

/**
 * To get the severa user id when logged in, if severaUserId is not found and in develop mode, it will return the test user severa id
 *
 * @param user
 * @returns user severaUserId or testUserSeveraId
 */
export const getSeveraUserId = (user: User | undefined): string => {
  const severaUserId = user?.attributes?.severaUserId;

  if (!severaUserId) {
    if (import.meta.env.MODE === "development") {
      return config.user.testUserSeveraId ?? "";
    }
    throw new Error(strings.error.noSeveraUserId);
  }
  return severaUserId;
};
