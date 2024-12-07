import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Typography 
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { TrelloCard, TrelloMember } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Interface for CardDialog component
 * 
 * @param isOpen indicates if dialog is open
 * @param selectedCard selected Trello card need to display
 * @param members Trello members
 * @param comment text for adding a new comment to the card
 * @param onCommentChange callback that handles updates to the comment
 * @param onClose callback that closes the dialog
 * @param onCreateComment callback that adds a new comment to the selected card
 * @param onImageClick callback that handles actions when an image is clicked
 */
interface CardDialogProps {
  isOpen: boolean;
  selectedCard: TrelloCard;
  members: TrelloMember[];
  comment: string;
  onCommentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onCreateComment: () => void;
  onImageClick: (src: string) => void;
}

/**
 * CardDialog component to display Trello card data
 */
const CardDialog = ({
  isOpen,
  selectedCard,
  members,
  comment,
  onCommentChange,
  onClose,
  onCreateComment,
  onImageClick,
}: CardDialogProps ) => {

  /**
   * Handles the keydown event for an image element
   * 
   * @param event event
   * @param src source URL of the image
   */
  const handleImageKey = (event: React.KeyboardEvent<HTMLImageElement>, src: string) => {
    if (event.key === "Enter" || event.key === " ") {
      onImageClick(src);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{selectedCard?.title || "" }</DialogTitle>
      <DialogContent>
        <ReactMarkdown
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                style={{
                  width: "100%",
                  height: "auto",
                  cursor: "pointer",
                }}
                alt={props.alt || "Image"}
                src={props.src || ""}
                onClick={() => onImageClick(props.src || "")}
                onKeyDown={(event) => handleImageKey(event, props.src || "")}
              />
            ),
          }}
        >
          {selectedCard?.description || strings.cardRequestError.noDescription}
        </ReactMarkdown>
        <Box>
          <Typography variant="subtitle1">{strings.cardScreen.comments}</Typography>
          {selectedCard?.comments?.map((comment: any, memberId: any) => (
            <Typography 
              key={memberId} 
              variant="body2" 
              sx={{ pl: 2 }}
            >
              - {comment.text || `${strings.cardRequestError.noText}`} (
              {members.find((member) => member.memberId === comment.createdBy)?.fullName ||
                `${strings.cardRequestError.unknownAuthor}`} -{" "}
              {members.find((member) => member.memberId === comment.createdBy)?.email ||
                `${strings.cardRequestError.noEmail}`})
            </Typography>
          ))}
        </Box>
        <TextField
          label={strings.cardScreen.addComment}
          value={comment}
          onChange={onCommentChange}
          fullWidth
          sx={{ mt: 1 }}
        />
        <Button onClick={onCreateComment} variant="contained" sx={{ mt: 1 }}>
          {strings.cardScreen.addComment}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CardDialog;