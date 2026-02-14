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
  Lock,
  Download
} from "lucide-react";
import { Card, Button, Badge, Loading, Input, ImageUpload, Alert, Select } from "../../components/ui";
import { PricingCard } from "../../components/billing/PricingCard";
import { supabase } from "../../config/supabase";
import { APP_CONFIG } from "../../config/config";
import { formatCurrency } from "../../utils/helpers";
import { QRCodeSVG } from "qrcode.react";

const Billing: React.FC = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [restRes, subRes, plansRes] = await Promise.all([
      supabase.from("restaurants").select("id, name, owner_name, email, phone, subscription_plan, subscription_expiry").eq("id", user.restaurant_id).single(),
      supabase.from("subscriptions").select("id, status, plan_id, current_period_end").eq("restaurant_id", user.restaurant_id).maybeSingle(),
      supabase.from("plans").select("id, name, price, price_amount, features")
    ]);
    
    const subData = subRes.data as any;
    if (subData && plansRes.data) {
      subData.plan = plansRes.data.find((p: any) => p.id === subData.plan_id);
    }

    setRestaurant(restRes.data);
    setSubscription(subData);
    setLoading(false);
  };

  const handleSubscription = async (planId: string) => {
    const plan = APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans];
    if (plan.price === 0) return;

    setSubmitting(true);
    try {
      // 1. Call Edge Function to create checkout session/subscription
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan_id: planId }
      });

      if (error) throw error;

      // 2. Redirect to Razorpay/Gateway (Simplified for now)
      console.log("Subscription data:", data);
      alert("Opening payment gateway... (Requires Razorpay Integration)");
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to initialize payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgradeRequest = async () => {
    if (!selectedPlan || !paymentProof) {
      alert("Please upload payment proof first.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("registration_requests").insert([{
        restaurant_name: restaurant?.name,
        owner_name: restaurant?.owner_name,
        email: restaurant?.email,
        phone: restaurant?.phone,
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
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Syncing financial ledger..." />;

  const plans = Object.values(APP_CONFIG.plans);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
           <CreditCard className="w-3 h-3" /> Financial Ecosystem
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your infrastructure access and billing history.</p>
      </div>

      {subscription?.status === 'past_due' && (
        <Alert type="error" message="Your subscription is past due. Please update your payment method to avoid service interruption." />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Plan Card */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-8 flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Current Infrastructure</p>
              <h2 className="text-4xl font-black mb-6">{(subscription as any).plan?.name || subscription?.plans?.name || APP_CONFIG.plans[restaurant?.subscription_plan as keyof typeof APP_CONFIG.plans]?.name}</h2>
              <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
                    Status: <Badge variant={subscription?.status === 'active' ? 'success' : 'neutral'} className="ml-1 uppercase font-black text-[10px]">
                      {subscription?.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-500" /> Next Bill: {new Date(subscription?.current_period_end || restaurant?.subscription_expiry).toLocaleDateString()}
                  </div>
              </div>
            </div>
            <div className="pt-10 relative z-10">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Enterprise Security Active</p>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full animate-pulse" />
                </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" /> Recent Invoices
            </h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group cursor-pointer">
                  <div>
                    <p className="text-sm font-black text-slate-900">INV-2026-00{i}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Feb {i}, 2026</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <PricingCard 
                key={plan.id}
                plan={plan as any}
                isCurrent={restaurant?.subscription_plan === plan.id}
                onSubscribe={handleSubscription}
                loading={submitting}
              />
            ))}
          </div>

          <div className="border-t-2 border-slate-100 pt-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-emerald-600" /> Manual Payment Override
            </h3>
            <Alert type="info" message="Need a custom setup or experiencing payment issues? Use our manual verification system below." className="mb-8" />
            
            <Card className="border-slate-100 bg-white p-8">
                <div className="grid md:grid-cols-2 gap-10">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight italic">Scan & Transfer</h3>
                      <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Scan our official merchant QR. Your account will be upgraded within 2 hours of verification.</p>
                      
                      <div className="bg-slate-900 p-8 rounded-[40px] flex flex-col items-center shadow-2xl">
                         <div className="bg-white p-5 rounded-[32px] shadow-2xl mb-6 flex items-center justify-center border-4 border-emerald-500/20">
                            <QRCodeSVG 
                              value={`upi://pay?pa=${APP_CONFIG.adminPayment.upiId}&pn=${encodeURIComponent(APP_CONFIG.adminPayment.accountHolder)}&am=${APP_CONFIG.plans[selectedPlan as keyof typeof APP_CONFIG.plans]?.price || 0}&cu=INR`}
                              size={180}
                              level="H"
                            />
                         </div>
                         <p className="font-mono text-emerald-400 text-sm font-bold tracking-widest">{APP_CONFIG.adminPayment.upiId}</p>
                         <p className="text-[10px] font-black text-white/40 uppercase mt-2 tracking-[0.3em]">{APP_CONFIG.adminPayment.accountHolder}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight italic">Evidence Upload</h3>
                      <Select 
                        label="Select Target Plan"
                        value={selectedPlan || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlan(e.target.value)}
                        options={plans.filter(p => p.price > 0).map(p => ({ value: p.id, label: p.name }))}
                      />
                      <ImageUpload
                        label="Payment Confirmation Screenshot"
                        value={paymentProof}
                        onChange={setPaymentProof}
                        bucket="restaurant-assets"
                        path={`${restaurant.id}/payments`}
                        helperText="Upload the digital receipt or UTR screen"
                      />
                      <Input 
                        label="Transaction ID / UTR" 
                        placeholder="12-digit number" 
                        value={txnId}
                        onChange={e => setTxnId(e.target.value)}
                      />
                      <Button 
                        fullWidth 
                        size="lg" 
                        loading={submitting}
                        disabled={!selectedPlan || !paymentProof}
                        onClick={handleUpgradeRequest}
                        className="h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                      >
                        Verify & Activate Access
                      </Button>
                   </div>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;