import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { PagedQuery, PagedResponse } from "@/shared/types/api";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  fetch: (query: PagedQuery) => Promise<PagedResponse<T>>;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  defaultSortBy?: string;
  defaultSortDir?: "asc" | "desc";
  rowKey: (row: T) => string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function PagedTable<T>({
  columns,
  fetch,
  onRowClick,
  searchPlaceholder = "Caută...",
  defaultSortBy,
  defaultSortDir = "asc",
  rowKey,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortBy ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (q: PagedQuery) => {
      setLoading(true);
      setError("");
      try {
        const result = await fetch(q);
        setRows(result.items);
        setTotal(result.totalCount);
      } catch {
        setError("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  useEffect(() => {
    load({ page: page + 1, pageSize, search, sortBy: sortBy || undefined, sortDir });
  }, [page, pageSize, sortBy, sortDir, load]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load({ page: 1, pageSize, search: value, sortBy: sortBy || undefined, sortDir });
    }, 300);
  };

  const handleSort = (key: string) => {
    const isActive = sortBy === key;
    const newDir = isActive && sortDir === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortDir(newDir);
    setPage(0);
  };

  return (
    <Box>
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2, width: 280 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {error && (
        <Typography color="error" variant="body2" mb={1}>
          {error}
        </Typography>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Niciun rezultat.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage="Rânduri pe pagină:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} din ${count}`}
      />
    </Box>
  );
}

export default PagedTable;
