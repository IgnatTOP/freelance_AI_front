"use client";

import { Layout, Typography, Card, Space } from "antd";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function TermsPage() {
  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Content style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Link href="/auth/register">
            <ArrowLeft size={20} style={{ marginBottom: 16, cursor: "pointer" }} />
          </Link>

          <Card>
            <Title level={1}>Условия использования</Title>
            <Paragraph>
              <strong>Последнее обновление:</strong> {new Date().toLocaleDateString("ru-RU")}
            </Paragraph>

            <Title level={2}>1. Принятие условий</Title>
            <Paragraph>
              Используя наш сервис, вы соглашаетесь с настоящими условиями использования.
              Если вы не согласны с какими-либо условиями, пожалуйста, не используйте наш сервис.
            </Paragraph>

            <Title level={2}>2. Описание сервиса</Title>
            <Paragraph>
              Наша платформа предоставляет возможность связи между заказчиками и фрилансерами
              для выполнения различных проектов и задач.
            </Paragraph>

            <Title level={2}>3. Регистрация и аккаунт</Title>
            <Paragraph>
              При регистрации вы обязуетесь предоставлять точную и актуальную информацию.
              Вы несете ответственность за безопасность вашего аккаунта и пароля.
            </Paragraph>

            <Title level={2}>4. Использование сервиса</Title>
            <Paragraph>
              Вы обязуетесь использовать сервис только в законных целях и в соответствии
              с настоящими условиями. Запрещается использовать сервис для мошенничества,
              спама или других незаконных действий.
            </Paragraph>

            <Title level={2}>5. Интеллектуальная собственность</Title>
            <Paragraph>
              Все материалы на платформе, включая дизайн, текст, графику и код,
              являются собственностью платформы и защищены законами об авторском праве.
            </Paragraph>

            <Title level={2}>6. Ограничение ответственности</Title>
            <Paragraph>
              Платформа предоставляется "как есть". Мы не гарантируем бесперебойную работу
              сервиса и не несем ответственности за любые убытки, возникшие в результате
              использования или невозможности использования сервиса.
            </Paragraph>

            <Title level={2}>7. Изменения условий</Title>
            <Paragraph>
              Мы оставляем за собой право изменять настоящие условия в любое время.
              Изменения вступают в силу с момента публикации на сайте.
            </Paragraph>

            <Title level={2}>8. Контакты</Title>
            <Paragraph>
              Если у вас есть вопросы по поводу условий использования, пожалуйста,
              свяжитесь с нами через форму обратной связи на сайте.
            </Paragraph>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}

