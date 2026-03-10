import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, UserPlus, GraduationCap as TeacherIcon, BookOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { authService } from '../api/auth';
import { ROLES, ROUTES } from '../utils/constants';

export default function Register() {
  const register = useApi(authService.register);
  const { setUserData } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ROLES>(ROLES.STUDENT);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register.request({ name, email, password, role });
    setLoading(false);
    if (result) {
      setUserData(result);
      navigate(result.user.role === ROLES.TEACHER ? ROUTES.TEACHER.DASHBOARD : ROUTES.STUDENT.DASHBOARD);
    } else {
      console.log(register.error);
      
      setError(register.error || 'Registration failed');
    }
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
          <h1 className="text-white text-2xl mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm">Join EduLearn today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-slate-300 text-sm mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(ROLES.STUDENT)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${role === ROLES.STUDENT
                  ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
              >
                <BookOpen size={24} />
                <span className="text-sm">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(ROLES.TEACHER)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${role === ROLES.TEACHER
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
              >
                <TeacherIcon size={24} />
                <span className="text-sm">Teacher</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
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
                placeholder="Min 6 characters"
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
