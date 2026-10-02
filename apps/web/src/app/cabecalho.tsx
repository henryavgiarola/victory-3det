"use client";

import AddIcon from "@mui/icons-material/Add";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export function Cabecalho() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: "3px solid", borderColor: "warning.main" }}>
      <Toolbar component="nav" aria-label="Principal" sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
        <Typography
          component={Link}
          href="/"
          variant="h2"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontSize: "1.25rem" }}
        >
          Victory
        </Typography>
        <Button component={Link} href="/fichas/nova" color="warning" variant="contained" startIcon={<AddIcon />}>
          Nova ficha
        </Button>
      </Toolbar>
    </AppBar>
  );
}
