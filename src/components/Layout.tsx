import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calculator, 
  Map, 
  Trophy, 
  BookOpen, 
  BarChart3, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Leaf 
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Travel Tracker', path: '/travel-tracker', icon: Map },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Eco Hub', path: '/education', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Add Admin item if role is admin
  if (userProfile?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen z-10 p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <Leaf className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
          <span className="font-outfit font-bold text-2xl tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            EcoTrack
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? '' : 'text-slate-400 group-hover:text-slate-900'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Settings */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <span className="text-sm font-medium">Theme</span>
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {userProfile && (
            <div className="flex items-center gap-3 px-2">
              <img 
                src={userProfile.profilePhoto || 'https://api.dicebear.com/7.x/adventurer/svg?seed=EcoUser'} 
                alt={userProfile.name}
                className="w-10 h-10 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{userProfile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile.points} pts</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Header for Mobile */}
      <header className="lg:hidden glass-panel border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
          <span className="font-outfit font-bold text-xl tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            EcoTrack
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setMobileMenuOpen(false)}>
          <aside 
            className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 p-6 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
                <span className="font-outfit font-bold text-xl tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  EcoTrack
                </span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      active 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              {userProfile && (
                <div className="flex items-center gap-3 px-2">
                  <img 
                    src={userProfile.profilePhoto || 'https://api.dicebear.com/7.x/adventurer/svg?seed=EcoUser'} 
                    alt={userProfile.name}
                    className="w-10 h-10 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20"
                  />
                  <div>
                    <p className="text-sm font-semibold">{userProfile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile.points} pts</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full lg:max-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
