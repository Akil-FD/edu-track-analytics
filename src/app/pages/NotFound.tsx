import { Link } from 'react-router';
import { GraduationCap, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={32} className="text-indigo-400" />
        </div>
        <h1 className="text-white text-6xl font-bold mb-4">404</h1>
        <p className="text-slate-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
