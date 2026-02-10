import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  IndianRupee, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Star,
  Zap,
  Users,
  Clock,
  Menu as MenuIcon,
  X,
  Store
} from 'lucide-react';
import { Button } from '../components/ui';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">IBNai</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms</Link>
            <Link to="/login" className="hover:text-emerald-600 transition-colors">Login</Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 shadow-xl shadow-emerald-600/20 border-none">
                Get Started
              </Button>
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-900">
            {isMenuOpen ? <X /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300 shadow-xl">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">How it Works</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Pricing</a>
            <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Privacy Policy</Link>
            <Link to="/terms" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Terms of Use</Link>
            <div className="h-px bg-slate-100 w-full"></div>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Login</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button fullWidth className="bg-emerald-600 text-white h-14">Claim My Free Menu</Button>
            </Link>
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Owner Support</span>
              <a href="tel:+919390949028" className="text-slate-900 font-black">+91 93909 49028</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-8">
            <span className="text-amber-600 text-xs font-black uppercase tracking-[0.2em]">Limited Time Launch Offer</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8 max-w-5xl">
            Stop Donating 30% to Zomato. <span className="text-emerald-600">Keep 100% of Your Profit.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mb-12 leading-relaxed">
            The Zero-Commission QR Menu for Smart Restaurant Owners. No App Downloads. No Hardware. <span className="text-slate-900 font-bold">Setup in 5 Minutes.</span>
          </p>

          <div className="flex flex-col items-center gap-6">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-xl md:text-2xl h-20 md:h-24 px-12 md:px-20 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-600/40 rounded-2xl border-none font-black transition-all hover:scale-105 active:scale-95">
                Claim My Free Menu (Launch Offer)
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              14-Day Free Trial • No Credit Card Required
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-60">
             <div className="flex flex-col items-center">
               <TrendingUp className="w-8 h-8 mb-4 text-emerald-600" />
               <span className="font-black text-xs uppercase tracking-widest">Boost Profits</span>
             </div>
             <div className="flex flex-col items-center">
               <Smartphone className="w-8 h-8 mb-4 text-emerald-600" />
               <span className="font-black text-xs uppercase tracking-widest">No App Required</span>
             </div>
             <div className="flex flex-col items-center">
               <Zap className="w-8 h-8 mb-4 text-emerald-600" />
               <span className="font-black text-xs uppercase tracking-widest">Instant Setup</span>
             </div>
             <div className="flex flex-col items-center">
               <IndianRupee className="w-8 h-8 mb-4 text-emerald-600" />
               <span className="font-black text-xs uppercase tracking-widest">Zero Commission</span>
             </div>
          </div>
        </div>
      </section>

      {/* The Pain Section */}
      <section id="features" className="py-24 md:py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Why Settle for the "Old Way"?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Traditional ordering is killing your margins and annoying your customers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* The Old Way */}
            <div className="p-10 md:p-16 rounded-[40px] bg-slate-800/50 border border-slate-700/50">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-xs font-black uppercase tracking-widest">The Old, Expensive Way</span>
              </div>
              <ul className="space-y-8">
                {[
                  { title: "Paper Menus", desc: "Dirty, expensive to print, and impossible to update." },
                  { title: "Zomato Commissions", desc: "Losing up to 30% of every order to third-party apps." },
                  { title: "Human Errors", desc: "Waiters mishearing orders leads to wasted food and angry guests." },
                  { title: "Slow Service", desc: "Customers wait 10-15 minutes just to get someone's attention." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-6 group">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-500 font-bold">×</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1 text-slate-200">{item.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* The New Way */}
            <div className="p-10 md:p-16 rounded-[40px] bg-emerald-600 shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Store className="w-64 h-64 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-black uppercase tracking-widest">The IBNai Profit Engine</span>
                </div>
                <ul className="space-y-8">
                  {[
                    { title: "Instant Digital Menu", desc: "Update prices and items in real-time. 100% hygienic." },
                    { title: "0% Commission", desc: "Direct ordering means every rupee stays in your bank account." },
                    { title: "Flawless Accuracy", desc: "Customers order exactly what they want directly from their phone." },
                    { title: "Turbocharged Service", desc: "Orders hit your kitchen instantly. Turnover tables 25% faster." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-6">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1 text-white">{item.title}</h4>
                        <p className="text-emerald-50/80 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Greedy Pricing */}
      <section id="pricing" className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-24">
          <Badge variant="accent-secondary" className="bg-emerald-600/10 text-emerald-600 border-none px-6 py-2 rounded-full mb-6 font-black uppercase tracking-widest text-sm">Transparent Pricing</Badge>
          <h2 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">Choose Your Profit Level</h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">No hidden fees. No commissions. Just pure profit.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Starter Plan */}
          <div className="p-12 rounded-[48px] bg-slate-50 border border-slate-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Starter</h3>
                <span className="px-4 py-1 rounded-full bg-slate-200 text-[10px] font-black uppercase tracking-widest">Early Access</span>
              </div>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black text-slate-900 italic tracking-tighter">₹0</span>
                <span className="text-slate-400 font-bold text-lg uppercase">/month</span>
              </div>
              <p className="text-slate-500 font-medium mb-10 text-lg">Free Forever for the first 50 smart restaurant owners who join today.</p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Digital QR Menu</li>
                <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Real-time Updates</li>
                <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Basic Analytics</li>
                <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Email Support</li>
              </ul>
            </div>
            <Link to="/register">
              <Button fullWidth size="lg" className="h-16 bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-100 transition-colors text-lg font-black uppercase tracking-widest">Start for Free</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-12 rounded-[48px] bg-slate-900 text-white shadow-2xl shadow-emerald-600/20 border-4 border-emerald-600 relative scale-105">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl animate-bounce">
              Most Profitable Choice
            </div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Pro</h3>
              <Zap className="text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-7xl font-black text-white italic tracking-tighter">₹499</span>
              <span className="text-slate-400 font-bold text-lg uppercase">/month</span>
            </div>
            <p className="text-slate-400 font-medium mb-10 text-lg">The 'Money Maker' plan. Everything you need to dominate your city.</p>
            <ul className="space-y-4 mb-12">
              <li className="flex items-center gap-3 text-slate-200 font-bold text-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /> Unlimited Orders</li>
              <li className="flex items-center gap-3 text-slate-200 font-bold text-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /> Advanced Sales Insights</li>
              <li className="flex items-center gap-3 text-slate-200 font-bold text-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /> Custom Branding</li>
              <li className="flex items-center gap-3 text-slate-200 font-bold text-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /> VIP WhatsApp Support</li>
              <li className="flex items-center gap-3 text-slate-200 font-bold text-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /> Priority Feature Access</li>
            </ul>
            <Link to="/register">
              <Button fullWidth size="lg" className="h-20 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/40 border-none transition-transform hover:scale-[1.02]">Get the Pro Edge</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight italic">Join 50+ Smart Restaurants in Andhra Pradesh</h2>
             <div className="flex justify-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-amber-500 fill-amber-500" />)}
             </div>
             <p className="text-xl text-slate-500 font-bold uppercase tracking-widest">Empowering local owners, one table at a time.</p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-white rounded-[32px] border border-slate-200 flex items-center justify-center p-8 grayscale hover:grayscale-0 transition-all cursor-pointer group shadow-sm hover:shadow-xl">
                   <div className="text-center group-hover:scale-110 transition-transform duration-500">
                     <Users className="w-12 h-12 mx-auto mb-4 text-emerald-600 opacity-20 group-hover:opacity-100" />
                     <span className="font-black text-slate-400 text-sm group-hover:text-slate-900 uppercase tracking-widest leading-none">Restaurant Logo</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[64px] shadow-2xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 text-emerald-600">
                <IndianRupee className="w-64 h-64 rotate-12" />
             </div>
             <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1]">Ready to Reclaim Your <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8 italic">Hard-Earned</span> Cash?</h2>
             <Link to="/register">
               <Button size="lg" className="h-20 px-16 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/40 rounded-2xl border-none transition-all hover:scale-110">Launch My Digital Menu Now</Button>
             </Link>
             <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 animate-pulse" /> Setup takes less than 300 seconds.
             </p>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Simple Badge component since we might need local style overrides
const Badge = ({ children, variant, className }: any) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default Home;