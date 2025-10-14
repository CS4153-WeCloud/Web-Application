import React from 'react';

function HomePage({ services }) {
  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">🚀 Microservices Architecture</h1>
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

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">🎯 Architecture Overview</h2>
        <div className="card-content">
          <p><strong>Frontend:</strong> React application (this app)</p>
          <p><strong>Backend:</strong> 3 independent microservices</p>
          <p><strong>Database:</strong> MySQL (shared instance)</p>
          <p><strong>Deployment:</strong> Google Cloud Platform VMs</p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Features:</strong>
          </p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>RESTful APIs with OpenAPI documentation</li>
            <li>Service-to-service communication</li>
            <li>Independent deployment and scaling</li>
            <li>Health monitoring endpoints</li>
          </ul>
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
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
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

