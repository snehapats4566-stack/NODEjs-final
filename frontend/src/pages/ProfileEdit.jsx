import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', bio: '', city: '', state: '', phone: '',
    preferredSpecies: '', homeType: '', housingStatus: '',
    hasGarden: false, hasOtherPets: false,
    showEmail: false, showPhone: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      if (data.data) {
        const d = data.data;
        setProfile({
          name: d.name || '', bio: d.bio || '', city: d.city || '', 
          state: d.state || '', phone: d.phone || '',
          preferredSpecies: d.preferredSpecies || '', homeType: d.homeType || '', 
          housingStatus: d.housingStatus || '',
          hasGarden: !!d.hasGarden, hasOtherPets: !!d.hasOtherPets,
          showEmail: !!d.showEmail, showPhone: !!d.showPhone
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', profile);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await api.post('/profile/photo', formData);
      toast.success('Photo updated');
      fetchProfile(); // reload to get new photo (which we didn't include in local state for simplicity, but could)
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="admin-card" style={{ padding: '2rem', marginTop: '1rem' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-input" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">City</label>
            <input type="text" name="city" value={profile.city} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">State</label>
            <input type="text" name="state" value={profile.state} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Bio</label>
          <textarea name="bio" value={profile.bio} onChange={handleChange} className="form-input" rows="3"></textarea>
        </div>

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Adoption Preferences</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Preferred Species</label>
            <select name="preferredSpecies" value={profile.preferredSpecies} onChange={handleChange} className="form-input">
              <option value="">Any</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Home Type</label>
            <select name="homeType" value={profile.homeType} onChange={handleChange} className="form-input">
              <option value="">Select...</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="hasGarden" checked={profile.hasGarden} onChange={handleChange} />
            I have a garden
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="hasOtherPets" checked={profile.hasOtherPets} onChange={handleChange} />
            I have other pets
          </label>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Privacy</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="showEmail" checked={profile.showEmail} onChange={handleChange} />
            Show Email on Public Profile
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="showPhone" checked={profile.showPhone} onChange={handleChange} />
            Show Phone on Public Profile
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
