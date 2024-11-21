import { Grid, Typography, Card, CardContent, Skeleton } from "@mui/material";
import strings from "src/localization/strings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { errorAtom } from "src/atoms/error";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";
import UserRoleUtils from "src/utils/user-role-utils";
import { DateTime } from "luxon";
import { usersAtom } from "src/atoms/user";
import type { Flextime } from "src/generated/homeLambdasClient";
import type { User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { getSeveraUserId } from "src/utils/user-utils";

/**
 * Component for displaying user's balance
 */
const BalanceCard = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const adminMode = UserRoleUtils.adminMode();
  const [usersFlextimes, setUsersFlextimes] = useState<Flextime[]>();
  const yesterday = DateTime.now().minus({ days: 1 });
  const { flexTimeApi } = useLambdasApi();

  /**
   * Initialize logged in users's time data.
   */
  const getUsersFlextimes = async () => {
    setLoading(true);
    const loggedInUser = users.find(
      (users: User) =>
        users.id === userProfile?.id
    );
    console.log("loggedInUser", loggedInUser);
    if (loggedInUser) {
      const severaUserId = getSeveraUserId(loggedInUser);
      console.log("severaUserId", severaUserId);
      try {
        console.log(flexTimeApi);
        const fetchedUsersFlextime = await flexTimeApi.getFlextimeBySeveraUserId({
          severaUserId
        });
        console.log("fetchedUsersFlextime:", fetchedUsersFlextime);
        setUsersFlextimes([fetchedUsersFlextime]);
        console.log("usersFlextimes:", usersFlextimes);
      } catch (error) {
        console.log(error)
        setError(`${strings.error.fetchFailedGeneral}, ${error}`);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("users", users);
    if (users.length > 0 && userProfile) {
      getUsersFlextimes();
    }
  }, [users, userProfile]);

  const renderUserFlextime = () => {
    return (
      <Typography variant="body1">
        " No data"
        FIXME: Localization
      </Typography>
    );
  };

  return (
    <Link
      to={adminMode ? "/admin/timebank/viewall" : "/timebank"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        {adminMode ? (
          <CardContent>
            <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
              {strings.timebank.employeeBalances}
            </Typography>
            <Typography variant="body1">{strings.timebank.viewAllTimeEntries}</Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
              {strings.timebank.balance}
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                {strings.formatString(strings.timebank.atTheEndOf, yesterday.toLocaleString())}
              </Grid>
              <Grid style={{ marginBottom: 1 }} item xs={1}>
                <ScheduleIcon style={{ marginTop: 1 }} />
              </Grid>
              <Grid item xs={11}>
                {loading ? <Skeleton /> : renderUserFlextime()}
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default BalanceCard;
