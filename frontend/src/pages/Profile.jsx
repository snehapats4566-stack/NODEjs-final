import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Camera, Mail, Phone, MapPin, Heart, Shield, Pencil,
  Loader2, X, Check, Upload, Trash2, Image as ImageIcon
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Build a full URL for a backend-stored image path */
const imgUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_BASE_URL}/${relativePath}`;
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Photo upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Lightbox state
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile');
      setProfile(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // ─── Photo selection & validation ───────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG or WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 5 MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const cancelPhotoSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savePhoto = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const { data } = await api.post('/profile/photo', formData);

      // Update profile state immediately
      setProfile((prev) => ({ ...prev, profilePhoto: data.data.profilePhoto }));
      // Update AuthContext so navbar avatar updates too
      updateUser({ profilePhoto: data.data.profilePhoto });

      toast.success('Profile photo updated successfully!');
      cancelPhotoSelection();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async () => {
    if (!profile?.profilePhoto) return;
    if (!window.confirm('Remove your profile photo?')) return;
    try {
      await api.delete('/profile/photo');
      setProfile((prev) => ({ ...prev, profilePhoto: null }));
      updateUser({ profilePhoto: null });
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error('Failed to remove photo');
    }
  };

  // ─── Completion calculation ─────────────────────────────────────
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      'profilePhoto', 'name', 'city', 'bio', 'phone',
      'dateOfBirth', 'preferredSpecies', 'housingStatus',
    ];
    let filled = 0;
    fields.forEach((f) => { if (profile[f]) filled++; });
    return Math.round((filled / fields.length) * 100);
  };

  // ─── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Profile not found. Please log in again.</p>
      </div>
    );
  }

  const completion = calculateCompletion();
  const currentPhotoUrl = previewUrl || imgUrl(profile.profilePhoto);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800 }}>My Profile</h2>
        <Link to="/profile/edit" className="btn btn-primary">
          <Pencil size={15} /> Edit Profile
        </Link>
      </div>

      {/* ─── Profile Header Card ─────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div
              onClick={handleAvatarClick}
              style={{
                position: 'relative', width: '130px', height: '130px', borderRadius: '50%',
                overflow: 'hidden', cursor: 'pointer', border: '4px solid var(--primary)',
                boxShadow: '0 4px 24px rgba(250,217,200,0.35)',
                background: 'var(--bg-card2)',
              }}
            >
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              {/* Fallback initial */}
              <div style={{
                display: currentPhotoUrl ? 'none' : 'flex',
                width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: 800, color: '#493A35',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(73,58,53,0.45)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '4px',
                opacity: 0, transition: 'opacity 0.25s ease',
              }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <Camera size={22} color="white" />
                <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>Change Photo</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Save / Cancel buttons when a new file is selected */}
            {selectedFile && (
              <div style={{ display: 'flex', gap: '0.5rem', animation: 'slideDown 0.3s ease' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={savePhoto}
                  disabled={uploading}
                  style={{ minWidth: '100px' }}
                >
                  {uploading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                      Uploading…
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} /> Save Photo
                    </span>
                  )}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={cancelPhotoSelection} disabled={uploading}>
                  <X size={14} /> Cancel
                </button>
              </div>
            )}

            {/* Delete photo */}
            {!selectedFile && profile.profilePhoto && (
              <button
                onClick={deletePhoto}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-dim)',
                  fontSize: '0.78rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '4px', padding: '4px 0',
                }}
              >
                <Trash2 size={12} /> Remove photo
              </button>
            )}
          </div>

          {/* User info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {profile.name}
              {profile.role === 'admin' && <span className="nav-badge" style={{ position: 'static' }}>Admin</span>}
            </h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              {(profile.city || profile.state) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {[profile.city, profile.state].filter(Boolean).join(', ')}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {profile.email}
              </span>
              {profile.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
            </div>
            {profile.bio ? (
              <p style={{ maxWidth: '550px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{profile.bio}</p>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                No bio yet — <Link to="/profile/edit" style={{ color: 'var(--primary-dark)' }}>add one</Link>
              </p>
            )}
          </div>

          {/* Completion */}
          <div style={{
            width: '180px', background: 'var(--bg-card2)', padding: '1.25rem',
            borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Completion</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: completion === 100 ? 'var(--success)' : 'var(--primary-dark)', marginBottom: '8px' }}>
              {completion}%
            </div>
            <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${completion}%`, borderRadius: '3px',
                background: completion === 100
                  ? 'var(--success)'
                  : 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                transition: 'width 0.5s ease',
              }} />
            </div>
            {completion < 100 && (
              <p style={{ fontSize: '0.72rem', marginTop: '8px', color: 'var(--warning)' }}>
                Complete your profile to boost adoption chances!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Info Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Adoption Preferences */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
            <Heart size={18} color="var(--primary-dark)" /> Adoption Preferences
          </h4>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              ['Preferred Species', profile.preferredSpecies || 'Any'],
              ['Preferred Breeds', profile.preferredBreeds || 'Any'],
              ['Preferred Age Range', profile.preferredAgeRange || 'Any'],
              ['Home Type', profile.homeType || '—'],
              ['Housing Status', profile.housingStatus || '—'],
              ['Has Garden', profile.hasGarden ? 'Yes' : 'No'],
              ['Has Other Pets', profile.hasOtherPets ? 'Yes' : 'No'],
              ['Has Children', profile.hasChildren ? 'Yes' : 'No'],
              ['Household Size', profile.householdSize || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '1rem' }}>
            <Shield size={18} color="var(--accent)" /> Privacy Settings
          </h4>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              ['Email Visibility', profile.showEmail ? '🌐 Public' : '🔒 Private'],
              ['Phone Visibility', profile.showPhone ? '🌐 Public' : '🔒 Private'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
            Manage visibility in <Link to="/profile/edit" style={{ color: 'var(--primary-dark)' }}>Edit Profile</Link>.
          </p>
        </div>
      </div>

      {/* ─── Gallery ─────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <ImageIcon size={18} color="var(--primary-dark)" /> My Photos
          </h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', background: 'var(--bg-card2)', padding: '4px 10px', borderRadius: '20px' }}>
            {profile.gallery?.length || 0} / 10
          </span>
        </div>

        {profile.gallery && profile.gallery.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {profile.gallery.map((photo, index) => (
              <div
                key={index}
                onClick={() => setLightboxImg(imgUrl(photo))}
                style={{
                  aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  background: 'var(--bg-card2)', cursor: 'pointer', transition: 'transform 0.25s ease',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={imgUrl(photo)}
                  alt={`Gallery ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = ''; e.target.alt = '⚠️'; }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-dim)',
            background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)',
            border: '2px dashed var(--border)',
          }}>
            <Upload size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>No photos yet.</p>
            <Link to="/profile/edit" style={{ color: 'var(--primary-dark)', fontSize: '0.88rem' }}>
              Upload photos from Edit Profile →
            </Link>
          </div>
        )}
      </div>

      {/* ─── Lightbox ────────────────────────────────────────────── */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(73,58,53,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', cursor: 'pointer', animation: 'fadeIn 0.2s ease',
          }}
        >
          <img
            src={lightboxImg}
            alt="Full size"
            style={{
              maxWidth: '90vw', maxHeight: '85vh', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)', objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
