import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NotificationsPage({ serviceUrl }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [serviceUrl]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serviceUrl}/api/notifications`);
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-warning',
      sent: 'status-success',
      delivered: 'status-success',
      failed: 'status-error'
    };
    return colors[status] || 'status-warning';
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: '📧',
      sms: '📱',
      push: '🔔'
    };
    return icons[type] || '📬';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">❌ Error Loading Notifications</h2>
        <p className="card-content">
          Could not connect to Notification Service at <code>{serviceUrl}</code>
        </p>
        <p className="card-content" style={{ color: '#dc3545', marginTop: '1rem' }}>
          {error}
        </p>
        <button onClick={fetchNotifications} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="card">
        <h1 className="card-title">🔔 Notifications</h1>
        <p className="card-content">
          Managing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
        <button onClick={fetchNotifications} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          🔄 Refresh
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <p className="card-content">No notifications found. Create some notifications using the API!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(notification.type)}</span>
                    <h3 style={{ margin: 0 }}>{notification.subject || 'No Subject'}</h3>
                  </div>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    👤 User ID: {notification.userId}
                  </p>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    📬 To: {notification.recipient}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span className={`status-badge ${getStatusColor(notification.status)}`}>
                    {notification.status}
                  </span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem',
                    background: '#f5f5f5',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {notification.type}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {notification.message}
                </p>
              </div>

              <div style={{ 
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#999',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                {notification.sentAt && (
                  <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.5rem' }}>
                ID: {notification.id}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

export default NotificationsPage;

