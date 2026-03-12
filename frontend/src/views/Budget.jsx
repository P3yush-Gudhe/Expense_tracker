import { useState, useEffect } from 'react';
import API from '../context/api';
import { Target, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

export default function Budget() {
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [current, setCurrent] = useState(null);
  const [spent, setSpent] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, analyticsRes] = await Promise.all([
          API.get('/budget'),
          API.get('/analytics')
        ]);
        const limit = budgetRes.data.monthlyLimit || 0;
        setCurrent(limit);
        setMonthlyLimit(limit > 0 ? String(limit) : '');
        setSpent(analyticsRes.data.monthlyTotal || 0);
      } catch (err) {
        console.error('Failed to load budget data:', err);
        setError('Failed to load budget data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const amount = parseFloat(monthlyLimit);
    if (!monthlyLimit || isNaN(amount) || amount <= 0) {
      return setError('Please enter a valid budget amount greater than 0');
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await API.post('/budget', { monthlyLimit: amount });
      setCurrent(data.monthlyLimit);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const pct = current > 0 ? Math.min((spent / current) * 100, 100) : 0;
  const remaining = current > 0 ? current - spent : null;
  const isOver = remaining !== null && remaining < 0;
  const isNear = remaining !== null && remaining >= 0 && pct >= 80;
  const barColor = isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)';

  const PRESETS = [5000, 10000, 15000, 20000, 30000, 50000];

  if (loading) return <div className="loading-state"><div className="spinner" /> Loading budget...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="page-title">Budget</div>
          <div className="page-subtitle">Set and track your monthly spending limit</div>
        </div>
      </div>

      <div className="budget-layout">
        {/* Status overview — only when budget is set */}
        {current > 0 && (
          <div className="card" style={{
            borderColor: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--border)',
            borderWidth: isOver || isNear ? 2 : 1
          }}>
            <div className="card-header">
              <div>
                <div className="card-title">Status Overview</div>
                <div className="card-subtitle">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <span className={`badge ${isOver ? 'badge--danger' : isNear ? 'badge--warning' : 'badge--success'}`}>
                {isOver ? '⚠ Over Budget' : isNear ? '⚠ Near Limit' : '✓ On Track'}
              </span>
            </div>

            <div className="budget-numbers-grid">
              <div className="budget-stat">
                <div className="budget-stat-label">Spent</div>
                <div className="budget-stat-value">₹{spent.toFixed(2)}</div>
              </div>
              <div className="budget-stat">
                <div className="budget-stat-label">{isOver ? 'Over by' : 'Remaining'}</div>
                <div className={`budget-stat-value ${isOver ? 'budget-stat-value--danger' : ''}`}>
                  ₹{Math.abs(remaining ?? 0).toFixed(2)}
                </div>
              </div>
              <div className="budget-stat">
                <div className="budget-stat-label">Monthly Limit</div>
                <div className="budget-stat-value">₹{current.toFixed(2)}</div>
              </div>
            </div>

            <div className="budget-bar-wrap">
              <div className="budget-bar" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <div className="budget-labels">
              <span>₹{spent.toFixed(2)} used</span>
              <span style={{ fontWeight: 700, color: barColor }}>{pct.toFixed(1)}%</span>
              <span>₹{current.toFixed(2)} limit</span>
            </div>

            {isOver && (
              <div className="alert alert-error" style={{ marginTop: 16 }}>
                <TrendingUp size={15} style={{ flexShrink: 0 }} />
                You have exceeded your budget by ₹{Math.abs(remaining ?? 0).toFixed(2)} this month.
              </div>
            )}
            {isNear && !isOver && (
              <div className="alert alert-warning" style={{ marginTop: 16 }}>
                <TrendingDown size={15} style={{ flexShrink: 0 }} />
                You have used {pct.toFixed(1)}% of your budget. ₹{(remaining ?? 0).toFixed(2)} left.
              </div>
            )}
          </div>
        )}

        {/* Set / Update form */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Target size={20} />
              </div>
              <div>
                <div className="card-title">{current > 0 ? 'Update Budget' : 'Set Your Budget'}</div>
                <div className="card-subtitle">
                  {current > 0 ? `Current limit: ₹${current.toFixed(2)}` : 'Define your monthly spending limit'}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
          {saved && (
            <div className="alert alert-success">
              <CheckCircle size={15} style={{ flexShrink: 0 }} />
              Budget saved successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="form-stack">
            <div className="form-group">
              <label className="form-label">Monthly Budget Limit (₹)</label>
              <input
                className="form-input"
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 20000"
                value={monthlyLimit}
                onChange={e => setMonthlyLimit(e.target.value)}
                style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}
              />
              <span className="form-hint">Set the max amount you want to spend each month.</span>
            </div>

            {/* Quick presets */}
            <div>
              <div className="form-label" style={{ marginBottom: 8 }}>Quick presets</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESETS.map(amt => {
                  const isSelected = monthlyLimit === String(amt);
                  return (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setMonthlyLimit(String(amt))}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-2)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all var(--transition)'
                      }}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? 'Saving...' : current > 0 ? 'Update Budget' : 'Set Budget'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
