"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Space,
  Button,
  Form,
  Input,
  InputNumber,
  theme,
  message,
  Spin,
  Row,
  Col,
  Alert,
} from "antd";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Loader } from "lucide-react";
import { createProposal } from "@/src/shared/api/proposals";
import { getOrder } from "@/src/shared/api/orders";
import { getProfile } from "@/src/shared/api/profile";
import { aiService } from "@/src/shared/lib/ai";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { proposalCoverLetterRules, budgetRules } from "@/src/shared/lib/utils/form-validations";
import type { Order } from "@/src/entities/order/model/types";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

export default function CreateProposalPage() {
  const { token } = useToken();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [showAiHelp, setShowAiHelp] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "freelancer") {
      toastService.error("Только фрилансеры могут откликаться на заказы");
      router.push(`/orders/${orderId}`);
      return;
    }

    loadOrder();
  }, [orderId, router]);

  const loadOrder = async () => {
    setOrderLoading(true);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error("Error loading order:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказа");
      router.push(`/orders/${orderId}`);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!order || generating) return; // Защита от двойного клика

    setGenerating(true);
    setAiGeneratedText("");
    setShowAiHelp(true);

    try {
      // Получаем профиль пользователя для контекста
      let profileData = null;
      try {
        profileData = await getProfile();
      } catch (e) {
        console.warn("Could not load profile for AI context:", e);
      }

      let finalText = "";
      await aiService.generateProposalStream(
        orderId,
        {
          user_skills: profileData?.skills || [],
          user_experience: profileData?.experience_level || "middle",
          user_bio: profileData?.bio || "",
        },
        (chunk) => {
          finalText += chunk;
          setAiGeneratedText((prev) => prev + chunk);
        }
      );

      // Автоматически заполняем форму сгенерированным текстом
      // Используем finalText вместо aiGeneratedText, так как state может быть не обновлен
      form.setFieldsValue({
        cover_letter: finalText,
      });

      toastService.success("Отклик сгенерирован с помощью AI!");
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при генерации отклика"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleUseAIGenerated = () => {
    form.setFieldsValue({
      cover_letter: aiGeneratedText,
    });
    setShowAiHelp(false);
    toastService.success("Текст применен к форме");
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const proposal = await createProposal(orderId, {
        cover_letter: values.cover_letter,
        amount: values.amount || undefined,
      });

      toastService.success("Отклик успешно отправлен!");
      // Перенаправляем на страницу заказа - там автоматически загрузится информация об отклике
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при отправке отклика"
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderLoading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "transparent" }}>
        <Content>
          <div
            style={{
              minHeight: "100vh",
              padding: "40px 24px",
              maxWidth: 800,
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Card
              style={{
                borderRadius: token.borderRadiusLG,
                borderColor: token.colorBorder,
              }}
            >
              <Spin size="large" style={{ display: "block", textAlign: "center", padding: 40 }} />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content>
        <div
          style={{
            minHeight: "100vh",
            padding: "40px 24px",
            maxWidth: 800,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              {/* Header */}
              <div>
                <Button
                  type="text"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => router.push(`/orders/${orderId}`)}
                  style={{
                    padding: 0,
                    height: "auto",
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  Назад к заказу
                </Button>
                <Title
                  level={1}
                  style={{
                    margin: 0,
                    fontSize: 28,
                    lineHeight: "36px",
                    fontWeight: 600,
                  }}
                >
                  Откликнуться на заказ
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
                  {order.title}
                </Text>
              </div>

              {/* Form */}
              <Card
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorder,
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          Сопроводительное письмо
                        </Text>
                        <Button
                          type="default"
                          icon={<Sparkles size={16} />}
                          onClick={handleGenerateWithAI}
                          loading={generating}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {generating ? "Генерирую..." : "Сгенерировать с AI"}
                        </Button>
                      </Space>
                    </Col>
                  </Row>

                  {showAiHelp && aiGeneratedText && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col span={24}>
                        <Alert
                          message="AI сгенерировал отклик"
                          description={
                            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                              <Text style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                                {aiGeneratedText}
                              </Text>
                              <Button
                                type="primary"
                                size="small"
                                onClick={handleUseAIGenerated}
                                style={{ marginTop: 8 }}
                              >
                                Использовать этот текст
                              </Button>
                            </Space>
                          }
                          type="info"
                          icon={<Sparkles size={16} />}
                          closable
                          onClose={() => setShowAiHelp(false)}
                          style={{ marginBottom: 16 }}
                        />
                      </Col>
                    </Row>
                  )}

                  <Form.Item
                    name="cover_letter"
                    rules={proposalCoverLetterRules}
                  >
                    <TextArea
                      rows={8}
                      placeholder="Расскажите, почему вы подходите для этого проекта. Опишите свой опыт и подход к работе..."
                      style={{ fontSize: 14 }}
                    />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="amount"
                        label="Предлагаемая сумма (₽)"
                        tooltip="Необязательно. Если не указано, будет использован бюджет заказчика."
                        rules={budgetRules}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="Введите сумму"
                          min={0}
                          formatter={(value) =>
                            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
                          }
                          parser={(value) => {
                            const cleaned = value?.replace(/\s/g, "") || "";
                            return (cleaned ? Number(cleaned) : 0) as any;
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<Send size={16} />}
                      size="large"
                      block
                      style={{
                        height: 48,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      Отправить отклик
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Space>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
}

