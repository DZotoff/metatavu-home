import { useEffect, useState } from "react";
import { Person, Timespan } from "src/generated/client";
import { CircularProgress, Card } from "@mui/material";
import { userProfileAtom } from "src/atoms/auth";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import {
  dailyEntriesAtom,
  personDailyEntryAtom,
  personsAtom,
  timebankScreenPersonTotalTimeAtom,
  timespanAtom
} from "src/atoms/person";
import { useApi } from "src/hooks/use-api";
import TimebankContent from "../timebank/timebank-content";
import { DateTime } from "luxon";
import strings from "src/localization/strings";
import config from "src/app/config";

/**
 * Timebank screen component.
 */
const TimebankScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const persons = useAtomValue(personsAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(loggedInPerson?.id);

  useEffect(() => {
    if (loggedInPerson) {
      setSelectedEmployeeId(loggedInPerson.id);
    }
  }, [loggedInPerson]);

  return (
    <div>
      <div style={{ marginTop: "16px" }} />
      {!selectedEmployeeId ? (
        <Card sx={{ p: "25%", display: "flex", justifyContent: "center" }}>
          { <CircularProgress sx={{ scale: "150%" }} /> }
        </Card>
      ) : (
        <TimebankContent
          selectedEmployeeId={selectedEmployeeId}
          setSelectedEmployeeId={setSelectedEmployeeId}
        />
      )}
    </div>
  );
};

export default TimebankScreen;
