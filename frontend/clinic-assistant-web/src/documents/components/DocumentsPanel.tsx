import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useDocumentApi from "@/documents/useDocumentApi";
import UploadDocumentDialog from "@/documents/components/UploadDocumentDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { UploadedDocumentResponseDTO } from "@/documents/props";

interface Props {
  patientId: string;
  sessionId: string | null;
  readOnly?: boolean;
}

const DocumentsPanel = ({ patientId, sessionId, readOnly = false }: Props) => {
  const { getDocumentsByPatient, deleteDocument, openDocumentFile } = useDocumentApi();
  const { user, hasRole } = useAuth();
  const notify = useNotification();
  const [docs, setDocs] = useState<UploadedDocumentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const canUpload = !readOnly && (hasRole(Roles.Doctor) || hasRole(Roles.Admin));

  const visibleDocs = sessionId ? docs.filter((d) => d.sessionId === sessionId) : docs;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocumentsByPatient(patientId);
      setDocs(data);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    } finally {
      setLoading(false);
    }
  }, [patientId, getDocumentsByPatient, notify]);

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
      notify("Document șters.", "success");
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!loading && readOnly && visibleDocs.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" mb={1}>Documente atașate</Typography>
        <Typography variant="body2" color="text.secondary">
          Niciun document atașat acestei sesiuni.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1">Documente atașate</Typography>
        {canUpload && (
          <Button size="small" startIcon={<UploadFileIcon />} onClick={() => setUploadOpen(true)}>
            Încarcă
          </Button>
        )}
      </Box>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <List dense disablePadding sx={{ maxHeight: 280, overflowY: "auto" }}>
          {visibleDocs.map((doc) => (
            <ListItem
              key={doc.id}
              disablePadding
              secondaryAction={
                <Box sx={{ display: "flex" }}>
                  <IconButton size="small" onClick={() => openDocumentFile(doc.id)}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  {canUpload && (
                    <IconButton edge="end" size="small" onClick={() => setDeleteTarget(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
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
    </Paper>
  );
};

export default DocumentsPanel;
