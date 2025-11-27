"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout, Card, Form, Input, InputNumber, DatePicker, Button, Typography, Space, Select, Tag } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { ArrowLeft, Save } from "lucide-react";
import { getOrder, updateOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import dayjs from "dayjs";
import type { OrderRequirement, SkillLevel } from "@/src/entities/order/model/types";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
  "Python", "Django", "Flask", "PHP", "Laravel", "Java", "Spring",
  "C#", ".NET", "Go", "Rust", "Ruby", "Rails",
  "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
  "UI/UX", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Docker", "Kubernetes", "CI/CD", "Git",
  "Mobile", "iOS", "Android", "React Native", "Flutter",
  "SEO", "Analytics", "Marketing", "Content Writing",
];

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    loadOrder();
  }, [orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const order = await getOrder(orderId);
      
      const user = authService.getCurrentUser();
      if (String(order.client_id) !== String(user?.id)) {
        toastService.error("У вас нет прав на редактирование этого заказа");
        router.push(`/orders/${orderId}`);
        return;
      }

      // Заполняем форму
      const skills = order.requirements?.map((r: any) => r.skill) || [];
      setSelectedSkills(skills);

      form.setFieldsValue({
        title: order.title,
        description: order.description,
        budget_min: order.budget_min,
        budget_max: order.budget_max,
        deadline: order.deadline_at ? dayjs(order.deadline_at) : undefined,
        status: order.status,
      });
    } catch (error: any) {
      console.error("Error loading order:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказа");
      router.push(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const requirements: OrderRequirement[] = selectedSkills.map((skill) => ({
        skill,
        level: "middle" as SkillLevel,
      }));

      await updateOrder(orderId, {
        title: values.title,
        description: values.description,
        budget_min: values.budget_min,
        budget_max: values.budget_max,
        deadline_at: values.deadline ? values.deadline.toISOString() : undefined,
        status: values.status,
        requirements,
      });

      toastService.success("Заказ успешно обновлен");
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error("Error updating order:", error);
      toastService.error(error.response?.data?.error || "Ошибка обновления заказа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Link href={`/orders/${orderId}`}>
              <Button type="link" icon={<ArrowLeft size={16} />} style={{ padding: 0, marginBottom: 16 }}>
                Назад к заказу
              </Button>
            </Link>
            <Title level={2}>Редактировать заказ</Title>
          </div>

          <Card loading={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="title"
                label="Название заказа"
                rules={[
                  { required: true, message: "Введите название заказа" },
                  { min: 3, message: "Минимум 3 символа" },
                  { max: 200, message: "Максимум 200 символов" },
                ]}
              >
                <Input placeholder="Например: Разработка веб-сайта" size="large" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Описание"
                rules={[
                  { required: true, message: "Введите описание" },
                  { min: 10, message: "Минимум 10 символов" },
                  { max: 5000, message: "Максимум 5000 символов" },
                ]}
              >
                <TextArea
                  rows={8}
                  placeholder="Подробно опишите задачу, требования и ожидания..."
                  showCount
                  maxLength={5000}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Статус"
                rules={[{ required: true, message: "Выберите статус" }]}
              >
                <Select size="large">
                  <Select.Option value="published">Опубликован</Select.Option>
                  <Select.Option value="in_progress">В работе</Select.Option>
                  <Select.Option value="completed">Завершен</Select.Option>
                  <Select.Option value="cancelled">Отменен</Select.Option>
                </Select>
              </Form.Item>

              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Text strong>Бюджет (₽)</Text>
                <Space>
                  <Form.Item
                    name="budget_min"
                    label="От"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Минимум"
                      style={{ width: 200 }}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="budget_max"
                    label="До"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Максимум"
                      style={{ width: 200 }}
                      size="large"
                    />
                  </Form.Item>
                </Space>
              </Space>

              <Form.Item
                name="deadline"
                label="Срок выполнения"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              <Form.Item label="Навыки">
                <div style={{ marginBottom: 8 }}>
                  {COMMON_SKILLS.map((skill) => (
                    <Tag
                      key={skill}
                      color={selectedSkills.includes(skill) ? "blue" : "default"}
                      style={{ cursor: "pointer", marginBottom: 8 }}
                      onClick={() => {
                        if (selectedSkills.includes(skill)) {
                          setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                        } else {
                          setSelectedSkills([...selectedSkills, skill]);
                        }
                      }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Выбрано: {selectedSkills.length}
                </Text>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<Save size={16} />}
                    size="large"
                  >
                    Сохранить изменения
                  </Button>
                  <Link href={`/orders/${orderId}`}>
                    <Button size="large">Отмена</Button>
                  </Link>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}

