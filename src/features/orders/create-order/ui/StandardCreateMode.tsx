"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Typography,
  Row,
  Col,
  theme,
  Select,
  Tag,
  Divider,
  message,
} from "antd";
import {
  FileText,
  DollarSign,
  Calendar as CalendarIcon,
  Code,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import type { GeneratedOrderData } from "./QuickCreateMode";
import dayjs from "dayjs";
import { formatNumber, parseFormattedNumber, COMMON_SKILLS } from "@/src/shared/lib/utils";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { useToken } = theme;

interface StandardCreateModeProps {
  initialData?: GeneratedOrderData;
  onSubmit: (values: any) => Promise<void>;
  onSwitchMode: () => void;
  loading?: boolean;
}

export function StandardCreateMode({
  initialData,
  onSubmit,
  onSwitchMode,
  loading = false,
}: StandardCreateModeProps) {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills || []);

  const handleSubmit = async (values: any) => {
    const formData = {
      ...values,
      skills: selectedSkills,
      deadline: values.deadline ? values.deadline.toISOString() : undefined,
    };
    await onSubmit(formData);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
        }}
        styles={{
          body: { padding: 0 }
        }}
      >
        {/* Заголовок Card */}
        <div style={{ padding: "24px 24px 16px 24px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Space align="center" size={16}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: token.borderRadiusLG,
                background: `${token.colorPrimary}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={28} strokeWidth={2} style={{ color: token.colorPrimary }} />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: "32px",
                  fontWeight: 600,
                }}
              >
                Создание заказа
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
                Заполните детали вашего проекта
              </Text>
            </div>
            <Button
              type="text"
              icon={<Sparkles size={16} />}
              onClick={onSwitchMode}
              style={{
                fontSize: 14,
                height: 32,
              }}
            >
              Быстрое создание
            </Button>
          </Space>
        </div>

        {/* Форма */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          initialValues={{
            title: initialData?.title,
            description: initialData?.description,
            budget_min: initialData?.budget_min,
            budget_max: initialData?.budget_max,
            deadline: initialData?.deadline ? dayjs(initialData.deadline) : undefined,
          }}
          style={{ padding: 24 }}
        >
          {/* Секция 1: Основная информация */}
          <div style={{ marginBottom: 32 }}>
            <Space align="center" size={12} style={{ marginBottom: 16 }}>
              <FileText size={20} style={{ color: token.colorPrimary }} />
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 600,
                }}
              >
                Основная информация
              </Title>
            </Space>

            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label={
                    <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                      Название заказа
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Введите название заказа" },
                    { min: 10, message: "Минимум 10 символов" },
                    { max: 200, message: "Максимум 200 символов" },
                  ]}
                  style={{ marginBottom: 24 }}
                >
                  <Input
                    placeholder="Например: Разработка веб-приложения для управления задачами"
                    maxLength={200}
                    showCount
                    style={{
                      fontSize: 14,
                      lineHeight: "22px",
                      height: 40,
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label={
                    <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                      Описание проекта
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Введите описание проекта" },
                    { min: 50, message: "Минимум 50 символов" },
                  ]}
                  extra={
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                      Опишите детально: цели, требования, функционал, технические детали
                    </Text>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <TextArea
                    rows={8}
                    placeholder="Опишите детально требования к проекту..."
                    maxLength={5000}
                    showCount
                    style={{
                      fontSize: 14,
                      lineHeight: "22px",
                      resize: "none",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: "32px 0" }} />

          {/* Секция 2: Бюджет и сроки */}
          <div style={{ marginBottom: 32 }}>
            <Space align="center" size={12} style={{ marginBottom: 16 }}>
              <DollarSign size={20} style={{ color: token.colorSuccess }} />
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 600,
                }}
              >
                Бюджет и сроки
              </Title>
            </Space>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="budget_min"
                  label={
                    <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                      Минимальный бюджет (₽)
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Укажите минимальный бюджет" },
                    { type: "number", min: 1000, message: "Минимум 1 000 ₽" },
                  ]}
                  style={{ marginBottom: 24 }}
                >
                  <InputNumber
                    min={1000}
                    max={10000000}
                    step={1000}
                    style={{
                      width: "100%",
                      fontSize: 14,
                      height: 40,
                    }}
                    formatter={(value) => formatNumber(value)}
                    parser={(value) => parseFormattedNumber(value!) as any}
                    placeholder="10 000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="budget_max"
                  label={
                    <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                      Максимальный бюджет (₽)
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Укажите максимальный бюджет" },
                    { type: "number", min: 1000, message: "Минимум 1 000 ₽" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const min = getFieldValue("budget_min");
                        if (!value || !min || value >= min) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Должен быть больше минимального")
                        );
                      },
                    }),
                  ]}
                  style={{ marginBottom: 24 }}
                >
                  <InputNumber
                    min={1000}
                    max={10000000}
                    step={1000}
                    style={{
                      width: "100%",
                      fontSize: 14,
                      height: 40,
                    }}
                    formatter={(value) => formatNumber(value)}
                    parser={(value) => parseFormattedNumber(value!) as any}
                    placeholder="50 000"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="deadline"
                  label={
                    <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                      Срок выполнения
                    </Text>
                  }
                  extra={
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
                      Когда проект должен быть завершён (опционально)
                    </Text>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <DatePicker
                    style={{
                      width: "100%",
                      fontSize: 14,
                      height: 40,
                    }}
                    format="DD.MM.YYYY"
                    placeholder="Выберите дату"
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: "32px 0" }} />

          {/* Секция 3: Навыки */}
          <div style={{ marginBottom: 32 }}>
            <Space align="center" size={12} style={{ marginBottom: 16 }}>
              <Code size={20} style={{ color: token.colorInfo }} />
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 600,
                }}
              >
                Требуемые навыки
              </Title>
            </Space>

            <Select
              mode="tags"
              style={{ width: "100%", fontSize: 14 }}
              size="large"
              placeholder="Выберите или введите навыки"
              value={selectedSkills}
              onChange={setSelectedSkills}
              options={COMMON_SKILLS.map((skill) => ({
                label: skill,
                value: skill,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              maxTagCount="responsive"
            />

            {selectedSkills.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    lineHeight: "20px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Выбрано: {selectedSkills.length}
                </Text>
                <Space wrap size={[8, 8]}>
                  {selectedSkills.map((skill) => (
                    <Tag
                      key={skill}
                      closable
                      onClose={() => {
                        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                      }}
                      color="processing"
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        padding: "4px 12px",
                        borderRadius: token.borderRadius,
                      }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {selectedSkills.length === 0 && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  lineHeight: "20px",
                  display: "block",
                  marginTop: 8,
                }}
              >
                Добавьте навыки, необходимые для выполнения проекта
              </Text>
            )}
          </div>

          <Divider style={{ margin: "32px 0 24px 0" }} />

          {/* Кнопки */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckCircle size={20} strokeWidth={2} />}
              size="large"
              loading={loading}
              block
              style={{
                height: 48,
                fontSize: 16,
                lineHeight: "24px",
                fontWeight: 500,
              }}
            >
              {loading ? "Создаю заказ..." : "Создать заказ"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
