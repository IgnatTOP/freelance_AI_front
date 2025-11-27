'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { toastService } from '@/src/shared/lib/toast';
import { Mail, Lock } from 'lucide-react';
import { emailRules, passwordRules } from '@/src/shared/lib/utils/form-validations';
import { useAsyncOperation } from '@/src/shared/lib/hooks';
import { authService } from '@/src/shared/lib/auth/auth.service';
import type { LoginRequest } from '@/src/shared/lib/auth/auth.service';

const { Text, Link: AntLink } = Typography;

export function LoginForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  
  const { execute: handleLogin, loading } = useAsyncOperation(
    async (values: LoginRequest) => {
      await authService.login(values);
      toastService.success('Успешный вход!');
      router.push('/dashboard');
    },
    {
      onError: (error) => {
        toastService.error('Ошибка входа. Проверьте данные.');
        console.error('Login error:', error);
      },
    }
  );

  const handleSubmit = async (values: LoginRequest) => {
    await handleLogin(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      size="large"
      requiredMark={false}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={emailRules}
      >
        <Input
          prefix={<Mail size={18} />}
          placeholder="your@email.com"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Пароль"
        rules={passwordRules}
      >
        <Input.Password
          prefix={<Lock size={18} />}
          placeholder="••••••••"
        />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Запомнить меня</Checkbox>
          </Form.Item>
          <Link href="/auth/forgot-password">
            <AntLink>Забыли пароль?</AntLink>
          </Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
        >
          Войти
        </Button>
      </Form.Item>

      <Divider>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Нет аккаунта?{' '}
          <Link href="/auth/register">
            <AntLink>Зарегистрироваться</AntLink>
          </Link>
        </Text>
      </Divider>
    </Form>
  );
}
