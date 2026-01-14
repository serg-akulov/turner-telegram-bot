import React, { useState, useEffect, useContext } from 'react';
import {
  Table, Button, Select, Tag, Modal, Image, Form, Input, message,
  Space, Card, Row, Col, Statistic, Avatar, Tooltip, Badge
} from 'antd';
import {
  EyeOutlined, EditOutlined, ShoppingCartOutlined,
  UserOutlined, SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import AuthContext from '../contexts/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const Orders = () => {
  const { loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState({
    total_orders: 0,
    new_orders: 0,
    active_orders: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [pagination.current, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          status_filter: statusFilter
        }
      });
      setOrders(response.data);
      setPagination(prev => ({ ...prev, total: response.data.length * 5 }));
    } catch (error) {
      message.error('Ошибка загрузки заказов');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      message.success('Статус обновлен');
      fetchOrders();
      fetchStats();
    } catch (error) {
      message.error('Ошибка обновления статуса');
    }
  };

  const showOrderDetails = async (order) => {
    setSelectedOrder(order);
    setModalVisible(true);

    try {
      const response = await axios.get(`/api/orders/${order.id}/photos`);
      setPhotos(response.data.photos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const showEditModal = (order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await axios.put(`/api/orders/${selectedOrder.id}`, values);
      message.success('Заказ обновлен');
      setEditModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error('Ошибка обновления заказа');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Клиент',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Тип работы',
      dataIndex: 'work_type',
      key: 'work_type',
      render: (text) => text || '-',
    },
    {
      title: 'Срочность',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (text) => {
        const urgencyColors = {
          '🔥 СРОЧНО (Цена x2)': 'red',
          '🗓 Стандарт (2-3 дня)': 'orange',
          '🐢 Не к спеху': 'green'
        };
        return <Tag color={urgencyColors[text] || 'default'}>{text || '-'}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="new">🔥 НОВЫЙ</Option>
          <Option value="discussion">💬 Обсуждение</Option>
          <Option value="approved">🛠 В работе</Option>
          <Option value="work">⚙️ Выполняется</Option>
          <Option value="done">✅ ГОТОВ</Option>
          <Option value="rejected">❌ Отказ</Option>
        </Select>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Просмотр">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-content">
      <h1>📦 Управление заказами</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Всего заказов"
              value={stats.total_orders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Новых заказов"
              value={stats.new_orders}
              prefix={<Badge dot status="success"><ShoppingCartOutlined /></Badge>}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Активных заказов"
              value={stats.active_orders}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>Фильтр по статусу:</span>
          <Select
            allowClear
            placeholder="Все статусы"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="new">🔥 Новые</Option>
            <Option value="discussion">💬 Обсуждение</Option>
            <Option value="approved">🛠 В работе</Option>
            <Option value="work">⚙️ Выполняется</Option>
            <Option value="done">✅ Готовые</Option>
            <Option value="rejected">❌ Отказы</Option>
          </Select>
          <Button onClick={fetchOrders}>Обновить</Button>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} заказов`,
        }}
        onChange={(pagination) => setPagination(pagination)}
      />

      <Modal
        title={`Заказ №${selectedOrder?.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <h3>👤 Информация о клиенте</h3>
                <p><strong>Имя:</strong> {selectedOrder.full_name}</p>
                <p><strong>Username:</strong> @{selectedOrder.username}</p>
                <p><strong>Telegram ID:</strong> {selectedOrder.user_id}</p>
              </Col>
              <Col span={12}>
                <h3>📋 Детали заказа</h3>
                <p><strong>Тип работы:</strong> {selectedOrder.work_type}</p>
                <p><strong>Размеры:</strong> {selectedOrder.dimensions_info}</p>
                <p><strong>Условия:</strong> {selectedOrder.conditions}</p>
                <p><strong>Срочность:</strong> {selectedOrder.urgency}</p>
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              <h3>💬 Комментарий</h3>
              <p>{selectedOrder.comment || 'Нет комментария'}</p>
            </div>

            {photos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3>📸 Фото</h3>
                <div className="photo-gallery">
                  {photos.map((photoId, index) => (
                    <Image
                      key={index}
                      src={photoId} // Теперь тут полная ссылка
                      alt={`Фото ${index + 1}`}
                      className="photo-item"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={`Редактирование заказа №${selectedOrder?.id}`}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <Form
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={{
              status: selectedOrder.status,
              internal_note: selectedOrder.internal_note || ''
            }}
          >
            <Form.Item
              name="status"
              label="Статус"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="new">🔥 НОВЫЙ</Option>
                <Option value="discussion">💬 Обсуждение</Option>
                <Option value="approved">🛠 В работе</Option>
                <Option value="work">⚙️ Выполняется</Option>
                <Option value="done">✅ ГОТОВ</Option>
                <Option value="rejected">❌ Отказы</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="internal_note"
              label="Внутренняя заметка"
            >
              <TextArea rows={4} placeholder="Внутренняя заметка для администратора" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setEditModalVisible(false)}>
                  Отмена
                </Button>
                <Button type="primary" htmlType="submit">
                  Сохранить
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Orders;