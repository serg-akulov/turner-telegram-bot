import React, { useEffect, useState } from 'react';
import { Button, Statistic, Row, Col, Card } from 'antd';
import {
  ShoppingCartOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    new_orders: 0,
    active_orders: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard-content">
      <h1>📊 Дашборд</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Всего заказов"
              value={stats.total_orders}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Новых заказов"
              value={stats.new_orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Активных заказов"
              value={stats.active_orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Быстрые действия" style={{ marginTop: 24 }}>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => navigate('/orders')}
          style={{ marginRight: 8 }}
        >
          Просмотр заказов
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => navigate('/bot-config')}
        >
          Настройки бота
        </Button>
      </Card>
    </div>
  );
};

export default Dashboard;