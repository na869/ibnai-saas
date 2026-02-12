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
  ArrowRight,
  Globe
} from "lucide-react";
import { Button } from "../components/ui";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { APP_CONFIG } from "../config/config";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section - The "Statement" */}
      <section className="relative pt-48 pb-40 px-6 bg-slate-900 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-in-up backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
            <Zap className="w-3 h-3" /> The Profit-First Operating System
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-10 animate-in-up delay-100">
            Stop Donating <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">30% to Aggregators.</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-16 leading-relaxed animate-in-up delay-200 text-balance">
            Keep <span className="text-white font-bold underline decoration-emerald-500 underline-offset-8">100% of your profit</span>. IBNai DineOS is the zero-commission infrastructure for the next generation of restaurants.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in-up delay-300">
            <Link to="/register">
              <Button size="lg" className="h-24 px-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-lg shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] transition-all scale-100 hover:scale-105 group">
                Launch My DineOS
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center ml-6 group-hover:rotate-45 transition-transform">
                   <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-left">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
               </div>
               <div>
                 <p className="text-white font-bold text-sm">Join 500+ Founders</p>
                 <p className="text-slate-500 text-xs">Scaling profitably today</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Intelligence Grid */}
      <section id="features" className="py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">Built for <span className="text-emerald-600">Scale</span>.</h2>
             <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Enterprise-grade tools simplified for every kitchen.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Contactless IQ",
                desc: "High-speed QR ordering that feels like a native app. Reduce wait times by 40% instantly.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: BarChart3,
                title: "Yield Analytics",
                desc: "Deep-dive into your profit DNA. Know which dishes are actually paying your rent.",
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                icon: Globe,
                title: "Direct Capital",
                desc: "Money hits your bank account instantly via UPI. No holding periods, no transaction fees.",
                color: "bg-indigo-50 text-indigo-600"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-12 rounded-[40px] border-2 border-slate-100 hover:border-slate-200 bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2">
                <div className={`w-20 h-20 ${feature.color} rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-loose text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Series A Style */}
      <section id="pricing" className="py-40 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {Object.entries(APP_CONFIG.plans).map(([key, plan]) => {
              const isGrowth = key === 'growth_pack';
              const isCustom = key === 'customizeble_pack';
              
              return (
                <div 
                  key={key} 
                  className={`p-10 rounded-[40px] border-2 transition-all duration-500 relative overflow-hidden group flex flex-col h-full ${
                    isGrowth 
                      ? 'bg-slate-900 border-slate-900 shadow-2xl scale-105 z-10 text-white' 
                      : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {isGrowth && (
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/20 animate-pulse">
                      <Zap className="w-32 h-32 rotate-12" />
                    </div>
                  )}
                  
                  <div className="mb-10 relative z-10">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${isGrowth ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {isCustom ? 'Flagship' : isGrowth ? 'Most Popular' : 'Entry Level'}
                    </p>
                    <h3 className="text-4xl font-black tracking-tighter">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-10 relative z-10">
                    <span className="text-6xl font-black italic tracking-tighter">{APP_CONFIG.defaultCurrency}{plan.price}</span>
                    <span className={`font-black uppercase tracking-widest text-xs ${isGrowth ? 'text-slate-500' : 'text-slate-400'}`}>/ {plan.duration}</span>
                  </div>

                  <ul className="space-y-5 mb-12 relative z-10 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className={`flex items-start gap-4 font-bold text-sm leading-relaxed ${isGrowth ? 'text-slate-300' : 'text-slate-600'}`}>
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isGrowth ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link to={`/register?plan=${key}`} className="relative z-10 mt-auto">
                    <Button 
                      fullWidth 
                      variant={isGrowth ? 'primary' : 'outline'} 
                      className={`h-16 rounded-2xl font-black uppercase tracking-widest text-xs ${
                        isGrowth 
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-none shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {plan.price === 0 ? 'Start Free' : 'Get Started'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600/10 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-12 italic">Ready to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Serve Smart?</span></h2>
          <p className="text-slate-400 text-xl md:text-2xl font-medium mb-16 max-w-2xl mx-auto">Join the new generation of profitable restaurants globally. Setup takes less than 5 minutes.</p>
          <Link to="/register">
            <Button size="lg" className="h-24 px-16 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-xl shadow-2xl group">
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