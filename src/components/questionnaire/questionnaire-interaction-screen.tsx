import { KeyboardReturn } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Typography
} from "@mui/material";
import { useState } from "react";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import type { QuestionnairePreviewModes } from "src/types";
import QuestionnaireFillMode from "./questionnaires-fill-mode";

/**
 * Component properties
 */
interface Props {
  questionnaire: Questionnaire | null;
  mode: QuestionnairePreviewModes;
  setMode: (mode: QuestionnairePreviewModes) => void;
  onBack: () => void;
}

/**
 *  Screen for the user to interact with the questionnaire; fill, edit and preview
 *
 * @param props component properties
 */
const QuestionnaireInteractionScreen = ({ questionnaire, mode, setMode, onBack }: Props) => {
  if (!questionnaire) {
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

  const [userResponses, setUserResponses] = useState<Record<string, string[]>>({});

  /**
   * Function to handle the change of the option
   *
   * @param questionId
   * @param optionLabel
   * @param isChecked
   */
  const handleOptionChange = (questionId: string, optionLabel: string, isChecked: boolean) => {
    setUserResponses((prevResponses) => {
      const selectedOptions = prevResponses[questionId] || [];
      return {
        ...prevResponses,
        [questionId]: isChecked
          ? [...selectedOptions, optionLabel]
          : selectedOptions.filter((label) => label !== optionLabel)
      };
    });
  };

  /**
   * Function to handle the submission of the questionnaire
   */
  const handleSubmit = () => {
    let correctAnswersCount = 0;
    questionnaire.questions.forEach((question) => {
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
    console.log(`Correct answers: ${correctAnswersCount} / ${questionnaire.questions.length}`);
  };

  // FIXME: "Saving the results is not implemented yet";

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
            handleOptionChange={handleOptionChange}
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
              onClick={onBack}
              startIcon={<KeyboardReturn />}
            >
              {strings.questionnaireInteractionScreen.goBack}
            </Button>
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              variant="contained"
              color="success"
              onClick={handleSubmit}
            >
              {strings.questionnaireInteractionScreen.submit}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderCardContent()}
      {renderButtons()}
    </>
  );
};

export default QuestionnaireInteractionScreen;
