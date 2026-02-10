import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate login
      setTimeout(() => navigate('/restaurant'), 1000); 
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans selection:bg-emerald-100">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
        <div className="absolute top-8 left-8 md:left-16 lg:left-24">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">IBNai</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3 italic underline decoration-emerald-200 underline-offset-8">Welcome Back</h1>
            <p className="text-slate-500 font-medium text-lg mt-6">Manage your digital menu and track your profits.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="owner@restaurant.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" title="Recover Password" className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={loading}
              className="mt-4 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/30"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Access Dashboard
            </Button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-slate-50">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-black hover:underline underline-offset-4">
                Start Free Trial
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-auto pt-10 text-center lg:text-left">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">© 2026 IBNai Digital Systems</p>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:block bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Restaurant Ambience" 
          className="w-full h-full object-cover opacity-40 grayscale"
        />
        
        <div className="absolute bottom-0 left-0 w-full p-20 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
          <div className="max-w-xl">
             <div className="flex gap-1 mb-8">
               {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>)}
             </div>
             <blockquote className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-10 italic">
               "IBNai transformed how we handle rush hours. Our table turnover increased by <span className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">35%</span> in just two weeks."
             </blockquote>
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[24px] bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl">R</div>
               <div>
                 <p className="text-white font-black text-lg tracking-tight">Rajesh Kumar</p>
                 <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Founder, Spice Garden</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;