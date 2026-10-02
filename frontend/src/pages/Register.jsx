import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UX Features
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate password strength in real time
  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 6) strength += 1;
    if (form.password.match(/[A-Z]/)) strength += 1;
    if (form.password.match(/[0-9]/)) strength += 1;
    if (form.password.match(/[^A-Za-z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [form.password]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const getStrengthLabel = () => {
    if (form.password.length === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444'; // red
    if (passwordStrength === 2) return '#eab308'; // yellow
    if (passwordStrength >= 3) return '#22c55e'; // green
    return '#4b5563';
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (!validateEmail(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    setError('');
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Welcome to PawHaven, ${user.name}!`, { icon: '🐾' });
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.response?.data?.message || 'Server error. Please try again later.');
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
            <Sparkles size={40} color="var(--accent)" strokeWidth={1.5} />
          </div>
          <h2 className="premium-heading">Create Account</h2>
          <p className="subtitle">Join PawHaven and find your perfect pet</p>
        </div>

        {error && (
          <div className="alert alert-error slide-down">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-with-icon">
              <input
                id="reg-name"
                name="name"
                className="form-control"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-with-icon">
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="password-wrapper">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
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
            
            {/* Password Strength Indicator */}
            {form.password.length > 0 && (
              <div className="password-strength-container mt-2">
                <div className="strength-bar-bg">
                  <div 
                    className="strength-bar-fill transition-all"
                    style={{ 
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getStrengthColor()
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: getStrengthColor() }}>
                  {getStrengthLabel()}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="reg-confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                className="form-control"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                disabled={loading}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirm && form.password !== form.confirm && (
              <span className="validation-text error-text">Passwords do not match</span>
            )}
            {form.confirm && form.password === form.confirm && form.password.length >= 6 && (
              <span className="validation-text success-text">✓ Passwords match</span>
            )}
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg premium-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner-container">
                <span className="spinner-border"></span> Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="hover-underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
