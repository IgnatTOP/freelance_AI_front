"use client";

import { Box, Container, Typography, Card, Stack, Button } from "@mui/material";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Link href="/auth/register">
            <Button
              startIcon={<ArrowLeft size={20} />}
              sx={{ p: 0, minWidth: 0, minHeight: 44 }}
            >
              Назад
            </Button>
          </Link>

          <Card sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Typography variant="h3" component="h1" gutterBottom>
                Условия использования
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Последнее обновление:</strong>{" "}
                {new Date().toLocaleDateString("ru-RU")}
              </Typography>

              <Box>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  1. Принятие условий
                </Typography>
                <Typography variant="body1" paragraph>
                  Используя наш сервис, вы соглашаетесь с настоящими условиями
                  использования. Если вы не согласны с какими-либо условиями,
                  пожалуйста, не используйте наш сервис.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  2. Описание сервиса
                </Typography>
                <Typography variant="body1" paragraph>
                  Наша платформа предоставляет возможность связи между
                  заказчиками и фрилансерами для выполнения различных проектов и
                  задач.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  3. Регистрация и аккаунт
                </Typography>
                <Typography variant="body1" paragraph>
                  При регистрации вы обязуетесь предоставлять точную и актуальную
                  информацию. Вы несете ответственность за безопасность вашего
                  аккаунта и пароля.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  4. Использование сервиса
                </Typography>
                <Typography variant="body1" paragraph>
                  Вы обязуетесь использовать сервис только в законных целях и в
                  соответствии с настоящими условиями. Запрещается использовать
                  сервис для мошенничества, спама или других незаконных действий.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  5. Интеллектуальная собственность
                </Typography>
                <Typography variant="body1" paragraph>
                  Все материалы на платформе, включая дизайн, текст, графику и
                  код, являются собственностью платформы и защищены законами об
                  авторском праве.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  6. Ограничение ответственности
                </Typography>
                <Typography variant="body1" paragraph>
                  Платформа предоставляется "как есть". Мы не гарантируем
                  бесперебойную работу сервиса и не несем ответственности за
                  любые убытки, возникшие в результате использования или
                  невозможности использования сервиса.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  7. Изменения условий
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы оставляем за собой право изменять настоящие условия в любое
                  время. Изменения вступают в силу с момента публикации на сайте.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  8. Контакты
                </Typography>
                <Typography variant="body1" paragraph>
                  Если у вас есть вопросы по поводу условий использования,
                  пожалуйста, свяжитесь с нами через форму обратной связи на
                  сайте.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
