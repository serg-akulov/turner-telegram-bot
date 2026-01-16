import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Switch, message, Tabs, Space,
  Divider, InputNumber, Alert
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const BotConfig = () => {
  const [loading, setLoading] = useState(false);
  const [textsForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const loadConfig = React.useCallback(async () => {
    console.log('BotConfig: Loading config...');
    setLoading(true);
    try {
      const [textsResponse, settingsResponse] = await Promise.all([
        axios.get('/api/bot-config/texts'),
        axios.get('/api/bot-config/settings')
      ]);

      console.log('BotConfig: Loaded texts:', textsResponse.data);
      console.log('BotConfig: Loaded settings:', settingsResponse.data);

      if (textsResponse.data) {
        textsForm.setFieldsValue(textsResponse.data);
      }

      if (settingsResponse.data) {
        // Конвертируем "1"/"0" в true/false для Switch
        const normalizedSettings = { ...settingsResponse.data };
        ['is_photo_required', 'step_extra_enabled'].forEach(key => {
          if (normalizedSettings[key] !== undefined) {
            normalizedSettings[key] = normalizedSettings[key] === '1' || normalizedSettings[key] === 1 || normalizedSettings[key] === true || normalizedSettings[key] === "true";
          }
        });
        settingsForm.setFieldsValue(normalizedSettings);
      }
    } catch (error) {
      console.error('BotConfig: Load error:', error);
      message.error('Ошибка загрузки настроек');
    }
    setLoading(false);
  }, [textsForm, settingsForm]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveTexts = async (values) => {
    setLoading(true);
    try {
      await axios.put('/api/bot-config/texts', values);
      message.success('Тексты сохранены успешно');
    } catch (error) {
      message.error('Ошибка сохранения текстов');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (values) => {
    setLoading(true);
    try {
      await axios.put('/api/bot-config/settings', values);
      message.success('Настройки сохранены успешно');
    } catch (error) {
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'texts',
      label: '📝 Тексты бота',
      children: (
        <Card title="Конструктор текстов">
          <Form
            form={textsForm}
            layout="vertical"
            onFinish={saveTexts}
          >
            <Form.Item
              label="Приветственное сообщение"
              name="welcome_msg"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={3}
                placeholder="Привет! Я принимаю заказы на токарные работы..."
              />
            </Form.Item>

            <Divider>Шаг 1: Фото</Divider>

            <Form.Item
              label="Текст вопроса про фото"
              name="step_photo_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="📷 Шаг 1. Загрузите фото детали..."
              />
            </Form.Item>

            <Form.Item
              label="Кнопка 'Пропустить фото'"
              name="btn_skip_photo"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <Input placeholder="Нет фото / Пропустить" />
            </Form.Item>

            <Divider>Шаг 2: Тип работы</Divider>

            <Form.Item
              label="Текст вопроса про тип работы"
              name="step_type_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="🛠 Шаг 2. Что нужно сделать?"
              />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Кнопка 'Восстановление детали'"
                name="btn_type_repair"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🛠 Восстановление детали" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Копия по образцу'"
                name="btn_type_copy"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="⚙️ Копия по образцу" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Деталь по чертежу'"
                name="btn_type_drawing"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="📐 Деталь по чертежу" />
              </Form.Item>
            </Space>

            <Divider>Шаг 3: Размеры</Divider>

            <Form.Item
              label="Текст вопроса про размеры"
              name="step_dim_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={3}
                placeholder="📏 Шаг 3. Размеры..."
              />
            </Form.Item>

            <Divider>Шаг 4: Условия работы</Divider>

            <Form.Item
              label="Текст вопроса про условия"
              name="step_cond_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="⚙️ Шаг 4. Специфика детали..."
              />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Кнопка 'Вращение'"
                name="btn_cond_rotation"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="💫 Вращение" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Неподвижно'"
                name="btn_cond_static"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🧱 Неподвижно" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Ударная нагрузка'"
                name="btn_cond_impact"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🔨 Ударная нагрузка" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Не знаю'"
                name="btn_cond_unknown"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🤷‍♂️ Не знаю" />
              </Form.Item>
            </Space>

            <Divider>Шаг 5: Срочность</Divider>

            <Form.Item
              label="Текст вопроса про срочность"
              name="step_urgency_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="⏳ Шаг 5. Срочность"
              />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Кнопка 'СРОЧНО'"
                name="btn_urgency_high"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🔥 СРОЧНО (Цена x2)" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Стандарт'"
                name="btn_urgency_med"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🗓 Стандарт (2-3 дня)" />
              </Form.Item>

              <Form.Item
                label="Кнопка 'Не к спеху'"
                name="btn_urgency_low"
                rules={[{ required: true, message: 'Обязательное поле' }]}
              >
                <Input placeholder="🐢 Не к спеху" />
              </Form.Item>
            </Space>

            <Divider>Финальные сообщения</Divider>

            <Form.Item
              label="Текст финального вопроса"
              name="step_final_text"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="✍️ Финал. Напишите комментарий..."
              />
            </Form.Item>

            <Form.Item
              label="Сообщение об успехе"
              name="msg_done"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="✅ Заказ принят!..."
              />
            </Form.Item>

            <Form.Item
              label="Ошибка: нет фото"
              name="err_photo_required"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <TextArea
                rows={2}
                placeholder="⚠️ Я не могу принять заказ без фото..."
              />
            </Form.Item>

            <Form.Item
              label="Сообщение об отмене"
              name="msg_order_canceled"
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <Input placeholder="Заказ отменен" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadConfig}>
                  Сбросить
                </Button>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>
                  Сохранить тексты
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'settings',
      label: '🔧 Системные настройки',
      forceRender: true,
      children: (
        <Card title="Настройки поведения бота">
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={saveSettings}
          >
            <Form.Item
              label="Фото обязательно"
              name="is_photo_required"
              valuePropName="checked"
              tooltip="Если включено, клиент не сможет пропустить шаг с фото"
            >
              <Switch checkedChildren="Да" unCheckedChildren="Нет" />
            </Form.Item>

            <Form.Item
              label="Дополнительный вопрос включен"
              name="step_extra_enabled"
              valuePropName="checked"
              tooltip="Добавляет еще один шаг опроса после срочности"
            >
              <Switch checkedChildren="Да" unCheckedChildren="Нет" />
            </Form.Item>

            <Divider />

            <Form.Item
              label="ID чата администратора"
              name="admin_chat_id"
              tooltip="Telegram ID администратора для получения уведомлений"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="123456789"
              />
            </Form.Item>

            <Alert
              message="Важно"
              description="ID чата администратора можно получить командой /iamadmin в боте после настройки BOT_ADMIN_PASSWORD"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadConfig}>
                  Сбросить
                </Button>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>
                  Сохранить настройки
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div className="bot-config-content">
      <h1>⚙️ Настройки бота</h1>

      <Alert
        message="Внимание"
        description="Изменения вступят в силу после перезапуска бота. Используйте docker compose restart bot"
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs defaultActiveKey="texts" items={tabItems} />
    </div>
  );
};

export default BotConfig;