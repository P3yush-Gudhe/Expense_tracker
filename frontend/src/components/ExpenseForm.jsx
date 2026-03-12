import { useState } from 'react';
import API from '../context/api';
import { X, DollarSign } from 'lucide-react';

import { CATEGORIES, CATEGORY_EMOJI } from '../constants/categories';


export default function ExpenseForm({ expense, onSaved, onClose }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    amount: expense?.amount || '',
    category: expense?.category || 'Food',
    description: expense?.description || '',
    date: expense?.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    tags: expense?.tags?.join(', ') || ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return setError('Please enter a valid amount greater than 0');
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      let data;
      if (isEdit) {
        ({ data } = await API.put(`/expenses/${expense._id}`, payload));
      } else {
        ({ data } = await API.post('/expenses', payload));
      }
      onSaved(data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <DollarSign size={18} />
          </div>
          <div className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={handleChange} required autoFocus={!isEdit} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input select-input" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" name="description" type="text" placeholder="What was this expense for?" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" name="tags" type="text" placeholder="lunch, work (comma separated)" value={form.tags} onChange={handleChange} />
            </div>
          </div>

          {/* Quick category pills */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Quick select</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm(f => ({ ...f, category: c }))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${form.category === c ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.category === c ? 'var(--primary-light)' : 'var(--bg-surface-2)',
                    color: form.category === c ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'all var(--transition)'
                  }}
                >
                  {CATEGORY_EMOJI[c]} {c}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
