"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  theme,
} from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { motion } from "framer-motion";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

export default function LoginPage() {
  const { token } = useToken();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (values: any) => {
    setError("");
    setLoading(true);

    try {
      await authService.login({
        email: values.email,
        password: values.password,
      });

      toastService.success("Вход выполнен успешно!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        "Ошибка входа. Проверьте email и пароль.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "40px 24px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", maxWidth: 480 }}
          >
            <Space direction="vertical" size={32} style={{ width: "100%" }}>
              {/* Back Button */}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Button
                  type="text"
                  icon={<ArrowLeft size={20} />}
                  onClick={() => router.push("/")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 12px",
                    height: "auto",
                    color: token.colorTextSecondary,
                  }}
                >
                  На главную
                </Button>
              </div>

              {/* Header */}
              <div style={{ textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: token.borderRadiusLG,
                    background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <LogIn size={32} strokeWidth={2} style={{ color: "#fff" }} />
                </motion.div>
                <Title
                  level={1}
                  style={{
                    margin: 0,
                    fontSize: 32,
                    lineHeight: "40px",
                    fontWeight: 600,
                  }}
                >
                  Вход в аккаунт
                </Title>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 14,
                    lineHeight: "22px",
                    display: "block",
                    marginTop: 8,
                  }}
                >
                  Войдите для доступа к платформе
                </Text>
              </div>

              {/* Form Card */}
              <Card
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorder,
                }}
                styles={{
                  body: { padding: 32 },
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                  requiredMark={false}
                >
                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 24 }}
                    >
                      <Alert
                        message="Ошибка входа"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError("")}
                        style={{
                          borderRadius: token.borderRadius,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <Form.Item
                    name="email"
                    label={
                      <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                        Email
                      </Text>
                    }
                    rules={[
                      { required: true, message: "Введите email" },
                      { type: "email", message: "Введите корректный email" },
                    ]}
                    style={{ marginBottom: 24 }}
                  >
                    <Input
                      prefix={
                        <Mail size={16} style={{ color: token.colorTextTertiary }} />
                      }
                      placeholder="your@email.com"
                      disabled={loading}
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        height: 40,
                      }}
                    />
                  </Form.Item>

                  {/* Password Field */}
                  <Form.Item
                    name="password"
                    label={
                      <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                        Пароль
                      </Text>
                    }
                    rules={[
                      { required: true, message: "Введите пароль" },
                      { min: 6, message: "Минимум 6 символов" },
                    ]}
                    style={{ marginBottom: 16 }}
                  >
                    <Input.Password
                      prefix={
                        <Lock size={16} style={{ color: token.colorTextTertiary }} />
                      }
                      placeholder="••••••••"
                      disabled={loading}
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        height: 40,
                      }}
                    />
                  </Form.Item>

                  {/* Forgot Password Link */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: 24,
                    }}
                  >
                    <Link href="/auth/forgot-password">
                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: "22px",
                          color: token.colorPrimary,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        Забыли пароль?
                      </Text>
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<ArrowRight size={20} strokeWidth={2} />}
                      loading={loading}
                      block
                      iconPosition="end"
                      style={{
                        height: 48,
                        fontSize: 16,
                        lineHeight: "24px",
                        fontWeight: 500,
                      }}
                    >
                      {loading ? "Вход..." : "Войти"}
                    </Button>
                  </Form.Item>

                  {/* Register Link */}
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 24,
                      borderTop: `1px solid ${token.colorBorderSecondary}`,
                      textAlign: "center",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, lineHeight: "22px" }}
                    >
                      Нет аккаунта?{" "}
                      <Link href="/auth/register">
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            lineHeight: "22px",
                            color: token.colorPrimary,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          Зарегистрироваться
                        </Text>
                      </Link>
                    </Text>
                  </div>
                </Form>
              </Card>

              {/* Security Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <ShieldCheck
                  size={16}
                  style={{ color: token.colorTextTertiary }}
                />
                <Text
                  type="secondary"
                  style={{ fontSize: 12, lineHeight: "20px" }}
                >
                  Защищенное соединение с шифрованием
                </Text>
              </div>
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}
