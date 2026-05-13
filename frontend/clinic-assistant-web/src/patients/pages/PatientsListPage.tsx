import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import usePatientApi from "@/patients/usePatientApi";
import PatientForm from "@/patients/components/PatientForm";
import PagedTable from "@/shared/components/PagedTable";
import type { Column } from "@/shared/components/PagedTable";
import type { PatientResponseDTO } from "@/patients/props";
import type { PagedQuery } from "@/shared/types/api";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "24px",
} as const;

const columns: Column<PatientResponseDTO>[] = [
  {
    key: "lastName",
    label: "Nume",
    sortable: true,
    render: (p) => {
      const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();
      const isAccent = p.id.charCodeAt(0) % 2 === 0;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: isAccent ? T.accentSoft : T.warmSoft,
              color: isAccent ? T.accentInk : T.warm,
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>
            {p.lastName} {p.firstName}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (p) => (
      <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>{p.email}</Typography>
    ),
  },
  {
    key: "identityNumber",
    label: "CNP",
    render: (p) => (
      <Typography sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.8125rem", color: T.textMuted }}>
        {p.identityNumber}
      </Typography>
    ),
  },
  {
    key: "phoneNumber",
    label: "Telefon",
    render: (p) => (
      <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
        {p.phoneNumber ?? "—"}
      </Typography>
    ),
  },
];

const PatientsListPage = () => {
  const { getPatientsPaged } = usePatientApi();
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();
  const [addOpen, setAddOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    setHeader({ title: "Pacienți", subtitle: "Gestionare pacienți" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
        <Box>
          <Typography
            sx={{
              fontSize: "1.375rem",
              fontWeight: 600,
              color: T.text,
              fontFamily: MS_FONTS.sans,
              letterSpacing: "-0.3px",
            }}
          >
            Pacienți
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            Toți pacienții înregistrați în sistem
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Adaugă pacient
        </Button>
      </Box>
      <Box sx={cardSx}>
        <PagedTable
          columns={columns}
          fetch={fetchPaged}
          onRowClick={(p) => navigate(`/patients/${p.id}`)}
          searchPlaceholder="Caută după nume, email sau CNP..."
          defaultSortBy="lastName"
          rowKey={(p) => p.id}
        />
      </Box>
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
