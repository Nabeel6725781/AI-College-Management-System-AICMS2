import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigateTo('/login')}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to sign in
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-ink-900 mb-2">Check your email</h2>
              <p className="text-ink-500 mb-6">
                We've sent a password reset link to <span className="font-medium text-ink-900">{email}</span>.
                Follow the link to reset your password.
              </p>
              <button
                onClick={() => navigateTo('/login')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg hover:bg-ink-800 transition-all"
              >
                Back to Sign In
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink-900">Forgot password?</h2>
              <p className="mt-2 text-ink-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>

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
                      Send Reset Link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
