import { useState, useEffect } from 'react';
import API from '../context/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_EMOJI, MONTHS } from '../constants/categories';

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

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /> Loading analytics...</div>;
  if (error) return <div className="page-content"><div className="alert alert-error">{error}</div></div>;

  const trendData = (analytics?.monthlyTrend || []).map(item => ({
    month: MONTHS[item._id.month - 1],
    total: item.total,
  }));

  const pieData = (analytics?.categoryBreakdown || []).map(item => ({
    name: item._id,
    value: item.total,
    count: item.count,
  }));

  const totalSpent = pieData.reduce((s, i) => s + i.value, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Understand your spending patterns</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Spending Trend</div>
            <div className="card-subtitle">Last 6 months</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
            <TrendingUp size={15} />
            {trendData.length > 0 ? `${trendData.length} months` : 'No data'}
          </div>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5}
                dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: 'var(--bg-surface)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-text">Add more expenses to see your spending trends over time.</div>
        )}
      </div>

      {/* Pie + Bar side by side */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Category Breakdown</div>
            <div className="card-subtitle">This month</div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={84} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{CATEGORY_EMOJI[v]} {v}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-text">No spending recorded this month.</div>}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">By Category</div>
            <div className="card-subtitle">Spending this month</div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={pieData} layout="vertical" margin={{ top: 5, right: 12, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={105} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={20}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-text">No spending recorded this month.</div>}
        </div>
      </div>

      {/* Category detail rows */}
      {pieData.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">Category Details</div>
            <div className="card-subtitle">Total ₹{totalSpent.toFixed(2)}</div>
          </div>
          <div>
            {pieData.map((item, i) => {
              const pct = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
              return (
                <div key={item.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 0',
                  borderBottom: i < pieData.length - 1 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${CATEGORY_COLORS[item.name] || '#64748B'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>
                    {CATEGORY_EMOJI[item.name] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>₹{item.value.toFixed(2)}</span>
                    </div>
                    <div className="budget-bar-wrap" style={{ height: 5 }}>
                      <div className="budget-bar" style={{ width: `${pct}%`, background: CATEGORY_COLORS[item.name] || '#64748B' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {item.count} transaction{item.count !== 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pieData.length === 0 && trendData.length === 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: 32 }}>📊</div>
            <h3>No analytics yet</h3>
            <p>Start adding expenses and your spending insights will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
