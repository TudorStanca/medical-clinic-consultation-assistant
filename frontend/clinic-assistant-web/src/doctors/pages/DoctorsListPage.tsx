import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import useDoctorApi from "@/doctors/useDoctorApi";
import DoctorForm from "@/doctors/components/DoctorForm";
import PagedTable from "@/shared/components/PagedTable";
import type { Column } from "@/shared/components/PagedTable";
import type { DoctorResponseDTO } from "@/doctors/props";
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

const columns: Column<DoctorResponseDTO>[] = [
  {
    key: "lastName",
    label: "Nume",
    sortable: true,
    render: (d) => (
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>
        {d.lastName} {d.firstName}
      </Typography>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (d) => (
      <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>{d.email}</Typography>
    ),
  },
  {
    key: "specialization",
    label: "Specializare",
    render: (d) => (
      <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>{d.specialization}</Typography>
    ),
  },
  {
    key: "codParafa",
    label: "Cod parafă",
    render: (d) => (
      <Typography sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.8125rem", color: T.textMuted }}>
        {d.codParafa}
      </Typography>
    ),
  },
];

const DoctorsListPage = () => {
  const { getDoctorsPaged } = useDoctorApi();
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();
  const [addOpen, setAddOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setHeader({ title: "Doctori", subtitle: "Gestionare medici" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

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
            Doctori
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            Toți medicii înregistrați în sistem
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Adaugă doctor
        </Button>
      </Box>
      <Box sx={cardSx}>
        <PagedTable
          key={refreshKey}
          columns={columns}
          fetch={fetchPaged}
          onRowClick={(d) => navigate(`/doctors/${d.id}`)}
          searchPlaceholder="Caută după nume sau email..."
          defaultSortBy="lastName"
          rowKey={(d) => d.id}
        />
      </Box>
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
