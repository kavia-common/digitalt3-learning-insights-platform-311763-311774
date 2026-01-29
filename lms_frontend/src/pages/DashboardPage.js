import React from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Protected placeholder dashboard.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="h1">Dashboard</h1>
          <p className="muted">Authenticated area placeholder.</p>

          <div className="info-grid">
            <div className="info-item">
              <div className="label">Name</div>
              <div className="value">{user?.name}</div>
            </div>
            <div className="info-item">
              <div className="label">Email</div>
              <div className="value">{user?.email}</div>
            </div>
            <div className="info-item">
              <div className="label">Role</div>
              <div className="value">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
