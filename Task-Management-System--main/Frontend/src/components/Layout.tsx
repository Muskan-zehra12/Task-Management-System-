import React from 'react';
import { useNavigate, NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  LogOut, 
  PlusCircle,
  Menu,
  X,
  Bell,
  Search as SearchIcon,
  Settings,
  ChevronRight,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { signalRService } from '../services/signalR';
import { ThemeToggle } from './ThemeToggle';

export const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const [notifications, setNotifications] = React.useState<{ id: number; title: string; desc: string; time: string; type?: string }[]>([]);
  const [showLoginPopup, setShowLoginPopup] = React.useState(false);
  const [assignmentCount, setAssignmentCount] = React.useState(0);
  const [completionCount, setCompletionCount] = React.useState(0);
  const [activeToast, setActiveToast] = React.useState<{ title: string; desc: string } | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const response = await api.get('/task/notifications');
      setNotifications(response.data);
      
      if (!sessionStorage.getItem('login_popup_shown')) {
        const isAdmin = user?.roles?.includes('Admin');
        
        if (isAdmin) {
          const completions = response.data.filter((n: any) => n.type === 'Completion');
          if (completions.length > 0) {
            setCompletionCount(completions.length);
            setShowLoginPopup(true);
            sessionStorage.setItem('login_popup_shown', 'true');
          }
        } else {
          const assignments = response.data.filter((n: any) => n.type === 'Assignment');
          if (assignments.length > 0) {
            setAssignmentCount(assignments.length);
            setShowLoginPopup(true);
            sessionStorage.setItem('login_popup_shown', 'true');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [user]);

  const notificationRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let isMounted = true;

    // Connect SignalR with token
    void signalRService.connect();

    const loadNotifications = async () => {
      if (isMounted) {
        await fetchNotifications();
      }
    };

    void loadNotifications();

    const unsubscribeTask = signalRService.onTaskChanged(() => {
      void loadNotifications();
    });

    const unsubscribeNotify = signalRService.onNotificationReceived((data: any) => {
      setNotifications(prev => [{
        id: Date.now(), // Local ID for unique key
        ...data
      }, ...prev]);
      
      // Show real-time toast for completions or assignments
      setActiveToast({ title: data.title, desc: data.desc });
      setTimeout(() => setActiveToast(null), 5000);

      // Trigger a browser notification or simple alert if user wants
      if ('Notification' in window && window.Notification.permission === 'granted') {
  new window.Notification(data.title, { body: data.desc });
}
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Request notification permission
if ('Notification' in window && window.Notification.permission === 'default') {
  void window.Notification.requestPermission();
}

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribeTask();
      unsubscribeNotify();
      void signalRService.disconnect();
    };
  }, [fetchNotifications]);

  const handleLogout = () => {
    sessionStorage.removeItem('login_popup_shown');
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications([]);
    setTimeout(() => setIsNotificationsOpen(false), 300);
  };

  const isAdmin = user?.roles?.includes('Admin');

  const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/tasks', icon: CheckSquare, label: 'Task Repository' },
    ...(isAdmin ? [{ to: '/app/users', icon: Users, label: 'User Directory' }] : []),
    { to: '/app/profile', icon: User, label: 'User Profile' },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => location.pathname.startsWith(item.to));
    return current ? current.label : 'Task Detail';
  };

  const logoLink = isAuthenticated ? "/app/dashboard" : "/";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 sticky top-0 h-screen z-30">
        <div className="p-10">
          <Link to={logoLink} className="text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-3 tracking-tighter italic hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <CheckSquare size={24} />
            </div>
            ZenTask
          </Link>
        </div>
        
        <nav className="flex-1 px-6 space-y-1.5">
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center justify-between px-5 py-4 rounded-[1.25rem] font-bold transition-all duration-300 group
                ${isActive 
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={`${location.pathname.startsWith(item.to) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                {item.label}
              </div>
              {location.pathname.startsWith(item.to) && (
                <motion.div layoutId="nav-indicator">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </NavLink>
          ))}
          
          <div className="pt-10">
            <button
              onClick={() => navigate('/app/tasks/new')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.25rem] font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 dark:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle size={20} />
              Launch Task
            </button>
          </div>
        </nav>

        <div className="p-6 m-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-slate-100 dark:border-slate-600">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{user?.username}</p>
              <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{user?.roles?.[0] || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold text-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 h-24 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 hidden md:block">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6 relative">
            <div className="relative hidden sm:block">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-12 pr-6 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/5 focus:border-indigo-200 dark:focus:border-indigo-500 w-64 transition-all dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/app/tasks?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  }
                }}
              />
            </div>

            <ThemeToggle />
            
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className={`p-3 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
              >
                <Bell size={22} />
                {notifications.length > 0 && (
                  <span className={`absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full ${isNotificationsOpen ? 'hidden' : ''}`} />
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                  >
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-black text-slate-900 dark:text-slate-100">Notifications</h3>
                      {notifications.length > 0 && (
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">{notifications.length} NEW</span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { 
                              setNotifications(prev => prev.filter(item => item.id !== n.id));
                              navigate('/app/tasks'); 
                              setIsNotificationsOpen(false); 
                            }} 
                            className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer group"
                          >
                            <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{n.desc}</p>
                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 mt-2 uppercase tracking-widest">{n.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} className="w-full p-4 text-center text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        MARK ALL AS READ
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => navigate('/app/profile')}
              className="p-3 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all"
            >
              <Settings size={22} />
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black cursor-pointer transition-all border-2 ${isProfileOpen ? 'bg-indigo-600 text-white border-indigo-200 dark:border-indigo-500 scale-105 shadow-lg' : 'bg-indigo-50 dark:bg-slate-800 border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:scale-105'}`}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 p-2"
                  >
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{user?.username}</p>
                      <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">{user?.roles?.[0]}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { navigate('/app/profile'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        <User size={18} /> Profile Overview
                      </button>
                      <button 
                        onClick={() => { navigate('/app/profile'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        <Settings size={18} /> Settings
                      </button>
                      <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 z-50 lg:hidden flex flex-col shadow-2xl"
              >
                <div className="p-8 flex items-center justify-between">
                  <Link to={logoLink} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-indigo-600 dark:text-indigo-400 italic">ZenTask</Link>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl dark:text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all
                        ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}
                      `}
                    >
                      <item.icon size={24} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                   <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-red-600 font-bold"
                  >
                    <LogOut size={24} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Login Pop-up Modal */}
        <AnimatePresence>
          {showLoginPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLoginPopup(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-10 text-center">
                  <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 dark:shadow-none">
                    {isAdmin ? <CheckCircle2 size={40} className="animate-pulse" /> : <Bell size={40} className="animate-bounce" />}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                    {isAdmin ? 'Task Updates!' : 'New Assignment!'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                    {isAdmin ? (
                      <>
                        Users have completed <span className="text-indigo-600 dark:text-indigo-400">{completionCount}</span> tasks recently. 
                        Review the progress in your dashboard.
                      </>
                    ) : (
                      <>
                        Admin has assigned you <span className="text-indigo-600 dark:text-indigo-400">{assignmentCount}</span> new {assignmentCount === 1 ? 'task' : 'tasks'}. 
                        Please review them in your repository.
                      </>
                    )}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowLoginPopup(false);
                        navigate(isAdmin ? '/app/dashboard' : '/app/tasks');
                      }}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      {isAdmin ? 'Go to Dashboard' : 'View Tasks Now'}
                    </button>
                    <button
                      onClick={() => setShowLoginPopup(false)}
                      className="w-full py-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Real-time Progress Toast */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="fixed bottom-10 right-10 z-[110] w-80 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-white/10 dark:border-slate-200"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400 dark:text-emerald-600 mb-1">{activeToast.title}</p>
                <p className="font-bold text-sm leading-tight truncate">{activeToast.desc}</p>
              </div>
              <button onClick={() => setActiveToast(null)} className="p-2 hover:bg-white/10 dark:hover:bg-slate-100 rounded-xl transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
