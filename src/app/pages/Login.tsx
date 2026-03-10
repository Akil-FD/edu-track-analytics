
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { authService } from '../api/auth';
import { ROLES, ROUTES } from '../utils/constants';

export default function Login() {
  const login = useApi(authService.login);
  const { setUserData } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login.request({ email, password });
    if (result) {
      setUserData(result);
      navigate(result.user.role === ROLES.TEACHER ? ROUTES.TEACHER.DASHBOARD : ROUTES.STUDENT.DASHBOARD);
    } else {
      setError(login.error || 'Login failed');
    }
  };

  const fillDemo = (type: ROLES) => {
    setEmail(type === ROLES.TEACHER ? 'sarah.teacher@example.com' : 'john.student@example.com');
    setPassword(type === ROLES.TEACHER ? 'password123' : 'password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={ROUTES.ROOT} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl">EduLearn</span>
          </Link>
          <h1 className="text-white text-2xl mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        {/* Demo buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => fillDemo(ROLES.TEACHER)}
            className="flex-1 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-600/30 transition-colors"
          >
            Teacher Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemo(ROLES.STUDENT)}
            className="flex-1 py-2 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-300 text-sm hover:bg-sky-600/30 transition-colors"
          >
            Student Demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={login.loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-60"
          >
            {login.loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
          <p className="text-center text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-indigo-400 hover:text-indigo-300">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

