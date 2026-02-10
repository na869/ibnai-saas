import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Phone, Mail, ShieldCheck, TrendingUp } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white/40 py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          {/* Brand & Value Prop */}
          <div className="max-w-xs">
            <div className="flex items-center space-x-2 mb-8 text-white">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tighter italic">IBNai</span>
            </div>
            <p className="font-bold leading-relaxed text-slate-400 mb-8 text-lg">
              The #1 Commission-Free Ordering Platform for India's smartest restaurant owners.
            </p>
            <div className="flex items-center space-x-2 text-emerald-500 font-black text-sm uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5" />
              <span>Certified Digital Security</span>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full lg:w-2/3">
            <div>
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Business Support</h4>
              <ul className="space-y-6 font-bold text-sm uppercase tracking-widest">
                <li>
                  <span className="block text-[10px] text-slate-500 mb-1">24/7 Owner Hotline</span>
                  <a href="tel:+919390949028" className="text-white text-xl hover:text-emerald-500 transition-colors font-black">+91 93909 49028</a>
                </li>
                <li>
                  <span className="block text-[10px] text-slate-500 mb-1">General Inquiries</span>
                  <a href="mailto:naseershaik@gmail.com" className="text-white hover:text-emerald-500 transition-colors lowercase font-bold break-all">naseershaik@gmail.com</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Product</h4>
              <ul className="space-y-6 font-bold text-sm uppercase tracking-widest">
                <li><a href="#features" className="hover:text-emerald-500 transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing Plans</a></li>
                <li><Link to="/register" className="hover:text-emerald-500 transition-colors text-emerald-500">Claim Free Spot</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">Trust & Legal</h4>
              <ul className="space-y-6 font-bold text-sm uppercase tracking-widest">
                <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Use</Link></li>
                <li className="flex items-center gap-2 text-emerald-500/50 italic">
                  <TrendingUp className="w-4 h-4" /> Built for Profit
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
            © 2026 IBNai Digital Systems. All rights reserved.
          </p>
          <div className="flex gap-8">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Status: 100% Online
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;