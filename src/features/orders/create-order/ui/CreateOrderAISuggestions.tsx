"use client";

import { useState, useEffect } from "react";
import { Typography, Space, Spin, Button, Modal, Form, InputNumber, DatePicker, Divider, Checkbox } from "antd";
import { Bot, Check, Code, Wallet, Calendar, FileText, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { formatNumber, parseFormattedNumber } from "@/src/shared/lib/utils/number-utils";

const { Text } = Typography;

export interface AISuggestions {
  skills: string[];
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  needsAttachments: boolean;
  attachmentDescription?: string;
}

interface CreateOrderAISuggestionsProps {
  suggestions: AISuggestions | null;
  generating: boolean;
  selectedSkills: string[];
  onApplyAll: (edited?: Partial<AISuggestions>) => void;
  onToggleSkill?: (skill: string) => void;
  open?: boolean;
  onClose?: () => void;
}

export function CreateOrderAISuggestions({
  suggestions,
  generating,
  selectedSkills,
  onApplyAll,
  onToggleSkill,
  open,
  onClose,
}: CreateOrderAISuggestionsProps) {
  const [form] = Form.useForm();
  const [editedSkills, setEditedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (suggestions && open) {
      // Инициализируем все навыки как выбранные по умолчанию
      setEditedSkills([...suggestions.skills]);
      form.setFieldsValue({
        budget_min: suggestions.budget_min,
        budget_max: suggestions.budget_max,
        deadline: suggestions.deadline ? dayjs(suggestions.deadline) : undefined,
      });
    }
  }, [suggestions, open]);

  const handleApply = () => {
    const values = form.getFieldsValue();
    const editedSuggestions: Partial<AISuggestions> = {
      skills: editedSkills,
      budget_min: values.budget_min,
      budget_max: values.budget_max,
      deadline: values.deadline ? values.deadline.toISOString() : suggestions?.deadline,
    };
    onApplyAll(editedSuggestions);
    onClose?.();
  };

  if (generating) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={700}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} style={{ color: 'var(--primary)' }} />
            <span>AI готовит предложения...</span>
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <Space>
            <Spin size="large" />
            <Text style={{ fontSize: '14px' }}>AI анализирует заказ и готовит предложения...</Text>
          </Space>
        </div>
      </Modal>
    );
  }

  if (!open) return null;

  // Если предложения пустые, показываем сообщение
  if (!suggestions) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={700}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Предложения AI</span>
          </div>
        }
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text type="secondary">AI не смог сгенерировать предложения. Попробуйте еще раз.</Text>
        </div>
      </Modal>
    );
  }

  // Проверяем, есть ли хотя бы одно предложение
  const hasAnySuggestion = 
    (suggestions.skills && suggestions.skills.length > 0) ||
    suggestions.budget_min !== undefined ||
    suggestions.budget_max !== undefined ||
    suggestions.deadline !== undefined ||
    suggestions.needsAttachments;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <span>Предложения AI</span>
        </div>
      }
    >
      {!hasAnySuggestion ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text type="secondary">AI не смог предложить значения для полей. Вы можете заполнить их вручную.</Text>
          <div style={{ marginTop: '16px' }}>
            <Button onClick={onClose}>Закрыть</Button>
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical" size="large">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Навыки */}
            {suggestions.skills && suggestions.skills.length > 0 && (
              <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                <Code size={16} style={{ color: 'var(--primary)' }} />
                <Text strong style={{ fontSize: '14px' }}>
                  Навыки ({editedSkills.length} / {suggestions.skills.length})
                </Text>
              </div>
              <div style={{ 
                padding: '12px',
                background: 'var(--primary-05)',
                borderRadius: '8px',
                border: '1px solid var(--primary-12)',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {suggestions.skills.map((skill, idx) => {
                    const isSelected = editedSkills.includes(skill);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--primary-08)' : 'transparent',
                          border: `1px solid ${isSelected ? 'var(--primary-25)' : 'rgba(255, 255, 255, 0.1)'}`,
                        }}
                        onClick={() => {
                          setEditedSkills(prev => 
                            prev.includes(skill)
                              ? prev.filter(s => s !== skill)
                              : [...prev, skill]
                          );
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            setEditedSkills(prev => 
                              prev.includes(skill)
                                ? prev.filter(s => s !== skill)
                                : [...prev, skill]
                            );
                          }}
                          style={{ margin: 0, flexShrink: 0 }}
                        />
                        <Text style={{ fontSize: '13px' }}>{skill}</Text>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            )}

            {/* Бюджет */}
          {(suggestions.budget_min || suggestions.budget_max) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                <Wallet size={16} style={{ color: 'var(--primary)' }} />
                <Text strong style={{ fontSize: '14px' }}>Рекомендуемый бюджет</Text>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Form.Item
                  name="budget_min"
                  label="Бюджет от (₽)"
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) => formatNumber(value)}
                    parser={(value) => parseFormattedNumber(value || '') as any}
                  />
                </Form.Item>
                <Form.Item
                  name="budget_max"
                  label="Бюджет до (₽)"
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) => formatNumber(value)}
                    parser={(value) => parseFormattedNumber(value || '') as any}
                  />
                </Form.Item>
              </div>
            </div>
          )}

          {/* Срок */}
          {suggestions.deadline && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <Text strong style={{ fontSize: '14px' }}>Рекомендуемый срок</Text>
              </div>
              <Form.Item
                name="deadline"
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                  showTime={{ format: 'HH:mm' }}
                  format="DD.MM.YYYY HH:mm"
                  placeholder="Выберите дату и время"
                />
              </Form.Item>
            </div>
          )}

          {/* Файлы */}
          {suggestions.needsAttachments && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8 }}>
                <FileText size={16} style={{ color: 'var(--primary)' }} />
                <Text strong style={{ fontSize: '14px' }}>Рекомендуется прикрепить файлы</Text>
              </div>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {suggestions.attachmentDescription}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '16px 0' }} />

          {/* Кнопки действий */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={onClose}>
              Отклонить
            </Button>
            <Button
              type="primary"
              icon={<Check size={16} />}
              onClick={handleApply}
            >
              Применить предложения
            </Button>
          </div>
          </Space>
        </Form>
      )}
    </Modal>
  );
}
