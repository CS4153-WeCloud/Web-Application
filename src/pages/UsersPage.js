import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsersPage({ serviceUrl }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [serviceUrl]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serviceUrl}/api/users`);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">❌ Error Loading Users</h2>
        <p className="card-content">
          Could not connect to User Service at <code>{serviceUrl}</code>
        </p>
        <p className="card-content" style={{ color: '#dc3545', marginTop: '1rem' }}>
          {error}
        </p>
        <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <p><strong>Troubleshooting:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Make sure User Service is running on {serviceUrl}</li>
            <li>Check CORS settings on the backend</li>
            <li>Verify the service URL in .env file</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="card">
        <h1 className="card-title">👥 Users</h1>
        <p className="card-content">
          Managing {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
        <button onClick={fetchUsers} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          🔄 Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="card">
          <p className="card-content">No users found. Create some users using the API!</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>
                {user.first_name || user.firstName} {user.last_name || user.lastName}
              </h3>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                ✉️ {user.email}
              </p>
              {(user.phone || user.phone_number) && (
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                  📞 {user.phone || user.phone_number}
                </p>
              )}
              <span className={`status-badge ${
                user.status === 'active' ? 'status-success' : 
                user.status === 'inactive' ? 'status-warning' : 
                'status-error'
              }`}>
                {user.status}
              </span>
              <p style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.5rem' }}>
                ID: {user.id}
              </p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default UsersPage;

