import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight, User, Phone, CheckCircle2, Coffee, UtensilsCrossed, Truck, ChefHat, Pizza, ShoppingBag, ShieldCheck, IndianRupee, Upload } from 'lucide-react';
import { Button, Input, Card, Badge, ImageUpload } from '../../components/ui';
import { APP_CONFIG } from '../../config/config';
import { supabase } from '../../config/supabase';

import { QRCodeSVG } from 'qrcode.react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'starter_pack';
  const selectedPlan = APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans] || APP_CONFIG.plans.starter_pack;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentProof, setPaymentProof] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
    businessType: '',
    city: ''
  });

  const businessTypes = [
    { id: 'Restaurant', label: 'Dine-in Restaurant', icon: UtensilsCrossed },
    { id: 'Cafe', label: 'Cafe / Coffee Shop', icon: Coffee },
    { id: 'Cloud Kitchen', label: 'Cloud Kitchen', icon: ChefHat },
    { id: 'Quick Service', label: 'Fast Food / QSR', icon: Pizza },
    { id: 'Food Truck', label: 'Food Truck', icon: Truck },
    { id: 'Bakery', label: 'Bakery', icon: ShoppingBag },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.businessType) return;
      setStep(3);
      return;
    }

    if (step === 3) {
      if (planId !== 'starter_pack' && !paymentProof) {
        setStep(4);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // CEO STRATEGY: Use Native Supabase Auth
      // We pass all business data as 'meta_data'. 
      // The Database Trigger will automatically create the 'restaurants' entry.
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            owner_name: formData.name,
            phone: formData.phone,
            restaurant_name: formData.restaurantName,
            business_type: formData.businessType,
            city: formData.city,
            plan: planId,
            payment_proof: paymentProof
          }
        }
      });

      if (error) throw error;

      if (planId === 'starter_pack') {
        // Auto-login success logic
        navigate('/restaurant');
      } else {
        // Paid plans wait for approval
        setIsPending(true);
      }

    } catch (err: any) {
      console.error("Registration error:", err);
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md animate-in zoom-in duration-700">
          <div className="w-24 h-24 bg-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-600/20">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">Verification Active</h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
            Your <span className="text-emerald-400 font-black">{selectedPlan.name}</span> request is being processed. Our team is verifying the payment settlement. Access will be granted shortly.
          </p>
          <Link to="/">
            <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-white/5 h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
              Return to Landing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSteps = planId === 'starter_pack' ? 3 : 4;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex flex-col bg-slate-900 relative overflow-hidden p-20 justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900"></div>
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <UtensilsCrossed className="w-96 h-96 text-white rotate-12" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group mb-12">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase">IBNai</span>
          </Link>
          
          <h2 className="text-5xl font-black text-white leading-tight mb-8">
            Build Your <br />
            <span className="text-emerald-500 italic underline decoration-emerald-500/20 underline-offset-8">Digital Empire</span>.
          </h2>
          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
            The zero-commission operating system for the next generation of restaurants.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span>Powering Profit</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
          <div className="flex gap-8 mt-6 opacity-50 grayscale">
             <div className="text-2xl font-black text-white">PIZZA<span className="text-emerald-500">HUT</span></div>
             <div className="text-2xl font-black text-white">BURGER<span className="text-amber-500">KING</span></div>
             <div className="text-2xl font-black text-white">SUB<span className="text-emerald-500">WAY</span></div>
          </div>
        </div>
      </div>

      {/* Right Side - Wizard */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative bg-slate-50">
         <div className="max-w-md w-full mx-auto">
           {/* Progress Bar */}
           <div className="mb-10">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
               <span>Step {step} of {totalSteps}</span>
               <span>{step === 1 ? 'Identity' : step === 2 ? 'Persona' : step === 3 ? 'Details' : 'Settlement'}</span>
             </div>
             <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                 style={{ width: `${(step / totalSteps) * 100}%` }}
               ></div>
             </div>
           </div>

           <div className="mb-8">
             <div className="flex items-center gap-2 mb-2">
               <Badge variant="neutral" className="bg-emerald-600 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1">
                 Selected: {selectedPlan.name}
               </Badge>
               {planId === 'customizeble_pack' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
               {step === 1 ? 'Founder Identity' : step === 2 ? 'Select Business Type' : step === 3 ? 'Restaurant Details' : 'Secure Ecosystem'}
             </h1>
             <p className="text-slate-500 font-medium text-lg">
               {step === 1 ? 'Create your secure admin account.' : step === 2 ? 'Tailor the OS to your needs.' : step === 3 ? 'Finalize your digital presence.' : 'Complete your subscription to unlock.'}
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {step === 1 && (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 <Input
                   label="Full Name"
                   placeholder="John Doe"
                   icon={<User className="w-5 h-5" />}
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   autoFocus
                 />
                 <Input
                   label="Email Address"
                   type="email"
                   placeholder="owner@restaurant.com"
                   icon={<Mail className="w-5 h-5" />}
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 />
                 <Input
                   label="Create Password"
                   type="password"
                   placeholder="••••••••"
                   icon={<Lock className="w-5 h-5" />}
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 />
               </div>
             )}

             {step === 2 && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 {businessTypes.map((type) => (
                   <div
                     key={type.id}
                     onClick={() => setFormData({ ...formData, businessType: type.id })}
                     className={`
                       cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3 group
                       ${formData.businessType === type.id 
                         ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-600/10' 
                         : 'border-white bg-white hover:border-emerald-200 hover:shadow-md'}
                     `}
                   >
                     <div className={`
                       w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                       ${formData.businessType === type.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}
                     `}>
                       <type.icon className="w-6 h-6" />
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-tight ${formData.businessType === type.id ? 'text-emerald-900' : 'text-slate-500'}`}>
                       {type.label}
                     </span>
                   </div>
                 ))}
               </div>
             )}

             {step === 3 && (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 <Input
                   label="Restaurant Name"
                   placeholder="e.g. The Urban Spice"
                   icon={<Store className="w-5 h-5" />}
                   value={formData.restaurantName}
                   onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                   autoFocus
                 />
                 <Input
                   label="Phone Number"
                   type="tel"
                   placeholder="+91 98765 43210"
                   icon={<Phone className="w-5 h-5" />}
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                 />
                 <Input
                   label="City"
                   placeholder="e.g. Mumbai"
                   icon={<Store className="w-5 h-5" />}
                   value={formData.city}
                   onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                 />
               </div>
             )}

             {step === 4 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="p-6 bg-slate-900 rounded-[32px] text-center border-2 border-emerald-500/20 shadow-2xl">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Subscription Amount</p>
                     <p className="text-5xl font-black text-white italic">₹{selectedPlan.price}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Payable to: {APP_CONFIG.adminPayment.accountHolder}</p>
                     
                     <div className="mt-6 bg-white p-4 rounded-3xl inline-block shadow-2xl">
                        <QRCodeSVG 
                          value={`upi://pay?pa=${APP_CONFIG.adminPayment.upiId}&pn=${encodeURIComponent(APP_CONFIG.adminPayment.accountHolder)}&am=${selectedPlan.price}&cu=INR`}
                          size={160}
                          level="H"
                        />
                     </div>
                     <p className="mt-4 font-mono text-sm text-emerald-400 font-bold">{APP_CONFIG.adminPayment.upiId}</p>
                  </div>

                  <ImageUpload
                    label="Payment Proof (Screenshot)"
                    value={paymentProof}
                    onChange={setPaymentProof}
                    bucket="restaurant-assets"
                    path="temp-payments"
                    helperText="Upload the transaction confirmation screen"
                  />
               </div>
             )}

             <div className="flex gap-4 pt-4">
               {step > 1 && (
                 <Button 
                   type="button" 
                   variant="ghost" 
                   onClick={() => setStep(step - 1)} 
                   className="w-1/3 text-slate-500 font-bold hover:text-slate-900"
                 >
                   Back
                 </Button>
               )}
               <Button 
                 type="submit" 
                 fullWidth 
                 size="lg" 
                 loading={loading}
                 className="shadow-xl shadow-emerald-600/20 h-16 rounded-2xl font-black uppercase tracking-widest text-xs"
                 icon={step === totalSteps ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
               >
                 {step === totalSteps ? 'Finalize Subscription' : 'Continue'}
               </Button>
             </div>
           </form>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;