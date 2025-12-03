"use client";

import { useState } from "react";
import { Tabs, Tab, Stack, Box, Typography } from "@mui/material";
import { Sparkles, Bot, Lightbulb, MessageSquare } from "lucide-react";
import { AIRecommendations } from "@/src/widgets/Dashboard/AIRecommendations";
import { AIInsights } from "@/src/widgets/Dashboard/AIInsights";
import { AIAssistant } from "@/src/widgets/Dashboard/AIAssistant";
import { StyledCard } from "@/src/shared/ui";
import { radius, iconSize } from "@/src/shared/lib/constants/design";

interface AIHubProps {
  userRole: "client" | "freelancer" | null;
}

export function AIHub({ userRole }: AIHubProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <StyledCard noPadding sx={{ position: "sticky", top: 88 }}>
      <Box sx={{ px: 2, pt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: `${radius.md}px`,
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={iconSize.sm} style={{ color: "#fff" }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 16 }}>
            AI Центр
          </Typography>
        </Stack>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          px: 2,
          minHeight: 40,
          "& .MuiTab-root": {
            minHeight: 40,
            py: 1,
            fontSize: 12,
            minWidth: "auto",
            px: 1.5,
          },
        }}
      >
        <Tab icon={<Bot size={iconSize.sm} />} iconPosition="start" label="Рекомендации" />
        <Tab icon={<Lightbulb size={iconSize.sm} />} iconPosition="start" label="Инсайты" />
        <Tab icon={<MessageSquare size={iconSize.sm} />} iconPosition="start" label="Чат" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <AIRecommendations userRole={userRole} embedded />}
        {activeTab === 1 && <AIInsights userRole={userRole} embedded />}
        {activeTab === 2 && <AIAssistant embedded />}
      </Box>
    </StyledCard>
  );
}
