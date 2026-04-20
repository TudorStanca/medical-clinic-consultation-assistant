import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";

interface Props {
  letter: MedicalLetterResponseDTO;
  readOnly?: boolean;
  onSaved: (updated: MedicalLetterResponseDTO) => void;
}

const MedicalLetterForm = ({ letter, readOnly = false, onSaved }: Props) => {
  const { updateLetter, downloadLetterPdf } = useMedicalLetterApi();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [location, setLocation] = useState(letter.location);
  const [antecedente, setAntecedente] = useState(letter.antecedente ?? "");
  const [simptome, setSimptome] = useState(letter.simptome ?? "");
  const [clinice, setCLinice] = useState(letter.clinice ?? "");
  const [paraclinice, setParaclinice] = useState(letter.paraclinice ?? "");
  const [diagnostic, setDiagnostic] = useState(letter.diagnostic ?? "");
  const [recomandari, setRecomandari] = useState(letter.recomandari ?? "");

  useEffect(() => {
    setLocation(letter.location);
    setAntecedente(letter.antecedente ?? "");
    setSimptome(letter.simptome ?? "");
    setCLinice(letter.clinice ?? "");
    setParaclinice(letter.paraclinice ?? "");
    setDiagnostic(letter.diagnostic ?? "");
    setRecomandari(letter.recomandari ?? "");
  }, [letter]);

  const handleDownloadPdf = async () => {
    setErrors([]);
    setPdfLoading(true);
    try {
      await downloadLetterPdf(letter.id, `scrisoare-medicala-${letter.id}.pdf`);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSave = async () => {
    setErrors([]);
    setLoading(true);
    try {
      const updated = await updateLetter(letter.id, {
        location,
        antecedente: antecedente || null,
        simptome: simptome || null,
        clinice: clinice || null,
        paraclinice: paraclinice || null,
        diagnostic: diagnostic || null,
        recomandari: recomandari || null,
      });
      onSaved(updated);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1">
          {letter.letterType} — {letter.location}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
            disabled={loading || pdfLoading}
            onClick={handleDownloadPdf}
          >
            Descarcă PDF
          </Button>
          {!readOnly && (
            <Button
              size="small"
              variant="contained"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
              disabled={loading || pdfLoading}
              onClick={handleSave}
            >
              Salvează
            </Button>
          )}
        </Box>
      </Box>
      <ErrorBanner messages={errors} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <TextField
          label="Localitate"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={readOnly}
          fullWidth
          size="small"
        />
        {[
          { label: "Antecedente", value: antecedente, setter: setAntecedente },
          { label: "Simptome", value: simptome, setter: setSimptome },
          { label: "Examen clinic", value: clinice, setter: setCLinice },
          { label: "Examen paraclinic", value: paraclinice, setter: setParaclinice },
          { label: "Diagnostic", value: diagnostic, setter: setDiagnostic },
          { label: "Recomandări", value: recomandari, setter: setRecomandari },
        ].map(({ label, value, setter }) => (
          <TextField
            key={label}
            label={label}
            value={value}
            onChange={(e) => setter(e.target.value)}
            disabled={readOnly}
            multiline
            minRows={2}
            fullWidth
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

export default MedicalLetterForm;
