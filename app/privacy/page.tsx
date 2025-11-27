"use client";

import { Layout, Typography, Card, Space } from "antd";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

// Note: Metadata export doesn't work with "use client" components
// Consider creating a layout.tsx file for this route

export default function PrivacyPage() {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Link href="/auth/register">
            <ArrowLeft size={20} style={{ marginBottom: 16, cursor: "pointer" }} />
          </Link>

          <Card>
            <Title level={1}>Политика конфиденциальности</Title>
            <Paragraph>
              <strong>Последнее обновление:</strong> {new Date().toLocaleDateString("ru-RU")}
            </Paragraph>

            <Title level={2}>1. Сбор информации</Title>
            <Paragraph>
              Мы собираем информацию, которую вы предоставляете при регистрации и использовании
              сервиса, включая имя, email, профильную информацию и данные о вашей активности
              на платформе.
            </Paragraph>

            <Title level={2}>2. Использование информации</Title>
            <Paragraph>
              Собранная информация используется для предоставления и улучшения сервиса,
              связи с вами, обработки транзакций и обеспечения безопасности платформы.
            </Paragraph>

            <Title level={2}>3. Защита данных</Title>
            <Paragraph>
              Мы применяем современные методы защиты данных, включая шифрование и безопасное
              хранение информации. Однако ни один метод передачи данных через интернет
              не является абсолютно безопасным.
            </Paragraph>

            <Title level={2}>4. Передача данных третьим лицам</Title>
            <Paragraph>
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением
              случаев, когда это необходимо для предоставления сервиса или требуется по закону.
            </Paragraph>

            <Title level={2}>5. Cookies</Title>
            <Paragraph>
              Мы используем cookies и аналогичные технологии для улучшения работы сервиса,
              анализа использования и персонализации контента.
            </Paragraph>

            <Title level={2}>6. Ваши права</Title>
            <Paragraph>
              Вы имеете право запросить доступ к вашим персональным данным, их исправление
              или удаление. Для этого свяжитесь с нами через форму обратной связи.
            </Paragraph>

            <Title level={2}>7. Изменения политики</Title>
            <Paragraph>
              Мы можем обновлять настоящую политику конфиденциальности время от времени.
              Все изменения будут опубликованы на этой странице.
            </Paragraph>

            <Title level={2}>8. Контакты</Title>
            <Paragraph>
              Если у вас есть вопросы по поводу политики конфиденциальности, пожалуйста,
              свяжитесь с нами через форму обратной связи на сайте.
            </Paragraph>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}

