import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../../components/ui';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Restaurant Details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/restaurant/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Side - Visuals (Swapped for Register to vary layout) */}
      <div className="hidden lg:flex flex-col bg-emerald-900 relative overflow-hidden p-20 justify-between">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/0 via-emerald-900/50 to-emerald-900"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-emerald-900" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">IBNai</span>
          </Link>
          
          <h2 className="text-5xl font-black text-white leading-tight mb-8">
            Join the Revolution in Dining.
          </h2>
          <ul className="space-y-6">
            {[
              "Setup your menu in 5 minutes",
              "Accept unlimited QR orders",
              "No hardware required",
              "Cancel anytime"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-emerald-100 font-bold text-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="flex -space-x-4 mb-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-12 h-12 rounded-full border-4 border-emerald-900 bg-slate-200 flex items-center justify-center overflow-hidden">
                 <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Owner" />
               </div>
             ))}
          </div>
          <p className="text-emerald-100 font-medium">Join 500+ restaurant owners growing with IBNai.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
         <div className="lg:hidden mb-8">
           <Link to="/" className="flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-black text-slate-900">IBNai</span>
           </Link>
         </div>

         <div className="max-w-md w-full mx-auto">
           <div className="mb-8">
             <div className="flex items-center gap-2 mb-4">
               <span className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`}></span>
               <span className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}></span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
               {step === 1 ? 'Create Your Account' : 'Setup Restaurant'}
             </h1>
             <p className="text-slate-500 font-medium text-lg">
               {step === 1 ? 'Start your 14-day free trial. No credit card required.' : 'Tell us about your business.'}
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {step === 1 ? (
               <>
                 <Input
                   label="Full Name"
                   type="text"
                   placeholder="John Doe"
                   icon={<User className="w-5 h-5" />}
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   required
                   autoFocus
                 />
                 <Input
                   label="Email Address"
                   type="email"
                   placeholder="owner@restaurant.com"
                   icon={<Mail className="w-5 h-5" />}
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   required
                 />
                 <Input
                   label="Password"
                   type="password"
                   placeholder="Create a strong password"
                   icon={<Lock className="w-5 h-5" />}
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                   required
                 />
               </>
             ) : (
               <>
                 <Input
                   label="Restaurant Name"
                   type="text"
                   placeholder="Tasty Bites"
                   icon={<Store className="w-5 h-5" />}
                   value={formData.restaurantName}
                   onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                   required
                   autoFocus
                 />
                 <Input
                   label="Phone Number"
                   type="tel"
                   placeholder="+91 98765 43210"
                   icon={<Phone className="w-5 h-5" />}
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   required
                 />
                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                   <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                     By clicking "Launch Dashboard", you agree to our Terms of Service and Privacy Policy. You will not be charged today.
                   </p>
                 </div>
               </>
             )}

             <div className="flex gap-4">
               {step === 2 && (
                 <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-1/3">
                   Back
                 </Button>
               )}
               <Button 
                 type="submit" 
                 fullWidth 
                 size="lg" 
                 loading={loading}
                 className="shadow-xl shadow-emerald-600/20"
                 icon={step === 1 ? <ArrowRight className="w-5 h-5" /> : <Store className="w-5 h-5" />}
               >
                 {step === 1 ? 'Next Step' : 'Launch Dashboard'}
               </Button>
             </div>
           </form>

           <div className="mt-8 text-center">
             <p className="text-slate-500 font-medium">
               Already have an account?{' '}
               <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                 Sign In
               </Link>
             </p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;