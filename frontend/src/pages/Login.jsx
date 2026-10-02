import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PawPrint, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Where to redirect after login (preserve history if applicable)
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.password) { setError('Please enter your password.'); return; }
    
    setLoading(true);
    setError('');
    
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`, { icon: '🐾' });
      // Use role-based routing or redirect to the previous page
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper slide-up-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-icon glow-pulse">
            <PawPrint size={40} color="var(--primary-light)" />
          </div>
          <h2 className="premium-heading">Welcome Back</h2>
          <p className="subtitle">Sign in to your PawHaven account</p>
        </div>

        {error && (
          <div className="alert alert-error slide-down">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-full btn-lg premium-button" disabled={loading}>
            {loading ? (
               <span className="loading-spinner-container">
                 <span className="spinner-border"></span> Signing in...
               </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="hover-underline">Create one</Link>
        </div>
      </div>
    </div>
  );
}
