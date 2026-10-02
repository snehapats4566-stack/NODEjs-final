import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AdoptionModal from '../components/AdoptionModal';
import { ArrowLeft, Heart, Calendar, Tag, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5050';
const SPECIES_EMOJI = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };
const getPetPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return /^https?:\/\//i.test(photoPath) ? photoPath : `${UPLOADS_URL}/${photoPath}`;
};

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await api.get(`/pets/${id}`);
        setPet(data.data);
      } catch {
        toast.error('Pet not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/pets/${id}/status`, { status: newStatus });
      setPet(data.data);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${pet.name}?`)) return;
    try {
      await api.delete(`/pets/${id}`);
      toast.success('Pet deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete pet');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!pet) return null;

  const photoUrl = getPetPhotoUrl(pet.photoPath);

  return (
    <div className="container">
      <div className="pet-detail">
        {/* Back */}
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to all pets
        </Link>

        <div className="pet-detail-hero">
          {/* Photo */}
          <div className="pet-detail-img">
            {photoUrl ? (
              <img src={photoUrl} alt={pet.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'var(--bg-card2)' }}>
                {SPECIES_EMOJI[pet.species] || '🐾'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pet-detail-info">
            <span className={`status-badge status-${pet.status}`} style={{ position: 'static', display: 'inline-block', marginBottom: '12px' }}>
              {pet.status}
            </span>
            <h1 className="pet-detail-name">{pet.name}</h1>

            <div className="pet-attrs">
              <div className="pet-attr">
                <div className="pet-attr-label">Species</div>
                <div className="pet-attr-value">{SPECIES_EMOJI[pet.species]} {pet.species}</div>
              </div>
              <div className="pet-attr">
                <div className="pet-attr-label">Breed</div>
                <div className="pet-attr-value">{pet.breed}</div>
              </div>
              <div className="pet-attr">
                <div className="pet-attr-label">Age</div>
                <div className="pet-attr-value">{pet.age} year{pet.age !== 1 ? 's' : ''}</div>
              </div>
              <div className="pet-attr">
                <div className="pet-attr-label">Gender</div>
                <div className="pet-attr-value" style={{ textTransform: 'capitalize' }}>{pet.gender}</div>
              </div>
            </div>

            {pet.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>{pet.description}</p>
            )}

            {/* Action Buttons */}
            {isAdmin ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <Link to={`/admin/edit-pet/${pet._id}`} className="btn btn-ghost">
                  ✏️ Edit
                </Link>
                {pet.status !== 'available' && (
                  <button className="btn btn-success" disabled={updating} onClick={() => handleStatusChange('available')}>
                    ✅ Mark Available
                  </button>
                )}
                {pet.status !== 'adopted' && (
                  <button className="btn btn-primary" disabled={updating} onClick={() => handleStatusChange('adopted')}>
                    🏠 Mark Adopted
                  </button>
                )}
                {pet.status !== 'pending' && (
                  <button className="btn btn-accent" disabled={updating} onClick={() => handleStatusChange('pending')}>
                    ⏳ Mark Pending
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑 Delete
                </button>
              </div>
            ) : (
              pet.status === 'available' ? (
                user ? (
                  <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                    <Heart size={18} /> Request Adoption
                  </button>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>
                      Please log in to submit an adoption request.
                    </p>
                    <Link to="/login" className="btn btn-primary btn-lg">Login to Adopt</Link>
                  </div>
                )
              ) : (
                <div className="alert alert-error">
                  This pet is <strong style={{ marginLeft: 4 }}>{pet.status}</strong> and not accepting requests.
                </div>
              )
            )}
          </div>
        </div>

        <div className="divider" />
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
          Listed by <strong style={{ color: 'var(--text-muted)' }}>{pet.addedBy?.name || 'Shelter Admin'}</strong> &nbsp;·&nbsp;
          Added {new Date(pet.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {showModal && (
        <AdoptionModal pet={pet} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
