"use client";

import { Card, Button, Space, Row, Col } from "antd";
import {
  Plus,
  Search,
  MessageSquare,
  FileText,
  Sparkles,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QuickCreateOrder } from "../../QuickCreateOrder";

interface QuickActionsProps {
  userRole: "client" | "freelancer" | null;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const clientActions = [
    {
      title: "Создать заказ",
      description: "Опубликуйте новый проект",
      icon: Plus,
      href: "/orders/create",
      color: "bg-primary/10 text-primary hover:bg-primary/20",
      primary: true,
    },
    {
      title: "AI генератор ТЗ",
      description: "Сгенерируйте описание с помощью AI",
      icon: Sparkles,
      href: "/orders/create?ai=true",
      color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
    },
    {
      title: "Найти фрилансеров",
      description: "Подходящие исполнители",
      icon: Search,
      href: "/freelancers",
      color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
    },
    {
      title: "Сообщения",
      description: "Чаты с фрилансерами",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    },
  ];

  const freelancerActions = [
    {
      title: "Найти заказы",
      description: "Просмотр активных проектов",
      icon: Search,
      href: "/orders",
      color: "bg-primary/10 text-primary hover:bg-primary/20",
      primary: true,
    },
    {
      title: "AI рекомендации",
      description: "Подходящие заказы для вас",
      icon: Bot,
      href: "/orders?ai-recommended=true",
      color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
    },
    {
      title: "Мои отклики",
      description: "Управление предложениями",
      icon: FileText,
      href: "/proposals",
      color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
    },
    {
      title: "Сообщения",
      description: "Чаты с заказчиками",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    },
  ];

  const actions = userRole === "client" ? clientActions : freelancerActions;

  return (
    <Card
      style={{
        background: 'var(--primary-05)',
        borderColor: 'var(--primary-12)',
      }}
    >
      <Row gutter={[16, 16]} wrap={false} style={{ overflowX: 'auto' }}>
        {/* Quick Create Order для клиентов - первая карточка */}
        {userRole === "client" && (
          <Col flex="0 0 auto">
            <QuickCreateOrder userRole={userRole} />
          </Col>
        )}
        
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Col key={action.title} flex="0 0 auto">
              <Link href={action.href}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    style={{
                      minWidth: 140,
                      background: action.primary ? 'var(--primary-08)' : undefined,
                      borderColor: action.primary ? 'var(--primary-25)' : undefined,
                    }}
                  >
                    <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
                      <Icon size={20} style={{ color: action.primary ? 'var(--primary)' : undefined }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {action.title}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>
                          {action.description}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </motion.div>
              </Link>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
