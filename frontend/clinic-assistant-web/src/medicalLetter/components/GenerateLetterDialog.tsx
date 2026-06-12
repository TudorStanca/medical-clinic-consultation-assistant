import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { IconButton, Tooltip } from "@mui/material";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages, isNetworkError } from "@/core/errorMessages";
import type { MedicalLetterResponseDTO, MedicalLetterSummary } from "@/medicalLetter/props";
import { MS_LIGHT } from "@/theme/tokens";
import useAuth from "@/auth/useAuth";

const T = MS_LIGHT;

const LETTER_TYPES = ["Scrisoare medicală", "Bilet de trimitere", "Rețetă", "Raport medical"];

interface Props {
  open: boolean;
  sessionId: string;
  patientId: string;
  onGenerated: (letter: MedicalLetterResponseDTO) => void;
  onClose: () => void;
}

const GenerateLetterDialog = ({ open, sessionId, patientId, onGenerated, onClose }: Props) => {
  const { createLetter, getPreviousLetters, previewLetterPdf } = useMedicalLetterApi();
  const { user } = useAuth();
  const [letterType, setLetterType] = useState(LETTER_TYPES[0]);
  const [location, setLocation] = useState("");
  const [includeAllDocs, setIncludeAllDocs] = useState(false);
  const [previousLetters, setPreviousLetters] = useState<MedicalLetterSummary[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastErrorWasNetwork, setLastErrorWasNetwork] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current !== null) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setRetryCount(0);
      setCooldownSeconds(0);
      setLastErrorWasNetwork(false);
      if (cooldownRef.current !== null) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open || !patientId) {
      return;
    }

    getPreviousLetters(patientId, sessionId)
      .then(setPreviousLetters)
      .catch(() => setPreviousLetters([]));
  }, [open, patientId, sessionId, getPreviousLetters]);

  const toggleLetter = (id: string) => {
    setSelectedLetterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleGenerate = async () => {
    setErrors([]);
    setLastErrorWasNetwork(false);
    setLoading(true);
    try {
      const letter = await createLetter({
        sessionId,
        letterType,
        location,
        includeAllPatientDocuments: includeAllDocs,
        previousLetterIds: selectedLetterIds.size > 0 ? [...selectedLetterIds] : undefined,
      });
      onGenerated(letter);
    } catch (err) {
      setErrors(extractErrorMessages(err));
      if (isNetworkError(err)) {
        setLastErrorWasNetwork(true);
        setRetryCount((prev) => prev + 1);
        setCooldownSeconds(15);
        cooldownRef.current = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownRef.current!);
              cooldownRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const showRetryButton = lastErrorWasNetwork && retryCount < 2;
  const showGiveUpMessage = lastErrorWasNetwork && retryCount >= 2;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handlePreview = async (id: string) => {
    try {
      const url = await previewLetterPdf(id);
      window.open(url, "_blank");
    } catch {
      // preview failed silently
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AutoAwesomeIcon sx={{ fontSize: 20, color: T.accent }} />
          Generează scrisoare medicală
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "4px" }}>
          <ErrorBanner messages={errors} />

          {showRetryButton && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              disabled={loading || cooldownSeconds > 0}
              onClick={handleGenerate}
              sx={{ alignSelf: "flex-start" }}
            >
              {cooldownSeconds > 0 ? `Reîncearcă în ${cooldownSeconds}s` : "Încearcă din nou"}
            </Button>
          )}

          {showGiveUpMessage && (
            <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted }}>
              Serviciul de generare nu răspunde. Reveniți mai târziu.
            </Typography>
          )}

          {loading && (
            <Box
              sx={{
                background: T.accentSoft,
                border: `1px solid ${T.accent}33`,
                borderRadius: "10px",
                p: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <CircularProgress size={18} sx={{ color: T.accent, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.875rem", color: T.accentInk }}>
                Scrisoarea se generează cu ajutorul AI...
              </Typography>
            </Box>
          )}

          <FormControl fullWidth>
            <InputLabel>Tip scrisoare</InputLabel>
            <Select
              value={letterType}
              label="Tip scrisoare"
              onChange={(e) => setLetterType(e.target.value)}
              disabled={loading}
            >
              {LETTER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Localitate"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />

          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeAllDocs}
                  onChange={(e) => setIncludeAllDocs(e.target.checked)}
                  disabled={loading}
                  sx={{
                    color: T.border,
                    "&.Mui-checked": { color: T.accent },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: T.text }}>
                  Include toate documentele pacientului
                </Typography>
              }
            />
            <FormHelperText sx={{ ml: "30px", mt: "-4px" }}>
              Documentele acestei consultații sunt mereu incluse.
            </FormHelperText>
          </FormControl>

          {previousLetters.length > 0 && (
            <>
              <Divider />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "6px" }}>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: T.textMuted }}>
                    Scrisori anterioare ale pacientului
                  </Typography>
                  <Button
                    size="small"
                    disabled={loading}
                    onClick={() => {
                      if (selectedLetterIds.size === previousLetters.length) {
                        setSelectedLetterIds(new Set());
                      } else {
                        setSelectedLetterIds(new Set(previousLetters.map((pl) => pl.id)));
                      }
                    }}
                    sx={{ fontSize: "0.75rem", minWidth: 0, p: "2px 8px" }}
                  >
                    {selectedLetterIds.size === previousLetters.length ? "Deselectează toate" : "Selectează toate"}
                  </Button>
                </Box>
                <Box
                  sx={{
                    maxHeight: 180,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    pr: "4px",
                  }}
                >
                  {previousLetters.map((pl) => {
                    const isExternal = pl.authorDoctorId !== user?.id;

                    return (
                      <Box key={pl.id} sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <FormControlLabel
                          sx={{ flex: 1, mr: 0, minWidth: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedLetterIds.has(pl.id)}
                              onChange={() => toggleLetter(pl.id)}
                              disabled={loading}
                              sx={{
                                color: T.border,
                                "&.Mui-checked": { color: T.accent },
                                flexShrink: 0,
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontSize: "0.8125rem", color: T.text }}>
                                {pl.letterType}
                                {pl.location ? ` — ${pl.location}` : ""}
                                {" — "}
                                {formatDate(pl.writtenAt)}
                              </Typography>
                              {isExternal && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "3px" }}>
                                  <Chip
                                    label={`Dr. ${pl.authorDoctorName}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.6875rem", height: 20 }}
                                  />
                                  <Tooltip title="Deschide PDF">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => { e.preventDefault(); handlePreview(pl.id); }}
                                        disabled={loading}
                                        sx={{ color: T.textMuted, p: "2px" }}
                                      >
                                        <OpenInNewIcon sx={{ fontSize: 13 }} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </Box>
                    );
                  })}
                </Box>
                <FormHelperText sx={{ ml: "30px", mt: "2px" }}>
                  Scrisorile bifate vor fi incluse ca referință în prompt-ul AI.
                </FormHelperText>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!location || loading || lastErrorWasNetwork}
          startIcon={loading ? undefined : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Generează"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateLetterDialog;
