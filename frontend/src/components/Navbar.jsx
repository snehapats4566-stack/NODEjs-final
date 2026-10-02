import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/axios';
import { LogOut, PawPrint, LayoutDashboard, Heart, PlusCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const avatarUrl = user?.profilePhoto
    ? `${API_BASE_URL}/${user.profilePhoto}`
    : null;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon"><PawPrint className="brand-mark" aria-hidden="true" /></span>
            <span>PawHaven</span>
          </Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>Browse Pets</span>
            </NavLink>

            {user ? (
              <>
                {!isAdmin && (
                  <NavLink to="/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Heart size={15} style={{ display: 'inline' }} />
                    <span> My Requests</span>
                  </NavLink>
                )}
                {isAdmin && (
                  <>
                    <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <LayoutDashboard size={15} style={{ display: 'inline' }} />
                      <span> Admin</span>
                      <span className="nav-badge">Admin</span>
                    </NavLink>
                    <Link to="/admin/add-pet" className="btn btn-primary btn-sm">
                      <PlusCircle size={15} />
                      Add Pet
                    </Link>
                  </>
                )}
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          objectFit: 'cover', border: '2px solid var(--primary)'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        color: '#493A35', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '11px', fontWeight: 700
                      }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.name}</span>
                  </span>
                </NavLink>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
