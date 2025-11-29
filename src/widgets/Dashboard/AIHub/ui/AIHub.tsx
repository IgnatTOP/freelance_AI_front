"use client";

import { useState } from "react";
import { Card, CardContent, Tabs, Tab, Stack, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Sparkles, Bot, Lightbulb, MessageSquare } from "lucide-react";
import { AIRecommendations } from "@/src/widgets/Dashboard/AIRecommendations";
import { AIInsights } from "@/src/widgets/Dashboard/AIInsights";
import { AIAssistant } from "@/src/widgets/Dashboard/AIAssistant";

interface AIHubProps {
  userRole: "client" | "freelancer" | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`aihub-tabpanel-${index}`}
      aria-labelledby={`aihub-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function AIHub({ userRole }: AIHubProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Card
      sx={{
        borderColor: theme.palette.divider,
        borderRadius: 2,
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} style={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600 }}>
            AI Центр
          </Typography>
        </Stack>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          px: 3,
          '& .MuiTabs-flexContainer': {
            gap: 2,
          },
        }}
      >
        <Tab
          icon={<Bot size={16} />}
          iconPosition="start"
          label="Рекомендации"
          sx={{ minHeight: 48 }}
        />
        <Tab
          icon={<Lightbulb size={16} />}
          iconPosition="start"
          label="Инсайты"
          sx={{ minHeight: 48 }}
        />
        <Tab
          icon={<MessageSquare size={16} />}
          iconPosition="start"
          label="Помощник"
          sx={{ minHeight: 48 }}
        />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <AIRecommendations userRole={userRole} embedded={true} />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <AIInsights userRole={userRole} embedded={true} />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <AIAssistant embedded={true} />
      </TabPanel>
    </Card>
  );
}
