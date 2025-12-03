"use client";

import { Container, Box, Typography, Stack, Skeleton } from "@mui/material";
import type { ReactNode } from "react";
import { radius } from "@/src/shared/lib/constants/design";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function PageContainer({
  children,
  title,
  subtitle,
  actions,
  loading = false,
  maxWidth = "xl",
}: PageContainerProps) {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        pt: { xs: "88px", md: "96px" }, // header height + padding
        pb: { xs: 3, md: 4 },
        px: { xs: 2, md: 3 } 
      }}
    >
      {(title || actions) && (
        <Box sx={{ mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              {loading ? (
                <>
                  <Skeleton width={200} height={32} sx={{ borderRadius: `${radius.sm}px` }} />
                  {subtitle && <Skeleton width={300} height={20} sx={{ mt: 1, borderRadius: `${radius.sm}px` }} />}
                </>
              ) : (
                <>
                  {title && (
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: { xs: 24, md: 28 },
                        color: "var(--text)"
                      }}
                    >
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5, 
                        color: "var(--text-muted)",
                        fontSize: 14
                      }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </>
              )}
            </Box>
            {actions && <Box>{actions}</Box>}
          </Stack>
        </Box>
      )}
      {children}
    </Container>
  );
}
