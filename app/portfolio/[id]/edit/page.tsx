"use client";

import { Box, Container } from "@mui/material";
import { EditPortfolioItemFeature } from "@/src/features/portfolio/edit-portfolio-item/ui/EditPortfolioItemFeature";

export default function EditPortfolioPage() {
  return (
    <Box sx={{ bgcolor: "transparent" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, width: "100%" }}>
        <EditPortfolioItemFeature />
      </Container>
    </Box>
  );
}
