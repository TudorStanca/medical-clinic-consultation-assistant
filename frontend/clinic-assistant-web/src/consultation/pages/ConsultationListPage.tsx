import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
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

const STATUS_COLOR: Record<SessionStatusName, "default" | "primary" | "warning" | "success" | "error"> = {
  Created: "default",
  Recording: "primary",
  Processing: "warning",
  Done: "success",
  Failed: "error",
  Interrupted: "warning",
};

const STATUS_LABEL: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Înregistrare",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
  Interrupted: "Întreruptă",
};

const ConsultationListPage = () => {
  const { getSessionsPaged, deleteSession } = useConsultationApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const isDoctor = hasRole(Roles.Doctor);

  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionToDelete, setSessionToDelete] = useState<SessionSummaryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPaged = useCallback(
    (query: PagedQuery) => getSessionsPaged(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getSessionsPaged, refreshKey]
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
      render: (s) => new Date(s.createdAt).toLocaleDateString("ro-RO"),
    },
    { key: "patientFullName", label: "Pacient", sortable: true, render: (s) => s.patientFullName },
    { key: "doctorFullName", label: "Doctor", render: (s) => s.doctorFullName },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (s) => (
        <Chip label={STATUS_LABEL[s.status]} color={STATUS_COLOR[s.status]} size="small" />
      ),
    },
    { key: "hasLetter", label: "Scrisoare", render: (s) => (s.hasLetter ? "✓" : "—") },
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
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(s);
                    }}
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Consultații</Typography>
        {isDoctor && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/consultations/new")}>
            Consultație nouă
          </Button>
        )}
      </Box>
      <Paper>
        <Box sx={{ p: 2 }}>
          <PagedTable
            columns={columns}
            fetch={fetchPaged}
            onRowClick={(s) => navigate(`/consultations/${s.sessionId}`)}
            searchPlaceholder="Caută după pacient sau doctor..."
            defaultSortBy="createdAt"
            defaultSortDir="desc"
            rowKey={(s) => s.sessionId}
          />
        </Box>
      </Paper>
      <Dialog open={!!sessionToDelete} onClose={() => setSessionToDelete(null)}>
        <DialogTitle>Șterge consultație</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Consultația cu{" "}
            <strong>{sessionToDelete?.patientFullName}</strong> din{" "}
            {sessionToDelete
              ? new Date(sessionToDelete.createdAt).toLocaleDateString("ro-RO")
              : ""}{" "}
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
