import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../App.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.password);
    setLoading(false);

    if (result.success) {
      message.success('Вход выполнен успешно');
      navigate('/dashboard');
    } else {
      message.error(result.error);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="🔐 Вход в CRM">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль администратора"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;