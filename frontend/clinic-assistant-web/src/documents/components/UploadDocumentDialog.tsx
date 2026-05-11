import { useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useDocumentApi from "@/documents/useDocumentApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import { DocumentType, DocumentTypeLabels } from "@/shared/types/enums";
import type { DocumentTypeValue } from "@/shared/types/enums";
import type { UploadedDocumentResponseDTO } from "@/documents/props";

interface Props {
  open: boolean;
  patientId: string;
  uploadedByUserId: string;
  sessionId: string | null;
  onUploaded: (doc: UploadedDocumentResponseDTO) => void;
  onClose: () => void;
}

const UploadDocumentDialog = ({
  open,
  patientId,
  uploadedByUserId,
  sessionId,
  onUploaded,
  onClose,
}: Props) => {
  const { uploadDocument } = useDocumentApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentTypeValue>(DocumentType.Analiza);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    setErrors([]);
    setLoading(true);
    try {
      const doc = await uploadDocument(file, patientId, uploadedByUserId, docType, sessionId);
      onUploaded(doc);
      setFile(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Încarcă document</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <ErrorBanner messages={errors} />
          <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
            {file ? file.name : "Selectează fișier (.pdf, .txt)"}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          )}
          <FormControl fullWidth>
            <InputLabel>Tip document</InputLabel>
            <Select
              value={docType}
              label="Tip document"
              onChange={(e) => setDocType(e.target.value as DocumentTypeValue)}
            >
              {(Object.entries(DocumentTypeLabels) as [string, string][]).map(([val, label]) => (
                <MenuItem key={val} value={Number(val)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button onClick={handleUpload} variant="contained" disabled={!file || loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Încarcă"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentDialog;
