import React, { useState, useContext } from 'react';
import { Layout, Menu, Dropdown, Avatar, message, Spin } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
    const { logout, isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Во время проверки токена показываем загрузку
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Если не авторизован - редирект на логин
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        message.success('Выход выполнен');
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Дашборд',
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Заказы',
        },
        {
            key: '/bot-config',
            icon: <SettingOutlined />,
            label: 'Настройки бота',
        },
    ];

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: handleLogout,
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '10px' }}>
                    CRM TURNER
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Панель управления</h2>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 280, overflow: 'initial' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
