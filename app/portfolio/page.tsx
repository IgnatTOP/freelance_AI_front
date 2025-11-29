"use client";

import { Box, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { PortfolioList } from "@/src/features/portfolio/portfolio-list/ui/PortfolioList";

export default function PortfolioPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 }
        }}
      >
        <PortfolioList
          onCreateNew={() => router.push("/portfolio/create")}
          onEdit={(id) => router.push(`/portfolio/${id}/edit`)}
        />
      </Container>
    </Box>
  );
}


