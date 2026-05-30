import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Shield, 
  ArrowRight,
  Code2,
  Terminal,
  Activity,
  Database,
  BarChart,
  Star,
  CheckCircle2,
  LayoutDashboard,
  Globe,
  Share2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/hero.png';
import { ThemeToggle } from '../components/ThemeToggle';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <CheckSquare size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400">Task Manager</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Key Features</a>
            <a href="#stack" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tech Stack</a>
            <a href="#quality" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Quality Assurance</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            {isAuthenticated ? (
              <Link to="/app/dashboard" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full text-indigo-600 dark:text-indigo-400">
              <Star size={16} className="fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">Enterprise-Grade ZenTask</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              High Performance <span className="text-indigo-600 dark:text-indigo-400 italic">Engineering</span> Portal.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
              A robust ZenTask built with .NET, React, and modern dev-ops standards. Scalable, secure, and rigorously tested.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={isAuthenticated ? "/app/dashboard" : "/register"} className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] text-lg font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group">
                {isAuthenticated ? 'Enter Workspace' : 'Launch Project'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#stack" className="px-8 py-4 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center">
                Explore Architecture
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">SonarQube Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">xUnit Coverage</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Serilog Observation</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full" />
            <div className="relative z-10 bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-4 shadow-2xl border-[12px] border-white dark:border-slate-900 overflow-hidden">
               <img 
                src={heroImage} 
                alt="Dashboard Preview" 
                className="w-full h-auto rounded-[2rem] opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute bottom-10 left-10 right-10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-[10px] text-white/40 font-mono ml-2 tracking-widest">SYSTEM_LOG_ACTIVE</span>
                </div>
                <p className="text-indigo-300 font-mono text-xs leading-relaxed">
                  [12:15:34 INF] User "Admin" logged in successfully.<br/>
                  [12:15:35 INF] SignalR connection established on /taskHub.<br/>
                  [12:15:36 INF] Task Repository synchronized with SQL Server.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need to manage workloads.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Authentication', desc: 'Secure JWT-based user registration and login with role-based access control (Admin/Regular User).' },
              { icon: LayoutDashboard, title: 'Task Lifecycle', desc: 'Full CRUD operations for tasks with priorities, categories, and automated due-date monitoring.' },
              { icon: Activity, title: 'Real-time Sync', desc: 'Powered by SignalR to provide instantaneous updates across all active sessions when tasks change.' }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-6 transition-colors"
              >
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <f.icon size={32} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{f.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="stack" className="py-32 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="space-y-10"
             >
                <div className="space-y-4">
                  <h2 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">The Tech Stack</h2>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Built on solid foundations.</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { icon: Terminal, label: 'Backend Engine', val: '.NET Core 8 with Serilog Observation' },
                    { icon: Database, label: 'Data Persistence', val: 'Entity Framework Core & SQL Server' },
                    { icon: Code2, label: 'Frontend Architecture', val: 'React.js with TypeScript & Tailwind' },
                    { icon: BarChart, label: 'Observability', val: 'SonarQube Analysis & xUnit Testing' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="flex gap-6 items-start"
                    >
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl transition-colors">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{item.val}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 space-y-8 transition-colors"
             >
                <h4 className="text-2xl font-black text-slate-900 dark:text-white italic">"Robust engineering is not just about features, it's about reliability and observability."</h4>
                <div className="space-y-4">
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Every operation in ZenTask is logged using **Serilog**, ensuring that errors are caught and handled gracefully by our **Global Exception Handler**.
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Our codebase is continuously monitored by **SonarQube** to maintain the highest standards of code quality and security.
                   </p>
                </div>
                <div className="pt-6">
                   <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors"
                   >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                         <CheckSquare size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Test Coverage</p>
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic">xUnit Tests Passed (100%)</p>
                      </div>
                   </motion.div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section id="quality" className="py-32 bg-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 text-center relative z-10 space-y-12"
        >
           <h3 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto">
             Ready to experience professional task management?
           </h3>
           <p className="text-indigo-100 text-xl font-medium max-w-2xl mx-auto opacity-80">
             Log in to your account or register now to start managing your projects with a platform designed for performance.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
             <Link to="/register" className="bg-white text-indigo-600 px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-indigo-50 transition-all shadow-2xl">
               Get Started Free
             </Link>
             <Link to="/login" className="bg-indigo-500 text-white border-2 border-indigo-400 px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-indigo-400 transition-all">
               Sign In Now
             </Link>
           </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <CheckSquare size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400">Task Manager</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
              An advanced task management project demonstrating modern software engineering patterns and practices.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"><Globe size={20}/></a>
              <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"><Share2 size={20}/></a>
              <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"><Cpu size={20}/></a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Engineering</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li>.NET 8 Web API</li>
              <li>React + TypeScript</li>
              <li>Entity Framework</li>
              <li>SQL Database</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Quality</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li>Serilog Observation</li>
              <li>xUnit Testing</li>
              <li>SonarQube Analysis</li>
              <li>SignalR Real-time</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-50 dark:border-slate-900 text-center">
          <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">
            &copy; 2026 Task Manager Project. Developed with Excellence by Muskan Zehra | All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
