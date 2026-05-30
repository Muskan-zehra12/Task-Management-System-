import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Calendar, 
  Shield, 
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  X,
  Lock,
  User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import { type User } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';

interface UserWithRoles extends User {
  id: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsAddSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Regular User' });
  
  const { user: currentUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddSubmitting(true);
    try {
      await api.post('/auth/register', newUser);
      alert('User created successfully');
      setIsAddModalOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'Regular User' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setActiveMenu(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleRole = async (u: UserWithRoles) => {
    const newRole = u.roles.includes('Admin') ? 'Regular User' : 'Admin';
    if (!window.confirm(`Change ${u.username}'s role to ${newRole}?`)) return;

    try {
      await api.put(`/auth/users/${u.id}/role`, JSON.stringify(newRole), {
        headers: { 'Content-Type': 'application/json' }
      });
      setUsers(users.map(user => 
        user.id === u.id ? { ...user, roles: [newRole] } : user
      ));
      setActiveMenu(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Directory</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">User Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">System-wide overview of registered members and permissions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/50">
            <Users size={20} />
            {users.length} Total Members
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl px-6 h-12 shadow-lg shadow-indigo-100 dark:shadow-none">
            <UserPlus size={20} />
            Add User
          </Button>
        </div>
      </header>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 italic">Create Member</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enroll a new system user</p>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1 relative">
                      <UserIcon className="absolute left-4 top-[2.4rem] text-slate-400 z-10" size={18} />
                      <Input 
                        label="Username" 
                        placeholder="Choose a unique handle" 
                        className="pl-12"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-1 relative">
                      <Mail className="absolute left-4 top-[2.4rem] text-slate-400 z-10" size={18} />
                      <Input 
                        label="Email Address" 
                        type="email" 
                        placeholder="user@example.com" 
                        className="pl-12"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-1 relative">
                      <Lock className="absolute left-4 top-[2.4rem] text-slate-400 z-10" size={18} />
                      <Input 
                        label="Initial Password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-12"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button 
                      variant="outline" 
                      type="button"
                      className="flex-1 rounded-2xl h-14" 
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 rounded-2xl h-14" 
                      isLoading={isSubmitting}
                    >
                      Confirm Enrollment
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Authority</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Join Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredUsers.map((u, idx) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 dark:shadow-none italic shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{u.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail size={12} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                      {u.roles.map(role => (
                        <span key={role} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          role === 'Admin' 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' 
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-indigo-900/50'
                        }`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <Calendar size={16} />
                      {new Date(u.joinDate).getFullYear() > 1 
                        ? new Date(u.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                        : 'May 2026'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                      className={`p-3 rounded-xl transition-all ${
                        activeMenu === u.id 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === u.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-8 top-16 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
                        >
                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => handleToggleRole(u)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
                            >
                              {u.roles.includes('Admin') ? (
                                <><ShieldAlert size={18} /> Demote to User</>
                              ) : (
                                <><ShieldCheck size={18} /> Promote to Admin</>
                              )}
                            </button>
                            <div className="h-px bg-slate-50 dark:bg-slate-700 mx-2" />
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.username === currentUser?.username}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${
                                u.username === currentUser?.username
                                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                  : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                              }`}
                            >
                              <Trash2 size={18} /> Delete Account
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck size={24} />
           </div>
           <h4 className="text-xl font-bold">Active Sessions</h4>
           <p className="text-sm text-slate-500 dark:text-slate-400">Monitor real-time system engagement and websocket connections via SignalR.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield size={24} />
           </div>
           <h4 className="text-xl font-bold">Role Audit</h4>
           <p className="text-sm text-slate-500 dark:text-slate-400">Regularly review high-privilege access and administrative role assignments.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX size={24} />
           </div>
           <h4 className="text-xl font-bold">Account Security</h4>
           <p className="text-sm text-slate-500 dark:text-slate-400">Identify locked accounts or failed authentication attempts across the platform.</p>
        </div>
      </div>
    </div>
  );
};