import { KeyboardReturn } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography
} from "@mui/material";
import { useState } from "react";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";

interface QuestionnaireInteractionScreenProps {
  questionnaire: Questionnaire | null;
  mode: "view" | "edit" | "preview";
  onBack: () => void;
}

/**
 *  Screen for the user to interact with the questionnaire; fill, edit and preview
 */
const QuestionnaireInteractionScreen: React.FC<QuestionnaireInteractionScreenProps> = ({
  questionnaire,
  mode,
  onBack
}) => {
  if (!questionnaire) {
    return <Typography variant="h4">Loading...</Typography>;
  }

  const [responses, setResponses] = useState<Record<string, string[]>>({});

  const handleOptionChange = (questionId: string, optionLabel: string, isChecked: boolean) => {
    setResponses((prevResponses) => {
      const selectedOptions = prevResponses[questionId] || [];
      return {
        ...prevResponses,
        [questionId]: isChecked
          ? [...selectedOptions, optionLabel]
          : selectedOptions.filter((label) => label !== optionLabel)
      };
    });
  };

  const handleSubmit = () => {
    let correctAnswersCount = 0;
    questionnaire.questions.forEach((question) => {
      const userAnswers = responses[question.questionText] || [];
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
    console.log(`What you need to pass: ${questionnaire.passScore}`);
    console.log(`Number of correct answers: ${correctAnswersCount}`);
  };

  // FIXME: "Saving the results is not implemented yet";

  const renderInteractionScreen = () => {
    if (mode === "view") {
      return (
        <Card>
          <CardContent>
            <Typography variant="h5" align="left" sx={{ mt: 4, ml: 4 }}>
              {questionnaire.description}
            </Typography>
            <Box sx={{ marginTop: 4 }}>
              {questionnaire.questions.map((question: Question) => (
                <Box key={question.questionText} sx={{ mb: 4, ml: 4, mr: 4 }}>
                  <Typography variant="h6">{question.questionText}</Typography>
                  <Box>
                    {question.answerOptions.map((option: AnswerOption) => (
                      <FormControlLabel
                        key={option.label}
                        control={
                          <Checkbox
                            checked={
                              responses[question.questionText]?.includes(option.label) || false
                            }
                            onChange={(e) =>
                              handleOptionChange(
                                question.questionText,
                                option.label,
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={option.label}
                        sx={{ display: "block", marginLeft: 2 }}
                      />
                    ))}
                  </Box>
                  <Divider sx={{ marginY: 2 }} />
                </Box>
              ))}
            </Box>
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
                GO BACK
              </Button>
              <Button
                sx={{ alignItems: "center" }}
                size="large"
                variant="contained"
                color="success"
                onClick={handleSubmit}
              >
                Submit Responses
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (mode === "edit") {
      return (
        <Typography variant="h5" align="left" sx={{ mt: 4, ml: 4 }}>
          {questionnaire.description}; FIXME: "Edit mode is not implemented yet"
        </Typography>
      );
    }

    if (mode === "preview") {
      return (
        <Typography variant="h5" align="left" sx={{ mt: 4, ml: 4 }}>
          {questionnaire.description}; FIXME: "Preview mode is not implemented yet"
        </Typography>
      );
    }
  };

  return <>{renderInteractionScreen()}</>;
};

export default QuestionnaireInteractionScreen;
