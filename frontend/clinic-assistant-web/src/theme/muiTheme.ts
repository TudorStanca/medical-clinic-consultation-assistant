import { createTheme } from "@mui/material";
import { MS_FONTS } from "@/theme/tokens";

// Hex equivalents for MUI palette — MUI's internal color utils (lighten/darken/contrast)
// only support hex/rgb/hsl. OKLCH tokens are used directly in `sx` props.
const HEX = {
  accent:      "#398878",
  accentSoft:  "#ddf2ee",
  accentInk:   "#1c5448",
  warm:        "#b87c3a",
  warmSoft:    "#f5e9d8",
  success:     "#3d9e6a",
  successSoft: "#ddf2e8",
  warning:     "#c89430",
  warningSoft: "#f7eecc",
  danger:      "#c83030",
  dangerSoft:  "#f9e0e0",
  bg:          "#f9f8f5",
  surface:     "#fefefc",
  surfaceAlt:  "#f3f2ef",
  border:      "#e7e4dc",
  text:        "#2e2b24",
  textMuted:   "#7d7a72",
  textDim:     "#a7a49e",
} as const;

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: HEX.accent,
      light: HEX.accentSoft,
      dark: HEX.accentInk,
      contrastText: "#ffffff",
    },
    secondary: {
      main: HEX.warm,
      light: HEX.warmSoft,
      contrastText: "#ffffff",
    },
    error: {
      main: HEX.danger,
      light: HEX.dangerSoft,
      contrastText: "#ffffff",
    },
    warning: {
      main: HEX.warning,
      light: HEX.warningSoft,
      contrastText: "#ffffff",
    },
    success: {
      main: HEX.success,
      light: HEX.successSoft,
      contrastText: "#ffffff",
    },
    background: {
      default: HEX.bg,
      paper: HEX.surface,
    },
    text: {
      primary: HEX.text,
      secondary: HEX.textMuted,
      disabled: HEX.textDim,
    },
    divider: HEX.border,
  },
  typography: {
    fontFamily: MS_FONTS.sans,
    h1: { fontFamily: MS_FONTS.serif, fontWeight: 400, letterSpacing: -1 },
    h2: { fontFamily: MS_FONTS.serif, fontWeight: 400, letterSpacing: -0.5 },
    h3: { fontFamily: MS_FONTS.serif, fontWeight: 400, letterSpacing: -0.3 },
    h4: { fontFamily: MS_FONTS.sans, fontWeight: 600, letterSpacing: -0.3 },
    h5: { fontFamily: MS_FONTS.sans, fontWeight: 600, letterSpacing: -0.2 },
    h6: { fontFamily: MS_FONTS.sans, fontWeight: 600, letterSpacing: -0.2 },
    button: { fontFamily: MS_FONTS.sans, fontWeight: 500, textTransform: "none", letterSpacing: -0.1 },
    body1: { fontFamily: MS_FONTS.sans, fontSize: "0.9rem", lineHeight: 1.6 },
    body2: { fontFamily: MS_FONTS.sans, fontSize: "0.8125rem", lineHeight: 1.55 },
    caption: { fontFamily: MS_FONTS.sans, fontSize: "0.7rem", lineHeight: 1.5 },
    overline: {
      fontFamily: MS_FONTS.sans,
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: HEX.bg,
          color: HEX.text,
          fontFamily: MS_FONTS.sans,
        },
        "*": { boxSizing: "border-box" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          letterSpacing: -0.1,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
        },
        outlinedPrimary: {
          borderColor: HEX.border,
          color: HEX.text,
          "&:hover": { background: HEX.surfaceAlt, borderColor: "#ccc9bf" },
        },
        textPrimary: {
          color: HEX.textMuted,
          "&:hover": { background: HEX.surfaceAlt, color: HEX.text },
        },
        sizeSmall: { padding: "5px 10px", fontSize: "0.8125rem" },
        sizeMedium: { padding: "8px 14px", fontSize: "0.875rem" },
        sizeLarge: { padding: "11px 18px", fontSize: "0.9375rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: HEX.textMuted,
          "&:hover": { background: HEX.surfaceAlt },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: HEX.surface,
          border: `1px solid ${HEX.border}`,
          borderRadius: 14,
          boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: HEX.surface,
          backgroundImage: "none",
          boxShadow: "none",
          border: `1px solid ${HEX.border}`,
        },
        elevation0: { border: "none" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: HEX.surface,
          color: HEX.text,
          boxShadow: "none",
          borderBottom: `1px solid ${HEX.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: HEX.surface,
          borderRight: `1px solid ${HEX.border}`,
          boxShadow: "none",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: HEX.border },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: HEX.bg,
          fontSize: "0.875rem",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc9bf" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HEX.accent, borderWidth: "1.5px" },
        },
        notchedOutline: { borderColor: HEX.border },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          color: HEX.textMuted,
          "&.Mui-focused": { color: HEX.accent },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: "0.7188rem",
          fontWeight: 500,
          height: 26,
          letterSpacing: 0.1,
        },
        colorPrimary: {
          background: HEX.accentSoft,
          color: HEX.accentInk,
          border: "none",
        },
        colorSuccess: {
          background: HEX.successSoft,
          color: HEX.success,
          border: "none",
        },
        colorWarning: {
          background: HEX.warningSoft,
          color: HEX.warning,
          border: "none",
        },
        colorError: {
          background: HEX.dangerSoft,
          color: HEX.danger,
          border: "none",
        },
        outlined: {
          background: "transparent",
          borderColor: HEX.border,
          color: HEX.textMuted,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            background: HEX.surfaceAlt,
            fontSize: "0.7rem",
            fontWeight: 600,
            color: HEX.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: `1px solid ${HEX.border}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${HEX.border}`,
          fontSize: "0.875rem",
          padding: "12px 16px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { background: HEX.surfaceAlt },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${HEX.border}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: -0.2,
          paddingBottom: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { paddingTop: "8px !important" },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: "12px 20px 16px" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.8125rem",
          border: "1px solid",
          alignItems: "flex-start",
        },
        standardSuccess: {
          background: HEX.successSoft,
          color: "#2a7a4a",
          borderColor: "#b8e4cb",
          "& .MuiAlert-icon": { color: HEX.success },
        },
        standardError: {
          background: HEX.dangerSoft,
          color: "#9a2020",
          borderColor: "#f0baba",
          "& .MuiAlert-icon": { color: HEX.danger },
        },
        standardWarning: {
          background: HEX.warningSoft,
          color: "#8a6010",
          borderColor: "#e8d08a",
          "& .MuiAlert-icon": { color: HEX.warning },
        },
        standardInfo: {
          background: HEX.accentSoft,
          color: HEX.accentInk,
          borderColor: "#b0dcd4",
          "& .MuiAlert-icon": { color: HEX.accent },
        },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        autoHideDuration: 4000,
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          color: HEX.textMuted,
          minHeight: 44,
          "&.Mui-selected": { color: HEX.accentInk, fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { background: HEX.accent, height: 2 },
        root: { borderBottom: `1px solid ${HEX.border}` },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          margin: "1px 8px",
          padding: "8px 10px",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: HEX.textMuted,
          "&.Mui-selected": {
            background: HEX.accentSoft,
            color: HEX.accentInk,
            fontWeight: 600,
            "&:hover": { background: HEX.accentSoft },
          },
          "&:hover": { background: HEX.surfaceAlt, color: HEX.text },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: HEX.text,
          color: HEX.surface,
          fontSize: "0.75rem",
          borderRadius: 8,
          padding: "5px 10px",
        },
        arrow: { color: HEX.text },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, background: HEX.accentSoft },
        bar: { background: HEX.accent, borderRadius: 4 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { background: HEX.surfaceAlt },
      },
    },
  },
});

export default muiTheme;
