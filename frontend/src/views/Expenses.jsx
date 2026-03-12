import { useState, useEffect, useCallback } from 'react';
import API from '../context/api';
import ExpenseForm from '../components/ExpenseForm';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_EMOJI } from '../constants/categories';

const ALL_CATEGORIES = ['All', ...CATEGORIES];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All', search: '', startDate: '', endDate: '', sortBy: 'date', order: 'desc'
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      params.sortBy = filters.sortBy;
      params.order = filters.order;
      const { data } = await API.get('/expenses', { params });
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchExpenses, 300);
    return () => clearTimeout(t);
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    setExpenses(prev => prev.filter(e => e._id !== id));
    try {
      await API.delete(`/expenses/${id}`);
    } catch {
      fetchExpenses(); // rollback on failure
    }
  };

  const handleSaved = (expense, isEdit) => {
    setExpenses(prev =>
      isEdit ? prev.map(e => e._id === expense._id ? expense : e) : [expense, ...prev]
    );
    setShowForm(false);
    setEditExpense(null);
  };

  const openEdit = (exp) => { setEditExpense(exp); setShowForm(true); };
  const openAdd = () => { setEditExpense(null); setShowForm(true); };
  const clearFilters = () => setFilters({ category: 'All', search: '', startDate: '', endDate: '', sortBy: 'date', order: 'desc' });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const hasActiveFilters = filters.category !== 'All' || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}&nbsp;·&nbsp;Total: ₹{total.toFixed(2)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-ghost ${showFilters ? 'icon-btn--active' : ''}`} onClick={() => setShowFilters(s => !s)}>
            <Filter size={15} /> Filters {hasActiveFilters && <span className="badge badge--primary" style={{ padding: '2px 7px', fontSize: 11 }}>On</span>}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
        {ALL_CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilters(f => ({ ...f, category: c }))}
            className="cat-pill"
            style={{
              padding: '5px 13px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${filters.category === c ? 'var(--primary)' : 'var(--border)'}`,
              background: filters.category === c ? 'var(--primary)' : 'var(--bg-surface)',
              color: filters.category === c ? '#fff' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all var(--transition)', whiteSpace: 'nowrap',
            }}
          >
            {c === 'All' ? '🗂️' : CATEGORY_EMOJI[c]} {c}
          </button>
        ))}
      </div>

      {/* Collapsible advanced filters */}
      {showFilters && (
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap" style={{ flex: 2, minWidth: 180 }}>
            <Search size={14} className="search-icon" />
            <input
              className="form-input search-input"
              placeholder="Search by description or tag..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <input className="form-input" style={{ maxWidth: 150 }} type="date" value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          <input className="form-input" style={{ maxWidth: 150 }} type="date" value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          <select
            className="form-input select-input"
            style={{ maxWidth: 170 }}
            value={`${filters.sortBy}-${filters.order}`}
            onChange={e => {
              const [sortBy, order] = e.target.value.split('-');
              setFilters(f => ({ ...f, sortBy, order }));
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /> Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: 32 }}>💸</div>
            <h3>No expenses found</h3>
            <p>{hasActiveFilters ? 'Try clearing your filters.' : 'Add your first expense to get started.'}</p>
            {hasActiveFilters
              ? <button className="btn btn-ghost" onClick={clearFilters}>Clear Filters</button>
              : <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Expense</button>
            }
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-wrap desktop-only">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id}>
                    <td className="td-muted">
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{CATEGORY_EMOJI[exp.category] || '📦'}</span>
                        <span style={{ fontWeight: 500 }}>
                          {exp.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge" style={{
                        background: `${CATEGORY_COLORS[exp.category] || '#64748B'}18`,
                        color: CATEGORY_COLORS[exp.category] || '#64748B'
                      }}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="td-muted">
                      {exp.tags?.length > 0
                        ? exp.tags.map(t => (
                          <span key={t} className="tag-chip">{t}</span>
                        ))
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15 }}>
                      ₹{Number(exp.amount).toFixed(2)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => openEdit(exp)}>
                          <Pencil size={13} />
                        </button>
                        <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDelete(exp._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="expense-cards mobile-only">
            {expenses.map(exp => (
              <div key={exp._id} className="expense-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `${CATEGORY_COLORS[exp.category] || '#64748B'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>
                    {CATEGORY_EMOJI[exp.category] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                      {exp.description || exp.category}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="category-badge" style={{
                        background: `${CATEGORY_COLORS[exp.category] || '#64748B'}18`,
                        color: CATEGORY_COLORS[exp.category] || '#64748B', fontSize: 11
                      }}>
                        {exp.category}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      ₹{Number(exp.amount).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => openEdit(exp)}><Pencil size={13} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(exp._id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
                {exp.tags?.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {exp.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <ExpenseForm
          expense={editExpense}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditExpense(null); }}
        />
      )}
    </div>
  );
}
