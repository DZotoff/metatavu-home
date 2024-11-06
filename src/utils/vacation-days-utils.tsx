import { Grid, Typography } from "@mui/material";
import { theme } from "../theme";
import strings from "../localization/strings";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Display persons vacation days in card
 *
 * @param User KeyCloak user
 */
export const renderVacationDaysTextForCard = (user: User) => {
  const { spentVacationsColor, unspentVacationsColor } = getVacationColors(user);

  if (user) {
    return (
      <Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.spentVacations}
          </Grid>
          <Grid item xs={6}>
            <Typography color={spentVacationsColor}>
              {/*{user.spentVacations}*/}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.unspentVacations}
          </Grid>
          <Grid item xs={6}>
            <Typography color={unspentVacationsColor}>
              {/*{user.unspentVacations}*/}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
    return <Typography>{strings.error.personsFetch}</Typography>;
};

/**
 * Display users vacation days in screen
 *
 * @param User KeyCloak user
 */
export const renderVacationDaysTextForScreen = (user: User) => {
  //FIXME: Deal with the spent and unspent vacations
  const spentVacationsColor = theme.palette.error.main;
  const unspentVacationsColor = theme.palette.error.main;

  if (user) {
    return (
      <Grid container justifyContent="space-around">
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.spentVacations}
          <Typography color={spentVacationsColor} style={{ marginLeft: "8px" }}>
            {/*{user.spentVacations}*/}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.unspentVacations}
          <Typography color={unspentVacationsColor} style={{ marginLeft: "8px" }}>
            {/*{user.unspentVacations}*/}
          </Typography>
        </Grid>
      </Grid>
    );
  }
    return <Typography>{strings.error.personsFetch}</Typography>;
};

const getVacationColors = (user: User)=> {
  //FIXME: Deal with the spent and unspent vacations
  // Default colors, to be modified later once `spentVacations` and `unspentVacations` are available
  const spentVacationsColor = theme.palette.error.main;
  const unspentVacationsColor = theme.palette.error.main;

  // Uncomment and modify when `spentVacations` and `unspentVacations` properties are available
  // if (user && user.spentVacations > 0) {
  //   spentVacationsColor = theme.palette.success.main;
  // }
  // if (user && user.unspentVacations > 0) {
  //   unspentVacationsColor = theme.palette.success.main;
  // }

  return {
    spentVacationsColor,
    unspentVacationsColor
  };
}
