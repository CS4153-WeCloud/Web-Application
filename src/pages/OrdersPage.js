import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdersPage({ serviceUrl }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [serviceUrl]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serviceUrl}/api/orders`);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-warning',
      confirmed: 'status-success',
      processing: 'status-warning',
      shipped: 'status-success',
      delivered: 'status-success',
      cancelled: 'status-error'
    };
    return colors[status] || 'status-warning';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">❌ Error Loading Orders</h2>
        <p className="card-content">
          Could not connect to Order Service at <code>{serviceUrl}</code>
        </p>
        <p className="card-content" style={{ color: '#dc3545', marginTop: '1rem' }}>
          {error}
        </p>
        <button onClick={fetchOrders} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="card">
        <h1 className="card-title">📦 Orders</h1>
        <p className="card-content">
          Managing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
        <button onClick={fetchOrders} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p className="card-content">No orders found. Create some orders using the API!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Order #{order.id.slice(0, 8)}</h3>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    👤 User ID: {order.userId}
                  </p>
                </div>
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Items:</p>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}>
                    <span>{item.productName}</span>
                    <span style={{ color: '#666' }}> × {item.quantity}</span>
                    <span style={{ color: '#667eea', marginLeft: '0.5rem' }}>
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  Total: ${order.totalAmount.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#999' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

export default OrdersPage;

