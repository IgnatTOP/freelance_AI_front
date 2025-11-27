"use client";

import { useState } from "react";
import { Input, Typography, theme, Card, Button, Space, Alert } from "antd";
import { toastService } from "@/src/shared/lib/toast";
import { Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { aiService } from "@/src/shared/lib/ai";
import { COMMON_SKILLS } from "@/src/shared/lib/utils";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface QuickCreateModeProps {
  onGenerated: (data: GeneratedOrderData) => void;
  onSwitchMode: () => void;
}

export interface GeneratedOrderData {
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  skills: string[];
}

export function QuickCreateMode({ onGenerated, onSwitchMode }: QuickCreateModeProps) {
  const { token } = useToken();
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      toastService.warning("Опишите вашу идею проекта");
      return;
    }

    if (idea.trim().length < 20) {
      toastService.warning("Опишите идею подробнее (минимум 20 символов)");
      return;
    }

    setGenerating(true);

    try {
      // Генерируем полное описание через AI
      let fullDescription = "";
      await aiService.generateOrderDescriptionStream(
        {
          title: idea.trim(),
          description: "",
          skills: [],
        },
        (chunk) => {
          fullDescription += chunk;
        }
      );

      // Извлекаем навыки из описания
      const skills = extractSkillsFromDescription(fullDescription + idea);

      // Генерируем название (берем первые 100 символов идеи или генерируем короткое)
      const title = idea.trim().length > 80
        ? idea.trim().substring(0, 80).trim() + "..."
        : idea.trim();

      // Оцениваем бюджет на основе сложности
      const { budget_min, budget_max } = estimateBudget(fullDescription, skills);

      // Устанавливаем срок (по умолчанию 2 недели)
      const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const generatedData: GeneratedOrderData = {
        title,
        description: fullDescription,
        budget_min,
        budget_max,
        deadline,
        skills,
      };

      toastService.success("Заказ сгенерирован! Проверьте данные и создайте заказ");
      onGenerated(generatedData);
    } catch (error) {
      console.error("Error generating order:", error);
      toastService.error("Ошибка генерации. Попробуйте ещё раз");
    } finally {
      setGenerating(false);
    }
  };

  const extractSkillsFromDescription = (text: string): string[] => {
    const commonSkills = COMMON_SKILLS;

    const foundSkills = commonSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Возвращаем максимум 8 навыков
    return [...new Set(foundSkills)].slice(0, 8);
  };

  const estimateBudget = (description: string, skills: string[]): { budget_min: number; budget_max: number } => {
    // Базовая оценка
    let baseMin = 20000;
    let baseMax = 50000;

    // Увеличиваем бюджет в зависимости от сложности
    const complexity = skills.length;
    const descLength = description.length;

    if (complexity >= 5 || descLength > 500) {
      baseMin = 50000;
      baseMax = 150000;
    } else if (complexity >= 3 || descLength > 300) {
      baseMin = 30000;
      baseMax = 80000;
    }

    return { budget_min: baseMin, budget_max: baseMax };
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          borderColor: token.colorBorder,
        }}
        styles={{
          body: { padding: token.paddingXL }
        }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Заголовок */}
          <div>
            <Space align="center" size={16} style={{ marginBottom: 8 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: token.borderRadiusLG,
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={28} strokeWidth={2} style={{ color: "#fff" }} />
              </div>
              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 24,
                    lineHeight: "32px",
                    fontWeight: 600,
                  }}
                >
                  Быстрое создание с AI
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
                  Опишите идею — AI создаст полный заказ
                </Text>
              </div>
            </Space>

            <Button
              type="text"
              size="small"
              onClick={onSwitchMode}
              style={{
                padding: "4px 0",
                height: "auto",
                fontSize: 14,
                color: token.colorTextSecondary,
              }}
            >
              Переключиться на обычное создание
            </Button>
          </div>

          {/* Инфо блок */}
          <Alert
            message={
              <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                Как это работает?
              </Text>
            }
            description={
              <Paragraph
                style={{
                  margin: "8px 0 0 0",
                  fontSize: 14,
                  lineHeight: "22px",
                  color: token.colorTextSecondary,
                }}
              >
                Опишите вашу идею в свободной форме. AI автоматически создаст название,
                подробное описание, оценит бюджет, определит срок и подберёт необходимые навыки.
                Вы сможете отредактировать всё перед публикацией.
              </Paragraph>
            }
            type="info"
            showIcon
            icon={<Sparkles size={16} />}
            style={{
              borderRadius: token.borderRadius,
            }}
          />

          {/* Поле ввода */}
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14, lineHeight: "22px" }}>
                Опишите вашу идею проекта
              </Text>
              <Text
                type="danger"
                style={{ marginLeft: 4, fontSize: 14 }}
              >
                *
              </Text>
            </label>
            <TextArea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Например: Нужен лендинг для кофейни с онлайн-меню и системой заказа. Должен быть современный дизайн, адаптивная вёрстка, интеграция с картами и формой обратной связи..."
              rows={6}
              maxLength={1000}
              showCount
              disabled={generating}
              style={{
                fontSize: 14,
                lineHeight: "22px",
                borderRadius: token.borderRadius,
                resize: "none",
              }}
            />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                lineHeight: "20px",
                display: "block",
                marginTop: 8,
              }}
            >
              Минимум 20 символов. Чем подробнее опишете, тем точнее будет результат.
            </Text>
          </div>

          {/* Кнопка генерации */}
          <Button
            type="primary"
            size="large"
            icon={generating ? null : <Wand2 size={20} strokeWidth={2} />}
            onClick={handleGenerate}
            disabled={!idea.trim() || idea.trim().length < 20 || generating}
            loading={generating}
            block
            style={{
              height: 48,
              fontSize: 16,
              lineHeight: "24px",
              fontWeight: 500,
              borderRadius: token.borderRadius,
              marginTop: 8,
            }}
          >
            {generating ? "Генерирую заказ..." : "Создать заказ с помощью AI"}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
