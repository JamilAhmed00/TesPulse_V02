import { 
  Menu, 
  X, 
  Bot, 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  ArrowRight, 
  Bell, 
  FileText,
  Megaphone,
  User,
  LogOut,
  ChevronDown,
  Wallet,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '../store/auth';
import { useLogout } from '../hooks/api/auth';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const logoutMutation = useLogout();
  
  const showNav = isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const unreadCount = 0;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/applications', icon: BookOpen },
    { label: 'Admission', path: '/call-for-admission', icon: Megaphone },
    { label: 'Results', path: '/results', icon: BarChart3 },
    { label: 'Circulars', path: '/circulars', icon: FileText },
    { label: 'Alerts', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('testpulse_refresh_token');
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl shadow-black/20' 
        : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800/30'
    }`}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Icon Container */}
              <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 p-2 sm:p-2.5 rounded-xl shadow-lg group-hover:shadow-xl group-hover:shadow-violet-500/30 transition-all">
                <Bot className="text-white relative z-10" size={22} />
              </div>
              
              {/* Pulse Indicator */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  TestPulse
                </span>
                {!showNav && (
                  <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                    <Sparkles className="text-violet-400" size={12} />
                    <span className="text-xs font-bold text-violet-300">AI</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block font-medium">Smart Admission Ally</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative px-3 xl:px-4 py-2.5 font-medium transition-all duration-200 rounded-xl flex items-center gap-2 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`transition-all duration-200 ${isActive ? 'text-violet-400' : 'opacity-70 group-hover:opacity-100'}`} size={18} />
                    <span className="whitespace-nowrap text-sm">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center shadow-lg shadow-rose-500/30 animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* CTA Buttons for Landing Page */}
          {!showNav && !user && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-slate-300 hover:text-white font-semibold transition-colors rounded-xl hover:bg-slate-800/50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </div>
          )}

          {/* User Menu for Authenticated Users */}
          {showNav && user && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/balance"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white font-medium transition-all rounded-xl hover:bg-slate-800/50 group"
              >
                <Wallet className="opacity-70 group-hover:opacity-100 transition-opacity" size={18} />
                <span className="text-sm">Balance</span>
              </Link>
              
              {/* User Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-700/50"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-violet-500/25">
                    {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-white">{user.full_name?.split(' ')[0] || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{user.email}</p>
                  </div>
                  <ChevronDown className={`text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-sm font-semibold text-white">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      <User className="opacity-70" size={18} />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                    <Link
                      to="/balance"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors lg:hidden"
                    >
                      <Wallet className="opacity-70" size={18} />
                      <span className="text-sm font-medium">Balance</span>
                    </Link>
                    <div className="border-t border-slate-700/50 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="opacity-70" size={18} />
                      <span className="text-sm font-medium">{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="transition-transform rotate-90" />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-slate-700/50 mt-4 pt-6 animate-in slide-in-from-top-2">
            {showNav ? (
              <>
                {/* User Info Section */}
                {user && (
                  <div className="px-4 py-3 mb-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-500/25">
                        {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.full_name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <nav className="flex flex-col gap-1.5 mb-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className={`transition-all ${isActive ? 'text-violet-400' : 'opacity-70 group-hover:opacity-100'}`} size={20} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-rose-500/30">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="border-t border-slate-700/50 pt-4 space-y-1.5">
                  <Link
                    to="/balance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors font-medium"
                  >
                    <Wallet className="opacity-70" size={20} />
                    <span>Balance</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors font-medium"
                  >
                    <User className="opacity-70" size={20} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium disabled:opacity-50"
                  >
                    <LogOut className="opacity-70" size={20} />
                    <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/30 flex items-center justify-between"
                >
                  <span>Get Started</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
