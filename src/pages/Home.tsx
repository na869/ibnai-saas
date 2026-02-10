import React from "react";
import { Link } from "react-router-dom";
import { 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Smartphone, 
  BarChart3, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black">IBNai</span>
              <span className="text-2xl font-black text-white tracking-tighter">DineOS</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</a>
            <Link to="/login">
              <Button variant="ghost" className="text-white font-black uppercase tracking-widest text-xs">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">
                Launch My DineOS Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - The Greedy Sales Proposition */}
      <section className="pt-48 pb-32 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-600/5 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap className="w-3 h-3" /> The Profit-First Operating System
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Stop Donating 30% <br />to Zomato. <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Keep 100%</span> <br />of Your Profit.
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            IBNai DineOS helps you <span className="text-white font-bold italic">Serve Smart</span>. The Zero-Commission Operating System for Modern Restaurants.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link to="/register">
              <Button size="lg" className="h-20 px-12 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-lg shadow-2xl shadow-emerald-600/40 group">
                Launch My DineOS Free
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Setup in <span className="text-slate-300">5 Minutes</span> • No Hardware Required
            </p>
          </div>
        </div>
      </section>

      {/* Feature Intelligence Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                icon: Smartphone,
                title: "Contactless IQ",
                desc: "High-speed QR ordering that feels like a native app. Reduce wait times by 40% instantly."
              },
              {
                icon: BarChart3,
                title: "Yield Analytics",
                desc: "Deep-dive into your profit DNA. Know which dishes are actually paying your rent."
              },
              {
                icon: Zap,
                title: "Instant Kitchen",
                desc: "Direct transmission from customer phone to kitchen display. Eliminate order errors entirely."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[40px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-600/20 transition-all hover:shadow-2xl hover:shadow-emerald-600/5">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Series A Style */}
      <section id="pricing" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic mb-6">Built for Scale.</h2>
             <p className="text-slate-500 font-medium text-xl uppercase tracking-widest">Transparent. Scalable. Profit-Focused.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-12 rounded-[48px] border-2 border-slate-100 shadow-xl relative overflow-hidden">
               <div className="mb-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2">The Foundation</p>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Starter</h3>
               </div>
               <div className="flex items-baseline gap-2 mb-10">
                 <span className="text-6xl font-black text-slate-900 italic tracking-tighter">₹0</span>
                 <span className="text-slate-400 font-black uppercase tracking-widest text-xs">/ month</span>
               </div>
               <ul className="space-y-6 mb-12">
                 {[
                   "Free for first 50 Restaurants",
                   "Unlimited QR orders",
                   "Basic menu management",
                   "Digital menu hosting",
                   "Standard Support"
                 ].map((feat, i) => (
                   <li key={i} className="flex items-center gap-4 text-slate-600 font-bold">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {feat}
                   </li>
                 ))}
               </ul>
               <Link to="/register">
                 <Button fullWidth variant="outline" className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">Get Started</Button>
               </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 text-emerald-500/20">
                 <Zap className="w-24 h-24 rotate-12" />
               </div>
               <div className="mb-10 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">High Volume</p>
                 <h3 className="text-4xl font-black text-white tracking-tighter">Pro</h3>
               </div>
               <div className="flex items-baseline gap-2 mb-10 relative z-10">
                 <span className="text-6xl font-black text-white italic tracking-tighter">₹499</span>
                 <span className="text-slate-500 font-black uppercase tracking-widest text-xs">/ month</span>
               </div>
               <ul className="space-y-6 mb-12 relative z-10">
                 {[
                   "Complete Control",
                   "Advanced Analytics",
                   "Inventory Management",
                   "Custom Branding",
                   "Priority Support"
                 ].map((feat, i) => (
                   <li key={i} className="flex items-center gap-4 text-slate-300 font-bold">
                     <Zap className="w-5 h-5 text-emerald-500" /> {feat}
                   </li>
                 ))}
               </ul>
               <Link to="/register">
                 <Button fullWidth className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-none font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">Go Pro Now</Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 bg-emerald-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-10 italic">Ready to Serve Smart?</h2>
          <p className="text-emerald-50 text-xl md:text-2xl font-medium mb-16 max-w-2xl mx-auto">Join the new generation of profitable restaurants globally.</p>
          <Link to="/register">
            <Button size="lg" className="h-24 px-16 rounded-[32px] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xl shadow-2xl group">
              Launch My DineOS Free
              <ArrowRight className="w-6 h-6 ml-4 transition-transform group-hover:translate-x-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;