"use client";

import { Box, Container } from "@mui/material";
import { CreatePortfolioItemFeature } from "@/src/features/portfolio/create-portfolio-item/ui/CreatePortfolioItemFeature";

export default function CreatePortfolioPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, width: "100%" }}>
        <CreatePortfolioItemFeature />
      </Container>
    </Box>
  );
}
