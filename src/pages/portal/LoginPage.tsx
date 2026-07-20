import { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';

export default function LoginPage() {
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
      navigateTo('/portal/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-ink-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Campus"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/90 to-ink-900/70" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <button onClick={() => navigateTo('/')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-ink-900 border border-ink-700 flex items-center justify-center">
              <span className="font-serif text-xl font-bold text-gold-400">M</span>
            </div>
            <div className="text-left">
              <div className="font-serif text-lg font-bold">Meridian University</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">Student Portal</div>
            </div>
          </button>

          <div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-balance">
              Your academic journey,
              <br />
              <span className="text-gold-400">all in one place.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-300 max-w-md">
              Access your courses, attendance, results, fees, and more — anytime, anywhere.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-ink-400">
            <div className="flex items-center gap-2"><GraduationCap size={18} className="text-gold-400" /> 80+ Programs</div>
            <div className="flex items-center gap-2"><span className="text-gold-400">12,000+</span> Students</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ink-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center">
              <span className="font-serif text-xl font-bold text-gold-400">M</span>
            </div>
            <div className="font-serif text-lg font-bold text-ink-900">Meridian Portal</div>
          </div>

          <h2 className="text-3xl font-bold text-ink-900">Welcome back</h2>
          <p className="mt-2 text-ink-500">Sign in to access your student portal.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@meridian.edu"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-11 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
                <input type="checkbox" className="rounded border-ink-300 text-ink-900 focus:ring-ink-900" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigateTo('/forgot-password')}
                className="text-sm font-medium text-ink-600 hover:text-ink-900 link-underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg transition-all duration-300 hover:bg-ink-800 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigateTo('/register')}
              className="font-medium text-ink-900 hover:text-gold-600 link-underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
