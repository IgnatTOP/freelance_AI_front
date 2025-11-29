"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button, Stack, Typography, Box, IconButton, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
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

  const theme = useTheme();

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Card
          onClick={() => setIsMinimized(false)}
          sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold">AI Гид</Typography>
                <Typography variant="caption" color="text.secondary">
                  {steps[currentStep]?.title || "Начните работу"}
                </Typography>
              </Box>
              <Button variant="text" size="small">
                Развернуть
              </Button>
            </Box>
          </CardContent>
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
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <div className="relative">
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, var(--primary-12) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={24} style={{ color: 'var(--primary)' }} />
                </Box>
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
              <Box>
                <Typography variant="h6">AI Гид</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Ваш персональный помощник</Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(true)}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* AI Message */}
          {aiMessage && (
            <Card
              sx={{
                mb: 3,
                bgcolor: 'var(--primary-06)',
                borderColor: 'var(--primary-18)',
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Bot size={18} style={{ color: 'var(--primary)' }} />
                  <Typography variant="body2">
                    {aiMessage}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Steps Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Шаг {currentStep + 1} из {steps.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: index === currentStep ? 24 : 8,
                      height: 8,
                      borderRadius: 1,
                      bgcolor: index === currentStep
                        ? 'primary.main'
                        : index < currentStep
                        ? 'primary.light'
                        : 'action.disabled',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <AnimatePresence mode="wait">
              {activeStep && (
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        opacity: 0.1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {activeStep.completed ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : (
                          <Target size={20} className="text-primary" />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {activeStep.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activeStep.description}
                        </Typography>
                      </Box>
                    </Box>

                    {activeStep.action && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Link href={activeStep.action.href} style={{ flex: 1, textDecoration: 'none' }}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Wand2 size={16} />}
                            onClick={() => handleStepComplete(activeStep.id)}
                          >
                            {activeStep.action.label}
                          </Button>
                        </Link>
                        {!activeStep.completed && (
                          <Button
                            variant="outlined"
                            startIcon={<CheckCircle size={16} />}
                            onClick={() => handleStepComplete(activeStep.id)}
                          >
                            Пропустить
                          </Button>
                        )}
                      </Box>
                    )}
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid var(--primary-12)' }}>
            <Button
              size="small"
              startIcon={<ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Назад
            </Button>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {steps.map((step, index) => (
                <Box
                  key={step.id}
                  component="button"
                  onClick={() => setCurrentStep(index)}
                  sx={{
                    width: index === currentStep ? 24 : 8,
                    height: 8,
                    borderRadius: 0.5,
                    border: 'none',
                    bgcolor: index === currentStep ? 'primary.main' : 'var(--primary-18)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      opacity: 0.8,
                    }
                  }}
                />
              ))}
            </Box>

            <Button
              size="small"
              endIcon={<ArrowRight size={16} />}
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              Далее
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

