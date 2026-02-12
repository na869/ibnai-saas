import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  History, 
  ArrowUpRight, 
  Upload, 
  Clock,
  IndianRupee,
  Lock
} from "lucide-react";
import { Card, Button, Badge, Loading, Input, ImageUpload } from "../../components/ui";
import { supabase } from "../../config/supabase";
import { APP_CONFIG } from "../../config/config";
import { formatCurrency } from "../../utils/helpers";
import { QRCodeSVG } from "qrcode.react";

const Billing: React.FC = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { data } = await supabase.from("restaurants").select("*").eq("id", user.restaurant_id).single();
    setRestaurant(data);
    setLoading(false);
  };

  const handleUpgradeRequest = async () => {
    if (!selectedPlan || !paymentProof) {
      alert("Please upload payment proof first.");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from("registration_requests").insert([{
        restaurant_name: restaurant.name,
        owner_name: restaurant.owner_name,
        email: restaurant.email,
        phone: restaurant.phone,
        status: 'pending',
        requested_plan: selectedPlan,
        payment_proof_url: paymentProof,
        notes: `UPGRADE REQUEST. TXN ID: ${txnId}`
      }]);

      if (error) throw error;
      alert("Upgrade request submitted! Our team will verify and activate your plan within 2 hours.");
      setSelectedPlan(null);
      setPaymentProof("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading text="Syncing financial ledger..." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
           <CreditCard className="w-3 h-3" /> Financial Ecosystem
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your plan and access premium infrastructure.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Plan Card */}
        <Card className="bg-slate-900 text-white border-none p-8 flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldCheck className="w-32 h-32 rotate-12" />
           </div>
           <div className="relative z-10">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Current Status</p>
             <h2 className="text-3xl font-black mb-6">{APP_CONFIG.plans[restaurant?.subscription_plan as keyof typeof APP_CONFIG.plans]?.name}</h2>
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> All features active
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-500" /> Renew on: {new Date(restaurant?.subscription_expiry).toLocaleDateString()}
                </div>
             </div>
           </div>
           <div className="pt-10 relative z-10">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Secured by IBNai Vault</p>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-full animate-pulse" />
              </div>
           </div>
        </Card>

        {/* Upgrade Logic */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(APP_CONFIG.plans).filter(([k]) => k !== restaurant?.subscription_plan && k !== 'starter_pack').map(([key, plan]) => (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all border-2 ${selectedPlan === key ? 'border-emerald-600 bg-emerald-50 shadow-2xl' : 'border-slate-100 hover:border-emerald-200'}`}
                  onClick={() => setSelectedPlan(key)}
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-xl ${selectedPlan === key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Zap className="w-6 h-6" />
                      </div>
                      <Badge variant="neutral" className="font-black">POPULAR</Badge>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
                   <p className="text-3xl font-black text-slate-900 mb-6">{APP_CONFIG.defaultCurrency}{plan.price}<span className="text-xs text-slate-400 font-bold uppercase"> / mo</span></p>
                   <ul className="space-y-3">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
                        </li>
                      ))}
                   </ul>
                </Card>
              ))}
           </div>

           {selectedPlan && (
             <Card className="border-emerald-600/20 bg-white p-8 animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-emerald-600/10">
                <div className="grid md:grid-cols-2 gap-10">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Step 1: Transfer Payment</h3>
                      <p className="text-slate-500 text-sm font-medium mb-8">Scan our official merchant QR to process your upgrade. Use your restaurant name in the notes.</p>
                      
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                         <div className="bg-white p-4 rounded-3xl shadow-2xl mb-4 flex items-center justify-center border border-slate-100">
                            <QRCodeSVG 
                              value={`upi://pay?pa=${APP_CONFIG.adminPayment.upiId}&pn=${encodeURIComponent(APP_CONFIG.adminPayment.accountHolder)}&am=${APP_CONFIG.plans[selectedPlan as keyof typeof APP_CONFIG.plans]?.price || 0}&cu=INR`}
                              size={180}
                              level="H"
                            />
                         </div>
                         <p className="font-black text-slate-900 text-sm tracking-widest">{APP_CONFIG.adminPayment.upiId}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{APP_CONFIG.adminPayment.accountHolder}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Step 2: Verification</h3>
                      <ImageUpload
                        label="Payment Screenshot"
                        value={paymentProof}
                        onChange={setPaymentProof}
                        bucket="restaurant-assets"
                        path={`${restaurant.id}/payments`}
                        helperText="Upload the confirmation screen"
                      />
                      <Input 
                        label="Transaction ID (Optional)" 
                        placeholder="UTR / Ref Number" 
                        value={txnId}
                        onChange={e => setTxnId(e.target.value)}
                      />
                      <Button 
                        fullWidth 
                        size="lg" 
                        loading={uploading}
                        onClick={handleUpgradeRequest}
                        className="h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                      >
                        Verify & Activate
                      </Button>
                   </div>
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
};

export default Billing;