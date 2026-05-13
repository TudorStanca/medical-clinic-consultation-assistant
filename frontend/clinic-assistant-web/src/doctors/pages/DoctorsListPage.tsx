import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import useDoctorApi from "@/doctors/useDoctorApi";
import DoctorForm from "@/doctors/components/DoctorForm";
import type { DoctorResponseDTO } from "@/doctors/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const PAGE_SIZE = 12;

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "20px",
} as const;

const DoctorsListPage = () => {
  const { getDoctorsPaged } = useDoctorApi();
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();
  const [addOpen, setAddOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [doctors, setDoctors] = useState<DoctorResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeader({ title: "Doctori", subtitle: "Gestionare medici" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDoctorsPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sortBy: "lastName",
        sortDir: "asc",
      });
      setDoctors(result.items);
      setTotal(result.totalCount);
    } finally {
      setLoading(false);
    }
  }, [getDoctorsPaged, page, debouncedSearch, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

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

      <Box sx={{ ...cardSx }}>
        <Box sx={{ mb: "20px" }}>
          <TextField
            size="small"
            placeholder="Caută după nume sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: T.textDim }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: "48px" }}>
            <CircularProgress size={28} sx={{ color: T.accent }} />
          </Box>
        ) : doctors.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", py: "48px" }}>
            <SearchOffIcon sx={{ fontSize: 44, color: T.border }} />
            <Typography sx={{ color: T.textMuted, fontSize: "0.875rem" }}>
              {debouncedSearch ? `Niciun rezultat pentru „${debouncedSearch}"` : "Nu există medici înregistrați."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: "16px",
            }}
          >
            {doctors.map((d) => {
              const initials = `${d.firstName[0] ?? ""}${d.lastName[0] ?? ""}`.toUpperCase();
              const isAccent = d.id.charCodeAt(0) % 2 === 0;
              return (
                <Box
                  key={d.id}
                  onClick={() => navigate(`/doctors/${d.id}`)}
                  sx={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: "14px",
                    p: "20px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    "&:hover": {
                      borderColor: T.accent,
                      boxShadow: `0 4px 20px ${T.accentSoft}`,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "14px" }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: isAccent ? T.accentSoft : T.warmSoft,
                        color: isAccent ? T.accentInk : T.warm,
                        fontSize: "1rem",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: T.text, lineHeight: 1.3 }}>
                        Dr. {d.lastName} {d.firstName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8125rem", color: T.accent, mt: "2px" }}>
                        {d.specialization}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: "10px",
                        py: "3px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background: T.surfaceAlt,
                        color: T.textMuted,
                        border: `1px solid ${T.border}`,
                        fontFamily: MS_FONTS.mono,
                        flexShrink: 0,
                      }}
                    >
                      {d.codParafa}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pt: "14px",
                      borderTop: `1px solid ${T.border}`,
                    }}
                  >
                    <MailOutlinedIcon sx={{ fontSize: 15, color: T.textDim, flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        color: T.textMuted,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.email}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: "24px" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              size="small"
              sx={{
                "& .MuiPaginationItem-root": { color: T.textMuted, fontSize: "0.8125rem" },
                "& .Mui-selected": { background: T.accentSoft, color: T.accentInk },
              }}
            />
          </Box>
        )}
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
