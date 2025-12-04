"use client";

import { Skeleton, Stack, Grid, Box, CircularProgress } from "@mui/material";
import { radius } from "@/src/shared/lib/constants/design";

interface LoadingStateProps {
  type?: "cards" | "list" | "page" | "spinner";
  count?: number;
  height?: number;
}

export function LoadingState({ type = "cards", count = 4, height = 120 }: LoadingStateProps) {
  if (type === "spinner") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (type === "list") {
    return (
      <Stack spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={height} sx={{ borderRadius: `${radius.lg}px` }} />
        ))}
      </Stack>
    );
  }

  if (type === "page") {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={88} sx={{ borderRadius: `${radius.lg}px` }} />
        <Grid container spacing={2}>
          {Array.from({ length: count }).map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={88} sx={{ borderRadius: `${radius.lg}px` }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  // cards
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
          <Skeleton variant="rectangular" height={height} sx={{ borderRadius: `${radius.lg}px` }} />
        </Grid>
      ))}
    </Grid>
  );
}
