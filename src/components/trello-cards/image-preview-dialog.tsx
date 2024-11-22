import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  Typography 
} from "@mui/material";
import strings from "src/localization/strings";

/**
 * Interface for CardFilter component
 * 
 * @param isOpen indicates if dialog is open
 * @param selectedImage URL of the image to be displayed
 * @param onClose callback that closes the dialog
 */
interface ImagePreviewProps {
  isOpen: boolean;
  selectedImage: string | null;
  onClose: () => void;
}

/**
 * ImagePreviewDialog component which provides dialog to display selected image in full size
 */
const ImagePreviewDialog = ({
  isOpen,
  selectedImage,
  onClose,
}: ImagePreviewProps ) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Full Size"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                marginTop: "16px",
              }}
            />
          ) : (
            <Typography>{strings.cardRequestError.noImage}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {strings.cardScreen.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewDialog;