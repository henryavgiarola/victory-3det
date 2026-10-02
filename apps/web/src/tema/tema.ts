import { createTheme } from "@mui/material/styles";

export const tema = createTheme({
  cssVariables: false,
  palette: {
    mode: "light",
    primary: { main: "#5B21B6", light: "#7C3AED", dark: "#4C1D95", contrastText: "#FFFFFF" },
    secondary: { main: "#047857", light: "#10B981", dark: "#065F46", contrastText: "#FFFFFF" },
    warning: { main: "#EAB308", light: "#FDE047", dark: "#A16207", contrastText: "#1C1028" },
    info: { main: "#0E7490", light: "#22D3EE", dark: "#155E75", contrastText: "#FFFFFF" },
    success: { main: "#15803D", contrastText: "#FFFFFF" },
    error: { main: "#B91C1C", contrastText: "#FFFFFF" },
    background: { default: "#F4F0FA", paper: "#FFFFFF" },
    text: { primary: "#1A1226", secondary: "#4A3F5C" },
    divider: "rgba(91, 33, 182, 0.16)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-body), sans-serif",
    h1: { fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: "2.25rem", lineHeight: 1.2 },
    h2: { fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.3 },
    subtitle1: { fontFamily: "var(--font-display), sans-serif", fontWeight: 700 },
    button: { fontFamily: "var(--font-display), sans-serif", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F4F0FA",
          backgroundImage:
            "radial-gradient(1000px 360px at 0% -10%, rgba(124, 58, 237, 0.16), transparent 55%), radial-gradient(800px 280px at 100% 0%, rgba(14, 116, 144, 0.12), transparent 50%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minHeight: 44,
          paddingInline: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(91, 33, 182, 0.14)",
          boxShadow: "0 10px 28px rgba(44, 16, 84, 0.07)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
