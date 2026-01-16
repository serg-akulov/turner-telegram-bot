import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import './App.css';

// Компоненты
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import BotConfig from './components/BotConfig';
import MainLayout from './components/MainLayout';

// Контекст аутентификации
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/bot-config" element={<BotConfig />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;