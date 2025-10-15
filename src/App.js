import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import HomePage from './pages/HomePage';

function App() {
  const [services, setServices] = useState({
    userService: { status: 'unknown', url: '' },
    orderService: { status: 'unknown', url: '' },
    notificationService: { status: 'unknown', url: '' }
  });

  useEffect(() => {
    // Load service URLs from environment or default
    const userServiceUrl = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';
    const orderServiceUrl = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:3002';
    const notificationServiceUrl = process.env.REACT_APP_NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

    setServices({
      userService: { status: 'configured', url: userServiceUrl },
      orderService: { status: 'configured', url: orderServiceUrl },
      notificationService: { status: 'configured', url: notificationServiceUrl }
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
               WeCloud Logistics
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/users" className="nav-link">Users</Link>
              </li>
              <li className="nav-item">
                <Link to="/orders" className="nav-link">Orders</Link>
              </li>
              <li className="nav-item">
                <Link to="/notifications" className="nav-link">Notifications</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage services={services} />} />
            <Route path="/users" element={<UsersPage serviceUrl={services.userService.url} />} />
            <Route path="/orders" element={<OrdersPage serviceUrl={services.orderService.url} />} />
            <Route path="/notifications" element={<NotificationsPage serviceUrl={services.notificationService.url} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>WeCloud Logistics © 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

