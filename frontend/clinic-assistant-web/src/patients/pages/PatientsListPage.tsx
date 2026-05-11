import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import usePatientApi from "@/patients/usePatientApi";
import PatientForm from "@/patients/components/PatientForm";
import PagedTable from "@/shared/components/PagedTable";
import type { Column } from "@/shared/components/PagedTable";
import type { PatientResponseDTO } from "@/patients/props";
import type { PagedQuery } from "@/shared/types/api";

const columns: Column<PatientResponseDTO>[] = [
  { key: "lastName", label: "Nume", sortable: true, render: (p) => `${p.lastName} ${p.firstName}` },
  { key: "email", label: "Email", sortable: true, render: (p) => p.email },
  { key: "identityNumber", label: "CNP", render: (p) => p.identityNumber },
  { key: "phoneNumber", label: "Telefon", render: (p) => p.phoneNumber ?? "—" },
];

const PatientsListPage = () => {
  const { getPatientsPaged } = usePatientApi();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const fetchPaged = useCallback(
    (query: PagedQuery) => getPatientsPaged(query),
    [getPatientsPaged]
  );

  const handleCloseAdd = () => {
    if (formDirty) {
      setConfirmClose(true);
    } else {
      setAddOpen(false);
    }
  };

  const handleConfirmDiscard = () => {
    setConfirmClose(false);
    setAddOpen(false);
    setFormDirty(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Pacienți</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Adaugă pacient
        </Button>
      </Box>
      <Paper>
        <Box sx={{ p: 2 }}>
          <PagedTable
            columns={columns}
            fetch={fetchPaged}
            onRowClick={(p) => navigate(`/patients/${p.id}`)}
            searchPlaceholder="Caută după nume, email sau CNP..."
            defaultSortBy="lastName"
            rowKey={(p) => p.id}
          />
        </Box>
      </Paper>
      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
        <DialogTitle>Adaugă pacient nou</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <PatientForm
              onDirtyChange={setFormDirty}
              onCreated={(patient) => {
                setAddOpen(false);
                setFormDirty(false);
                navigate(`/patients/${patient.id}`);
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Renunți la adăugarea pacientului?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ai date completate în formular. Dacă închizi, acestea se vor pierde.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Rămâi</Button>
          <Button color="error" onClick={handleConfirmDiscard}>Renunță</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientsListPage;
