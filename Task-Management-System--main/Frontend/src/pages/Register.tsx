import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Regular User');
  const [isAdminExists, setIsAdminExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get('/auth/check-admin');
        setIsAdminExists(response.data.exists);
      } catch (err) {
        console.error('Failed to check admin status', err);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', { username, email, password, role });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-4 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
        <Link 
          to="/" 
          className="text-white dark:text-slate-200 font-medium bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-colors backdrop-blur-md flex items-center gap-2 cursor-pointer border border-white/20 dark:border-slate-700/50"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          ← Back to Home
        </Link>
        <ThemeToggle className="bg-white/10 dark:bg-slate-800/50 text-white dark:text-amber-400 hover:bg-white/20 dark:hover:bg-slate-700/50 border border-white/20 dark:border-slate-700/50 shadow-none" />
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-white/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-black/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 relative z-10 border border-white/20 dark:border-slate-800"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 mb-2 transform rotate-6 transition-shadow">
            <UserPlus size={36} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Join our professional task management community.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-900/50">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Role
              </label>
              {isAdminExists && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
                  Admin already exists
                </span>
              )}
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-white font-medium"
            >
              <option value="Regular User">Regular User</option>
              {!isAdminExists && <option value="Admin">Admin</option>}
            </select>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
