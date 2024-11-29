import { KeyboardReturn } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import type { QuestionnairePreviewModes } from "src/types";
import QuestionnaireFillMode from "./questionnaires-fill-mode";
import { useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
  const handleSubmit = () => {
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
    navigate(-1);
  };

  // FIXME: "Saving the results is not implemented yet: Save QuestionnaireId to Users KeyCloak + Save User ID tp Questionnaire.passedUsers";

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

export default QuestionnaireManager;
