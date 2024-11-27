import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Divider
} from "@mui/material";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";

interface Props {
  questionnaire: Questionnaire;
  userResponses: Record<string, string[]>;
  handleOptionChange: (questionId: string, optionLabel: string, isChecked: boolean) => void;
}

const QuestionnaireFillMode = ({ questionnaire, userResponses, handleOptionChange }: Props) => (
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
                        userResponses[question.questionText]?.includes(option.label) || false
                      }
                      onChange={(e) =>
                        handleOptionChange(question.questionText, option.label, e.target.checked)
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
    </CardContent>
  </Card>
);

export default QuestionnaireFillMode;
