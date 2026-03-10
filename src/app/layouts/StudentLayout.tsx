import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, UserCircle, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { ROLES, ROUTES } from '../utils/constants';

const navItems = [
  { to: ROUTES.STUDENT.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.STUDENT.ARTICLES, label: 'Browse Articles', icon: BookOpen }
];

export default function StudentLayout() {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authUser) { navigate(ROUTES.LOGIN); return; }
    if (authUser.role !== ROLES.STUDENT) { navigate(ROUTES.TEACHER.DASHBOARD); return; }
  }, [authUser]);

  if (!authUser || authUser.role !== ROLES.STUDENT) return null;

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">EduLearn</div>
          <div className="text-sky-300 text-xs">Student Portal</div>
        </div>
      </div>
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
            {authUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm truncate">{authUser.name}</div>
            <div className="text-slate-500 text-xs truncate">{authUser.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <span className="text-slate-800 font-semibold">EduLearn — Student</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
