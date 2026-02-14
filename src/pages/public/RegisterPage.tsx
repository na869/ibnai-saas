import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight, User, Phone, CheckCircle2, Coffee, UtensilsCrossed, Truck, ChefHat, Pizza, ShoppingBag, ShieldCheck, IndianRupee, Upload, Loader2 } from 'lucide-react';
import { Button, Input, Card, Badge } from '../../components/ui';
import { APP_CONFIG } from '../../config/config';
import { supabase } from '../../config/supabase';
import { useRazorpay } from '../../hooks/useRazorpay';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'starter_pack';
  const selectedPlan = APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans] || APP_CONFIG.plans.starter_pack;

  const { openCheckout, loading: rzpLoading } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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

    // Step 3: Final Submit & Payment
    setLoading(true);
    
    try {
      // 1. Create Auth User
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
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("User creation failed");

      // 2. Handle Plan Logic
      if (planId === 'starter_pack') {
         localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            restaurant_id: data.user.id
         }));
         navigate('/restaurant');
         return;
      } 
      
      // Paid Plan - Trigger Razorpay
      if (!data.session) {
          alert("Account created! Please confirm your email, then complete payment in the dashboard.");
          navigate('/login');
          return;
      }

      // CRITICAL FIX: Force the client to recognize the session immediately
      // This ensures the Authorization header is automatically included in the invoke call
      await supabase.auth.setSession(data.session);

      console.log("Initializing payment for:", planId);
      
      // Call Edge Function to create subscription
      const { data: subData, error: subError } = await supabase.functions.invoke('create-subscription', {
        body: { plan_id: planId }
      });

      if (subError) {
          // Attempt to extract error details from the Edge Function response
          const errorBody = await subError.context?.json();
          const errorMessage = errorBody?.error || subError.message;
          throw new Error(errorMessage);
      }

      await openCheckout({
        key: subData.key_id,
        subscription_id: subData.id,
        name: APP_CONFIG.appName,
        description: `Subscription for ${selectedPlan.name}`,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#059669" },
        handler: async (response: any) => {
          localStorage.setItem('user', JSON.stringify({
             id: data.user!.id,
             email: data.user!.email,
             restaurant_id: data.user!.id
          }));
          alert("Payment Successful! Welcome to IBNai.");
          navigate('/restaurant');
        }
      });

    } catch (err: any) {
      console.error("Registration error:", err);
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
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
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative bg-slate-50">
         <div className="max-w-md w-full mx-auto relative">
           {/* Header Section with Badge */}
           <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex-1">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                 {step === 1 ? 'Founder Identity' : step === 2 ? 'Select Business Type' : 'Finalize Setup'}
               </h1>
               <p className="text-slate-500 font-medium text-sm">
                 {step === 1 ? 'Create your secure admin account.' : step === 2 ? 'Tailor the OS to your needs.' : 'Complete your subscription to unlock.'}
               </p>
             </div>
             <div className="flex-shrink-0">
               <Badge variant="neutral" className="bg-emerald-600 text-white border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 shadow-lg shadow-emerald-600/20">
                 {selectedPlan.name}
               </Badge>
             </div>
           </div>

           <div className="mb-10">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
               <span>Step {step} of 3</span>
               <span>{step === 1 ? 'Identity' : step === 2 ? 'Persona' : 'Payment'}</span>
             </div>
             <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-600 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                 style={{ width: `${(step / 3) * 100}%` }}
               ></div>
             </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {step === 1 && (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 <Input label="Full Name" placeholder="John Doe" icon={<User className="w-5 h-5" />} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
                 <Input label="Email Address" type="email" placeholder="owner@restaurant.com" icon={<Mail className="w-5 h-5" />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                 <Input label="Create Password" type="password" placeholder="••••••••" icon={<Lock className="w-5 h-5" />} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
               </div>
             )}

             {step === 2 && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 {businessTypes.map((type) => (
                   <div key={type.id} onClick={() => setFormData({ ...formData, businessType: type.id })}
                     className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3 group
                       ${formData.businessType === type.id ? 'border-emerald-600 bg-emerald-50' : 'border-white bg-white hover:border-emerald-200'}`}
                   >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.businessType === type.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                       <type.icon className="w-6 h-6" />
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-tight ${formData.businessType === type.id ? 'text-emerald-900' : 'text-slate-500'}`}>{type.label}</span>
                   </div>
                 ))}
               </div>
             )}

             {step === 3 && (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                 <Input label="Restaurant Name" placeholder="e.g. The Urban Spice" icon={<Store className="w-5 h-5" />} value={formData.restaurantName} onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })} autoFocus />
                 <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" icon={<Phone className="w-5 h-5" />} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                 <Input label="City" placeholder="e.g. Mumbai" icon={<Store className="w-5 h-5" />} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
               </div>
             )}

             <div className="flex gap-4 pt-4">
               {step > 1 && <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="w-1/3 text-slate-500">Back</Button>}
               <Button type="submit" fullWidth size="lg" loading={loading || rzpLoading} className="shadow-xl shadow-emerald-600/20 h-16 rounded-2xl font-black uppercase tracking-widest text-xs"
                 icon={step === 3 ? (loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />) : <ArrowRight className="w-5 h-5" />}
               >
                 {step === 3 ? (planId === 'starter_pack' ? 'Complete Registration' : `Pay ₹${selectedPlan.price}`) : 'Continue'}
               </Button>
             </div>
           </form>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;
