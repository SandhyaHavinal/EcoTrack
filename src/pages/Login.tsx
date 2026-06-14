import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name.');
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Beautiful ambient background glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-500/5 blur-[90px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-md z-10 transition-all duration-300">
        
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 animate-pulse-soft">
            <Leaf className="w-9 h-9 text-emerald-400 fill-emerald-400/20" />
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">EcoTrack</span>
          </h1>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Start tracking, reducing, and offsetting your carbon emissions today.
          </p>
        </div>

        {/* Auth form card */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
          
          {/* Tab selector */}
          <div className="flex rounded-xl bg-slate-800/50 p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isSignUp 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isSignUp 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  disabled={loading}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-700/60"></div>
            <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-slate-700/60"></div>
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 border border-slate-700/60 hover:bg-slate-800/30 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.88 3C6.3 7.63 8.92 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.4 3.57l3.72 2.88c2.18-2 3.69-4.96 3.69-8.61z"
              />
              <path
                fill="#FBBC05"
                d="M5.38 10.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 2.92A11.967 11.967 0 000 8.21c0 1.92.45 3.74 1.25 5.37l4.13-3.08z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.72-2.88c-1.03.69-2.35 1.1-4.24 1.1-3.08 0-5.7-2.59-6.62-5.46L1.5 15.88C3.4 19.73 7.35 23 12 23z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
