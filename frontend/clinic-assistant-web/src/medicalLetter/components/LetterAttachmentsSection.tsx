import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageIcon from "@mui/icons-material/Image";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { LetterAttachmentResponseDTO } from "@/medicalLetter/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

interface Props {
  letterId: string;
  readOnly: boolean;
}

interface AttachmentWithUrl extends LetterAttachmentResponseDTO {
  blobUrl?: string;
}

const LetterAttachmentsSection = ({ letterId, readOnly }: Props) => {
  const { addAttachment, getAttachments, getAttachmentImageUrl, deleteAttachment } = useMedicalLetterApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<AttachmentWithUrl[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const loadAttachments = useCallback(async () => {
    try {
      const docs = await getAttachments(letterId);
      const withUrls: AttachmentWithUrl[] = await Promise.all(
        docs.map(async (doc) => {
          try {
            const url = await getAttachmentImageUrl(letterId, doc.id);

            return { ...doc, blobUrl: url };
          } catch {
            return { ...doc };
          }
        })
      );
      setAttachments(withUrls);
    } catch {
      setAttachments([]);
    }
  }, [letterId, getAttachments, getAttachmentImageUrl]);

  useEffect(() => {
    loadAttachments();

    return () => {
      attachments.forEach((a) => {
        if (a.blobUrl) {
          URL.revokeObjectURL(a.blobUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAttachments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setErrors([]);
    setUploading(true);
    try {
      await addAttachment(letterId, selectedFile, caption);
      setSelectedFile(null);
      setCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadAttachments();
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setErrors([]);
    try {
      await deleteAttachment(letterId, attachmentId);
      await loadAttachments();
    } catch (err) {
      setErrors(extractErrorMessages(err));
    }
  };

  return (
    <Box sx={{ mt: "32px", pt: "24px", borderTop: `1px solid ${T.border}` }}>
      <Typography
        sx={{
          fontSize: "0.71875rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.textMuted,
          fontFamily: MS_FONTS.sans,
          mb: "14px",
        }}
      >
        Anexe (imagini)
      </Typography>

      <ErrorBanner messages={errors} />

      {attachments.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px", mb: "16px" }}>
          {attachments.map((att) => (
            <Box
              key={att.id}
              sx={{
                position: "relative",
                width: 120,
                border: `1px solid ${T.border}`,
                borderRadius: "10px",
                overflow: "hidden",
                background: T.surface,
              }}
            >
              {att.blobUrl ? (
                <Box
                  component="img"
                  src={att.blobUrl}
                  alt={att.originalFileName}
                  sx={{ width: "100%", height: 90, objectFit: "cover", display: "block" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.surfaceAlt,
                  }}
                >
                  <ImageIcon sx={{ color: T.textMuted, fontSize: 32 }} />
                </Box>
              )}

              <Box sx={{ p: "6px 8px" }}>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: T.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {att.caption || att.originalFileName}
                </Typography>
              </Box>

              {!readOnly && (
                <Tooltip title="Șterge anexă">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(att.id)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(255,255,255,0.85)",
                      "&:hover": { background: "rgba(255,255,255,1)" },
                      p: "2px",
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16, color: T.textMuted }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      )}

      {!readOnly && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: 400 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ flexShrink: 0 }}
            >
              Alege imagine
            </Button>
            {selectedFile && (
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: T.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFile.name}
              </Typography>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <>
              <TextField
                label="Caption (opțional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                size="small"
                fullWidth
              />
              <Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUpload}
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : undefined}
                >
                  {uploading ? "Se încarcă..." : "Adaugă anexă"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LetterAttachmentsSection;
