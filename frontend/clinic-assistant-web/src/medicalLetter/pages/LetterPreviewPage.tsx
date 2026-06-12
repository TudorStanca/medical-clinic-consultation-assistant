import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import { usePageHeader } from "@/shared/PageHeaderContext";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

const LetterPreviewPage = () => {
  const { letterId } = useParams<{ letterId: string }>();
  const navigate = useNavigate();
  const { downloadLetterPdf, previewLetterPdf } = useMedicalLetterApi();
  const { setHeader } = usePageHeader();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeader({ title: "Previzualizare scrisoare", breadcrumbs: ["Consultații", "Previzualizare"] });

    return () => setHeader({ title: "" });
  }, [setHeader]);

  useEffect(() => {
    if (!letterId) {
      return;
    }
    let objectUrl = "";
    setLoading(true);
    previewLetterPdf(letterId)
      .then((url) => {
        objectUrl = url;
        setPdfUrl(url);
      })
      .catch(() => setError("Nu s-a putut încărca documentul."))
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterId]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 400 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pb: "16px",
          mb: "16px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Înapoi">
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography sx={{ flex: 1, fontSize: "0.9375rem", fontWeight: 600, color: T.text }}>
          Scrisoare medicală
        </Typography>
        {letterId && (
          <Tooltip title="Descarcă PDF">
            <IconButton
              size="small"
              onClick={() => downloadLetterPdf(letterId, `scrisoare-medicala-${letterId}.pdf`)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Typography color="error" sx={{ textAlign: "center", pt: 4 }}>
          {error}
        </Typography>
      )}
      {pdfUrl && !loading && (
        <Box
          component="iframe"
          src={pdfUrl}
          title="Previzualizare PDF"
          sx={{
            flex: 1,
            border: `1px solid ${T.border}`,
            borderRadius: "10px",
            width: "100%",
          }}
        />
      )}
    </Box>
  );
};

export default LetterPreviewPage;
