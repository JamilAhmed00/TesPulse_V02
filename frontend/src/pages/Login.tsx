import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignin } from '../hooks/api/auth';
import Header from '../components/Header';
import { Mail, Lock, ArrowRight, Bot, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const signinMutation = useSignin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signinMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        onError: (error: any) => {
          console.error('Login error:', error);
        },
      }
    );
  };

  const loading = signinMutation.isPending;
  const error = signinMutation.error
    ? (signinMutation.error as any)?.response?.data?.detail || 'Failed to sign in'
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      {/* Background Effects - z-0 to stay behind content */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <div className="w-full max-w-md relative z-10">
          <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 md:p-10">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 rounded-2xl shadow-lg shadow-violet-500/30">
                  <Bot className="text-white" size={36} />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="text-amber-400" size={20} />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Sign in to continue to TestPulse</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail 
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === 'email' ? 'text-violet-400' : 'text-slate-500'
                    }`} 
                    size={20} 
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border-2 rounded-xl transition-all duration-200 text-white placeholder-slate-500 ${
                      focusedField === 'email'
                        ? 'border-violet-500 ring-2 ring-violet-500/20'
                        : 'border-slate-700 hover:border-slate-600'
                    } focus:outline-none`}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock 
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === 'password' ? 'text-violet-400' : 'text-slate-500'
                    }`} 
                    size={20} 
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border-2 rounded-xl transition-all duration-200 text-white placeholder-slate-500 ${
                      focusedField === 'password'
                        ? 'border-violet-500 ring-2 ring-violet-500/20'
                        : 'border-slate-700 hover:border-slate-600'
                    } focus:outline-none`}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={20} />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-violet-400 hover:text-violet-300 font-semibold hover:underline transition-colors inline-flex items-center gap-1"
                >
                  Create Account
                  <ArrowRight size={14} className="inline" />
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Social Login Placeholder */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
