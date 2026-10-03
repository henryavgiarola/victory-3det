"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export function CartaoMinhaFicha({
  id,
  nome,
  conceito,
  status,
}: {
  id: string;
  nome: string;
  conceito: string;
  status: string;
}) {
  return (
    <Card component="li">
      <CardActionArea component={Link} href={`/fichas/${id}`}>
        <CardContent>
          <Typography variant="h2">{nome}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {conceito}
          </Typography>
          <Chip label={status} color="primary" />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
