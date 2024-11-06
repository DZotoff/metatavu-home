import type { VacationRequest } from "../generated/client";
import type { KeycloakProfile } from "keycloak-js";
import strings from "../localization/strings";
import {User} from "src/generated/homeLambdasClient";

/**
 * Get vacation request person full name
 * Match keycloak id from persons with vacationrequest id or user profile id
 *
 * @param props component properties
 * @returns person full name as string
 */
export const getVacationRequestPersonFullName = (
  vacationRequest: VacationRequest,
  users: User[],
  userProfile?: KeycloakProfile | undefined
) => {
  let userFullName = strings.vacationRequestError.nameNotFound;
  const foundUser = users.find((user) => user.id === vacationRequest?.personId);

  if (foundUser) {
    userFullName = `${foundUser.firstName} ${foundUser.lastName}`;
  } else if (userProfile && userProfile.id === vacationRequest.personId) {
    userFullName = `${userProfile.firstName} ${userProfile.lastName}`;
  }

  return userFullName;
};
