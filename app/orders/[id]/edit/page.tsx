"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { toastService } from "@/src/shared/lib/toast";
import { ArrowLeft, Save } from "lucide-react";
import { getOrder, updateOrder } from "@/src/shared/api/orders";
import { authService } from "@/src/shared/lib/auth/auth.service";
import Link from "next/link";
import type { OrderRequirement, SkillLevel } from "@/src/entities/order/model/types";

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
  "Python", "Django", "Flask", "PHP", "Laravel", "Java", "Spring",
  "C#", ".NET", "Go", "Rust", "Ruby", "Rails",
  "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
  "UI/UX", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Docker", "Kubernetes", "CI/CD", "Git",
  "Mobile", "iOS", "Android", "React Native", "Flutter",
  "SEO", "Analytics", "Marketing", "Content Writing",
];

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("published");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning("Необходимо авторизоваться");
      router.push("/auth/login");
      return;
    }

    loadOrder();
  }, [orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const order = await getOrder(orderId);

      const user = authService.getCurrentUser();
      if (String(order.client_id) !== String(user?.id)) {
        toastService.error("У вас нет прав на редактирование этого заказа");
        router.push(`/orders/${orderId}`);
        return;
      }

      const skills = order.requirements?.map((r: any) => r.skill) || [];
      setSelectedSkills(skills);
      setTitle(order.title);
      setDescription(order.description);
      setBudgetMin(order.budget_min || "");
      setBudgetMax(order.budget_max || "");
      // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
      if (order.deadline_at) {
        const date = new Date(order.deadline_at);
        const formatted = date.toISOString().slice(0, 16);
        setDeadline(formatted);
      }
      setStatus(order.status || "published");
    } catch (error: any) {
      console.error("Error loading order:", error);
      toastService.error(error.response?.data?.error || "Ошибка загрузки заказа");
      router.push(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Введите название заказа";
    } else if (title.trim().length < 3) {
      newErrors.title = "Минимум 3 символа";
    } else if (title.trim().length > 200) {
      newErrors.title = "Максимум 200 символов";
    }

    if (!description.trim()) {
      newErrors.description = "Введите описание";
    } else if (description.trim().length < 10) {
      newErrors.description = "Минимум 10 символов";
    } else if (description.trim().length > 5000) {
      newErrors.description = "Максимум 5000 символов";
    }

    if (!status) {
      newErrors.status = "Выберите статус";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const requirements: OrderRequirement[] = selectedSkills.map((skill) => ({
        skill,
        level: "middle" as SkillLevel,
      }));

      await updateOrder(orderId, {
        title: title.trim(),
        description: description.trim(),
        budget_min: budgetMin || undefined,
        budget_max: budgetMax || undefined,
        deadline_at: deadline ? new Date(deadline).toISOString() : undefined,
        status,
        requirements,
      });

      toastService.success("Заказ успешно обновлен");
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error("Error updating order:", error);
      toastService.error(error.response?.data?.error || "Ошибка обновления заказа");
    } finally {
      setSaving(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, width: "100%" }}>
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box>
              <Link href={`/orders/${orderId}`}>
                <Button
                  startIcon={<ArrowLeft size={16} />}
                  sx={{ p: 0, mb: 2, minWidth: 0, minHeight: 44 }}
                >
                  Назад к заказу
                </Button>
              </Link>
              <Typography variant="h4" component="h2" fontWeight={600}>
                Редактировать заказ
              </Typography>
            </Box>

            <Card sx={{ p: { xs: 3, md: 4 } }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Название заказа"
                    placeholder="Например: Разработка веб-сайта"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                    inputProps={{ minLength: 3, maxLength: 200 }}
                  />

                  <TextField
                    fullWidth
                    label="Описание"
                    placeholder="Подробно опишите задачу, требования и ожидания..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || `${description.length}/5000`}
                    required
                    multiline
                    rows={8}
                    inputProps={{ maxLength: 5000 }}
                  />

                  <FormControl fullWidth required error={!!errors.status}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={status}
                      label="Статус"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="published">Опубликован</MenuItem>
                      <MenuItem value="in_progress">В работе</MenuItem>
                      <MenuItem value="completed">Завершен</MenuItem>
                      <MenuItem value="cancelled">Отменен</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                  </FormControl>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Бюджет (₽)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="От"
                          type="number"
                          placeholder="Минимум"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : "")}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="До"
                          type="number"
                          placeholder="Максимум"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : "")}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <TextField
                    fullWidth
                    label="Срок выполнения"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Навыки
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                      {COMMON_SKILLS.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onClick={() => handleSkillToggle(skill)}
                          color={selectedSkills.includes(skill) ? "primary" : "default"}
                          variant={selectedSkills.includes(skill) ? "filled" : "outlined"}
                          sx={{ cursor: "pointer" }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Выбрано: {selectedSkills.length}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Save size={16} />}
                      disabled={saving}
                      sx={{ minHeight: 48 }}
                    >
                      {saving ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                    <Link href={`/orders/${orderId}`}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        sx={{ minHeight: 48 }}
                      >
                        Отмена
                      </Button>
                    </Link>
                  </Stack>
                </Stack>
              </Box>
            </Card>
          </Stack>
        </Container>
      </Box>
  );
}
