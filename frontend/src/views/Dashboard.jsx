import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../context/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Receipt, Target, BarChart2, ArrowRight } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_EMOJI, MONTHS } from '../constants/categories';

// ── Illustrations ──────────────────────────────────────
const EmptyIllustration = () => (
  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="30" width="120" height="80" rx="10" fill="var(--primary-light)" />
    <rect x="35" y="18" width="90" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1.5" />
    <rect x="48" y="38" width="64" height="8" rx="4" fill="var(--border)" />
    <rect x="48" y="54" width="48" height="6" rx="3" fill="var(--border)" />
    <rect x="48" y="68" width="56" height="6" rx="3" fill="var(--border)" />
    <circle cx="130" cy="30" r="22" fill="var(--primary-light)" />
    <path d="M130 22v8l4 4" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="130" cy="30" r="12" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
    <path d="M122 85 Q125 75 130 80 Q135 72 138 82" stroke="var(--primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 13
      }}>
        {label && <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>}
        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{Number(payload[0].value).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      Loading your dashboard...
    </div>
  );

  if (error) return (
    <div className="page-content">
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const budgetPct = analytics?.budget > 0
    ? Math.min((analytics.monthlyTotal / analytics.budget) * 100, 100)
    : 0;
  const remaining = analytics?.budget > 0 ? analytics.budget - analytics.monthlyTotal : null;
  const isOver = remaining !== null && remaining < 0;
  const isNear = remaining !== null && remaining >= 0 && budgetPct >= 80;
  const budgetBarColor = isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)';

  const barData = (analytics?.monthlyTrend || []).map(item => ({
    month: MONTHS[item._id.month - 1],
    total: item.total,
  }));

  const pieData = (analytics?.categoryBreakdown || []).map(item => ({
    name: item._id,
    value: item.total,
  }));

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <Link to="/expenses" className="btn btn-primary">
          + Add Expense
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-card-accent" />
          <div className="stat-icon stat-icon--primary"><TrendingUp size={18} /></div>
          <div className="stat-label">Month Spending</div>
          <div className="stat-value">₹{(analytics?.monthlyTotal || 0).toFixed(2)}</div>
          <div className="stat-trend">
            {pieData.length > 0 ? `${pieData.length} categories` : 'No spending yet'}
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card-accent" />
          <div className="stat-icon stat-icon--green"><Receipt size={18} /></div>
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{analytics?.monthlyExpenses || 0}</div>
          <div className="stat-trend">This month</div>
        </div>

        <div className={`stat-card ${isOver ? 'stat-card--red' : 'stat-card--amber'}`}>
          <div className="stat-card-accent" />
          <div className={`stat-icon ${isOver ? 'stat-icon--red' : 'stat-icon--amber'}`}><Target size={18} /></div>
          <div className="stat-label">Budget Left</div>
          <div className="stat-value">
            {remaining !== null ? `₹${Math.abs(remaining).toFixed(2)}` : '—'}
          </div>
          <div className="stat-trend" style={{ color: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : undefined }}>
            {remaining === null ? 'No budget set' : isOver ? 'Over limit!' : `${budgetPct.toFixed(0)}% used`}
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card-accent" />
          <div className="stat-icon stat-icon--purple"><BarChart2 size={18} /></div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: 17 }}>
            {pieData.length > 0 ? `${CATEGORY_EMOJI[pieData[0].name] || '📦'} ${pieData[0].name}` : '—'}
          </div>
          <div className="stat-trend">
            {pieData.length > 0 ? `₹${pieData[0].value.toFixed(2)}` : 'Add expenses'}
          </div>
        </div>
      </div>

      {/* Budget bar */}
      {analytics?.budget > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Budget</div>
              <div className="card-subtitle">₹{analytics.monthlyTotal.toFixed(2)} of ₹{analytics.budget.toFixed(2)}</div>
            </div>
            <span className={`badge ${isOver ? 'badge--danger' : isNear ? 'badge--warning' : 'badge--success'}`}>
              {isOver ? '⚠ Over Budget' : isNear ? '⚠ Near Limit' : '✓ On Track'}
            </span>
          </div>
          <div className="budget-bar-wrap">
            <div className="budget-bar" style={{ width: `${budgetPct}%`, background: budgetBarColor }} />
          </div>
          <div className="budget-labels">
            <span>₹{analytics.monthlyTotal.toFixed(2)} spent</span>
            <span>{budgetPct.toFixed(1)}% used</span>
            <span>₹{analytics.budget.toFixed(2)} limit</span>
          </div>
        </div>
      )}

      {/* Charts — only render when data exists */}
      {(barData.length > 0 || pieData.length > 0) && (
        <div className="charts-grid">
          {barData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Monthly Trend</div>
                <div className="card-subtitle">Last 6 months</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="total" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {pieData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">By Category</div>
                <div className="card-subtitle">This month</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={7} formatter={v => (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div className="card-title">Recent Transactions</div>
          <Link to="/expenses" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {analytics?.recentExpenses?.length > 0 ? (
          <div className="transaction-list">
            {analytics.recentExpenses.map(exp => (
              <div className="transaction-item" key={exp._id}>
                <div className="transaction-icon" style={{ background: `${CATEGORY_COLORS[exp.category] || '#64748B'}18` }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_EMOJI[exp.category] || '📦'}</span>
                </div>
                <div className="transaction-info">
                  <div className="transaction-desc">{exp.description || exp.category}</div>
                  <div className="transaction-meta">
                    <span style={{
                      background: `${CATEGORY_COLORS[exp.category] || '#64748B'}18`,
                      color: CATEGORY_COLORS[exp.category] || '#64748B',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600
                    }}>
                      {exp.category}
                    </span>
                    {' · '}{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <div className="transaction-amount">₹{Number(exp.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <EmptyIllustration />
            <h3>No transactions yet</h3>
            <p>Add your first expense to start tracking your finances.</p>
            <Link to="/expenses" className="btn btn-primary">+ Add First Expense</Link>
          </div>
        )}
      </div>
    </div>
  );
}
