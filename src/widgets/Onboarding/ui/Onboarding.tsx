"use client";

import { useState, useEffect } from "react";
import { Modal, Steps, Typography, Card } from "antd";
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
import api from "@/src/shared/lib/api/axios";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

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
    // Проверяем, проходил ли пользователь онбординг
    const checkOnboarding = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;

        // Проверяем в localStorage
        const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);

        if (!onboardingCompleted) {
          // Можно также проверить через API, если добавим поле в профиль
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };

    checkOnboarding();
  }, []);

  // Keyboard navigation
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
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={40} className="text-primary" />
            </div>
            <Title level={3}>Добро пожаловать на платформу!</Title>
            <Paragraph className="text-foreground-secondary">
              Мы поможем вам найти лучших исполнителей для ваших проектов
            </Paragraph>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl glass">
              <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <Text strong>Создавайте заказы</Text>
                <Paragraph className="mb-0 text-sm text-foreground-secondary">
                  Используйте AI для быстрого создания подробных описаний проектов
                </Paragraph>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl glass">
              <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <Text strong>Находите исполнителей</Text>
                <Paragraph className="mb-0 text-sm text-foreground-secondary">
                  AI поможет найти подходящих фрилансеров для ваших задач
                </Paragraph>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl glass">
              <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <Text strong>Управляйте проектами</Text>
                <Paragraph className="mb-0 text-sm text-foreground-secondary">
                  Отслеживайте прогресс и общайтесь с исполнителями в реальном времени
                </Paragraph>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "create-order",
      title: "Создание заказа",
      description: "Как создать первый заказ",
      icon: Briefcase,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={40} className="text-primary" />
            </div>
            <Title level={3}>Создайте свой первый заказ</Title>
          </div>
          <div className="space-y-4">
            <Card className="glass border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <Text strong className="block mb-1">Используйте AI-генератор</Text>
                  <Paragraph className="mb-0 text-sm text-foreground-secondary">
                    Нажмите "Создать заказ с AI" в быстрых действиях. AI поможет создать подробное описание проекта за секунды.
                  </Paragraph>
                </div>
              </div>
            </Card>
            <Card className="glass">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-blue-400" />
                </div>
                <div>
                  <Text strong className="block mb-1">Укажите требования</Text>
                  <Paragraph className="mb-0 text-sm text-foreground-secondary">
                    Добавьте необходимые навыки, бюджет и сроки выполнения. Чем подробнее описание, тем лучше подберутся исполнители.
                  </Paragraph>
                </div>
              </div>
            </Card>
            <Card className="glass">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-green-400" />
                </div>
                <div>
                  <Text strong className="block mb-1">AI найдет исполнителей</Text>
                  <Paragraph className="mb-0 text-sm text-foreground-secondary">
                    После публикации AI автоматически подберет подходящих фрилансеров и отправит им уведомления.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      key: "ai-assistant",
      title: "AI Помощник",
      description: "Ваш персональный ассистент",
      icon: Bot,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Bot size={40} className="text-primary" />
            </div>
            <Title level={3}>AI Помощник всегда рядом</Title>
            <Paragraph className="text-foreground-secondary">
              В правом нижнем углу вы найдете AI-помощника
            </Paragraph>
          </div>
          <div className="space-y-3">
            <Card className="glass border-primary/20">
              <Text strong className="block mb-2">Что может AI Помощник:</Text>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ответить на вопросы о платформе</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Помочь с созданием заказов</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Дать советы по работе с фрилансерами</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Объяснить функции платформы</span>
                </li>
              </ul>
            </Card>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Text className="text-sm">
                💡 <strong>Совет:</strong> AI Помощник доступен на всех страницах. Просто нажмите на кнопку в правом нижнем углу!
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "messages",
      title: "Общение",
      description: "Работа с сообщениями",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={40} className="text-primary" />
            </div>
            <Title level={3}>Общайтесь с исполнителями</Title>
          </div>
          <div className="space-y-3">
            <Card className="glass">
              <Text strong className="block mb-2">В разделе "Сообщения" вы можете:</Text>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Обсуждать детали проекта с фрилансерами</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Получать уведомления о новых сообщениях</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Использовать AI для создания резюме переписки</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
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
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
              <div className="absolute inset-1 sm:inset-2 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                <Sparkles size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary relative z-10" />
              </div>
            </div>
            <Title level={2} className="!mb-2 sm:!mb-3 !text-xl sm:!text-2xl font-bold">
              Добро пожаловать на платформу!
            </Title>
            <Paragraph className="text-sm sm:text-base text-foreground-secondary max-w-md mx-auto px-2 sm:px-0">
              Мы поможем вам найти интересные проекты и развивать свой бизнес
            </Paragraph>
          </motion.div>

          {/* Feature Cards */}
          <div className="space-y-3 sm:space-y-4">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Target size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs font-bold">1</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text strong className="text-sm sm:text-base block mb-0.5 sm:mb-1">
                      Заполните профиль
                    </Text>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      Добавьте навыки, портфолио и описание. Это поможет AI найти подходящие заказы
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Recommendations Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bot size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text strong className="text-sm sm:text-base block mb-0.5 sm:mb-1">
                      Используйте AI рекомендации
                    </Text>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      AI подберет заказы специально для вас на основе вашего профиля
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Proposals Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text strong className="text-sm sm:text-base block mb-0.5 sm:mb-1">
                      Создавайте отклики с AI
                    </Text>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      AI поможет создать профессиональные отклики к заказам
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 p-3 sm:p-4"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <Text className="text-xs sm:text-sm font-medium text-center">
                Начните работу уже сегодня и получайте заказы!
              </Text>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      key: "profile",
      title: "Заполните профиль",
      description: "Важно для успеха",
      icon: Target,
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
              <div className="absolute inset-1 sm:inset-2 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                <Target size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary relative z-10" />
              </div>
            </div>
            <Title level={2} className="!mb-2 sm:!mb-3 !text-xl sm:!text-2xl font-bold">
              Заполните свой профиль
            </Title>
            <Paragraph className="text-sm sm:text-base text-foreground-secondary max-w-md mx-auto px-2 sm:px-0">
              Полный профиль увеличивает ваши шансы на получение заказов
            </Paragraph>
          </motion.div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 p-3 sm:p-4"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                  40%
                </div>
                <Text className="text-[10px] sm:text-xs text-foreground-secondary">Больше откликов</Text>
              </div>
              <div className="h-8 sm:h-10 w-px bg-border/50"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-500 flex items-center justify-center gap-1">
                  <Zap size={20} className="sm:w-6 sm:h-6" />
                  AI
                </div>
                <Text className="text-[10px] sm:text-xs text-foreground-secondary">Подбор заказов</Text>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="space-y-3 sm:space-y-4">
            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Code size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle size={10} className="sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <Text strong className="text-sm sm:text-base block">
                        Добавьте навыки
                      </Text>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        Важно
                      </span>
                    </div>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      Укажите все технологии и инструменты, с которыми вы работаете. Это поможет AI найти подходящие заказы.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Portfolio Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FolderKanban size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <TrendingUp size={10} className="sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <Text strong className="text-sm sm:text-base block">
                        Создайте портфолио
                      </Text>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                        +40%
                      </span>
                    </div>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      Добавьте примеры ваших работ. Фрилансеры с портфолио получают на 40% больше откликов.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Description Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card
                className="glass border-2 border-transparent hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group cursor-pointer"
                bodyStyle={{ padding: "12px 16px" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-400" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Sparkles size={10} className="sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <Text strong className="text-sm sm:text-base block">
                        Напишите описание
                      </Text>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-500/10 text-green-400 font-medium">
                        AI помощь
                      </span>
                    </div>
                    <Paragraph className="mb-0 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      Расскажите о своем опыте и специализации. AI может помочь улучшить описание.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Tip Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 p-3 sm:p-4"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="sm:w-4 sm:h-4 text-primary" />
              </div>
              <div>
                <Text strong className="text-xs sm:text-sm block mb-0.5 sm:mb-1">
                  💡 Совет от AI
                </Text>
                <Paragraph className="mb-0 text-[11px] sm:text-xs text-foreground-secondary">
                  Заполните все разделы профиля для максимальной эффективности. Используйте AI-помощника для улучшения описания и подбора навыков.
                </Paragraph>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      key: "ai-recommendations",
      title: "AI Рекомендации",
      description: "Найдите подходящие заказы",
      icon: Bot,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Bot size={40} className="text-primary" />
            </div>
            <Title level={3}>Используйте AI рекомендации</Title>
            <Paragraph className="text-foreground-secondary">
              AI анализирует ваш профиль и подбирает заказы специально для вас
            </Paragraph>
          </div>
          <div className="space-y-3">
            <Card className="glass border-primary/20">
              <Text strong className="block mb-2">Как это работает:</Text>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI анализирует ваши навыки и опыт</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Сравнивает с требованиями заказов</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Показывает процент совпадения</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Объясняет, почему заказ подходит</span>
                </li>
              </ul>
            </Card>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Text className="text-sm">
                💡 <strong>Совет:</strong> Чем полнее ваш профиль, тем точнее будут рекомендации!
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "ai-assistant",
      title: "AI Помощник",
      description: "Ваш персональный ассистент",
      icon: Bot,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Bot size={40} className="text-primary" />
            </div>
            <Title level={3}>AI Помощник всегда рядом</Title>
            <Paragraph className="text-foreground-secondary">
              В правом нижнем углу вы найдете AI-помощника
            </Paragraph>
          </div>
          <div className="space-y-3">
            <Card className="glass border-primary/20">
              <Text strong className="block mb-2">Что может AI Помощник:</Text>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Помочь создать отклик к заказу</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Рекомендовать цену и сроки</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Улучшить профиль и портфолио</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ответить на вопросы о платформе</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 sm:space-y-3">
            <Text strong className="block text-center mb-2 sm:mb-3 text-sm sm:text-base">Начните прямо сейчас:</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <motion.a
                href="/profile"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block"
              >
                <Card className="glass border-2 border-transparent hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="text-center p-2 sm:p-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                      <Target size={20} className="sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <Text strong className="text-xs sm:text-sm block">Заполнить профиль</Text>
                  </div>
                </Card>
              </motion.a>
              <motion.a
                href="/orders"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block"
              >
                <Card className="glass border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="text-center p-2 sm:p-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                      <Briefcase size={20} className="sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <Text strong className="text-xs sm:text-sm block">Смотреть заказы</Text>
                  </div>
                </Card>
              </motion.a>
            </div>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 p-3 sm:p-4"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <CheckCircle size={20} className="sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
              <Text className="text-xs sm:text-sm font-medium text-center">
                Вы готовы к работе! Удачи в поиске проектов! 🚀
              </Text>
            </div>
          </motion.div>
        </div>
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
        // Сохраняем в localStorage
        localStorage.setItem(`onboarding_completed_${user.id}`, "true");
        
        // Можно также отправить на бэкенд, если добавим API
        // await api.post('/profile/onboarding-complete');
      }
      setIsVisible(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsVisible(false);
    }
  };

  if (!isVisible || !userRole) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      open={isVisible}
      onCancel={handleSkip}
      footer={null}
      width={520}
      closeIcon={<X size={18} />}
      className="onboarding-modal"
      maskClosable={false}
      style={{ 
        top: 20,
      }}
      styles={{
        content: {
          maxWidth: '520px',
          width: '520px',
          margin: '0 auto',
        },
        body: {
          maxWidth: '520px',
        }
      }}
      wrapClassName="onboarding-modal-wrapper"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <Text className="text-foreground-secondary">
              Шаг {currentStep + 1} из {steps.length}
            </Text>
            <Text className="text-foreground-secondary font-medium">
              {Math.round(progressPercentage)}%
            </Text>
          </div>
          <div className="h-1.5 sm:h-2 w-full bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="hidden sm:block">
          <Steps current={currentStep} size="small" className="mb-6">
            {steps.map((step, index) => (
              <Step
                key={step.key}
                title={step.title}
                description={step.description}
                icon={<step.icon size={16} />}
                onClick={() => {
                  // Allow clicking on completed steps or current step
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                className={index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"}
              />
            ))}
          </Steps>
        </div>

        {/* Mobile Steps Dots */}
        <div className="flex sm:hidden justify-center gap-2 mb-4">
          {steps.map((step, index) => (
            <button
              key={step.key}
              onClick={() => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-border/50"
              } ${index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"}`}
              disabled={index > currentStep}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>

        {/* Keyboard Hint - Desktop Only */}
        <div className="hidden md:flex items-center justify-center gap-2 text-xs text-foreground-secondary">
          <span className="px-2 py-1 rounded bg-border/20">←</span>
          <span className="px-2 py-1 rounded bg-border/20">→</span>
          <span>для навигации</span>
          <span className="mx-2">•</span>
          <span className="px-2 py-1 rounded bg-border/20">Esc</span>
          <span>пропустить</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50 gap-2">
          <Button onClick={handleSkip} variant="glass" className="text-xs sm:text-sm px-3 sm:px-4">
            Пропустить
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button onClick={handlePrev} variant="glass" className="text-xs sm:text-sm px-3 sm:px-4">
                Назад
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
            >
              {currentStep === steps.length - 1 ? "Завершить" : "Далее"}
              {currentStep < steps.length - 1 && <ArrowRight size={14} className="sm:w-4 sm:h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

