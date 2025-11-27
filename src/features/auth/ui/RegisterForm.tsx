'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Checkbox, Typography, Divider, Select } from 'antd';
import { toastService } from '@/src/shared/lib/toast';
import { User, Mail, Lock } from 'lucide-react';
import { emailRules, passwordRules, displayNameRules, usernameRules, confirmPasswordRules } from '@/src/shared/lib/utils/form-validations';
import { useAsyncOperation } from '@/src/shared/lib/hooks';
import { authService } from '@/src/shared/lib/auth/auth.service';
import type { RegisterRequest } from '@/src/shared/lib/auth/auth.service';

const { Text, Link: AntLink } = Typography;

interface RegisterFormValues {
  email: string;
  password: string;
  username: string;
  role: 'client' | 'freelancer';
  display_name: string;
  confirmPassword: string;
  agreement: boolean;
}

export function RegisterForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  
  const { execute: handleRegister, loading } = useAsyncOperation(
    async (values: RegisterRequest) => {
      await authService.register(values);
      toastService.success('Регистрация успешна!');
      router.push('/dashboard');
    },
    {
      onError: (error) => {
        toastService.error('Ошибка регистрации. Попробуйте снова.');
        console.error('Register error:', error);
      },
    }
  );

  const handleSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword, agreement, ...registerData } = values;
    await handleRegister(registerData as RegisterRequest);
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
        name="display_name"
        label="Имя"
        rules={displayNameRules}
      >
        <Input
          prefix={<User size={18} />}
          placeholder="Иван Иванов"
        />
      </Form.Item>

      <Form.Item
        name="username"
        label="Имя пользователя"
        rules={usernameRules}
      >
        <Input
          prefix={<User size={18} />}
          placeholder="username"
        />
      </Form.Item>

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
        name="role"
        label="Роль"
        rules={[{ required: true, message: 'Выберите роль' }]}
      >
        <Select placeholder="Выберите роль">
          <Select.Option value="client">Заказчик</Select.Option>
          <Select.Option value="freelancer">Фрилансер</Select.Option>
        </Select>
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

      <Form.Item
        name="confirmPassword"
        label="Подтверждение пароля"
        dependencies={['password']}
        rules={confirmPasswordRules}
      >
        <Input.Password
          prefix={<Lock size={18} />}
          placeholder="••••••••"
        />
      </Form.Item>

      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Необходимо согласие с условиями')),
          },
        ]}
      >
        <Checkbox>
          Я согласен с{' '}
          <Link href="/terms">
            <AntLink>условиями использования</AntLink>
          </Link>{' '}
          и{' '}
          <Link href="/privacy">
            <AntLink>политикой конфиденциальности</AntLink>
          </Link>
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
        >
          Зарегистрироваться
        </Button>
      </Form.Item>

      <Divider>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Уже есть аккаунт?{' '}
          <Link href="/auth/login">
            <AntLink>Войти</AntLink>
          </Link>
        </Text>
      </Divider>
    </Form>
  );
}
