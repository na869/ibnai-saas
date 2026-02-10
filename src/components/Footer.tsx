import React from "react";
import { Link } from "react-router-dom";
import { Store, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-32 pb-16 px-6 relative overflow-hidden">
      {/* Visual Identity Watermark */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-600/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black">IBNai</span>
                <span className="text-2xl font-black text-white tracking-tighter">DineOS</span>
              </div>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed text-lg italic">
              Serve Smart. Built by IBNai: Architects of Intelligence.
            </p>
            <div className="flex gap-4">
              {[Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Infrastructure</h4>
            <ul className="space-y-4">
              <li><Link to="/register" className="text-slate-400 font-bold hover:text-white transition-colors">Start Free Trial</Link></li>
              <li><Link to="/login" className="text-slate-400 font-bold hover:text-white transition-colors">Partner Dashboard</Link></li>
              <li><a href="#features" className="text-slate-400 font-bold hover:text-white transition-colors">DineOS Core</a></li>
              <li><a href="#pricing" className="text-slate-400 font-bold hover:text-white transition-colors">Pricing Structure</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Legal Compliance</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-slate-400 font-bold hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 font-bold hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="text-slate-400 font-bold hover:text-white transition-colors">Cookie Architecture</a></li>
              <li><a href="#" className="text-slate-400 font-bold hover:text-white transition-colors">Security Audit</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Communications</h4>
            <div className="space-y-6">
              <a href="tel:+919390949028" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Support</p>
                  <p className="text-white font-black">+91 93909 49028</p>
                </div>
              </a>
              <a href="mailto:naseershaik@gmail.com" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Inquiry</p>
                  <p className="text-white font-black">naseershaik@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
            © 2026 IBNai Digital Systems. All Systems Operational.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Series-A Verified Node</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;