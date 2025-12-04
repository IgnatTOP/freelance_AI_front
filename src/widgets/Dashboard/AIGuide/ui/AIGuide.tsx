"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button, Stack, Typography, Box, IconButton } from "@mui/material";
import { Bot, ArrowRight, CheckCircle, X, Wand2, Target } from "lucide-react";
import Link from "next/link";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
  completed?: boolean;
}

interface AIGuideProps {
  userRole: "client" | "freelancer" | null;
}

const clientSteps: GuideStep[] = [
  { id: "1", title: "Создайте первый заказ", description: "Используйте AI для быстрого создания", action: { label: "Создать с AI", href: "/orders/create?ai=true" } },
  { id: "2", title: "Найдите фрилансеров", description: "AI поможет найти лучших исполнителей", action: { label: "Найти", href: "/freelancers" } },
  { id: "3", title: "Общайтесь", description: "Используйте чат для обсуждения деталей", action: { label: "Сообщения", href: "/messages" } },
];

const freelancerSteps: GuideStep[] = [
  { id: "1", title: "Заполните профиль", description: "Добавьте навыки и портфолио", action: { label: "Профиль", href: "/profile" } },
  { id: "2", title: "AI рекомендации", description: "Подобранные заказы для вас", action: { label: "Посмотреть", href: "/orders?ai-recommended=true" } },
  { id: "3", title: "Отправьте отклик", description: "AI поможет с профессиональным откликом", action: { label: "Заказы", href: "/orders" } },
];

const welcomeMessages = {
  client: "Добро пожаловать! Помогу создать заказы и найти лучших исполнителей для ваших проектов.",
  freelancer: "Привет! Помогу найти подходящие заказы и создать профессиональные отклики.",
};

export function AIGuide({ userRole }: AIGuideProps) {
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    if (!userRole) return;
    setSteps(userRole === "client" ? clientSteps : freelancerSteps);
    setAiMessage(welcomeMessages[userRole]);
  }, [userRole]);

  const handleComplete = (stepId: string) => {
    setSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, completed: true } : s));
  };

  const activeStep = steps[currentStep];

  if (isMinimized) {
    return (
      <Card onClick={() => setIsMinimized(false)} sx={{ cursor: "pointer", background: "var(--glass-bg)", border: "1px solid var(--border)", "&:hover": { boxShadow: "var(--shadow-md)" } }}>
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Bot size={18} style={{ color: "var(--primary)" }} />
              <Box sx={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: "50%", bgcolor: "var(--primary)" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={600}>AI Гид</Typography>
              <Typography variant="caption" sx={{ color: "var(--foreground-muted)", display: "block", fontSize: 10 }}>{activeStep?.title || "Начните работу"}</Typography>
            </Box>
            <Button size="small">Развернуть</Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ background: "var(--glass-bg)", border: "1px solid var(--border)" }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1, background: "linear-gradient(135deg, var(--primary-15) 0%, rgba(139,92,246,0.2) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} style={{ color: "var(--primary)" }} />
              </Box>
              <Box sx={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", bgcolor: "var(--primary)" }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>AI Гид</Typography>
              <Typography variant="caption" sx={{ color: "var(--foreground-muted)" }}>Персональный помощник</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setIsMinimized(true)}><X size={14} /></IconButton>
        </Stack>

        {aiMessage && (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: "var(--primary-05)", border: "1px solid var(--primary-15)" }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Bot size={14} style={{ color: "var(--primary)", marginTop: 2 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5 }}>{aiMessage}</Typography>
            </Stack>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={500}>Шаг {currentStep + 1} из {steps.length}</Typography>
            <Stack direction="row" spacing={0.5}>
              {steps.map((_, i) => (
                <Box key={i} sx={{ width: i === currentStep ? 20 : 6, height: 6, borderRadius: 0.5, bgcolor: i === currentStep ? "var(--primary)" : i < currentStep ? "var(--primary-30)" : "var(--border)", transition: "all 0.2s" }} />
              ))}
            </Stack>
          </Stack>

          {activeStep && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {activeStep.completed ? <CheckCircle size={16} style={{ color: "#10b981" }} /> : <Target size={16} style={{ color: "var(--primary)" }} />}
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={600}>{activeStep.title}</Typography>
                  <Typography variant="caption" sx={{ color: "var(--foreground-muted)", display: "block", fontSize: 11 }}>{activeStep.description}</Typography>
                </Box>
              </Stack>

              {activeStep.action && (
                <Stack direction="row" spacing={1}>
                  <Link href={activeStep.action.href} style={{ flex: 1, textDecoration: "none" }}>
                    <Button variant="contained" fullWidth size="small" startIcon={<Wand2 size={14} />} onClick={() => handleComplete(activeStep.id)}>
                      {activeStep.action.label}
                    </Button>
                  </Link>
                  {!activeStep.completed && (
                    <Button variant="outlined" size="small" startIcon={<CheckCircle size={14} />} onClick={() => handleComplete(activeStep.id)}>
                      Пропустить
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: "1px solid var(--border)" }}>
          <Button size="small" startIcon={<ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />} onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            Назад
          </Button>
          <Button size="small" endIcon={<ArrowRight size={14} />} onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1}>
            Далее
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
