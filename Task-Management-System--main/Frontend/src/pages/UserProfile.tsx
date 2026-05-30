import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, LogOut, Settings, Mail, Calendar, Key, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface NotificationSetting {
  id: number;
  label: string;
  active: boolean;
  key: string;
}

export const UserProfile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ username: '', email: '' });
  const [isSaving, setIsSaving] = React.useState(false);
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSetting[]>(() => {
    const saved = localStorage.getItem('zen_notifications');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, label: 'Email notifications on task updates', active: true, key: 'email' },
      { id: 2, label: 'Desktop push notifications', active: false, key: 'push' },
      { id: 3, label: 'Weekly productivity digest', active: true, key: 'digest' },
      { id: 4, label: 'Share task progress with team', active: true, key: 'share' },
    ];
  });
  const [feedback, setFeedback] = React.useState<{ id: number; msg: string } | null>(null);

  const toggleNotification = async (id: number) => {
    const item = notificationSettings.find((n) => n.id === id);
    if (!item) return;

    const newStatus = !item.active;

    // Special Task: Desktop Push Permission
    if (item.key === 'push' && newStatus) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setFeedback({ id, msg: 'Permission denied by browser' });
          setTimeout(() => setFeedback(null), 3000);
          return;
        }
      }
    }

    const updated = notificationSettings.map((n) => 
      n.id === id ? { ...n, active: newStatus } : n
    );
    
    setNotificationSettings(updated);
    localStorage.setItem('zen_notifications', JSON.stringify(updated));

    // Perform simulated "task" update
    setFeedback({ id, msg: newStatus ? 'Enabled' : 'Disabled' });
    
    // Simulate API delay for "performing task"
    console.log(`Syncing ${item.key} preference to cloud...`);
    
    setTimeout(() => setFeedback(null), 2000);
  };

  React.useEffect(() => {
    if (user) {
      setEditData({ username: user.username, email: user.email });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', editData);
      updateUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { icon: Mail, label: 'Email Address', value: user?.email || 'N/A' },
    { icon: Shield, label: 'Role & Permissions', value: user?.roles?.[0] || 'Member' },
    { icon: Calendar, label: 'Member Since', value: user?.joinDate && new Date(user.joinDate).getFullYear() > 1 ? new Date(user.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'May 2026' },
    { icon: Key, label: 'Two-Factor Auth', value: 'Enabled', active: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 text-slate-900 dark:text-slate-100">
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsEditing(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Edit Preferences</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Update your account settings and presence.</p>
              
              <div className="space-y-6">
                <Input 
                  label="Username" 
                  value={editData.username} 
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                />
                <Input 
                  label="Email Address" 
                  value={editData.email} 
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
                <div className="pt-4 flex gap-3">
                  <Button 
                    className="flex-1 rounded-2xl" 
                    onClick={handleSaveChanges}
                    isLoading={isSaving}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="space-y-1">
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Identity & Account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Manage your personal presence and security settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-8"
        >
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 text-white flex items-center justify-center font-black text-5xl italic mb-6">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{user?.username}</h3>
            <div className="space-y-1 mt-1">
              <p className="text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">{user?.roles?.[0] || 'Standard Member'}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                Member since {user?.joinDate && new Date(user.joinDate).getFullYear() > 1 ? new Date(user.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'May 2026'}
              </p>
            </div>
            
            <div className="w-full h-px bg-slate-50 dark:bg-slate-800 my-8" />
            
            <div className="w-full space-y-3">
              <Button 
                variant="outline" 
                className="w-full rounded-2xl py-3 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setIsEditing(true)}
              >
                <Settings size={18} />
                Edit Preferences
              </Button>
              <Button variant="danger" className="w-full rounded-2xl py-3" onClick={handleLogout}>
                <LogOut size={18} />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <Shield className="text-indigo-400" size={20} />
                <h4 className="font-bold">Security Status</h4>
             </div>
             <p className="text-slate-400 text-sm mb-6">Your account security is currently at 85%. Add a phone number to reach 100%.</p>
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[85%]" />
             </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
              <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              Profile Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {sections.map((section) => (
                <div key={section.label} className="space-y-2 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{section.label}</p>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-600 transition-colors min-w-0">
                    <section.icon size={18} className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{section.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
              <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
              Notifications & Privacy
            </h3>
            
            <div className="space-y-4">
              {notificationSettings.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleNotification(item.id)}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer group select-none"
                >
                  <div className="flex-1">
                    <span className="font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{item.label}</span>
                    <AnimatePresence>
                      {feedback && feedback.id === item.id && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="ml-3 text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400"
                        >
                          {feedback.msg}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${item.active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <motion.div 
                      animate={{ x: item.active ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
