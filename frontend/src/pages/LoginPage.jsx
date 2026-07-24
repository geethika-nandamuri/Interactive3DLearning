import React, { useState, useEffect } from 'react';
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

const LoginPage = () => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Feedback states
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNav();
  const { login, register, forgotPassword } = useAuth();

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Clear feedback states when switching auth views
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [view]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (view === 'login') {
        await login(email, password, rememberMe);
        navigate('/dashboard');
      } else if (view === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register(name, email, password);
        navigate('/dashboard');
      } else if (view === 'forgot') {
        const res = await forgotPassword(email);
        setSuccessMessage(res.message || 'Password reset instructions have been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 relative text-white font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />

      {/* Back button */}
      <RouterLink
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Home
      </RouterLink>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-soft">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-bold text-xl mx-auto mb-4">
            3D
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {view === 'login' && 'Sign in to SpatialLearn'}
            {view === 'register' && 'Create your account'}
            {view === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {view === 'login' && 'Enter your credentials to access the 3D dashboard'}
            {view === 'register' && 'Get access to advanced spatial models'}
            {view === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Alert Feedback boxes */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-medium text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {view === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {/* Remember Me Toggle */}
          {view === 'login' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-white/[0.03] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4 accent-primary cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-400 select-none cursor-pointer font-medium">
                Remember Me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {view === 'login' && 'Sign In'}
                {view === 'register' && 'Register Account'}
                {view === 'forgot' && 'Send Recovery Email'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer switches */}
        <div className="text-center mt-6 text-sm text-slate-400">
          {view === 'login' && (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setView('register')} className="text-primary hover:underline font-semibold bg-transparent border-none cursor-pointer">
                Register here
              </button>
            </p>
          )}
          {view === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="text-primary hover:underline font-semibold bg-transparent border-none cursor-pointer">
                Sign in
              </button>
            </p>
          )}
          {view === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button onClick={() => setView('login')} className="text-primary hover:underline font-semibold bg-transparent border-none cursor-pointer">
                Back to login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
