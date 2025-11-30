"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container } from "@mui/material";
import { CreateOrderFeature } from "@/src/features/orders/create-order";

function CreateOrderPageContent() {
  const searchParams = useSearchParams();
  const isAIMode = searchParams.get("ai") === "true";
  const title = searchParams.get("title") || undefined;
  const description = searchParams.get("description") || undefined;

  return (
    <Box sx={{ minHeight: '100vh', py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        <CreateOrderFeature
          initialTitle={title}
          initialDescription={description}
          aiMode={isAIMode}
        />
      </Container>
    </Box>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', py: 8, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box>Загрузка...</Box>
        </Container>
      </Box>
    }>
      <CreateOrderPageContent />
    </Suspense>
  );
}