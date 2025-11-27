"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout, Card, Typography, Space, Button } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { User, Bell, Lock, Settings as SettingsIcon } from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }
  }, [router]);

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>Настройки</Title>
            <Text type="secondary">Управление настройками аккаунта</Text>
          </div>

          <Card
            title={
              <Space>
                <User size={20} />
                <span>Профиль</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Link href="/profile">
                <Button type="primary">Редактировать профиль</Button>
              </Link>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">
                Управляйте информацией о себе, навыками и опытом работы
              </Text>
              <Link href="/profile">
                <Button>Перейти к редактированию профиля</Button>
              </Link>
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <Bell size={20} />
                <span>Уведомления</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">
                Настройки уведомлений будут доступны в следующих версиях
              </Text>
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <Lock size={20} />
                <span>Безопасность</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">
                Настройки безопасности будут доступны в следующих версиях
              </Text>
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}

