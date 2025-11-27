"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Card, Form, Input, Button, Typography, Space } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      // TODO: Implement password reset API call
      toastService.success("Инструкции по восстановлению пароля отправлены на ваш email");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toastService.error("Не удалось отправить инструкции. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={2} style={{ marginBottom: 8 }}>
                Восстановление пароля
              </Title>
              <Text type="secondary">
                Введите email, и мы отправим вам инструкции по восстановлению пароля
              </Text>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Введите email" },
                  { type: "email", message: "Введите корректный email" },
                ]}
              >
                <Input
                  prefix={<Mail size={16} />}
                  placeholder="your@email.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  Отправить инструкции
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center" }}>
              <Link href="/auth/login">
                <Button type="link" icon={<ArrowLeft size={16} />}>
                  Вернуться к входу
                </Button>
              </Link>
            </div>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

