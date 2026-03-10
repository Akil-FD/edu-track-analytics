import { useRouteError, Link } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h1 className="text-white text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-slate-400 mb-2">Something went wrong</p>
        <p className="text-slate-500 text-sm mb-8">
          {error?.message || "An unexpected error occurred"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            <RefreshCw size={18} />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
