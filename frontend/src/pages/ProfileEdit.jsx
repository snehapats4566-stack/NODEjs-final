import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Camera, Loader2, X, Check, Upload, Trash2, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const imgUrl = (p) => {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${API_BASE_URL}/${p}`;
};

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const photoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);         // existing photo path
  const [selectedPhoto, setSelectedPhoto] = useState(null);       // new File
  const [photoPreview, setPhotoPreview] = useState(null);         // preview blob url
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [deletingIndex, setDeletingIndex] = useState(null);

  const [profile, setProfile] = useState({
    name: '', bio: '', city: '', state: '', country: '', phone: '',
    occupation: '', education: '', languages: '', interests: '',
    adoptionReason: '', previousPetExperience: '',
    preferredSpecies: '', preferredBreeds: '', preferredAgeRange: '',
    preferredGender: '', homeType: '', housingStatus: '',
    hasGarden: false, hasChildren: false, hasOtherPets: false,
    householdSize: 1, careAvailability: '', preferredLocation: '',
    showEmail: false, showPhone: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      if (data.data) {
        const d = data.data;
        setCurrentPhoto(d.profilePhoto || null);
        setGallery(d.gallery || []);
        setProfile({
          name: d.name || '', bio: d.bio || '', city: d.city || '',
          state: d.state || '', country: d.country || '', phone: d.phone || '',
          occupation: d.occupation || '', education: d.education || '',
          languages: d.languages || '', interests: d.interests || '',
          adoptionReason: d.adoptionReason || '', previousPetExperience: d.previousPetExperience || '',
          preferredSpecies: d.preferredSpecies || '', preferredBreeds: d.preferredBreeds || '',
          preferredAgeRange: d.preferredAgeRange || '', preferredGender: d.preferredGender || '',
          homeType: d.homeType || '', housingStatus: d.housingStatus || '',
          hasGarden: !!d.hasGarden, hasChildren: !!d.hasChildren, hasOtherPets: !!d.hasOtherPets,
          householdSize: d.householdSize || 1, careAvailability: d.careAvailability || '',
          preferredLocation: d.preferredLocation || '',
          showEmail: !!d.showEmail, showPhone: !!d.showPhone,
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ─── Profile info save ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/profile', profile);
      updateUser({ name: profile.name });
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ─── Profile photo ──────────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max 5 MB.');
      return;
    }
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const cancelPhotoSelection = () => {
    setSelectedPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const savePhoto = async () => {
    if (!selectedPhoto) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', selectedPhoto);
      const { data } = await api.post('/profile/photo', fd);
      setCurrentPhoto(data.data.profilePhoto);
      updateUser({ profilePhoto: data.data.profilePhoto });
      toast.success('Profile photo updated!');
      cancelPhotoSelection();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deletePhoto = async () => {
    if (!currentPhoto) return;
    if (!window.confirm('Remove your profile photo?')) return;
    try {
      await api.delete('/profile/photo');
      setCurrentPhoto(null);
      updateUser({ profilePhoto: null });
      toast.success('Photo removed');
    } catch {
      toast.error('Failed to remove photo');
    }
  };

  // ─── Gallery ────────────────────────────────────────────────────
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`Invalid type: ${f.name}`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`Too large: ${f.name} (max 5 MB)`);
        return;
      }
    }

    if (gallery.length + files.length > 10) {
      toast.error(`Gallery limit is 10. You can add ${10 - gallery.length} more.`);
      return;
    }

    setUploadingGallery(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('photos', f));
      const { data } = await api.post('/profile/gallery', fd);
      setGallery(data.data);
      toast.success(`${files.length} photo(s) added to gallery`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const deleteGalleryPhoto = async (index) => {
    if (!window.confirm('Remove this photo from your gallery?')) return;
    setDeletingIndex(index);
    try {
      const { data } = await api.delete(`/profile/gallery/${index}`);
      setGallery(data.data);
      toast.success('Photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setDeletingIndex(null);
    }
  };

  // ─── Field helper ───────────────────────────────────────────────
  const Field = ({ label, name, type = 'text', ...rest }) => (
    <div>
      <label className="form-label">{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={profile[name]} onChange={handleChange} className="form-control" rows="3" {...rest} />
      ) : type === 'select' ? (
        <select name={name} value={profile[name]} onChange={handleChange} className="form-control" {...rest}>
          {rest.children}
        </select>
      ) : (
        <input type={type} name={name} value={profile[name]} onChange={handleChange} className="form-control" {...rest} />
      )}
    </div>
  );

  const CheckField = ({ label, name }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
      <input
        type="checkbox" name={name} checked={profile[name]} onChange={handleChange}
        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-dark)' }}
      />
      {label}
    </label>
  );

  const photoDisplayUrl = photoPreview || imgUrl(currentPhoto);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '860px', margin: '0 auto' }}>

      {/* Back */}
      <button onClick={() => navigate('/profile')} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Edit Profile
      </h2>

      {/* ─── Photo Section ─────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
      }}>
        <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Profile Photo</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Current / Preview */}
          <div
            onClick={() => photoInputRef.current?.click()}
            style={{
              width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden',
              cursor: 'pointer', border: '3px solid var(--primary)', background: 'var(--bg-card2)',
              position: 'relative', flexShrink: 0,
            }}
          >
            {photoDisplayUrl ? (
              <img src={photoDisplayUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)',
              }}>
                <Camera size={28} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>Add Photo</span>
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(73,58,53,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            >
              <Camera size={20} color="white" />
            </div>
          </div>

          <input ref={photoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handlePhotoSelect} style={{ display: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => photoInputRef.current?.click()}>
              <Upload size={14} /> Choose Photo
            </button>
            {selectedPhoto && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={savePhoto} disabled={uploadingPhoto}>
                  {uploadingPhoto ? (
                    <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading…</>
                  ) : (
                    <><Check size={14} /> Save Photo</>
                  )}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={cancelPhotoSelection} disabled={uploadingPhoto}>
                  <X size={14} /> Cancel
                </button>
              </div>
            )}
            {!selectedPhoto && currentPhoto && (
              <button type="button" onClick={deletePhoto} style={{
                background: 'none', border: 'none', color: 'var(--danger)',
                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Trash2 size={12} /> Remove Photo
              </button>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>JPG, PNG or WEBP. Max 5 MB.</p>
          </div>
        </div>
      </div>

      {/* ─── Profile Form ──────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Basic Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Full Name" name="name" required />
            <Field label="Phone" name="phone" />
            <Field label="City" name="city" />
            <Field label="State" name="state" />
            <Field label="Country" name="country" />
            <Field label="Occupation" name="occupation" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Bio" name="bio" type="textarea" placeholder="Tell us about yourself…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <Field label="Education" name="education" />
            <Field label="Languages" name="languages" placeholder="e.g. English, Hindi" />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Interests / Hobbies" name="interests" placeholder="e.g. Reading, Hiking" />
            </div>
          </div>
        </div>

        {/* Adoption Preferences */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>🐾 Adoption Preferences</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Preferred Species" name="preferredSpecies" type="select">
              <option value="">Any</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </Field>
            <Field label="Preferred Breeds" name="preferredBreeds" placeholder="e.g. Labrador, Siamese" />
            <Field label="Preferred Age Range" name="preferredAgeRange" type="select">
              <option value="">Any</option>
              <option value="Baby">Baby</option>
              <option value="Young">Young</option>
              <option value="Adult">Adult</option>
              <option value="Senior">Senior</option>
            </Field>
            <Field label="Preferred Gender" name="preferredGender" type="select">
              <option value="">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Field>
            <Field label="Home Type" name="homeType" type="select">
              <option value="">Select…</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Farm">Farm</option>
              <option value="Other">Other</option>
            </Field>
            <Field label="Housing Status" name="housingStatus" type="select">
              <option value="">Select…</option>
              <option value="Own">Own</option>
              <option value="Rent">Rent</option>
            </Field>
            <Field label="Household Size" name="householdSize" type="number" min="1" max="20" />
            <Field label="Care Availability" name="careAvailability" type="select">
              <option value="">Select…</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Limited">Limited</option>
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Why do you want to adopt?" name="adoptionReason" type="textarea" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Previous Pet Experience" name="previousPetExperience" type="textarea" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
            <CheckField label="Has Garden / Balcony" name="hasGarden" />
            <CheckField label="Has Children" name="hasChildren" />
            <CheckField label="Has Other Pets" name="hasOtherPets" />
          </div>
        </div>

        {/* Privacy */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>🔒 Privacy Settings</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <CheckField label="Show my email on public profile" name="showEmail" />
            <CheckField label="Show my phone on public profile" name="showPhone" />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* ─── Gallery Management ────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <ImageIcon size={18} /> My Gallery
          </h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{gallery.length} / 10</span>
        </div>

        {gallery.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
            {gallery.map((photo, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={imgUrl(photo)} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => deleteGalleryPhoto(i)}
                  disabled={deletingIndex === i}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.9)', border: 'none',
                    color: 'white', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {deletingIndex === i ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Trash2 size={12} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {gallery.length < 10 && (
          <div
            onClick={() => galleryInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '2rem', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.25s',
              color: 'var(--text-dim)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {uploadingGallery ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading…
              </span>
            ) : (
              <>
                <Upload size={24} style={{ marginBottom: '6px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.88rem' }}>Click to upload photos (max 5 at a time)</p>
                <p style={{ fontSize: '0.75rem' }}>JPG, PNG, WEBP. Max 5 MB each.</p>
              </>
            )}
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleGalleryUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
