import { useCallback, useEffect, useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import useConsultationApi from "@/consultation/useConsultationApi";
import PagedTable from "@/shared/components/PagedTable";
import type { Column } from "@/shared/components/PagedTable";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { SessionSummaryResponse } from "@/consultation/props";
import type { SessionStatusName } from "@/shared/types/enums";
import type { PagedQuery } from "@/shared/types/api";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const STATUS_LABEL: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Înregistrare",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
  Interrupted: "Întreruptă",
};

const STATUS_BG: Record<SessionStatusName, string> = {
  Created: T.surfaceAlt,
  Recording: T.accentSoft,
  Processing: T.warningSoft,
  Done: T.successSoft,
  Failed: T.dangerSoft,
  Interrupted: T.warningSoft,
};

const STATUS_FG: Record<SessionStatusName, string> = {
  Created: T.textMuted,
  Recording: T.accentInk,
  Processing: T.warning,
  Done: T.success,
  Failed: T.danger,
  Interrupted: T.warning,
};

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "24px",
} as const;

const ConsultationListPage = () => {
  const { getSessionsPaged, deleteSession } = useConsultationApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const isDoctor = hasRole(Roles.Doctor);
  const { setHeader } = usePageHeader();

  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionToDelete, setSessionToDelete] = useState<SessionSummaryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");

  const { dateFrom, dateTo } = useMemo(() => {
    if (dateFilter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
    }
    if (dateFilter === "week") {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7);
      return { dateFrom: monday.toISOString(), dateTo: nextMonday.toISOString() };
    }
    return { dateFrom: undefined, dateTo: undefined };
  }, [dateFilter]);

  useEffect(() => {
    setHeader({ title: "Consultații", subtitle: "Istoric consultații medicale" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

  const fetchPaged = useCallback(
    (query: PagedQuery) => getSessionsPaged({ ...query, dateFrom, dateTo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getSessionsPaged, refreshKey, dateFrom, dateTo]
  );

  const DATE_FILTERS: { key: "all" | "today" | "week"; label: string }[] = [
    { key: "all", label: "Toate" },
    { key: "today", label: "Astăzi" },
    { key: "week", label: "Această săptămână" },
  ];

  const dateFilterChips = (
    <>
      {DATE_FILTERS.map((f) => (
        <Box
          key={f.key}
          onClick={() => setDateFilter(f.key)}
          sx={{
            px: "12px",
            py: "5px",
            borderRadius: "20px",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer",
            userSelect: "none",
            background: dateFilter === f.key ? T.accentSoft : T.surfaceAlt,
            color: dateFilter === f.key ? T.accentInk : T.textMuted,
            border: `1px solid ${dateFilter === f.key ? "transparent" : T.border}`,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {f.label}
        </Box>
      ))}
    </>
  );

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) {
      return;
    }
    setDeleting(true);
    try {
      await deleteSession(sessionToDelete.sessionId);
      setSessionToDelete(null);
      setRefreshKey((k) => k + 1);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<SessionSummaryResponse>[] = [
    {
      key: "createdAt",
      label: "Data",
      sortable: true,
      render: (s) => (
        <Typography sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.8125rem", color: T.textMuted }}>
          {new Date(s.createdAt).toLocaleDateString("ro-RO")}
        </Typography>
      ),
    },
    {
      key: "patientFullName",
      label: "Pacient",
      sortable: true,
      render: (s) => {
        const parts = s.patientFullName?.split(" ") ?? [];
        const initials = parts.length >= 2
          ? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
          : (parts[0]?.[0] ?? "?").toUpperCase();
        const isAccent = s.sessionId.charCodeAt(0) % 2 === 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: isAccent ? T.accentSoft : T.warmSoft,
                color: isAccent ? T.accentInk : T.warm,
                fontSize: "0.65rem",
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>
              {s.patientFullName}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "doctorFullName",
      label: "Doctor",
      render: (s) => (
        <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
          {s.doctorFullName}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (s) => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: "10px",
            py: "3px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 500,
            background: STATUS_BG[s.status],
            color: STATUS_FG[s.status],
          }}
        >
          {STATUS_LABEL[s.status]}
        </Box>
      ),
    },
    {
      key: "hasLetter",
      label: "Scrisoare",
      render: (s) => (
        <Typography
          sx={{
            fontSize: "0.8125rem",
            color: s.hasLetter ? T.success : T.textDim,
            fontWeight: s.hasLetter ? 600 : 400,
          }}
        >
          {s.hasLetter ? "✓ Da" : "—"}
        </Typography>
      ),
    },
    ...(isDoctor
      ? [
          {
            key: "actions",
            label: "",
            render: (s: SessionSummaryResponse) =>
              s.status === "Interrupted" || s.status === "Failed" ? (
                <Tooltip title="Șterge consultație">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(s);
                    }}
                    sx={{ color: T.danger, "&:hover": { background: T.dangerSoft } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null,
          },
        ]
      : []),
  ];

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
            Consultații
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            Toate consultațiile medicale înregistrate
          </Typography>
        </Box>
        {isDoctor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/consultations/new")}
          >
            Consultație nouă
          </Button>
        )}
      </Box>
      <Box sx={cardSx}>
        <PagedTable
          columns={columns}
          fetch={fetchPaged}
          onRowClick={(s) => navigate(`/consultations/${s.sessionId}`)}
          searchPlaceholder="Caută după pacient sau doctor..."
          defaultSortBy="createdAt"
          defaultSortDir="desc"
          rowKey={(s) => s.sessionId}
          extraFilters={dateFilterChips}
        />
      </Box>
      <Dialog open={!!sessionToDelete} onClose={() => setSessionToDelete(null)}>
        <DialogTitle>Șterge consultație</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Consultația cu <strong>{sessionToDelete?.patientFullName}</strong> din{" "}
            {sessionToDelete ? new Date(sessionToDelete.createdAt).toLocaleDateString("ro-RO") : ""}{" "}
            va fi ștearsă definitiv. Continui?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionToDelete(null)} disabled={deleting}>
            Anulează
          </Button>
          <Button color="error" onClick={handleDeleteConfirm} disabled={deleting}>
            Șterge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationListPage;
