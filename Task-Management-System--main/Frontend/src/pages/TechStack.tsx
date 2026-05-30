import React from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const TechStack: React.FC = () => {
  const layers = [
    {
      title: 'Frontend Architecture',
      icon: Globe,
      techs: ['React 19', 'TypeScript', 'Tailwind CSS 4', 'Framer Motion', 'Lucide Icons'],
      desc: 'A high-performance SPA built with the latest React primitives, utilizing atomic design and utility-first styling for maximum consistency.',
      color: 'bg-blue-500'
    },
    {
      title: 'Backend Engine',
      icon: Cpu,
      techs: ['.NET 10 Core', 'C# 13', 'Entity Framework Core', 'Identity Core', 'SignalR'],
      desc: 'A robust RESTful API leveraging asynchronous processing, dependency injection, and real-time socket communication.',
      color: 'bg-indigo-600'
    },
    {
      title: 'Data Persistence',
      icon: Database,
      techs: ['SQL Server', 'LINQ', 'Migrations', 'Connection Pooling'],
      desc: 'Relational data management with rigid schema enforcement and high-performance querying via EF Core.',
      color: 'bg-emerald-500'
    },
    {
      title: 'Quality & DevOps',
      icon: ShieldCheck,
      techs: ['SonarQube', 'xUnit', 'Serilog', 'JWT Auth', 'AutoMapper'],
      desc: 'Continuous observability and security auditing to ensure code integrity and protection against vulnerabilities.',
      color: 'bg-rose-500'
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
             <Link to="/features" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 transition-colors">Key Features</Link>
             <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-40 pb-20 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full text-emerald-600 dark:text-emerald-400"
            >
              <Terminal size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Full-Stack Excellence</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              A Modern <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 italic">Engineering Stack.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We've chosen a battle-tested, high-performance tech stack designed to scale with your ambitions.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
             {['.NET 10', 'React 19', 'SQL Server', 'Tailwind 4'].map((tech, i) => (
               <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-2xl font-black italic text-indigo-600 dark:text-indigo-400">{tech}</p>
               </div>
             ))}
          </div>
        </div>
      </header>

      {/* Stack Explorer */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-12 items-center"
            >
              <div className={`${layer.color} w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl flex-shrink-0 group-hover:rotate-6 transition-transform duration-500`}>
                <layer.icon size={48} />
              </div>
              <div className="flex-1 space-y-6">
                 <div className="flex flex-wrap gap-2">
                    {layer.techs.map(t => (
                      <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {t}
                      </span>
                    ))}
                 </div>
                 <h3 className="text-3xl font-black">{layer.title}</h3>
                 <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                   {layer.desc}
                 </p>
              </div>
              <ChevronRight className="hidden md:block text-slate-200 dark:text-slate-700" size={48} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Visual */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
           <h3 className="text-4xl font-black tracking-tight">System Infrastructure</h3>
           <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800 hidden md:block -z-10" />
              
              {[
                { label: 'Client Layer', val: 'Vite / React SPA', icon: Globe },
                { label: 'Application Layer', val: 'ASP.NET Web API', icon: Layers },
                { label: 'Resource Layer', val: 'SQL Server / SignalR', icon: Database }
              ].map((node, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl mx-auto flex items-center justify-center">
                    <node.icon size={24} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{node.label}</p>
                  <p className="text-xl font-bold">{node.val}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-slate-900 text-white text-center px-6">
        <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-8 italic">Ready to see it in action?</h3>
        <Link to="/register" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-indigo-700 transition-all shadow-2xl group">
          Launch ZenTask
          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
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
