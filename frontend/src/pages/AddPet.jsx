import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, ArrowLeft } from 'lucide-react';

export default function AddPet() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: '', breed: '', age: '', species: 'dog', gender: 'unknown', description: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      api.get(`/pets/${id}`)
        .then(({ data }) => {
          const p = data.data;
          setForm({ name: p.name, breed: p.breed, age: p.age, species: p.species, gender: p.gender, description: p.description || '' });
          if (p.photoPath) setPreview(`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000'}/${p.photoPath}`);
        })
        .catch(() => toast.error('Failed to load pet'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.breed.trim()) e.breed = 'Breed is required';
    if (form.age === '' || isNaN(form.age) || Number(form.age) < 0) e.age = 'Valid age is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, val]) => formData.append(k, val));
      if (photo) formData.append('photo', photo);

      if (id) {
        await api.put(`/pets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pet updated successfully!');
      } else {
        await api.post('/pets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pet listing created!');
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pet');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ maxWidth: '680px', paddingTop: '40px', paddingBottom: '60px' }}>
      <Link to="/admin" className="back-link"><ArrowLeft size={16} /> Back to Admin</Link>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-body">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            {id ? '✏️ Edit Pet' : '🐾 Add New Pet'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
            {id ? 'Update this pet\'s information.' : 'Fill in the details to add a new pet to the shelter.'}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Photo Upload */}
            <div className="form-group">
              <label className="form-label">Pet Photo</label>
              <div
                className="upload-area"
                onClick={() => fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                {preview ? (
                  <img src={preview} alt="Preview" className="upload-preview" />
                ) : (
                  <div>
                    <Upload size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Click to upload a photo (max 5 MB)</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '4px' }}>JPEG, PNG, WebP, GIF</p>
                  </div>
                )}
              </div>
              {preview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }} onClick={() => { setPhoto(null); setPreview(null); }}>
                  Remove photo
                </button>
              )}
            </div>

            {/* Name & Breed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Pet Name *</label>
                <input name="name" className="form-control" placeholder="Buddy" value={form.name} onChange={handleChange} />
                {errors.name && <p className="form-error">⚠ {errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Breed *</label>
                <input name="breed" className="form-control" placeholder="Golden Retriever" value={form.breed} onChange={handleChange} />
                {errors.breed && <p className="form-error">⚠ {errors.breed}</p>}
              </div>
            </div>

            {/* Age, Species, Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Age (years) *</label>
                <input name="age" type="number" min="0" max="30" step="0.5" className="form-control" placeholder="2" value={form.age} onChange={handleChange} />
                {errors.age && <p className="form-error">⚠ {errors.age}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Species</label>
                <select name="species" className="form-control" value={form.species} onChange={handleChange}>
                  {['dog', 'cat', 'bird', 'rabbit', 'other'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                  {['male', 'female', 'unknown'].map(g => (
                    <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={4}
                placeholder="Tell adopters about this pet's personality, energy level, and special traits…"
                value={form.description}
                onChange={handleChange}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {form.description.length}/500 characters
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Link to="/admin" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : id ? '✏️ Update Pet' : '🐾 Add Pet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
