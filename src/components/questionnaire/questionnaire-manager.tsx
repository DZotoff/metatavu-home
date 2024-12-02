import { KeyboardReturn } from "@mui/icons-material";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import type { Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import type { QuestionnairePreviewModes } from "src/types";
import QuestionnaireFillMode from "./questionnaires-fill-mode";
import { useAtomValue, useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import { useNavigate } from "react-router-dom";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  mode: QuestionnairePreviewModes;
}

/**
 * Interface for the user responses
 */
interface UserResponses {
  [questionText: string]: string[];
}

/**
 *  Manager page for user to interact with the questionnaire; fill and edit
 *
 * @param props component properties
 */
const QuestionnaireManager = ({ mode }: Props) => {
  const { id } = useParams<{ id: string }>();
  const { questionnairesApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    id: "",
    title: "",
    description: "",
    questions: [],
    passScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [ifPassedMessage, setIfPassedMessage] = useState<string | null>(null);
  const [passedDialogOpen, setPassedDialogOpen] = useState<boolean>(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const navigate = useNavigate();

  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      try {
        const fetchedQuestionnaire = await questionnairesApi.getQuestionnairesById({ id });
        setQuestionnaire(fetchedQuestionnaire);
        console.log(fetchedQuestionnaire);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaire();
  }, [id, questionnairesApi, setError]);

  if (loading) {
    return (
      <CircularProgress
        size={50}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    );
  }

  /**
   * Function to handle the change of the answer option checkboxes
   *
   * @param questionText
   * @param answerLabel
   * @param isSelected
   */
  const handleCheckboxChange = (questionText: string, answerLabel: string, isSelected: boolean) => {
    setUserResponses((prevResponses) => {
      const selectedAnswerLabels = prevResponses[questionText] || [];
      return {
        ...prevResponses,
        [questionText]: isSelected
          ? [...selectedAnswerLabels, answerLabel]
          : selectedAnswerLabels.filter((label) => label !== answerLabel)
      };
    });
  };

  /**
   * Function to handle the change of the answer option radio buttons
   *
   * @param questionText
   * @param answerLabel
   */
  const handleRadioChange = (questionText: string, answerLabel: string) => {
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questionText]: [answerLabel]
    }));
  };

  /**
   * Function to handle the submission of the questionnaire
   */
  const handleSubmit = async () => {
    let correctAnswersCount = 0;
    questionnaire.questions?.forEach((question) => {
      const userAnswers = userResponses[question.questionText] || [];
      const correctAnswers = question.answerOptions
        .filter((option) => option.isCorrect)
        .map((option) => option.label);
      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((answer) => correctAnswers.includes(answer))
      ) {
        correctAnswersCount++;
      }
    });

    const passed = correctAnswersCount >= questionnaire.passScore;

    if (passed) {
      try {
        const passedQuestionnaire = await questionnairesApi.updateQuestionnaires({
          id: questionnaire.id || "",
          questionnaire: {
            ...questionnaire,
            passedUsers: [...(questionnaire.passedUsers || []), loggedInUser?.id || ""]
          }
        });
        console.log(passedQuestionnaire);
        setIfPassedMessage(
          `${strings.formatString(
            strings.questionnaireManager.passed,
            correctAnswersCount,
            questionnaire.passScore
          )}`
        );
        setPassedDialogOpen(true);
        return passedQuestionnaire;
      } catch (error) {
        setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
      }
    } else {
      setIfPassedMessage(
        `${strings.formatString(
          strings.questionnaireManager.failed,
          correctAnswersCount,
          questionnaire.passScore
        )}`
      );
      setPassedDialogOpen(true);
    }
  };

  /**
   * Function to close the passed dialog
   */
  const closePassedDialog = () => {
    setPassedDialogOpen(false);
    setIfPassedMessage(null);
    navigate(-1);
  };

  /**
   * Function to render the content of the card
   */
  const renderCardContent = () => {
    switch (mode) {
      case "FILL":
        return (
          <QuestionnaireFillMode
            questionnaire={questionnaire}
            userResponses={userResponses}
            handleCheckboxChange={handleCheckboxChange}
            handleRadioChange={handleRadioChange}
          />
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (mode) {
      case "FILL":
        return (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 3,
              justifyContent: "space-between"
            }}
          >
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              onClick={() => navigate(-1)}
              startIcon={<KeyboardReturn />}
            >
              {strings.questionnaireManager.goBack}
            </Button>
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              variant="contained"
              color="success"
              onClick={handleSubmit}
            >
              {strings.questionnaireManager.submit}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDialog = () => {
    switch (mode) {
      case "FILL":
        return (
          <Dialog open={passedDialogOpen} onClose={closePassedDialog}>
            <DialogTitle>{ifPassedMessage}</DialogTitle>
            <DialogActions>
              <Button onClick={closePassedDialog} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderCardContent()}
      {renderButtons()}
      {renderDialog()}
    </>
  );
};

export default QuestionnaireManager;
