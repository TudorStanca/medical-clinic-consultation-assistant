import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import usePatientApi from "@/patients/usePatientApi";
import PatientForm from "@/patients/components/PatientForm";
import type { PatientResponseDTO } from "@/patients/props";

interface Props {
  value: PatientResponseDTO | null;
  onChange: (patient: PatientResponseDTO | null) => void;
}

const PatientPicker = ({ value, onChange }: Props) => {
  const { getAllPatients } = usePatientApi();
  const [patients, setPatients] = useState<PatientResponseDTO[]>([]);
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch {
      // ignore — user can type
    }
  }, [getAllPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleCreated = (patient: PatientResponseDTO) => {
    setPatients((prev) => [...prev, patient]);
    onChange(patient);
    setNewPatientOpen(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <Autocomplete
        sx={{ flexGrow: 1 }}
        options={patients}
        value={value}
        onChange={(_, v) => onChange(v)}
        getOptionLabel={(p) => `${p.lastName} ${p.firstName} — ${p.identityNumber}`}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderInput={(params) => <TextField {...params} label="Selectează pacient" required />}
        noOptionsText="Niciun pacient găsit"
      />
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        sx={{ mt: 1, whiteSpace: "nowrap" }}
        onClick={() => setNewPatientOpen(true)}
      >
        Pacient nou
      </Button>
      <Dialog open={newPatientOpen} onClose={() => setNewPatientOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adaugă pacient nou</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <PatientForm onCreated={handleCreated} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PatientPicker;
