import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
};

const STATUS_LABEL: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Înregistrare",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
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
];

const ConsultationListPage = () => {
  const { getSessionsPaged } = useConsultationApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchPaged = useCallback(
    (query: PagedQuery) => getSessionsPaged(query),
    [getSessionsPaged]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Consultații</Typography>
        {hasRole(Roles.Doctor) && (
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
    </Box>
  );
};

export default ConsultationListPage;
