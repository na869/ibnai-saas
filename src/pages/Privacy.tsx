import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, FileText, Globe, CheckCircle2 } from 'lucide-react';

const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/10 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-600/30 px-4 py-1.5 rounded-full mb-8">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">Data Protection Standards</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Privacy Policy</h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            We treat your business data with the same level of security as a global financial institution. Your privacy is non-negotiable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[350px_1fr] gap-20">
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6">Core Commitments</h3>
                <ul className="space-y-6">
                  {[
                    "Zero Selling of Data",
                    "Bank-Grade Encryption",
                    "GDPR & CCPA Compliant",
                    "24/7 Security Monitoring"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-emerald-600 rounded-[32px] text-white shadow-2xl shadow-emerald-600/20">
                <Lock className="w-10 h-10 mb-6 opacity-40" />
                <h3 className="text-xl font-black mb-4 tracking-tight">Need help with legal?</h3>
                <p className="text-emerald-50/80 text-sm font-medium mb-8">Our compliance team is available for any questions regarding your restaurant's data.</p>
                <a href="mailto:naseershaik@gmail.com" className="block text-center bg-white text-emerald-600 font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:scale-105 transition-transform">Contact Security</a>
              </div>
            </div>
          </aside>

          <article className="prose prose-slate max-w-none space-y-16">
            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-emerald-500" />
                </div>
                1. Data Architecture & Collection
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                IBNai Digital Systems collects only the essential information required to operate your high-performance digital menu. This includes:
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-xs">Proprietor Data</h4>
                  <p className="text-sm text-slate-500 font-medium">Verified email, business phone, and operational address for account integrity.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-xs">Transaction Data</h4>
                  <p className="text-sm text-slate-500 font-medium">Internal order logs, item preferences, and total revenue metrics for your dashboard.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-emerald-500" />
                </div>
                2. Strategic Data Utilization
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Your data is used exclusively to optimize your restaurant's profit margins. We utilize behavioral analytics to suggest menu improvements and ensure 99.9% system uptime during peak hours. We do not engage in cross-site tracking or selling lists to third-party marketers.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                3. Encryption & Sovereignity
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                All data in transit is encrypted using 256-bit SSL/TLS protocols. Our databases are isolated and firewalled behind multiple layers of defense. You retain full ownership of your data and can request a full export or permanent deletion at any time through our verified owner hotline.
              </p>
            </section>

            <section className="bg-slate-900 p-12 rounded-[48px] text-white">
              <div className="flex items-center gap-4 mb-8">
                <FileText className="w-8 h-8 text-emerald-500" />
                <h2 className="text-3xl font-black text-white tracking-tight">Inquiries</h2>
              </div>
              <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed">
                Our Data Protection Officer (DPO) is available to discuss our security protocols in detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-8">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Primary Email</span>
                  <p className="font-bold text-lg">naseershaik@gmail.com</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Legal Hotline</span>
                  <p className="font-bold text-lg">+91 93909 49028</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;