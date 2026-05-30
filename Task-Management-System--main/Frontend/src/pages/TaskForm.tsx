import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const TaskForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const isAdmin = user?.roles.includes('Admin');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    category: '',
    dueDate: '',
    userId: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

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
    if (isEdit) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/task/${id}`);
          const task = response.data;
          setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'Pending',
            priority: task.priority || 'Medium',
            category: task.category || '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            userId: task.userId || ''
          });
        } catch (error) {
          console.error('Failed to fetch task', error);
          navigate('/app/tasks');
        } finally {
          setIsFetching(false);
        }
      };
      fetchTask();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await api.put(`/task/${id}`, formData);
      } else {
        await api.post('/task', formData);
      }
      navigate('/app/tasks');
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Task Title"
            placeholder="e.g., Complete Project Documentation"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[120px]"
              placeholder="Provide more details about this task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <Input
              label="Category"
              placeholder="e.g., Work, Personal"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <UserIcon size={14} />
                Assign To
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                <option value="">Myself</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only administrators can assign tasks to other users.</p>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              isLoading={isLoading}
            >
              <Save size={20} />
              {isEdit ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
