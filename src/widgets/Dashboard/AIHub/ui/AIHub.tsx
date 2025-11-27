"use client";

import { useState } from "react";
import { Card, Tabs, Space, theme } from "antd";
import { Sparkles, Bot, Lightbulb, MessageSquare } from "lucide-react";
import { AIRecommendations } from "@/src/widgets/Dashboard/AIRecommendations";
import { AIInsights } from "@/src/widgets/Dashboard/AIInsights";
import { AIAssistant } from "@/src/widgets/Dashboard/AIAssistant";

const { useToken } = theme;

interface AIHubProps {
  userRole: "client" | "freelancer" | null;
}

export function AIHub({ userRole }: AIHubProps) {
  const { token } = useToken();
  const [activeTab, setActiveTab] = useState("recommendations");

  const tabItems = [
    {
      key: "recommendations",
      label: (
        <Space size="small">
          <Bot size={16} />
          <span>Рекомендации</span>
        </Space>
      ),
      children: (
        <div style={{ padding: token.paddingLG }}>
          <AIRecommendations userRole={userRole} embedded={true} />
        </div>
      ),
    },
    {
      key: "insights",
      label: (
        <Space size="small">
          <Lightbulb size={16} />
          <span>Инсайты</span>
        </Space>
      ),
      children: (
        <div style={{ padding: token.paddingLG }}>
          <AIInsights userRole={userRole} embedded={true} />
        </div>
      ),
    },
    {
      key: "chat",
      label: (
        <Space size="small">
          <MessageSquare size={16} />
          <span>Помощник</span>
        </Space>
      ),
      children: (
        <div style={{ padding: 0 }}>
          <AIAssistant embedded={true} />
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderColor: token.colorBorder,
        borderRadius: token.borderRadiusLG,
      }}
      styles={{
        body: { padding: 0 }
      }}
    >
      <div style={{ 
        padding: `${token.paddingLG}px ${token.paddingLG}px 0 ${token.paddingLG}px`,
        display: 'flex',
        alignItems: 'center',
        gap: token.marginSM,
      }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: token.borderRadius,
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: token.fontSizeLG, fontWeight: 600 }}>AI Центр</span>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabBarStyle={{
          padding: `0 ${token.paddingLG}px`,
          margin: 0,
        }}
      />
    </Card>
  );
}
