import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  pending: 'status-pending',
  approved: 'status-available',
  rejected: 'status-adopted',
};

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5050';
const getPetPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return /^https?:\/\//i.test(photoPath) ? photoPath : `${UPLOADS_URL}/${photoPath}`;
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/adoption-requests')
      .then(({ data }) => setRequests(data.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800 }}>
          🐾 My Adoption Requests
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
          Track the status of your submitted adoption requests.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💌</div>
          <h3>No requests yet</h3>
          <p>Browse available pets and submit your first adoption request!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Pets</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map(req => {
            const photoUrl = getPetPhotoUrl(req.pet?.photoPath);
            return (
              <div key={req._id} className={`card request-card ${req.status}`}>
                <div className="card-body" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Pet photo */}
                  <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-card2)', flexShrink: 0 }}>
                    {photoUrl
                      ? <img src={photoUrl} alt={req.pet?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🐾</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <Link to={`/pets/${req.pet?._id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', textDecoration: 'none' }}>
                          {req.pet?.name}
                        </Link>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {req.pet?.breed} · {req.pet?.species}
                        </div>
                      </div>
                      <span className={`status-badge ${STATUS_COLOR[req.status]}`} style={{ position: 'static' }}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>📞 {req.phone}</span>
                      <span>📍 {req.address}</span>
                    </div>

                    <p style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      "{req.reason?.substring(0, 140)}{req.reason?.length > 140 ? '…' : ''}"
                    </p>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', alignSelf: 'flex-end' }}>
                    {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
