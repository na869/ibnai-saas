import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import { Scale, Gavel, CreditCard, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-emerald-600/10 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-600/30 px-4 py-1.5 rounded-full mb-8">
            <Gavel className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">Legal Framework & Usage</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Terms of Use</h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            Clear, transparent, and fair. Our terms are designed to protect both the IBNai ecosystem and your restaurant's growth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[350px_1fr] gap-20">
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6">Summary of Rights</h3>
                <ul className="space-y-6">
                  {[
                    "You own your menu content",
                    "We guarantee 99.9% uptime",
                    "No hidden commission fees",
                    "Cancel your plan at any time"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <article className="prose prose-slate max-w-none space-y-16">
            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-emerald-500" />
                </div>
                1. Acceptance of Global Terms
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                By accessing IBNai Digital Systems, you enter into a legally binding agreement with IBNai. Our platform is provided to help restaurants scale through digital innovation. Continued use of the platform constitutes acceptance of all terms outlined herein.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-emerald-500" />
                </div>
                2. Subscription & Commission Policy
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                IBNai operates on a flat-fee subscription model. We explicitly do not charge commission on your orders.
              </p>
              <ul className="list-disc pl-6 mt-6 space-y-4 text-slate-600 font-medium">
                <li><strong>Free Trial:</strong> The 14-day trial period is fully functional and requires no payment information upfront.</li>
                <li><strong>Billing:</strong> Fees are processed monthly in advance. Failed payments may result in temporary suspension of the digital menu.</li>
                <li><strong>Refunds:</strong> We provide a pro-rated refund for annual plans cancelled within the first 30 days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 tracking-tight">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 text-emerald-500" />
                </div>
                3. Operational Liability
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                While IBNai provides the infrastructure for ordering, the restaurant remains solely responsible for food quality, pricing accuracy, and tax compliance. IBNai shall not be liable for any revenue loss due to service interruptions beyond our 99.9% SLA guarantee.
              </p>
            </section>

            <section className="bg-slate-900 p-12 rounded-[48px] text-white">
              <div className="flex items-center gap-4 mb-8">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl font-black text-white tracking-tight">Termination</h2>
              </div>
              <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed">
                You may terminate your account at any time. Upon termination, your digital menu will remain active until the end of the current billing cycle.
              </p>
              <div className="flex flex-col sm:flex-row gap-8">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Legal Department</span>
                  <p className="font-bold text-lg">naseershaik@gmail.com</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Corporate Address</span>
                  <p className="font-bold text-lg">IBNai Digital Systems, Hyderabad, India</p>
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

export default Terms;