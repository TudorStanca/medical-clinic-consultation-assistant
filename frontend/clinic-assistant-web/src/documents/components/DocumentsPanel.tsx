import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useDocumentApi from "@/documents/useDocumentApi";
import UploadDocumentDialog from "@/documents/components/UploadDocumentDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { UploadedDocumentResponseDTO } from "@/documents/props";

interface Props {
  patientId: string;
  sessionId: string | null;
}

const DocumentsPanel = ({ patientId, sessionId }: Props) => {
  const { getDocumentsByPatient, deleteDocument } = useDocumentApi();
  const { user, hasRole } = useAuth();
  const [docs, setDocs] = useState<UploadedDocumentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const canUpload = hasRole(Roles.Doctor) || hasRole(Roles.Admin);

  const visibleDocs = sessionId ? docs.filter((d) => d.sessionId === sessionId) : docs;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const data = await getDocumentsByPatient(patientId);
      setDocs(data);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }, [patientId, getDocumentsByPatient]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUploaded = (doc: UploadedDocumentResponseDTO) => {
    setDocs((prev) => [...prev, doc]);
    setUploadOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteDocument(deleteTarget);
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget));
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1">Documente atașate</Typography>
        {canUpload && (
          <Button size="small" startIcon={<UploadFileIcon />} onClick={() => setUploadOpen(true)}>
            Încarcă
          </Button>
        )}
      </Box>
      <ErrorBanner messages={errors} />
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <List dense disablePadding>
          {visibleDocs.map((doc) => (
            <ListItem
              key={doc.id}
              disablePadding
              secondaryAction={
                canUpload ? (
                  <IconButton edge="end" size="small" onClick={() => setDeleteTarget(doc.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                ) : undefined
              }
            >
              <ListItemText
                primary={doc.originalFileName}
                secondary={`${doc.documentType} — ${new Date(doc.uploadedAt).toLocaleDateString("ro-RO")}`}
              />
            </ListItem>
          ))}
          {visibleDocs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Niciun document.
            </Typography>
          )}
        </List>
      )}
      {canUpload && user && (
        <UploadDocumentDialog
          open={uploadOpen}
          patientId={patientId}
          uploadedByUserId={user.id}
          sessionId={sessionId}
          onUploaded={handleUploaded}
          onClose={() => setUploadOpen(false)}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Șterge document"
        message="Ești sigur că vrei să ștergi acest document? Acțiunea este ireversibilă."
        confirmLabel="Șterge"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default DocumentsPanel;
