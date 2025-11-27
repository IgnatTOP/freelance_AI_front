"use client";

import { Form, Input, Select, Button, Divider, InputNumber, Typography, theme, Space } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import {
  User,
  MapPin,
  DollarSign,
  Briefcase,
  FileText,
  Code,
  Save,
} from "lucide-react";
import type { FormInstance } from "antd";
import { AIAssistantInline } from "@/src/shared/ui/AIAssistantInline";
import { aiService } from "@/src/shared/lib/ai/ai.service";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { useToken } = theme;

interface EditProfileFormProps {
  form: FormInstance;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

export function EditProfileForm({
  form,
  skills,
  onSkillsChange,
  onSubmit,
  loading,
}: EditProfileFormProps) {
  const { token } = useToken();
  
  // Отслеживаем изменения bio и experience_level для реактивного обновления кнопки AI
  const bio = Form.useWatch("bio", form);
  const experienceLevel = Form.useWatch("experience_level", form);
  
  // Кнопка AI должна быть активна, если есть bio ИЛИ есть навыки ИЛИ есть уровень опыта
  const isAIDisabled = !bio && skills.length === 0 && !experienceLevel;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      size="large"
      requiredMark={false}
      style={{ width: "100%" }}
    >
      {/* Секция 1: Основная информация */}
      <div style={{ marginBottom: 32 }}>
        <Space align="center" size={12} style={{ marginBottom: 16 }}>
          <User size={20} style={{ color: token.colorPrimary }} />
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

        <Form.Item
          name="display_name"
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              Отображаемое имя
            </Text>
          }
          rules={[
            { required: true, message: "Введите имя" },
            { min: 2, message: "Минимум 2 символа" },
            { max: 100, message: "Максимум 100 символов" },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input
            prefix={<User size={16} style={{ color: token.colorTextTertiary }} />}
            placeholder="Как вас должны называть"
            maxLength={50}
            showCount
            style={{
              fontSize: 14,
              lineHeight: "22px",
              height: 40,
            }}
          />
        </Form.Item>

        <Form.Item
          name="bio"
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              О себе
            </Text>
          }
          rules={[{ max: 1000, message: "Максимум 1000 символов" }]}
          extra={
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px", display: "block", marginBottom: 8 }}>
                Расскажите о себе, опыте и специализации
              </Text>
              <AIAssistantInline
                onImprove={async (onChunk) => {
                  const currentBio = bio || "";
                  const currentExperienceLevel = experienceLevel || "";
                  if (!currentBio && skills.length === 0 && !currentExperienceLevel) {
                    toastService.warning("Сначала заполните описание, добавьте навыки или выберите уровень опыта");
                    return;
                  }
                  await aiService.improveProfileStream(
                    {
                      current_bio: currentBio || "Фрилансер с опытом работы",
                      skills: skills,
                      experience_level: currentExperienceLevel,
                    },
                    onChunk
                  );
                }}
                onApply={(text) => {
                  form.setFieldValue("bio", text);
                }}
                disabled={isAIDisabled}
              />
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <TextArea
            rows={6}
            placeholder="Опишите ваш опыт, навыки, специализацию..."
            showCount
            maxLength={1000}
            style={{
              fontSize: 14,
              lineHeight: "22px",
              resize: "none",
            }}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              Местоположение
            </Text>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
              Город, страна (опционально)
            </Text>
          }
          style={{ marginBottom: 24 }}
        >
          <Input
            prefix={<MapPin size={16} style={{ color: token.colorTextTertiary }} />}
            placeholder="Например: Москва, Россия"
            maxLength={100}
            style={{
              fontSize: 14,
              lineHeight: "22px",
              height: 40,
            }}
          />
        </Form.Item>
      </div>

      <Divider style={{ margin: "32px 0" }} />

      {/* Секция 2: Профессиональная информация */}
      <div style={{ marginBottom: 32 }}>
        <Space align="center" size={12} style={{ marginBottom: 16 }}>
          <Briefcase size={20} style={{ color: token.colorSuccess }} />
          <Title
            level={4}
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: "24px",
              fontWeight: 600,
            }}
          >
            Профессиональная информация
          </Title>
        </Space>

        <Form.Item
          name="experience_level"
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              Уровень опыта
            </Text>
          }
          rules={[{ required: true, message: "Выберите уровень опыта" }]}
          style={{ marginBottom: 24 }}
        >
          <Select
            placeholder="Выберите уровень опыта"
            suffixIcon={<Briefcase size={16} style={{ color: token.colorTextTertiary }} />}
            style={{
              fontSize: 14,
              lineHeight: "22px",
            }}
            options={[
              { label: "Начинающий (Junior)", value: "junior" },
              { label: "Средний (Middle)", value: "middle" },
              { label: "Опытный (Senior)", value: "senior" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="hourly_rate"
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              Ставка в час (₽)
            </Text>
          }
          rules={[
            { type: "number", min: 0, message: "Ставка должна быть положительным числом" },
          ]}
          extra={
            <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
              Укажите желаемую почасовую ставку (опционально)
            </Text>
          }
          style={{ marginBottom: 24 }}
        >
          <InputNumber
            prefix={<DollarSign size={16} style={{ color: token.colorTextTertiary }} />}
            placeholder="1000"
            min={0}
            max={100000}
            step={100}
            style={{
              width: "100%",
              fontSize: 14,
              height: 40,
            }}
            formatter={(value) => formatNumber(value)}
            parser={(value) => {
              const parsed = value ? Number(parseFormattedNumber(value)) : 0;
              return Math.max(0, Math.min(100000, parsed)) as 0 | 100000;
            }}
          />
        </Form.Item>
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
            Навыки и технологии
          </Title>
        </Space>

        <Form.Item
          label={
            <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
              Навыки
            </Text>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12, lineHeight: "20px" }}>
              Добавьте навыки и технологии, которыми владеете. Нажмите Enter после каждого
            </Text>
          }
          style={{ marginBottom: 24 }}
        >
          <Select
            mode="tags"
            placeholder="Введите навык и нажмите Enter"
            value={skills}
            onChange={onSkillsChange}
            tokenSeparators={[","]}
            maxTagCount="responsive"
            style={{
              fontSize: 14,
              lineHeight: "22px",
            }}
          />
        </Form.Item>

        {skills.length > 0 && (
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              lineHeight: "20px",
              display: "block",
            }}
          >
            Добавлено навыков: {skills.length}
          </Text>
        )}
      </div>

      <Divider style={{ margin: "32px 0 24px 0" }} />

      {/* Submit Button */}
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={<Save size={20} strokeWidth={2} />}
          loading={loading}
          block
          size="large"
          style={{
            height: 48,
            fontSize: 16,
            lineHeight: "24px",
            fontWeight: 500,
          }}
        >
          {loading ? "Сохраняю изменения..." : "Сохранить изменения"}
        </Button>
      </Form.Item>
    </Form>
  );
}
