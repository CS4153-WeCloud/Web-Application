import React from 'react';

function HomePage({ services }) {
  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">WeCloud Logistics</h1>
        <p className="hero-subtitle">
          A modern, scalable application built with microservices
        </p>
      </div>

      <div className="services-grid">
        <div className="card">
          <h2 className="card-title">👥 User Service</h2>
          <p className="card-content">
            Manage users, profiles, and authentication
          </p>
          <div className="service-info">
            <span className="status-badge status-success">Running</span>
            <code className="service-url">{services.userService.url}</code>
          </div>
          <a href="/users" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            View Users
          </a>
        </div>

        <div className="card">
          <h2 className="card-title">📦 Order Service</h2>
          <p className="card-content">
            Handle orders, items, and shipping
          </p>
          <div className="service-info">
            <span className="status-badge status-success">Running</span>
            <code className="service-url">{services.orderService.url}</code>
          </div>
          <a href="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            View Orders
          </a>
        </div>

        <div className="card">
          <h2 className="card-title">🔔 Notification Service</h2>
          <p className="card-content">
            Send emails, SMS, and push notifications
          </p>
          <div className="service-info">
            <span className="status-badge status-success">Running</span>
            <code className="service-url">{services.notificationService.url}</code>
          </div>
          <a href="/notifications" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            View Notifications
          </a>
        </div>
      </div>

      <style jsx>{`
        .hero {
          text-align: center;
          padding: 3rem 0;
          color: white;
        }

        .hero-title {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #22c55e;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          color: #46d279ff;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .service-url {
          background: #f5f5f5;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;

