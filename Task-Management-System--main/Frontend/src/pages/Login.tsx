import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Failed to login. Please check your credentials.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 relative overflow-hidden transition-colors duration-500">
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
      <div className="absolute top-0 -left-20 w-96 h-96 bg-white/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-black/10 dark:bg-purple-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 relative z-10 border border-white/20 dark:border-slate-800"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 mb-2 transform -rotate-6 transition-shadow">
            <LogIn size={36} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Log in to resume your productivity journey.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/50">
            {error}
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
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
