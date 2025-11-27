"use client";

import { useState, useEffect } from "react";
import { Card, Button, Space, Typography, Steps } from "antd";
import { motion, AnimatePresence } from "framer-motion";

const { Text, Paragraph } = Typography;
import {
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle,
  X,
  Wand2,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { aiService } from "@/src/shared/lib/ai";
import { useAuth } from "@/src/shared/lib/hooks";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  completed?: boolean;
}

interface AIGuideProps {
  userRole: "client" | "freelancer" | null;
}

export function AIGuide({ userRole }: AIGuideProps) {
  const { user } = useAuth({ requireAuth: false });
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("");

  useEffect(() => {
    if (!userRole) return;

    const clientSteps: GuideStep[] = [
      {
        id: "1",
        title: "Создайте первый заказ",
        description: "Используйте AI для быстрого создания заказа с подробным описанием",
        action: {
          label: "Создать заказ с AI",
          href: "/orders/create?ai=true",
        },
      },
      {
        id: "2",
        title: "Найдите подходящих фрилансеров",
        description: "AI поможет найти лучших исполнителей для вашего проекта",
        action: {
          label: "Найти фрилансеров",
          href: "/freelancers",
        },
      },
      {
        id: "3",
        title: "Общайтесь с исполнителями",
        description: "Используйте встроенный чат для обсуждения деталей проекта",
        action: {
          label: "Открыть сообщения",
          href: "/messages",
        },
      },
    ];

    const freelancerSteps: GuideStep[] = [
      {
        id: "1",
        title: "Заполните профиль",
        description: "Добавьте навыки, портфолио и описание. Это поможет AI найти подходящие заказы",
        action: {
          label: "Редактировать профиль",
          href: "/profile",
        },
      },
      {
        id: "2",
        title: "Посмотрите AI рекомендации",
        description: "AI подобрал заказы специально для вас на основе вашего профиля",
        action: {
          label: "Посмотреть рекомендации",
          href: "/orders?ai-recommended=true",
        },
      },
      {
        id: "3",
        title: "Отправьте отклик",
        description: "Используйте AI для генерации профессионального отклика к заказу",
        action: {
          label: "Найти заказы",
          href: "/orders",
        },
      },
    ];

    setSteps(userRole === "client" ? clientSteps : freelancerSteps);

    // Генерируем персональное сообщение от AI
    const generateAIMessage = async () => {
      try {
        // user уже доступен из useAuth
        const roleText = userRole === "client" ? "заказчика" : "фрилансера";
        let fullMessage = "";

        await aiService.chatAssistantStream(
          {
            message: `Привет! Я AI-помощник. Помоги новому ${roleText} начать работу на платформе. Дай краткое приветствие (2-3 предложения) и объясни, как я могу помочь.`,
            context_data: {
              user_role: userRole,
            },
          },
          (chunk) => {
            fullMessage += chunk;
            setAiMessage(fullMessage);
          }
        );
      } catch {
        setAiMessage(
          userRole === "client"
            ? "Добро пожаловать! Я помогу вам создать заказы, найти исполнителей и управлять проектами. Начните с создания первого заказа с помощью AI."
            : "Привет! Я помогу вам найти подходящие заказы, создать профессиональные отклики и развивать свой бизнес. Начните с заполнения профиля."
        );
      }
    };

    generateAIMessage();
  }, [userRole]);

  const handleStepComplete = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Card
          hoverable
          onClick={() => setIsMinimized(false)}
          style={{ cursor: 'pointer' }}
        >
          <Space>
            <div className="relative">
              <Bot size={20} style={{ color: 'var(--primary)' }} />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: '14px' }}>AI Гид</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {steps[currentStep]?.title || "Начните работу"}
                </Text>
              </div>
            </div>
            <Button type="text" size="small">
              Развернуть
            </Button>
          </Space>
        </Card>
      </motion.div>
    );
  }

  const activeStep = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        title={
          <Space>
            <div className="relative">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-12) 0%, rgba(139, 92, 246, 0.2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>AI Гид</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Ваш персональный помощник</div>
            </div>
          </Space>
        }
        extra={
          <Button
            type="text"
            size="small"
            icon={<X size={16} />}
            onClick={() => setIsMinimized(true)}
          />
        }
      >

        {/* AI Message */}
        {aiMessage && (
          <Card
            size="small"
            style={{
              marginBottom: 24,
              background: 'var(--primary-06)',
              borderColor: 'var(--primary-18)',
            }}
          >
            <Space>
              <Bot size={18} style={{ color: 'var(--primary)' }} />
              <Text style={{ fontSize: '14px' }}>
                {aiMessage}
              </Text>
            </Space>
          </Card>
        )}

        {/* Steps Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Шаг {currentStep + 1} из {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-primary w-6"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeStep && (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {activeStep.completed ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <Target size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                      <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: 4 }}>{activeStep.title}</Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {activeStep.description}
                      </Text>
                  </div>
                </div>

                {activeStep.action && (
                  <Space style={{ width: '100%' }}>
                    <Link href={activeStep.action.href} style={{ flex: 1 }}>
                      <Button
                        type="primary"
                        block
                        icon={<Wand2 size={16} />}
                        onClick={() => handleStepComplete(activeStep.id)}
                      >
                        {activeStep.action.label}
                      </Button>
                    </Link>
                    {!activeStep.completed && (
                      <Button
                        icon={<CheckCircle size={16} />}
                        onClick={() => handleStepComplete(activeStep.id)}
                      >
                        Пропустить
                      </Button>
                    )}
                  </Space>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <Space style={{ width: '100%', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--primary-12)' }}>
          <Button
            size="small"
            icon={<ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Назад
          </Button>

          <Space>
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: index === currentStep ? 'var(--primary)' : 'var(--primary-18)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Space>

          <Button
            size="small"
            icon={<ArrowRight size={16} />}
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
          >
            Далее
          </Button>
        </Space>
      </Card>
    </motion.div>
  );
}

