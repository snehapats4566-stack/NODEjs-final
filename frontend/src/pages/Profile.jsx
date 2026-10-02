import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Mail, Phone, MapPin, Calendar, Heart, Shield, Pencil } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      'profilePhoto', 'name', 'city', 'bio', 'phone', 
      'dateOfBirth', 'preferredSpecies', 'housingStatus'
    ];
    let filled = 0;
    fields.forEach(field => {
      if (profile[field]) filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading profile...</div>;
  if (!profile) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Profile not found</div>;

  const completion = calculateCompletion();

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Profile</h2>
        <Link to="/profile/edit" className="btn btn-primary">
          <Pencil size={15} /> Edit Profile
        </Link>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', 
              backgroundColor: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid white', boxShadow: 'var(--shadow-sm)'
            }}>
              {profile.profilePhoto ? (
                <img src={`http://localhost:5050/${profile.profilePhoto}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={40} style={{ color: 'var(--text-dim)' }} />
              )}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {profile.name} 
              {profile.role === 'admin' && <span className="nav-badge" style={{ position: 'static' }}>Admin</span>}
            </h3>
            <div style={{ color: 'var(--text-dim)', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {profile.city && profile.state && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {profile.city}, {profile.state}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14}/> {profile.email}</span>
              {profile.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14}/> {profile.phone}</span>}
            </div>
            {profile.bio && <p style={{ maxWidth: '600px' }}>{profile.bio}</p>}
          </div>
          
          <div style={{ width: '200px', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Profile Completion</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{completion}%</div>
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completion}%`, backgroundColor: 'var(--primary-color)' }}></div>
            </div>
            {completion < 100 && (
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#eab308' }}>
                Complete your profile to increase adoption chances!
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Heart size={18} /> Adoption Preferences
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Preferred Species:</strong> {profile.preferredSpecies || 'Any'}</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Home Type:</strong> {profile.homeType || 'Not specified'}</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Housing Status:</strong> {profile.housingStatus || 'Not specified'}</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Has Garden:</strong> {profile.hasGarden ? 'Yes' : 'No'}</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Has Other Pets:</strong> {profile.hasOtherPets ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Shield size={18} /> Privacy Settings
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Email Visibility:</strong> {profile.showEmail ? 'Public' : 'Private'}</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Phone Visibility:</strong> {profile.showPhone ? 'Public' : 'Private'}</li>
          </ul>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4>My Photos</h4>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>{profile.gallery?.length || 0}/10</span>
        </div>
        
        {profile.gallery && profile.gallery.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {profile.gallery.map((photo, index) => (
              <div key={index} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <img src={`http://localhost:5050/${photo}`} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
            No photos in your gallery yet. Edit profile to add some!
          </div>
        )}
      </div>
    </div>
  );
}
