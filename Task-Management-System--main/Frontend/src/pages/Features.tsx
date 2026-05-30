import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Activity, 
  LayoutDashboard, 
  Globe, 
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Intelligent Tasking',
      desc: 'Our proprietary algorithm suggests task priorities and categories based on your past behavior and deadlines.',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: Activity,
      title: 'Real-time Sync',
      desc: 'Powered by SignalR, ZenTask ensures your data is instantly synchronized across all your devices and browser tabs.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      desc: 'Enterprise-grade authentication with JWT and rigid role management (Admin vs Regular User) to protect sensitive data.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: LayoutDashboard,
      title: 'Visual Analytics',
      desc: 'Get deep insights into your productivity with interactive charts, burndown lists, and trend analysis.',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Clock,
      title: 'Smart Notifications',
      desc: 'Never miss a deadline with automated alerts and a global notification center that keeps you informed in real-time.',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/20'
    },
    {
      icon: Globe,
      title: 'Cloud Resilience',
      desc: 'Built on a distributed architecture that guarantees 99.9% uptime and automatic backups for your peace of mind.',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400">ZenTask</span>
          </Link>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
             <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 transition-colors">Sign In</Link>
             <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all">Join ZenTask</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-40 pb-20 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full text-indigo-600 dark:text-indigo-400"
          >
            <Zap size={16} className="fill-current" />
            <span className="text-xs font-black uppercase tracking-widest">Innovation at Scale</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Designed for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Modern Engineer.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            ZenTask isn't just a list; it's a high-performance workspace engineered for reliability, observability, and speed.
          </p>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6"
            >
              <div className={`${f.bg} ${f.color} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                <f.icon size={32} />
              </div>
              <h4 className="text-2xl font-black">{f.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Observability as a <br /> First-Class Citizen.
            </h3>
            <div className="space-y-6">
              {[
                'Global Exception Handling on the API layer.',
                'Serilog Structured Logging for all operations.',
                'SonarQube continuous code quality monitoring.',
                '100% automated test coverage with xUnit.'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <p className="text-lg font-bold text-slate-300 italic">{text}</p>
                </div>
              ))}
            </div>
            <Link to="/stack" className="inline-flex items-center gap-2 text-indigo-400 font-black text-lg group">
              Explore our Architecture
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
             <div className="relative bg-slate-800 rounded-[2rem] p-8 border border-white/10 shadow-2xl">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="font-mono text-sm text-indigo-300 leading-relaxed overflow-x-auto">
{`// Secure Task Retrieval
[HttpGet("{id}")]
public async Task<IActionResult> GetTask(int id)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var task = await _context.Tasks
        .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        
    if (task == null) return NotFound();
    
    Log.Information("Task {Id} retrieved by user {UserId}", id, userId);
    return Ok(task);
}`}
                </pre>
             </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-indigo-600 text-white text-center px-6">
        <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to evolve your workflow?</h3>
        <Link to="/register" className="inline-block bg-white text-indigo-600 px-12 py-5 rounded-[2rem] text-xl font-black hover:bg-indigo-50 transition-all shadow-2xl">
          Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400">ZenTask</span>
          </div>
          <p className="text-slate-400 text-sm font-black uppercase tracking-widest italic text-center">
            &copy; 2026 ZenTask Engineering Project. Built with Excellence.
          </p>
          <div className="flex gap-8">
            <Link to="/features" className="text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Features</Link>
            <Link to="/stack" className="text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Stack</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
