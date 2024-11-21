import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useLambdasApi } from "src/hooks/use-api";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useAtom } from "jotai";
import { languageAtom } from "src/atoms/language";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import { AutoAwesomeSharp, GTranslateSharp, PictureAsPdfSharp }  from "@mui/icons-material";
import strings from "src/localization/strings";
import { PdfFile } from "src/generated/homeLambdasClient";

/**
 * Memo screen component
 */
const MemoScreen = () => {
  const [selectedYear, setSelectedYear] = useState<DateTime | null>(DateTime.now());
  const [fileList, setFileList] = useState<PdfFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const { memoApi } = useLambdasApi();

  useEffect(() => {
    fetchMemos();
  }, [selectedYear]);

  const fetchMemos = async () => {
    
    if (!selectedYear) {
      throw new Error(strings.memoRequestError.fetchYearError);
    }
    const formattedDate = selectedYear.toJSDate();
    try {
      const validFiles = await memoApi.getMemos({ date: formattedDate });
      setFileList(validFiles);
      setSelectedFileId(validFiles[0]?.id);
    } catch {
      
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="row" 
      width="100%" 
      height="50vh"
    >
      <Card sx={{ 
        width: "300px", 
        p: 2, 
        mr: 2 
      }}>
        <Typography 
          variant="h6" 
          mb={2} 
          pl={"50px"}
        >
          {strings.memoScreen.selectPdf}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={strings.memoScreen.selectYear}
            value={selectedYear ? dayjs(selectedYear.toISO()) : null}
            onChange={(date) => {
              if (date) {
                setSelectedYear(DateTime.fromISO(date.toISOString()));
              }
            }}
            views={["year"]}
          />
        </LocalizationProvider>
        <List sx={{ mt: 2 }}>
          {fileList.map((file) => (
            <ListItem key={file.id} disablePadding>
              <ListItemButton onClick={() => setSelectedFileId(file.id)}>
                <ListItemIcon><PictureAsPdfIcon /></ListItemIcon>
                <ListItemText primary={file.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {error && <Typography color="error">{error}</Typography>}
      </Card>
      <Box 
        display="flex" 
        flexDirection="column" 
        flexGrow={1} 
        alignItems="center" 
        justifyContent="center"
      >
        {selectedFileId ? (
          <PdfViewer fileId={selectedFileId} />
        ) : (
          <Typography variant="body1">{strings.memoScreen.selectFile}</Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Component to display a selected PDF file with services provided
 */
const PdfViewer = ({ fileId }: { fileId: string }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string>();
  const [language] = useAtom(languageAtom);
  const { memoApi } = useLambdasApi();

  const fetchPdf = async () => {
    setLoading(true);
    try {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      const pdfBlob = await memoApi.getContentMemo({ fileId });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(pdfUrl);
    } catch (err) {
      setError(strings.memoRequestError.fetchPdfError);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (fileId) fetchPdf();
  }, [fileId]);

  const handleTranslatedPdf = async () => {
    setIsTranslating(true);
    try {
      const translatedPdf = await memoApi.getTranslatedMemoPdf({ fileId });
      const pdfUrl = URL.createObjectURL(translatedPdf);
      setPdfBlobUrl(pdfUrl);
    } catch (error) {
      setError(strings.memoRequestError.downloadTranslatedError);
    } 
    setIsTranslating(false);
  };

  const handleSummary = async () => {
    try {
      setIsDialogOpen(true);
      const summary = await memoApi.getSummaryMemo({ fileId });
      const text = language === "fi" ? summary.fi ?? "" : summary.en ?? "";
      setSummaryText(text);
    } catch (error) {
      setError(strings.memoRequestError.fetchSummaryError);
    }
  };

  return (
    <Card sx={{ 
      p: 2, 
      width: "100%", 
      height: "100%",
      position: "relative"
    }}>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1}
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <PictureAsPdfSharp />
          <Button 
            variant="text" 
            href={pdfBlobUrl || ""} 
            download 
            disabled={isTranslating || !pdfBlobUrl}
          >
            {strings.memoScreen.download}
          </Button>
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          <GTranslateSharp />
          <Button onClick={handleTranslatedPdf} disabled={!fileId || isTranslating}>
            {strings.memoScreen.translatePdf}
          </Button>
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          <AutoAwesomeSharp />
          <Button onClick={handleSummary} disabled={isTranslating}>
            {strings.memoScreen.viewSummary}
          </Button>
        </Box>
      </Box>
      {(loading || isTranslating) ? (
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        }}
        >
          <CircularProgress />
        </Box>
      ) : (
        pdfBlobUrl ? 
          <PdfObject pdfBlobUrl={pdfBlobUrl} /> 
        : 
          <Typography variant="body1" color="error">
            {strings.memoScreen.failedToLoadPdf}
          </Typography>
        )
      }

      {isDialogOpen && (
        <Box sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -20%)",
          bgcolor: "background.paper",
          border: "1px solid #ccc",
          boxShadow: 24,
          p: 3,
          width: "80%",
        }}
        >
          <Typography variant="h6" gutterBottom>
            {strings.memoScreen.summaryTitle}
          </Typography>
          {summaryText ? (
            <Typography variant="body1">{summaryText}</Typography>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="100px"
            >
              <CircularProgress />
            </Box>
          )}
          <Button onClick={() => setIsDialogOpen(false)} color="primary" fullWidth>
            {strings.memoScreen.close}
          </Button>
        </Box>
      )}
    </Card>
  );
};

/**
 * Displays the PDF in an object element for viewing within the browser
 */
const PdfObject = ({pdfBlobUrl}: {pdfBlobUrl: string}) => {
  const [bdfBlodUrl] = useState(pdfBlobUrl);
  return (
    <object
      data={bdfBlodUrl + "#toolbar=0&zoom=90"}
      type="application/pdf"
      width="100%"
      height="100%"
      style = {{paddingBottom:"50px", backgroundColor:"white"}}
    >
      <Typography variant="body2" color="textSecondary">
        {strings.memoScreen.unsupportedBrowser}{" "}
        <Button 
          variant="text" 
          href={pdfBlobUrl} 
          download
        >
          {strings.memoScreen.downloadPdf}
        </Button>
      </Typography>
    </object>
  )
}

export default MemoScreen;