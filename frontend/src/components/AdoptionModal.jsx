import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function AdoptionModal({ pet, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    reason: '',
    hasOtherPets: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email is required';
    if (!form.phone.match(/^[+\d\s\-()]{7,20}$/)) e.phone = 'Valid phone is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (form.reason.trim().length < 20) e.reason = 'Reason must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setSubmitting(true);
    try {
      await api.post('/adoption-requests', { ...form, petId: pet._id });
      toast.success(`🐾 Adoption request for ${pet.name} submitted!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>🐾 Adopt {pet.name}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="fullName" className="form-control" value={form.fullName} onChange={handleChange} />
              {errors.fullName && <p className="form-error">⚠ {errors.fullName}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input name="phone" className="form-control" placeholder="+1 555 000 0000" value={form.phone} onChange={handleChange} />
            {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Home Address *</label>
            <input name="address" className="form-control" placeholder="123 Main St, City, State" value={form.address} onChange={handleChange} />
            {errors.address && <p className="form-error">⚠ {errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Why do you want to adopt {pet.name}? *</label>
            <textarea name="reason" className="form-control" rows={4} placeholder="Tell us about your home, lifestyle, and why you'd be a great match…" value={form.reason} onChange={handleChange} />
            <p style={{ fontSize: '0.75rem', color: form.reason.length < 20 ? 'var(--danger)' : 'var(--text-dim)', marginTop: '4px' }}>
              {form.reason.length}/1000 characters (min 20)
            </p>
            {errors.reason && <p className="form-error">⚠ {errors.reason}</p>}
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox" name="hasOtherPets" id="hasOtherPets"
              checked={form.hasOtherPets} onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="hasOtherPets" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
              I currently have other pets at home
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : '🐾 Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
