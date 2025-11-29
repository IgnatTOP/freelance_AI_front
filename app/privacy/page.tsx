"use client";

import { Box, Container, Typography, Card, Stack, Button } from "@mui/material";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
                Политика конфиденциальности
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Последнее обновление:</strong>{" "}
                {new Date().toLocaleDateString("ru-RU")}
              </Typography>

              <Box>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  1. Сбор информации
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы собираем информацию, которую вы предоставляете при
                  регистрации и использовании сервиса, включая имя, email,
                  профильную информацию и данные о вашей активности на
                  платформе.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  2. Использование информации
                </Typography>
                <Typography variant="body1" paragraph>
                  Собранная информация используется для предоставления и
                  улучшения сервиса, связи с вами, обработки транзакций и
                  обеспечения безопасности платформы.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  3. Защита данных
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы применяем современные методы защиты данных, включая
                  шифрование и безопасное хранение информации. Однако ни один
                  метод передачи данных через интернет не является абсолютно
                  безопасным.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  4. Передача данных третьим лицам
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы не продаем и не передаем ваши персональные данные третьим
                  лицам, за исключением случаев, когда это необходимо для
                  предоставления сервиса или требуется по закону.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  5. Cookies
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы используем cookies и аналогичные технологии для улучшения
                  работы сервиса, анализа использования и персонализации
                  контента.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  6. Ваши права
                </Typography>
                <Typography variant="body1" paragraph>
                  Вы имеете право запросить доступ к вашим персональным данным,
                  их исправление или удаление. Для этого свяжитесь с нами через
                  форму обратной связи.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  7. Изменения политики
                </Typography>
                <Typography variant="body1" paragraph>
                  Мы можем обновлять настоящую политику конфиденциальности время
                  от времени. Все изменения будут опубликованы на этой странице.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom>
                  8. Контакты
                </Typography>
                <Typography variant="body1" paragraph>
                  Если у вас есть вопросы по поводу политики
                  конфиденциальности, пожалуйста, свяжитесь с нами через форму
                  обратной связи на сайте.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
