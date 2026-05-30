import React, { useEffect, useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  BarChart3,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Users
} from 'lucide-react';
import api from '../services/api';
import { signalRService } from '../services/signalR';
import { type DashboardStats, type TaskItem } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskItem[]>([]);
  const [completedByUsers, setCompletedByUsers] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const isAdmin = user?.roles?.includes('Admin');
      const [statsRes, tasksRes, completedRes] = await Promise.all([
        api.get('/task/dashboard'),
        api.get('/task?limit=5'),
        isAdmin ? api.get('/task?status=Completed&limit=5') : Promise.resolve({ data: [] })
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
      if (isAdmin) {
        setCompletedByUsers(completedRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };

    void loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = signalRService.onTaskChanged(() => {
      console.log('Real-time update received: Refreshing dashboard...');
      void loadData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchDashboardData]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.6, 0.01, -0.05, 0.95] }
    })
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.total || 0, icon: ListTodo, color: 'bg-gradient-to-br from-indigo-500 to-purple-600', light: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Completed', value: stats?.completed || 0, icon: CheckCircle2, color: 'bg-gradient-to-br from-emerald-400 to-teal-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: TrendingUp, color: 'bg-gradient-to-br from-amber-400 to-orange-500', light: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'bg-gradient-to-br from-slate-400 to-slate-600', light: 'bg-slate-50', text: 'text-slate-500' },
  ];

  const completionRate = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const calculateHealthScore = () => {
    if (!stats || stats.total === 0) return { score: 0, grade: 'NEW' };
    
    // Base score from completion rate
    let score = (stats.completed / stats.total) * 100;
    
    // Penalty for overdue tasks
    if (stats.overdue > 0) {
      score -= (stats.overdue * 10);
    }
    
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 95) return { score, grade: 'A+' };
    if (score >= 80) return { score, grade: 'A' };
    if (score >= 65) return { score, grade: 'B' };
    if (score >= 40) return { score, grade: 'C' };
    return { score, grade: 'D' };
  };

  const health = calculateHealthScore();
  const isAdmin = user?.roles?.includes('Admin');

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isAdmin ? 'System-Wide Perspective' : 'Personal Workspace'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            {isAdmin ? 'Monitoring global task distribution and user engagement.' : 'Streamlining your workflow and task productivity.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button variant="outline" className="rounded-2xl px-6 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400" onClick={() => navigate('/app/users')}>
              <Users size={20} className="mr-2" />
              Manage Users
            </Button>
          )}
          <Button variant="outline" className="rounded-2xl px-6" onClick={() => navigate('/app/tasks')}>
            Manage Tasks
          </Button>
          <Button className="rounded-2xl px-6 shadow-lg shadow-indigo-200 dark:shadow-none" onClick={() => navigate('/app/tasks/new')}>
            <PlusCircle size={20} className="mr-1" />
            New Task
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-[0.03] -mr-8 -mt-8 rounded-full`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${card.color} text-white group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100 dark:shadow-none`}>
                <card.icon size={28} />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${card.light} ${card.text} dark:bg-slate-800 dark:text-indigo-400`}>
                Real-time
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Task Performance</h3>
              </div>
              <button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                {showAnalytics ? 'Show Less' : 'View Full Analytics'}
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-10">
              <div className="relative pt-1">
                <div className="flex mb-4 items-center justify-between">
                  <div>
                    <span className="text-sm font-bold inline-block text-slate-700 uppercase tracking-wider">
                      Completion Efficiency
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {completionRate}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${completionRate}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'circOut', delay: 0.2 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  />
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium italic">
                  Overall progress across all active and archived tasks.
                </p>
              </div>

              {showAnalytics && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Efficiency</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">High</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Velocity</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">12.5/wk</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Backlog</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats?.pending || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Archived</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">42</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <ListTodo size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Recent Activities</h3>
              </div>
              <button 
                onClick={() => navigate('/app/tasks')}
                className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-slate-400 font-medium">No recent tasks to display.</p>
                </div>
              ) : (
                recentTasks.map((task, idx) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    onClick={() => navigate(`/app/tasks/${task.id}`)}
                    className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-500' : 
                        task.status === 'InProgress' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</p>
                        <p className="text-xs text-slate-400 font-medium">{task.category || 'General'} • {task.status}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {isAdmin && completedByUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Completed by Users</h3>
                </div>
              </div>

              <div className="space-y-4">
                {completedByUsers.map((task, idx) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                        {task.user?.userName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{task.title}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          Completed by {task.user?.userName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Recently</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={120} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tight">Quick Actions</h3>
                <p className="text-indigo-100 font-medium opacity-80">Optimize your daily productivity.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => navigate('/app/tasks?filter=deadline')}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Calendar size={20} className="text-indigo-200" />
                    <div>
                      <p className="font-bold">Check Deadlines</p>
                      <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Priority View</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => setShowAnalytics(true)}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 text-left">
                    <BarChart3 size={20} className="text-indigo-200" />
                    <div>
                      <p className="font-bold">View Analytics</p>
                      <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Detailed Report</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Task Insights</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Performance Grade</p>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-black italic ${health.score > 70 ? 'text-emerald-500' : health.score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {health.grade}
                  </div>
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${health.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className={`h-full ${health.score > 70 ? 'bg-emerald-500' : health.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 group">
                  <div className={`p-2 rounded-lg ${stats?.overdue && stats.overdue > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                    {stats?.overdue && stats.overdue > 0 ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <span>{stats?.overdue && stats.overdue > 0 ? `${stats.overdue} tasks are overdue!` : 'No overdue tasks!'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 group">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Clock size={16} />
                  </div>
                  <span>{stats?.dueToday && stats.dueToday > 0 ? `${stats.dueToday} tasks due today.` : 'Nothing due today.'}</span>
                </div>

                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 group">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Calendar size={16} />
                  </div>
                  <span>{stats?.upcoming && stats.upcoming > 0 ? `${stats.upcoming} tasks in next 3 days.` : 'No upcoming deadlines.'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1 italic text-center">
                  Live data from TaskMaster Cloud
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

