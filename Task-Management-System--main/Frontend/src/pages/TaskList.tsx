import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  Trash2,
  Edit2,
  Eye,
  Filter,
  Calendar,
  ChevronRight,
  Download,
  Upload,
  X,
  User as UserIcon,
  Shield
} from 'lucide-react';
import api from '../services/api';
import { signalRService } from '../services/signalR';
import { type TaskItem } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const TaskList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('Admin');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(() => {
    return new URLSearchParams(window.location.search).get('search') || '';
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const response = await api.get('/auth/users');
          setUsers(response.data);
        } catch (error) {
          console.error('Failed to fetch users', error);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam !== null && searchParam !== search) {
      setSearch(searchParam);
    }
  }, [location.search]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const isDeadlineFilter = queryParams.get('filter') === 'deadline';
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (userFilter) params.append('userId', userFilter);
      
      // If deadline filter is active, we might want to sort by due date on the backend
      // For now, we'll fetch all and maybe do some client-side sorting if needed, 
      // but ideally the backend should handle this.
      if (isDeadlineFilter) {
        params.append('sort', 'dueDate');
        params.append('status', 'InProgress,Pending'); // Only active tasks
      }
      
      const response = await api.get(`/task?${params.toString()}`);
      let data = response.data;

      if (isDeadlineFilter) {
        // Simple client-side sort as fallback if backend doesn't support 'sort'
        data = [...data].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      }

      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, priorityFilter, userFilter, location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    const unsubscribe = signalRService.onTaskChanged(() => {
      console.log('Real-time update received: Refreshing tasks...');
      fetchTasks();
    });
    return () => unsubscribe();
  }, [fetchTasks]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/task/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/task/${task.id}`, { ...task, status: newStatus });
      // Real-time update via SignalR will handle the refresh, 
      // but we can optimistic update if we want.
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/task/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export tasks', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/task/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Tasks imported successfully');
      fetchTasks();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to import tasks', error);
      alert('Failed to import tasks. Please check the CSV format.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400';
      default: return 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    }
  };

  const isDeadlineView = new URLSearchParams(location.search).get('filter') === 'deadline';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isDeadlineView ? 'Upcoming Deadlines' : 'Task Repository'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            {isDeadlineView 
              ? 'Prioritizing tasks that require your immediate attention.' 
              : 'A comprehensive view of your professional commitments.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleImport} 
          />
          <div className="flex flex-col gap-1">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-2xl px-6 h-12">
              <Upload size={18} />
              Import
            </Button>
            <a href="/tasks_sample.csv" download className="text-[10px] text-center font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">
              Download Sample
            </a>
          </div>
          <Button variant="outline" onClick={handleExport} className="rounded-2xl px-6 h-12">
            <Download size={18} />
            Export
          </Button>
          <Button onClick={() => navigate('/app/tasks/new')} className="rounded-2xl px-8 h-12 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus size={20} />
            Launch New Task
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search tasks by title, description or category..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {isAdmin && (
            <div className="relative flex-1 min-w-[140px] lg:w-48">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={16} />
              <select
                className="w-full pl-10 pr-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-600 dark:text-slate-400 appearance-none cursor-pointer"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">User: All</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
          )}
          <div className="relative flex-1 min-w-[140px] lg:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={16} />
            <select
              className="w-full pl-10 pr-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-600 dark:text-slate-400 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="relative flex-1 min-w-[140px] lg:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={16} />
            <select
              className="w-full pl-10 pr-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-600 dark:text-slate-400 appearance-none cursor-pointer"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Priority: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Tasks</p>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {isDeadlineView ? 'All deadlines are met!' : 'No matching tasks found'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {isDeadlineView 
                  ? 'You have no urgent tasks pending. Take a moment to celebrate your productivity!' 
                  : 'Try adjusting your search or filters to find what you\'re looking for.'}
              </p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setPriorityFilter('');
                  navigate('/app/tasks');
                }}
              >
                {isDeadlineView ? 'View All Tasks' : 'Clear all filters'}
              </Button>
            </motion.div>
          ) : (
            tasks.map((task, idx) => {
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-6 flex-1">
                    <button 
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 p-3 rounded-2xl transition-all ${
                        task.status === 'Completed' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                      title={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-xl font-bold transition-colors ${
                          task.status === 'Completed' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className={`font-medium line-clamp-2 text-sm leading-relaxed transition-colors ${
                        task.status === 'Completed' ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {task.description || 'No description provided.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        {task.category && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <Filter size={12} /> {task.category}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            new Date(task.dueDate) < new Date() && task.status !== 'Completed'
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400'
                          }`}>
                            <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {isAdmin && task.user && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <UserIcon size={12} /> Assigned to: {task.user.userName}
                          </span>
                        )}
                        {task.isAssignedByAdmin && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                            <Shield size={12} /> Assigned by Admin {task.createdAt && `on ${new Date(task.createdAt).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t dark:border-slate-800 md:border-t-0 pt-6 md:pt-0">
                    <button 
                      onClick={() => navigate(`/app/tasks/${task.id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all font-bold text-sm"
                    >
                      <Eye size={18} />
                      <span className="md:hidden lg:inline">Details</span>
                    </button>
                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />
                    <button 
                      onClick={() => navigate(`/app/tasks/edit/${task.id}`)}
                      className="p-3 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                      title="Edit Task"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-3 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Delete Task"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="md:hidden lg:block ml-2 group-hover:translate-x-1 transition-transform text-slate-300 dark:text-slate-600">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
