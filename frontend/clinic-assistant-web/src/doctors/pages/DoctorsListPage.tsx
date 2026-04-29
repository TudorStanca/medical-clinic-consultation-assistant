import { useCallback, useState } from "react";
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
import useDoctorApi from "@/doctors/useDoctorApi";
import DoctorForm from "@/doctors/components/DoctorForm";
import PagedTable from "@/shared/components/PagedTable";
import type { Column } from "@/shared/components/PagedTable";
import type { DoctorResponseDTO } from "@/doctors/props";
import type { PagedQuery } from "@/shared/types/api";

const columns: Column<DoctorResponseDTO>[] = [
  { key: "lastName", label: "Nume", sortable: true, render: (d) => `${d.lastName} ${d.firstName}` },
  { key: "email", label: "Email", sortable: true, render: (d) => d.email },
  { key: "specialization", label: "Specializare", render: (d) => d.specialization },
  { key: "codParafa", label: "Cod parafă", render: (d) => d.codParafa },
];

const DoctorsListPage = () => {
  const { getDoctorsPaged } = useDoctorApi();
  const [addOpen, setAddOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPaged = useCallback(
    (query: PagedQuery) => getDoctorsPaged(query),
    [getDoctorsPaged]
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
        <Typography variant="h5">Doctori</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Adaugă doctor
        </Button>
      </Box>
      <Paper>
        <Box sx={{ p: 2 }}>
          <PagedTable
            key={refreshKey}
            columns={columns}
            fetch={fetchPaged}
            searchPlaceholder="Caută după nume sau email..."
            defaultSortBy="lastName"
            rowKey={(d) => d.id}
          />
        </Box>
      </Paper>
      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
        <DialogTitle>Adaugă doctor nou</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <DoctorForm
              onDirtyChange={setFormDirty}
              onCreated={() => {
                setAddOpen(false);
                setFormDirty(false);
                setRefreshKey((k) => k + 1);
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Renunți la adăugarea doctorului?</DialogTitle>
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

export default DoctorsListPage;
