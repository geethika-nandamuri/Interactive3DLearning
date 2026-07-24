import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '@contexts/ThemeContext';
import { trackStudyTime } from '@services/progressService';
import { useAuth } from '@contexts/AuthContext';
import { 
  LayoutDashboard, 
  Heart, 
  Dna, 
  Wrench, 
  FlaskConical, 
  Building, 
  BarChart3, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Helper to resolve initials from name
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Automatic study time tracker (runs silently in the background)
  useEffect(() => {
    const interval = setInterval(() => {
      trackStudyTime(30).catch(err => console.error('Failed to log study time:', err.message));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Anatomy', path: '/dashboard/anatomy', icon: Heart },
    { name: 'Biology', path: '/dashboard/biology', icon: Dna },
    { name: 'Engineering', path: '/dashboard/engineering', icon: Wrench },
    { name: 'Chemistry', path: '/dashboard/chemistry', icon: FlaskConical },
    { name: 'Architecture', path: '/dashboard/architecture', icon: Building },
    { name: 'Quiz', path: '/dashboard/quiz', icon: HelpCircle },
    { name: 'Progress', path: '/dashboard/progress', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/70 p-6 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              3D
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-slate-200">
              SpatialLearn
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls inside Sidebar */}
        <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>

          {/* Logout Trigger */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors bg-transparent border-none cursor-pointer text-left"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/30 backdrop-blur-md dark:bg-slate-900/30 px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
            {menuItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-650 dark:text-slate-400">
              {user?.name || 'User'}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary dark:text-primary-dark">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
