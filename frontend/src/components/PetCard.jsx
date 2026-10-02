import { useNavigate } from 'react-router-dom';

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5050';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };
const getPetPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return /^https?:\/\//i.test(photoPath) ? photoPath : `${UPLOADS_URL}/${photoPath}`;
};

export default function PetCard({ pet }) {
  const navigate = useNavigate();

  const photoUrl = getPetPhotoUrl(pet.photoPath);

  return (
    <div className="card pet-card" onClick={() => navigate(`/pets/${pet._id}`)}>
      <div className="pet-card-img">
        {photoUrl ? (
          <img src={photoUrl} alt={pet.name} loading="lazy" />
        ) : (
          <div className="no-photo">
            <span>{SPECIES_EMOJI[pet.species] || '🐾'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No photo</span>
          </div>
        )}
        <span className={`status-badge status-${pet.status}`}>{pet.status}</span>
      </div>

      <div className="pet-card-info">
        <div className="pet-card-name">{pet.name}</div>
        <div className="pet-card-meta">
          <span className="meta-tag">{SPECIES_EMOJI[pet.species]} {pet.species}</span>
          <span className="meta-tag">{pet.breed}</span>
          <span className="meta-tag">{pet.age} yr{pet.age !== 1 ? 's' : ''}</span>
          {pet.gender && pet.gender !== 'unknown' && (
            <span className="meta-tag">{pet.gender}</span>
          )}
        </div>
        {pet.description && (
          <p className="pet-card-desc">{pet.description}</p>
        )}
      </div>
    </div>
  );
}
