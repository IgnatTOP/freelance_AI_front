"use client";
import { toastService } from "@/src/shared/lib/toast";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  Typography,
  Stack,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, FileText, Plus, Trash2, Edit2, MoreVertical } from "lucide-react";
import { createProposal } from "@/src/shared/api/proposals";
import { getOrder } from "@/src/shared/api/orders";
import { getProfile } from "@/src/shared/api/profile";
import { getProposalTemplates, createProposalTemplate, updateProposalTemplate, deleteProposalTemplate } from "@/src/shared/api/proposal-templates";
import { aiService } from "@/src/shared/lib/ai";
import { authService } from "@/src/shared/lib/auth/auth.service";
import { proposalCoverLetterRules, budgetRules } from "@/src/shared/lib/utils/form-validations";
import type { Order } from "@/src/entities/order/model/types";
import type { ProposalTemplate } from "@/src/entities/proposal-template/model/types";

export default function CreateProposalPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [showAiHelp, setShowAiHelp] = useState(false);

  const [coverLetter, setCoverLetter] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Шаблоны
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [manageTemplatesOpen, setManageTemplatesOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role !== "freelancer") {
      toastService.error("Только фрилансеры могут откликаться на заказы");
      router.push(`/orders/${orderId}`);
      return;
    }

    loadOrder();
    loadTemplates();
  }, [orderId, router]);

  const loadTemplates = async () => {
    try {
      const data = await getProposalTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toastService.error("Заполните название и текст шаблона");
      return;
    }
    try {
      if (editingTemplate) {
        await updateProposalTemplate(editingTemplate.id, { title: templateName, content: templateContent });
        toastService.success("Шаблон обновлён");
      } else {
        await createProposalTemplate({ title: templateName, content: templateContent });
        toastService.success("Шаблон создан");
      }
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      setTemplateName("");
      setTemplateContent("");
      loadTemplates();
    } catch {
      toastService.error("Ошибка сохранения шаблона");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteProposalTemplate(id);
      toastService.success("Шаблон удалён");
      loadTemplates();
    } catch {
      toastService.error("Ошибка удаления");
    }
  };

  const handleUseTemplate = (template: ProposalTemplate) => {
    setCoverLetter(template.content);
    setTemplateMenuAnchor(null);
    toastService.success("Шаблон применён");
  };

  const handleSaveAsTemplate = () => {
    if (!coverLetter.trim()) {
      toastService.error("Сначала напишите текст отклика");
      return;
    }
    setTemplateName("");
    setTemplateContent(coverLetter);
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  const loadOrder = async () => {
    setOrderLoading(true);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error("Error loading order:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказа");
      router.push(`/orders/${orderId}`);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!order || generating) return;

    setGenerating(true);
    setAiGeneratedText("");
    setShowAiHelp(true);

    try {
      let profileResponse = null;
      try {
        profileResponse = await getProfile();
      } catch (e) {
        console.warn("Could not load profile for AI context:", e);
      }

      let finalText = "";
      await aiService.generateProposalStream(
        orderId,
        {
          user_skills: profileResponse?.profile?.skills || [],
          user_experience: profileResponse?.profile?.experience_level || "middle",
          user_bio: profileResponse?.profile?.bio || "",
        },
        (chunk) => {
          finalText += chunk;
          setAiGeneratedText((prev) => prev + chunk);
          // Показываем текст в реальном времени в превью, не в инпуте
        }
      );

      // После генерации показываем превью с кнопкой "Использовать"
      // Текст НЕ записываем автоматически в coverLetter
      toastService.success("AI сгенерировал отклик! Проверьте и примените.");
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при генерации отклика"
      );
      setShowAiHelp(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleUseAIGenerated = () => {
    setCoverLetter(aiGeneratedText);
    setShowAiHelp(false);
    toastService.success("Текст применён!");
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Введите сопроводительное письмо";
    } else if (coverLetter.trim().length < 50) {
      newErrors.coverLetter = "Минимум 50 символов";
    } else if (coverLetter.trim().length > 5000) {
      newErrors.coverLetter = "Максимум 5000 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const proposal = await createProposal(orderId, {
        cover_letter: coverLetter.trim(),
        amount: amount || undefined,
      });

      toastService.success("Отклик успешно отправлен!");
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      toastService.error(
        error.response?.data?.error || "Ошибка при отправке отклика"
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderLoading) {
    return (
      <Box sx={{ minHeight: 'auto', bgcolor: "transparent" }}>
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={48} />
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Box sx={{ minHeight: 'auto', bgcolor: "transparent" }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 }, width: "100%" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box>
              <Button
                startIcon={<ArrowLeft size={16} />}
                onClick={() => router.push(`/orders/${orderId}`)}
                sx={{ p: 0, mb: 2, minWidth: 0, minHeight: 44 }}
              >
                Назад к заказу
              </Button>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                  fontWeight: 600,
                }}
              >
                Откликнуться на заказ
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {order.title}
              </Typography>
            </Box>

            <Card sx={{ p: { xs: 3, md: 4 } }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Сопроводительное письмо
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<FileText size={16} />}
                          onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
                          size="small"
                          sx={{ minHeight: 36 }}
                        >
                          Шаблоны
                        </Button>
                        <Menu
                          anchorEl={templateMenuAnchor}
                          open={Boolean(templateMenuAnchor)}
                          onClose={() => setTemplateMenuAnchor(null)}
                        >
                          {templates.length === 0 ? (
                            <MenuItem disabled>Нет шаблонов</MenuItem>
                          ) : (
                            templates.map((t) => (
                              <MenuItem key={t.id} onClick={() => handleUseTemplate(t)}>
                                {t.title}
                              </MenuItem>
                            ))
                          )}
                          <MenuItem divider />
                          <MenuItem onClick={() => { setTemplateMenuAnchor(null); handleSaveAsTemplate(); }}>
                            <Plus size={14} style={{ marginRight: 8 }} /> Сохранить как шаблон
                          </MenuItem>
                          <MenuItem onClick={() => { setTemplateMenuAnchor(null); setManageTemplatesOpen(true); }}>
                            <Edit2 size={14} style={{ marginRight: 8 }} /> Управление шаблонами
                          </MenuItem>
                        </Menu>
                        <Button
                          variant="outlined"
                          startIcon={<Sparkles size={16} />}
                          onClick={handleGenerateWithAI}
                          disabled={generating}
                          size="small"
                          sx={{ minHeight: 36 }}
                        >
                          {generating ? "Генерирую..." : "AI"}
                        </Button>
                      </Stack>
                    </Stack>

                    {showAiHelp && aiGeneratedText && (
                      <Alert
                        severity="info"
                        icon={<Sparkles size={16} />}
                        onClose={() => setShowAiHelp(false)}
                        sx={{ mb: 2 }}
                        action={
                          <Button
                            color="primary"
                            size="small"
                            onClick={handleUseAIGenerated}
                          >
                            Использовать
                          </Button>
                        }
                      >
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          AI сгенерировал отклик
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", fontSize: "0.875rem" }}
                        >
                          {aiGeneratedText}
                        </Typography>
                      </Alert>
                    )}

                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder="Расскажите, почему вы подходите для этого проекта. Опишите свой опыт и подход к работе..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      error={!!errors.coverLetter}
                      helperText={errors.coverLetter || `${coverLetter.length}/5000`}
                      required
                      inputProps={{ maxLength: 5000 }}
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: 14,
                        },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Предлагаемая сумма (₽)"
                        type="number"
                        placeholder="Введите сумму"
                        value={amount}
                        onChange={(e) =>
                          setAmount(e.target.value ? Number(e.target.value) : "")
                        }
                        helperText="Необязательно. Если не указано, будет использован бюджет заказчика."
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Send size={16} />}
                    disabled={loading}
                    fullWidth
                    sx={{
                      minHeight: 48,
                      fontSize: 16,
                      fontWeight: 500,
                      mt: 3,
                    }}
                  >
                    {loading ? "Отправка..." : "Отправить отклик"}
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Stack>
        </motion.div>
      </Container>

      {/* Диалог создания/редактирования шаблона */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTemplate ? "Редактировать шаблон" : "Сохранить как шаблон"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Название шаблона"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Например: Для веб-разработки"
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Текст шаблона"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог управления шаблонами */}
      <Dialog open={manageTemplatesOpen} onClose={() => setManageTemplatesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Мои шаблоны
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => {
                setEditingTemplate(null);
                setTemplateName("");
                setTemplateContent("");
                setManageTemplatesOpen(false);
                setTemplateDialogOpen(true);
              }}
            >
              Создать
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {templates.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
              У вас пока нет шаблонов
            </Typography>
          ) : (
            <List>
              {templates.map((t) => (
                <ListItem key={t.id} divider>
                  <ListItemText
                    primary={t.title}
                    secondary={t.content.slice(0, 100) + (t.content.length > 100 ? "..." : "")}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingTemplate(t);
                        setTemplateName(t.title);
                        setTemplateContent(t.content);
                        setManageTemplatesOpen(false);
                        setTemplateDialogOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteTemplate(t.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageTemplatesOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
