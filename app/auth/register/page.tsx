"use client";
import { toastService } from "@/src/shared/lib/toast";

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
  Row,
  Col,
} from "antd";
import { motion } from "framer-motion";
import { authService } from "@/src/shared/lib/auth/auth.service";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Briefcase,
  Users,
  ArrowRight,
  Check,
  Shield,
} from "lucide-react";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

type Role = "client" | "freelancer";

export default function RegisterPage() {
  const { token } = useToken();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (values: any) => {
    setError("");

    if (!selectedRole) {
      setError("Пожалуйста, выберите роль");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: values.email,
        password: values.password,
        username: values.username,
        role: selectedRole,
        display_name: values.displayName || values.username,
      });

      toastService.success("Регистрация прошла успешно!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Register error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        "Ошибка регистрации. Попробуйте другой email или username.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "client" as Role,
      title: "Заказчик",
      description: "Ищу исполнителей для проектов",
      icon: Briefcase,
      features: [
        "Размещение заказов",
        "AI-помощник для ТЗ",
        "Выбор фрилансеров",
        "Контроль проекта",
      ],
    },
    {
      id: "freelancer" as Role,
      title: "Фрилансер",
      description: "Выполняю заказы и зарабатываю",
      icon: Users,
      features: [
        "Поиск заказов",
        "AI-помощник для откликов",
        "Портфолио и рейтинг",
        "Защищенные выплаты",
      ],
    },
  ];

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
            style={{ width: "100%", maxWidth: selectedRole ? 480 : 960 }}
          >
            <Space direction="vertical" size={32} style={{ width: "100%" }}>
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
                  <UserPlus size={32} strokeWidth={2} style={{ color: "#fff" }} />
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
                  Регистрация
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
                  {!selectedRole
                    ? "Выберите роль для начала работы"
                    : "Создайте аккаунт на платформе"}
                </Text>
              </div>

              {/* Role Selection */}
              {!selectedRole && (
                <Row gutter={[24, 24]}>
                  {roles.map((role, index) => {
                    const Icon = role.icon;
                    return (
                      <Col xs={24} md={12} key={role.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                          <Card
                            hoverable
                            onClick={() => setSelectedRole(role.id)}
                            style={{
                              borderRadius: token.borderRadiusLG,
                              borderColor: token.colorBorder,
                              height: "100%",
                              cursor: "pointer",
                            }}
                            styles={{
                              body: { padding: 24 },
                            }}
                          >
                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                              <Space align="start" size={16}>
                                <div
                                  style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: token.borderRadiusLG,
                                    background: `${token.colorPrimary}1A`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon size={28} style={{ color: token.colorPrimary }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Title
                                    level={3}
                                    style={{
                                      margin: 0,
                                      fontSize: 20,
                                      lineHeight: "28px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {role.title}
                                  </Title>
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: 14,
                                      lineHeight: "22px",
                                      display: "block",
                                      marginTop: 4,
                                    }}
                                  >
                                    {role.description}
                                  </Text>
                                </div>
                              </Space>

                              <div
                                style={{
                                  paddingTop: 16,
                                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                                }}
                              >
                                <Space direction="vertical" size={8}>
                                  {role.features.map((feature, i) => (
                                    <div
                                      key={i}
                                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                                    >
                                      <Check
                                        size={16}
                                        style={{
                                          color: token.colorSuccess,
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          lineHeight: "22px",
                                          color: token.colorTextSecondary,
                                        }}
                                      >
                                        {feature}
                                      </Text>
                                    </div>
                                  ))}
                                </Space>
                              </div>
                            </Space>
                          </Card>
                        </motion.div>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* Registration Form */}
              {selectedRole && (
                <Card
                  style={{
                    borderRadius: token.borderRadiusLG,
                    borderColor: token.colorBorder,
                  }}
                  styles={{
                    body: { padding: 32 },
                  }}
                >
                  {/* Selected Role Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      padding: 16,
                      marginBottom: 24,
                      borderRadius: token.borderRadius,
                      background: `${token.colorPrimary}0D`,
                      border: `1px solid ${token.colorPrimary}26`,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: token.borderRadius,
                        background: `${token.colorPrimary}1A`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedRole === "client" ? (
                        <Briefcase size={20} style={{ color: token.colorPrimary }} />
                      ) : (
                        <Users size={20} style={{ color: token.colorPrimary }} />
                      )}
                    </div>
                    <Text strong style={{ fontSize: 14, lineHeight: "22px", flex: 1 }}>
                      Регистрация как {selectedRole === "client" ? "Заказчик" : "Фрилансер"}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setSelectedRole(null)}
                      style={{ fontSize: 14, lineHeight: "22px" }}
                    >
                      Изменить
                    </Button>
                  </div>

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
                          message="Ошибка регистрации"
                          description={error}
                          type="error"
                          showIcon
                          closable
                          onClose={() => setError("")}
                          style={{ borderRadius: token.borderRadius }}
                        />
                      </motion.div>
                    )}

                    {/* Email */}
                    <Form.Item
                      name="email"
                      label={<Text strong style={{ fontSize: 14, lineHeight: "22px" }}>Email</Text>}
                      rules={[
                        { required: true, message: "Введите email" },
                        { type: "email", message: "Введите корректный email" },
                      ]}
                      style={{ marginBottom: 24 }}
                    >
                      <Input
                        prefix={<Mail size={16} style={{ color: token.colorTextTertiary }} />}
                        placeholder="your@email.com"
                        disabled={loading}
                        style={{ fontSize: 14, lineHeight: "22px", height: 40 }}
                      />
                    </Form.Item>

                    {/* Username */}
                    <Form.Item
                      name="username"
                      label={<Text strong style={{ fontSize: 14, lineHeight: "22px" }}>Имя пользователя</Text>}
                      rules={[
                        { required: true, message: "Введите имя пользователя" },
                        { min: 3, message: "Минимум 3 символа" },
                      ]}
                      extra={
                        <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                          Минимум 3 символа, без пробелов
                        </Text>
                      }
                      style={{ marginBottom: 24 }}
                    >
                      <Input
                        prefix={<User size={16} style={{ color: token.colorTextTertiary }} />}
                        placeholder="username"
                        disabled={loading}
                        style={{ fontSize: 14, lineHeight: "22px", height: 40 }}
                      />
                    </Form.Item>

                    {/* Display Name */}
                    <Form.Item
                      name="displayName"
                      label={<Text strong style={{ fontSize: 14, lineHeight: "22px" }}>Отображаемое имя</Text>}
                      extra={
                        <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                          Ваше настоящее имя (опционально)
                        </Text>
                      }
                      style={{ marginBottom: 24 }}
                    >
                      <Input
                        placeholder="Иван Иванов"
                        disabled={loading}
                        style={{ fontSize: 14, lineHeight: "22px", height: 40 }}
                      />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                      name="password"
                      label={<Text strong style={{ fontSize: 14, lineHeight: "22px" }}>Пароль</Text>}
                      rules={[
                        { required: true, message: "Введите пароль" },
                        { min: 6, message: "Минимум 6 символов" },
                      ]}
                      extra={
                        <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                          Минимум 6 символов
                        </Text>
                      }
                      style={{ marginBottom: 24 }}
                    >
                      <Input.Password
                        prefix={<Lock size={16} style={{ color: token.colorTextTertiary }} />}
                        placeholder="••••••••"
                        disabled={loading}
                        style={{ fontSize: 14, lineHeight: "22px", height: 40 }}
                      />
                    </Form.Item>

                    {/* Confirm Password */}
                    <Form.Item
                      name="confirmPassword"
                      label={<Text strong style={{ fontSize: 14, lineHeight: "22px" }}>Подтверждение пароля</Text>}
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: "Подтвердите пароль" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Пароли не совпадают"));
                          },
                        }),
                      ]}
                      style={{ marginBottom: 24 }}
                    >
                      <Input.Password
                        prefix={<Lock size={16} style={{ color: token.colorTextTertiary }} />}
                        placeholder="••••••••"
                        disabled={loading}
                        style={{ fontSize: 14, lineHeight: "22px", height: 40 }}
                      />
                    </Form.Item>

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
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                      </Button>
                    </Form.Item>

                    {/* Login Link */}
                    <div
                      style={{
                        marginTop: 24,
                        paddingTop: 24,
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                        textAlign: "center",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 14, lineHeight: "22px" }}>
                        Уже есть аккаунт?{" "}
                        <Link href="/auth/login">
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
                            Войти
                          </Text>
                        </Link>
                      </Text>
                    </div>
                  </Form>
                </Card>
              )}

              {/* Security Info */}
              {selectedRole && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Shield size={16} style={{ color: token.colorTextTertiary }} />
                  <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                    Регистрируясь, вы соглашаетесь с{" "}
                    <Link href="/terms">
                      <Text
                        style={{
                          fontSize: 12,
                          lineHeight: "20px",
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
                        условиями использования
                      </Text>
                    </Link>
                  </Text>
                </div>
              )}
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}
