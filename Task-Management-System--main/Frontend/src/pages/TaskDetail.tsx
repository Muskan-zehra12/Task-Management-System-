import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Shield
} from 'lucide-react';
import api from '../services/api';
import { type TaskItem } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('Admin');
  const [task, setTask] = useState<TaskItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/task/${id}`);
        setTask(response.data);
      } catch (error) {
        console.error('Failed to fetch task', error);
        navigate('/app/tasks');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/task/${id}`);
        navigate('/app/tasks');
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-900/30';
      case 'Low': return 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/20 dark:border-green-900/30';
      default: return 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Completed': return { icon: <CheckCircle2 size={20} />, text: 'Completed', color: 'text-green-600 dark:text-emerald-400' };
      case 'InProgress': return { icon: <Clock size={20} />, text: 'In Progress', color: 'text-amber-600 dark:text-amber-400' };
      case 'Pending': return { icon: <AlertTriangle size={20} />, text: 'Pending', color: 'text-slate-400 dark:text-slate-500' };
      default: return { icon: null, text: status, color: 'text-slate-600 dark:text-slate-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-indigo-500" />
      </div>
    );
  }

  if (!task) return null;

  const statusInfo = getStatusInfo(task.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/app/tasks')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>
        <div className="flex gap-2">
          {task.status !== 'Completed' && (
            <Button onClick={async () => {
              try {
                await api.put(`/task/${task.id}`, { ...task, status: 'Completed' });
                setTask(prev => prev ? { ...prev, status: 'Completed' } : null);
              } catch (error) {
                console.error('Failed to complete task', error);
              }
            }} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 size={18} />
              Mark as Done
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/app/tasks/edit/${task.id}`)}>
            <Edit2 size={18} />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`flex items-center gap-1.5 text-sm font-bold ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {task.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8 border-y border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Due Date</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No date set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <Tag size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{task.category || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <Flag size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{task.status}</p>
              </div>
            </div>
            {isAdmin && task.user && (
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <UserIcon size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned To</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{task.user.userName}</p>
                </div>
              </div>
            )}
            {task.isAssignedByAdmin && (
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Admin Assignment</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    Assigned by Admin {task.createdAt && `on ${new Date(task.createdAt).toLocaleString()}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
