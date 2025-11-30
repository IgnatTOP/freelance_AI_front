"use client";

import { useState, useEffect } from "react";
import { Dialog, Stepper, Step, StepLabel, Typography, Card, CardContent, Box, IconButton, LinearProgress } from "@mui/material";
import { Button } from "@/src/shared/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Sparkles,
  Briefcase,
  MessageSquare,
  Bot,
  Target,
  ArrowRight,
  X,
  Code,
  FolderKanban,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";
import { authService } from "@/src/shared/lib/auth/auth.service";

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  content: React.ReactNode;
}

interface OnboardingProps {
  userRole: "client" | "freelancer" | null;
}

export function Onboarding({ userRole }: OnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;

        const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
        if (!onboardingCompleted) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep]);

  const clientSteps: OnboardingStep[] = [
    {
      key: "welcome",
      title: "Добро пожаловать!",
      description: "Начнем с основ",
      icon: Sparkles,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Sparkles size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Добро пожаловать на платформу!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Мы поможем вам найти лучших исполнителей для ваших проектов
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: CheckCircle, title: 'Создавайте заказы', desc: 'Используйте AI для быстрого создания подробных описаний проектов' },
              { icon: CheckCircle, title: 'Находите исполнителей', desc: 'AI поможет найти подходящих фрилансеров для ваших задач' },
              { icon: CheckCircle, title: 'Управляйте проектами', desc: 'Отслеживайте прогресс и общайтесь с исполнителями в реальном времени' }
            ].map((item, idx) => (
              <Card key={idx} variant="outlined" sx={{ bgcolor: 'action.hover' }}>
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <item.icon size={20} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ),
    },
    {
      key: "create-order",
      title: "Создание заказа",
      description: "Как создать первый заказ",
      icon: Briefcase,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Briefcase size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Создайте свой первый заказ
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            {[
              { icon: Sparkles, color: '#14b8a6', title: 'Используйте AI-генератор', desc: 'Нажмите "Создать заказ с AI" в быстрых действиях. AI поможет создать подробное описание проекта за секунды.' },
              { icon: Target, color: '#3b82f6', title: 'Укажите требования', desc: 'Добавьте необходимые навыки, бюджет и сроки выполнения. Чем подробнее описание, тем лучше подберутся исполнители.' },
              { icon: Bot, color: '#4ade80', title: 'AI найдет исполнителей', desc: 'После публикации AI автоматически подберет подходящих фрилансеров и отправит им уведомления.' }
            ].map((item, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <item.icon size={20} style={{ color: item.color }} />
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ),
    },
    {
      key: "ai-assistant",
      title: "AI Помощник",
      description: "Ваш персональный ассистент",
      icon: Bot,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Bot size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            AI Помощник всегда рядом
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            В правом нижнем углу вы найдете AI-помощника
          </Typography>
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom textAlign="left">
                Что может AI Помощник:
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', textAlign: 'left' }}>
                {[
                  'Ответить на вопросы о платформе',
                  'Помочь с созданием заказов',
                  'Дать советы по работе с фрилансерами',
                  'Объяснить функции платформы'
                ].map((text, idx) => (
                  <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <Typography variant="caption" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ),
    },
    {
      key: "messages",
      title: "Общение",
      description: "Работа с сообщениями",
      icon: MessageSquare,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <MessageSquare size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Общайтесь с исполнителями
          </Typography>
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom textAlign="left">
                В разделе "Сообщения" вы можете:
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', textAlign: 'left' }}>
                {[
                  'Обсуждать детали проекта с фрилансерами',
                  'Получать уведомления о новых сообщениях',
                  'Использовать AI для создания резюме переписки'
                ].map((text, idx) => (
                  <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <Typography variant="caption" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ),
    },
  ];

  const freelancerSteps: OnboardingStep[] = [
    {
      key: "welcome",
      title: "Добро пожаловать!",
      description: "Начнем с основ",
      icon: Sparkles,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Sparkles size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Добро пожаловать на платформу!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Мы поможем вам найти интересные проекты и развивать свой бизнес
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: Target, num: 1, color: '#3b82f6', title: 'Заполните профиль', desc: 'Добавьте навыки, портфолио и описание. Это поможет AI найти подходящие заказы' },
              { icon: Bot, num: 2, color: '#a855f7', title: 'Используйте AI рекомендации', desc: 'AI подберет заказы специально для вас на основе вашего профиля' },
              { icon: MessageSquare, num: 3, color: '#4ade80', title: 'Создавайте отклики с AI', desc: 'AI поможет создать профессиональные отклики к заказам' }
            ].map((item) => (
              <Card key={item.num} variant="outlined">
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}15 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <item.icon size={24} style={{ color: item.color }} />
                    </Box>
                    <Box sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>
                        {item.num}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ),
    },
    {
      key: "profile",
      title: "Заполните профиль",
      description: "Важно для успеха",
      icon: Target,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Target size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Заполните свой профиль
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Полный профиль увеличивает ваши шансы на получение заказов
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: Code, color: '#3b82f6', title: 'Добавьте навыки', badge: 'Важно', desc: 'Укажите все технологии и инструменты, с которыми вы работаете. Это поможет AI найти подходящие заказы.' },
              { icon: FolderKanban, color: '#a855f7', title: 'Создайте портфолио', badge: '+40%', desc: 'Добавьте примеры ваших работ. Фрилансеры с портфолио получают на 40% больше откликов.' },
              { icon: FileText, color: '#4ade80', title: 'Напишите описание', badge: 'AI помощь', desc: 'Расскажите о своем опыте и специализации. AI может помочь улучшить описание.' }
            ].map((item, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}15 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <item.icon size={24} style={{ color: item.color }} />
                  </Box>
                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                      <Typography variant="caption" sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 2,
                        bgcolor: `${item.color}15`,
                        color: item.color,
                        fontWeight: 600
                      }}>
                        {item.badge}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ),
    },
    {
      key: "ai-recommendations",
      title: "AI Рекомендации",
      description: "Найдите подходящие заказы",
      icon: Bot,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Bot size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Используйте AI рекомендации
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            AI анализирует ваш профиль и подбирает заказы специально для вас
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom textAlign="left">
                Как это работает:
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', textAlign: 'left' }}>
                {[
                  'AI анализирует ваши навыки и опыт',
                  'Сравнивает с требованиями заказов',
                  'Показывает процент совпадения',
                  'Объясняет, почему заказ подходит'
                ].map((text, idx) => (
                  <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <Typography variant="caption" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ),
    },
    {
      key: "ai-assistant",
      title: "AI Помощник",
      description: "Ваш персональный ассистент",
      icon: Bot,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Bot size={40} style={{ color: 'var(--primary)' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            AI Помощник всегда рядом
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            В правом нижнем углу вы найдете AI-помощника
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom textAlign="left">
                Что может AI Помощник:
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none', textAlign: 'left' }}>
                {[
                  'Помочь создать отклик к заказу',
                  'Рекомендовать цену и сроки',
                  'Улучшить профиль и портфолио',
                  'Ответить на вопросы о платформе'
                ].map((text, idx) => (
                  <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <Typography variant="caption" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircle size={20} />
              <Typography variant="body2" fontWeight={600}>
                Вы готовы к работе! Удачи в поиске проектов! 🚀
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
  ];

  const steps = userRole === "client" ? clientSteps : freelancerSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps([...completedSteps, steps[currentStep].key]);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        localStorage.setItem(`onboarding_completed_${user.id}`, "true");
      }
      setIsVisible(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsVisible(false);
    }
  };

  if (!isVisible || !userRole) return null;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog
      open={isVisible}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <IconButton
        onClick={handleSkip}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
        }}
      >
        <X size={20} />
      </IconButton>

      <Box sx={{ p: 3 }}>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Шаг {currentStep + 1} из {steps.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 6, borderRadius: 3 }} />
        </Box>

        {/* Desktop Stepper */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.key} completed={index < currentStep}>
                <StepLabel
                  StepIconComponent={() => {
                    const Icon = step.icon;
                    return (
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: index <= currentStep ? 'primary.main' : 'action.hover',
                        color: index <= currentStep ? 'primary.contrastText' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon size={16} />
                      </Box>
                    );
                  }}
                >
                  {step.title}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Mobile Dots */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', gap: 1, mb: 3 }}>
          {steps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: index === currentStep ? 32 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: index === currentStep ? 'primary.main' : index < currentStep ? 'primary.light' : 'action.hover',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>

        {/* Keyboard Hint */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1, mt: 3, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', mx: 0.5 }}>←</Box>
            <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', mx: 0.5 }}>→</Box>
            для навигации
            <Box component="span" sx={{ mx: 1 }}>•</Box>
            <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', mx: 0.5 }}>Esc</Box>
            пропустить
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleSkip} variant="glass">
            Пропустить
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentStep > 0 && (
              <Button onClick={handlePrev} variant="glass">
                Назад
              </Button>
            )}
            <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
              {currentStep === steps.length - 1 ? "Завершить" : "Далее"}
              {currentStep < steps.length - 1 && <ArrowRight size={16} />}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
