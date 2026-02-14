import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../config/supabase';

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
      // NATIVE AUTH: This replaces custom hashing and RPC calls
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Fetch the profile and restaurant linked to this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, restaurants(*)')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || !profile.restaurants) {
        throw new Error("Restaurant profile not found.");
      }

      const restaurant = profile.restaurants;

      if (!restaurant.is_active) {
        // Log them back out if not active (Admin Gate)
        await supabase.auth.signOut();
        setError('Your restaurant account is pending approval or inactive. Access restricted.');
        setLoading(false);
        return;
      }

      // Store basic session for compatibility with existing dashboard code
      const sessionUser = {
        id: data.user.id,
        email: data.user.email,
        name: restaurant.name,
        restaurant_id: restaurant.id,
        restaurant: {
          name: restaurant.name,
          slug: restaurant.slug,
          type: restaurant.restaurant_type,
          subscription_plan: restaurant.subscription_plan
        }
      };

      localStorage.setItem('user', JSON.stringify(sessionUser));
      navigate('/restaurant');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-sans selection:bg-emerald-100">
      {/* Form Side */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative bg-white border-r-2 border-slate-100">
        <div className="absolute top-8 left-8 md:left-16 lg:left-24">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">IBNai</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 italic">
               <Sparkles className="w-3 h-3" /> Secure Access
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic">Command Center.</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">Enter your credentials to manage your digital empire.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800 leading-relaxed">{error}</p>
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
            
            <div className="space-y-2">
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
                <Link to="/forgot-password" title="Recover Password" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={loading}
              className="mt-6 h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 group"
              icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            >
              Access Dashboard
            </Button>
          </form>

          <div className="mt-12 text-center pt-8 border-t-2 border-slate-50">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              New to IBNai?{' '}
              <Link to="/register" className="text-emerald-600 font-black hover:underline underline-offset-4 ml-1">
                Start Free Trial
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-auto pt-10 text-center lg:text-left">
           <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">© 2026 IBNai Digital Systems</p>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex flex-col bg-slate-900 relative overflow-hidden justify-center items-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        <div className="relative z-10 max-w-xl text-center p-12 animate-in fade-in duration-1000">
           <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[32px] mb-10 border border-white/10 shadow-2xl">
              <Store className="w-10 h-10 text-emerald-400" />
           </div>
           <blockquote className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-10 italic">
             "The zero-commission <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">operating system</span> <br/> for restaurants."
           </blockquote>
           <div className="flex flex-col items-center gap-2">
             <p className="text-white font-bold text-lg tracking-tight">Rajesh Kumar</p>
             <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Founder, Spice Garden</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;