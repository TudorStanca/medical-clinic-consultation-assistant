import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useDoctorApi from "@/doctors/useDoctorApi";
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
  const navigate = useNavigate();

  const fetchPaged = useCallback(
    (query: PagedQuery) => getDoctorsPaged(query),
    [getDoctorsPaged]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Doctori</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/doctors/new")}>
          Adaugă doctor
        </Button>
      </Box>
      <Paper>
        <Box sx={{ p: 2 }}>
          <PagedTable
            columns={columns}
            fetch={fetchPaged}
            searchPlaceholder="Caută după nume sau email..."
            defaultSortBy="lastName"
            rowKey={(d) => d.id}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DoctorsListPage;
