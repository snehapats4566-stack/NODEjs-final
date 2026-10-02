import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, ClipboardList, Clock3, House, MapPin, PawPrint, Pencil, Phone, Plus, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5050';
const getPetPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return /^https?:\/\//i.test(photoPath) ? photoPath : `${UPLOADS_URL}/${photoPath}`;
};

export default function AdminPanel() {
  const [tab, setTab] = useState('pets'); // 'pets' | 'requests'
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, adopted: 0, pending: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [petsRes, reqRes] = await Promise.all([
        api.get('/pets', { params: { limit: 100 } }),
        api.get('/adoption-requests'),
      ]);
      const allPets = petsRes.data.data;
      setPets(allPets);
      setRequests(reqRes.data.data);
      setStats({
        total: petsRes.data.total,
        available: allPets.filter(p => p.status === 'available').length,
        adopted: allPets.filter(p => p.status === 'adopted').length,
        pending: allPets.filter(p => p.status === 'pending').length,
      });
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePetStatusChange = async (petId, status) => {
    try {
      await api.patch(`/pets/${petId}/status`, { status });
      toast.success(`Pet status updated to "${status}"`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleRequestStatus = async (reqId, status) => {
    try {
      await api.patch(`/adoption-requests/${reqId}/status`, { status });
      toast.success(`Request ${status}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Delete ${petName}?`)) return;
    try {
      await api.delete(`/pets/${petId}`);
      toast.success('Pet deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800 }}><House className="admin-heading-icon" aria-hidden="true" /> Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage pets and adoption requests</p>
        </div>
        <Link to="/admin/add-pet" className="btn btn-primary">
          <Plus size={16} /> Add New Pet
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {[
          { label: 'Total Pets', value: stats.total, color: 'var(--primary-light)', icon: PawPrint },
          { label: 'Available', value: stats.available, color: 'var(--success)', icon: CheckCircle2 },
          { label: 'Adopted', value: stats.adopted, color: 'var(--danger)', icon: House },
          { label: 'Pending', value: stats.pending, color: 'var(--warning)', icon: Clock3 },
          { label: 'Requests', value: requests.length, color: 'var(--accent)', icon: ClipboardList },
        ].map(s => (
          <div key={s.label} className="card card-body admin-stat-card" style={{ textAlign: 'center' }}>
            <div className="admin-stat-icon-wrap"><s.icon className="admin-stat-icon" size={25} strokeWidth={1.8} aria-hidden="true" /></div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {['pets', 'requests'].map(t => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setTab(t)}
          >
            {t === 'pets' ? <><PawPrint size={15} aria-hidden="true" /> Pets</> : <><ClipboardList size={15} aria-hidden="true" /> Adoption Requests</>}
          </button>
        ))}
      </div>

      {/* Pets Tab */}
      {tab === 'pets' && (
        <div className="admin-grid">
          {pets.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><PawPrint className="admin-empty-icon" aria-hidden="true" /></div><h3>No pets listed yet</h3></div>
          ) : pets.map(pet => {
            const photoUrl = getPetPhotoUrl(pet.photoPath);
            return (
              <div key={pet._id} className="card">
                <div style={{ height: '160px', overflow: 'hidden', background: 'var(--bg-card2)', position: 'relative' }}>
                  {photoUrl
                    ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="admin-no-photo"><PawPrint className="admin-empty-icon" size={42} aria-hidden="true" /></div>
                  }
                  <span className={`status-badge status-${pet.status}`}>{pet.status}</span>
                </div>
                <div className="card-body">
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>{pet.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {pet.breed} · {pet.age} yr · {pet.species}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <Link to={`/admin/edit-pet/${pet._id}`} className="btn btn-ghost btn-sm"><Pencil size={14} aria-hidden="true" /> Edit</Link>
                    {pet.status !== 'available' && (
                      <button className="btn btn-success btn-sm" onClick={() => handlePetStatusChange(pet._id, 'available')}><CheckCircle2 size={14} aria-hidden="true" /> Available</button>
                    )}
                    {pet.status !== 'adopted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handlePetStatusChange(pet._id, 'adopted')}><House size={14} aria-hidden="true" /> Adopted</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePet(pet._id, pet.name)} aria-label={`Delete ${pet.name}`} title="Delete pet"><Trash2 size={14} aria-hidden="true" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="admin-grid">
          {requests.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><ClipboardList className="admin-empty-icon" aria-hidden="true" /></div><h3>No adoption requests yet</h3></div>
          ) : requests.map(req => (
            <div key={req._id} className={`card request-card ${req.status}`}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{req.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.email}</div>
                  </div>
                  <span className={`status-badge status-${req.status}`}>{req.status}</span>
                </div>

                <div style={{ background: 'var(--glass)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '12px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Pet: </span>
                  <strong>{req.pet?.name || 'N/A'}</strong>
                  <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>({req.pet?.breed})</span>
                </div>

                <p className="admin-request-detail"><Phone size={14} aria-hidden="true" /> {req.phone}</p>
                <p className="admin-request-detail admin-request-address"><MapPin size={14} aria-hidden="true" /> {req.address}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  <em>"{req.reason?.substring(0, 120)}{req.reason?.length > 120 ? '…' : ''}"</em>
                </p>

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleRequestStatus(req._id, 'approved')}><Check size={14} aria-hidden="true" /> Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRequestStatus(req._id, 'rejected')}><X size={14} aria-hidden="true" /> Reject</button>
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
