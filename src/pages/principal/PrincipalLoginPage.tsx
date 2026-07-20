import { useState } from 'react';
import { Crown, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';

export default function PrincipalLoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigateTo('/principal/dashboard');
    }
  };

  return (
    <div className="animate-fade-in min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 bg-ink-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="University Campus"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-900/80 to-amber-950/50" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <button onClick={() => navigateTo('/')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-900 border border-ink-700 flex items-center justify-center">
              <span className="font-serif text-xl font-bold text-gold-400">M</span>
            </div>
            <div className="text-left">
              <div className="font-serif text-lg font-bold">Meridian University</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400">Principal Portal</div>
            </div>
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
              <Crown size={16} className="text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Executive Access</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-balance">
              Executive
              <br />
              <span className="text-amber-400">Dashboard</span>
            </h1>
            <p className="mt-6 text-lg text-ink-300 max-w-md">
              The Office of the Principal — strategic oversight of academics, finance, and institutional performance.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-ink-400">
            <div>Institutional KPIs</div>
            <div>·</div>
            <div>Analytics</div>
            <div>·</div>
            <div>AI Insights</div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ink-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center">
              <Crown className="text-amber-400" size={20} />
            </div>
            <div className="font-serif text-lg font-bold text-ink-900">Principal Portal</div>
          </div>

          <h2 className="text-3xl font-bold text-ink-900">Principal Sign In</h2>
          <p className="mt-2 text-ink-500">Access the executive dashboard and institutional overview.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="principal@meridian.edu"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-amber-700 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm text-ink-500">
            <button onClick={() => navigateTo('/login')} className="hover:text-ink-900">
              Student Login
            </button>
            <button onClick={() => navigateTo('/teacher/login')} className="hover:text-ink-900">
              Faculty Login
            </button>
            <button onClick={() => navigateTo('/admin/login')} className="hover:text-ink-900">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
