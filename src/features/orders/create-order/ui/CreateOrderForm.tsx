"use client";

import { Form, Input, DatePicker, InputNumber, Select, Row, Col, Typography, Space, Tag, Button, Spin } from "antd";
import type { FormInstance } from "antd";
import { Calendar, Wallet, Briefcase, Code, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import { aiService } from "@/src/shared/lib/ai";
import { parseAIResponse } from "@/src/shared/lib/ai/ai-utils";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";
import { toastService } from "@/src/shared/lib/toast";

const { TextArea } = Input;
const { Title, Text } = Typography;


interface CreateOrderFormProps {
  form: FormInstance;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  onTitleChange?: (title: string) => void;
  onGenerateAll?: () => void;
  aiMode?: boolean;
}

export function CreateOrderForm({
  form,
  skills,
  onSkillsChange,
  onSubmit,
  loading,
  onTitleChange,
  onGenerateAll,
  aiMode,
}: CreateOrderFormProps) {
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingSkills, setGeneratingSkills] = useState(false);
  const [generatingBudget, setGeneratingBudget] = useState(false);

  const handleGenerateDescription = async () => {
    const title = form.getFieldValue("title");
    if (!title || title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа (минимум 3 символа)");
      return;
    }

    setGeneratingDescription(true);
    try {
      let fullDescription = "";
      await aiService.generateOrderDescriptionStream(
        {
          title: title.trim(),
          description: form.getFieldValue("description") || "Создайте подробное описание проекта",
          skills: skills,
        },
        (chunk) => {
          fullDescription += chunk;
          form.setFieldValue("description", fullDescription);
        }
      );
      toastService.success("Описание сгенерировано!");
    } catch (error) {
      console.error("Error generating description:", error);
      toastService.error("Не удалось сгенерировать описание");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleGenerateSkills = async () => {
    const title = form.getFieldValue("title");
    const description = form.getFieldValue("description");
    
    if (!title || title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа");
      return;
    }

    setGeneratingSkills(true);
    try {
      const prompt = `Ты - AI помощник для создания заказов на фриланс-платформе.

На основе заказа:
Название: "${title}"
Описание: "${description || 'Не указано'}"

Определи необходимые навыки и технологии (массив строк).

ВАЖНО: Ответь ТОЛЬКО валидным JSON массивом без дополнительного текста:
["React", "TypeScript", "Node.js"]`;

      let aiResponse = "";
      await aiService.chatAssistantStream(
        {
          message: prompt,
          context_data: { user_role: "client" },
        },
        (chunk) => {
          aiResponse += chunk;
        }
      );

      // Парсим навыки из ответа
      const parsed = parseAIResponse(aiResponse);
      if (parsed && Array.isArray(parsed)) {
        onSkillsChange(parsed);
        form.setFieldValue("skills", parsed);
        toastService.success(`Добавлено ${parsed.length} навыков!`);
      } else if (parsed && parsed.skills && Array.isArray(parsed.skills)) {
        onSkillsChange(parsed.skills);
        form.setFieldValue("skills", parsed.skills);
        toastService.success(`Добавлено ${parsed.skills.length} навыков!`);
      } else {
        toastService.warning("Не удалось распознать навыки. Попробуйте еще раз.");
      }
    } catch (error) {
      console.error("Error generating skills:", error);
      toastService.error("Не удалось сгенерировать навыки");
    } finally {
      setGeneratingSkills(false);
    }
  };

  const handleGenerateBudget = async () => {
    const title = form.getFieldValue("title");
    const description = form.getFieldValue("description");
    
    if (!title || title.trim().length < 3) {
      toastService.warning("Сначала введите название заказа");
      return;
    }

    setGeneratingBudget(true);
    try {
      const prompt = `Ты - AI помощник для создания заказов на фриланс-платформе.

На основе заказа:
Название: "${title}"
Описание: "${description || 'Не указано'}"

Определи оптимальный бюджет в рублях (минимальная и максимальная стоимость).

ВАЖНО: Ответь ТОЛЬКО валидным JSON без дополнительного текста:
{
  "budget_min": 50000,
  "budget_max": 100000
}`;

      let aiResponse = "";
      await aiService.chatAssistantStream(
        {
          message: prompt,
          context_data: { user_role: "client" },
        },
        (chunk) => {
          aiResponse += chunk;
        }
      );

      // Парсим бюджет из ответа
      const parsed = parseAIResponse(aiResponse);
      if (parsed) {
        if (parsed.budget_min && typeof parsed.budget_min === "number") {
          form.setFieldValue("budget_min", parsed.budget_min);
        }
        if (parsed.budget_max && typeof parsed.budget_max === "number") {
          form.setFieldValue("budget_max", parsed.budget_max);
        }
        toastService.success("Бюджет предложен!");
      } else {
        toastService.warning("Не удалось распознать бюджет. Попробуйте еще раз.");
      }
    } catch (error) {
      console.error("Error generating budget:", error);
      toastService.error("Не удалось предложить бюджет");
    } finally {
      setGeneratingBudget(false);
    }
  };

  return (
    <Space direction="vertical" size={32} style={{ width: '100%' }}>
      {/* Кнопка AI заполнить всё */}
      {onGenerateAll && (
        <div style={{ 
          padding: '16px', 
          background: 'var(--primary-05)', 
          borderRadius: '8px',
          border: '1px solid var(--primary-12)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: 4 }}>
                <Sparkles size={14} style={{ marginRight: 8, color: 'var(--primary)', verticalAlign: 'middle' }} />
                AI помощник
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                Автоматически заполнит описание, навыки, бюджет и сроки
              </Text>
            </div>
            <Button
              type="primary"
              icon={<Sparkles size={16} />}
              onClick={onGenerateAll}
              style={{ background: 'var(--primary)', borderColor: 'var(--primary)', flexShrink: 0 }}
            >
              AI заполнить всё
            </Button>
          </div>
        </div>
      )}

      {/* Секция 1: Основная информация */}
      <div>
        <Title level={4} style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600 }}>
          Основная информация
        </Title>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Form.Item
            name="title"
            label={
              <Text strong style={{ fontSize: '14px' }}>
                Название заказа <Text type="danger">*</Text>
              </Text>
            }
            rules={[
              { required: true, message: "Введите название заказа" },
              { min: 3, message: "Минимум 3 символа" },
              { max: 200, message: "Максимум 200 символов" },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              prefix={<Briefcase size={16} />}
              placeholder="Например: Разработка веб-приложения для стартапа"
              size="large"
              onChange={(e) => {
                const title = e.target.value;
                form.setFieldValue("title", title);
                if (aiMode && title && onTitleChange) {
                  onTitleChange(title);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  Описание проекта <Text type="danger">*</Text>
                </Text>
                <Button
                  type="text"
                  size="small"
                  icon={generatingDescription ? <Spin size="small" /> : <Sparkles size={14} />}
                  onClick={handleGenerateDescription}
                  loading={generatingDescription}
                  style={{ color: 'var(--primary)', padding: '0 4px', height: 'auto' }}
                >
                  {generatingDescription ? 'Генерирую...' : 'AI создать описание'}
                </Button>
              </div>
            }
            rules={[
              { required: true, message: "Введите описание заказа" },
              { min: 10, message: "Минимум 10 символов" },
              { max: 5000, message: "Максимум 5000 символов" },
            ]}
            style={{ marginBottom: 0 }}
            help={
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Опишите детали проекта, требования, ожидания и задачи. Или используйте AI для генерации описания.
              </Text>
            }
          >
            <TextArea
              rows={8}
              placeholder="Опишите детали проекта, требования, ожидания..."
              showCount
              maxLength={5000}
              style={{ resize: 'vertical' }}
            />
          </Form.Item>
        </Space>
      </div>

      {/* Секция 2: Требования */}
      <div>
        <Title level={4} style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600 }}>
          Требования к исполнителю
        </Title>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  Требуемые навыки
                </Text>
                <Button
                  type="text"
                  size="small"
                  icon={generatingSkills ? <Spin size="small" /> : <Sparkles size={14} />}
                  onClick={handleGenerateSkills}
                  loading={generatingSkills}
                  style={{ color: 'var(--primary)', padding: '0 4px', height: 'auto' }}
                >
                  {generatingSkills ? 'Генерирую...' : 'AI подобрать навыки'}
                </Button>
              </div>
            }
            help={
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Укажите необходимые технологии и навыки. Введите навык и нажмите Enter, или используйте AI для подбора.
              </Text>
            }
            style={{ marginBottom: 0 }}
          >
            <Select
              mode="tags"
              placeholder="Например: React, TypeScript, Node.js, PostgreSQL"
              value={skills}
              onChange={onSkillsChange}
              tokenSeparators={[","]}
              maxTagCount="responsive"
              size="large"
              tagRender={(props) => {
                const { label, value, closable, onClose } = props;
                return (
                  <Tag
                    color="processing"
                    closable={closable}
                    onClose={onClose}
                    style={{ 
                      margin: '2px 4px 2px 0',
                      padding: '4px 10px',
                      fontSize: '13px',
                      height: '28px',
                      lineHeight: '20px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {label}
                  </Tag>
                );
              }}
            />
          </Form.Item>
        </Space>
      </div>

      {/* Секция 3: Бюджет и сроки */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Бюджет и сроки выполнения
          </Title>
          <Button
            type="text"
            size="small"
            icon={generatingBudget ? <Spin size="small" /> : <Sparkles size={14} />}
            onClick={handleGenerateBudget}
            loading={generatingBudget}
            style={{ color: 'var(--primary)', padding: '0 4px', height: 'auto' }}
          >
            {generatingBudget ? 'Генерирую...' : 'AI предложить бюджет'}
          </Button>
        </div>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget_min"
                label={
                  <Text strong style={{ fontSize: '14px' }}>
                    Бюджет от (₽)
                  </Text>
                }
                rules={[
                  { type: 'number', min: 0, message: 'Минимальная сумма должна быть положительной' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const max = getFieldValue('budget_max');
                      if (!value || !max || value <= max) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Минимум не может быть больше максимума'));
                    },
                  }),
                ]}
                style={{ marginBottom: 0 }}
                help={
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Минимальная сумма проекта
                  </Text>
                }
              >
                <InputNumber
                  prefix={<Wallet size={16} />}
                  placeholder="0"
                  min={0}
                  size="large"
                  style={{ width: "100%" }}
                  formatter={(value) => formatNumber(value)}
                  parser={(value) => parseFormattedNumber(value) as any}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget_max"
                label={
                  <Text strong style={{ fontSize: '14px' }}>
                    Бюджет до (₽)
                  </Text>
                }
                rules={[
                  { type: 'number', min: 0, message: 'Максимальная сумма должна быть положительной' },
                ]}
                style={{ marginBottom: 0 }}
                help={
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Максимальная сумма проекта
                  </Text>
                }
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  size="large"
                  style={{ width: "100%" }}
                  formatter={(value) => formatNumber(value)}
                  parser={(value) => parseFormattedNumber(value) as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="deadline"
            label={
              <Text strong style={{ fontSize: '14px' }}>
                Срок выполнения
              </Text>
            }
            style={{ marginBottom: 0 }}
            help={
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Выберите дату и время завершения проекта
              </Text>
            }
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              showTime={{ format: 'HH:mm' }}
              format="DD.MM.YYYY HH:mm"
              placeholder="Выберите дату и время"
            />
          </Form.Item>
        </Space>
      </div>

    </Space>
  );
}
