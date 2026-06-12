import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useLetterAccessApi from "@/access/useLetterAccessApi";
import AddGrantDialog from "@/access/components/AddGrantDialog";
import type { LetterAccessGrantResponseDTO } from "@/access/props";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

const LetterAccessSection = () => {
  const { getMyGrants, revokeGrant } = useLetterAccessApi();
  const [grants, setGrants] = useState<LetterAccessGrantResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyGrants();
      setGrants(data);
    } finally {
      setLoading(false);
    }
  }, [getMyGrants]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await revokeGrant(id);
      setGrants((prev) => prev.filter((g) => g.id !== id));
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: T.text }}>
            Acces scrisori medicale
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            Controlează care medici pot vedea scrisorile tale de la alți medici.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Acordă acces
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: "24px" }}>
          <CircularProgress size={24} />
        </Box>
      ) : grants.length === 0 ? (
        <Box
          sx={{
            border: `1px dashed ${T.border}`,
            borderRadius: "10px",
            p: "24px",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
            Nu ai acordat niciun acces încă.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {grants.map((g) => (
            <Box
              key={g.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: `1px solid ${T.border}`,
                borderRadius: "10px",
                px: "16px",
                py: "12px",
                gap: "12px",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "0.875rem", color: T.text, lineHeight: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    Dr. {g.granteeName}
                  </Box>
                  <Box component="span" sx={{ color: T.textMuted, mx: "6px" }}>
                    poate vedea scrisorile de la
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    Dr. {g.sourceName}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: T.textMuted, mt: "2px" }}>
                  Acordat pe {formatDate(g.createdAt)}
                </Typography>
              </Box>
              <Tooltip title="Revocă accesul">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleRevoke(g.id)}
                    disabled={revoking === g.id}
                    color="error"
                    sx={{ flexShrink: 0 }}
                  >
                    {revoking === g.id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteOutlineIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      <AddGrantDialog
        open={dialogOpen}
        onCreated={(grant) => {
          setGrants((prev) => [grant, ...prev]);
          setDialogOpen(false);
        }}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
};

export default LetterAccessSection;
