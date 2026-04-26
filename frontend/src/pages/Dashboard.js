import React, { useState, useEffect } from 'react';
import { taskApi } from '../services/taskApi';

function StatCard({ label, count, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-count">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    taskApi.getStats()
      .then(res => setStats(res.data))
      .catch(err => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="subtitle">Task overview at a glance</p>

      <div className="stats-grid">
        <StatCard label="Total Tasks"  count={stats.total}      color="blue" />
        <StatCard label="To Do"        count={stats.todo}       color="gray" />
        <StatCard label="In Progress"  count={stats.inProgress} color="amber" />
        <StatCard label="Done"         count={stats.done}       color="green" />
      </div>

      <div className="progress-section">
        <h2>Completion Rate</h2>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: stats.total > 0
              ? `${Math.round((stats.done / stats.total) * 100)}%`
              : '0%' }}
          />
        </div>
        <p>{stats.total > 0
          ? `${Math.round((stats.done / stats.total) * 100)}% complete`
          : 'No tasks yet'}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
