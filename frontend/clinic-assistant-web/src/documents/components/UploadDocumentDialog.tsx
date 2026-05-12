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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import useDocumentApi from "@/documents/useDocumentApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import { DocumentType, DocumentTypeLabels } from "@/shared/types/enums";
import type { DocumentTypeValue } from "@/shared/types/enums";
import type { UploadedDocumentResponseDTO } from "@/documents/props";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

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
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "4px" }}>
          <ErrorBanner messages={errors} />

          {/* Drop zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? T.accent : file ? T.success : T.border}`,
              borderRadius: "12px",
              p: "28px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              background: dragOver ? T.accentSoft : file ? T.successSoft : T.bg,
              transition: "all 0.15s ease",
              userSelect: "none",
              "&:hover": {
                borderColor: file ? T.success : T.accent,
                background: file ? T.successSoft : T.accentSoft,
              },
            }}
          >
            {file ? (
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 40, color: T.success }} />
            ) : (
              <CloudUploadOutlinedIcon
                sx={{ fontSize: 40, color: dragOver ? T.accent : T.textDim }}
              />
            )}
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: file ? T.success : T.textMuted,
                textAlign: "center",
                fontWeight: file ? 500 : 400,
              }}
            >
              {file ? file.name : "Trage fișierul aici sau apasă pentru a selecta"}
            </Typography>
            {file && (
              <Typography sx={{ fontSize: "0.75rem", color: T.textDim }}>
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            )}
            {!file && (
              <Typography sx={{ fontSize: "0.75rem", color: T.textDim }}>
                Formate acceptate: .pdf, .txt
              </Typography>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              hidden
              onChange={handleFileChange}
            />
          </Box>

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
