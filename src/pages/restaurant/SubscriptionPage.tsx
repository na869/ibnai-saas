import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  History, 
  Download,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Card, Loading, Badge, Alert } from "../../components/ui";
import { PricingCard } from "../../components/billing/PricingCard";
import { useRazorpay } from "../../hooks/useRazorpay";
import { supabase } from "../../config/supabase";
import { APP_CONFIG } from "../../config/config";

const SubscriptionPage: React.FC = () => {
  const { openCheckout, loading: rzpLoading } = useRazorpay();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const [plansRes, restRes, subRes] = await Promise.all([
      supabase.from("plans").select("id, name, description, price, price_amount, features").eq("is_active", true),
      supabase.from("restaurants").select("id, name, slug, logo_url, owner_name, email, phone, subscription_plan, subscription_expiry").eq("id", user.restaurant_id).single(),
      supabase.from("subscriptions").select("id, status, plan_id, current_period_end").eq("restaurant_id", user.restaurant_id).maybeSingle()
    ]);

    // Manually link plan details to subscription since we removed the join
    const subData = subRes.data as any;
    if (subData && plansRes.data) {
      subData.plan = plansRes.data.find(p => p.id === subData.plan_id);
    }

    // Sorting: Starter -> Growth -> Customizable
    const sortedPlans = (plansRes.data || []).sort((a, b) => {
      const order = { starter_pack: 1, growth_pack: 2, customizeble_pack: 3 };
      return (order[a.id as keyof typeof order] || 99) - (order[b.id as keyof typeof order] || 99);
    });

    setPlans(sortedPlans);
    setRestaurant(restRes.data);
    setSubscription(subData);
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.price_amount === 0) return;

    setSubmittingId(planId);
    try {
      // Get current session and refresh if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Please log in to continue.");

      // 1. Call Supabase Edge Function to initialize subscription
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan_id: planId }
      });

      if (error) throw error;

      // 2. Open Razorpay Checkout
      await openCheckout({
        key: data.key_id, // Returned from Edge Function
        subscription_id: data.id,
        name: APP_CONFIG.appName,
        description: `Upgrade to ${plan.name}`,
        handler: async (response: any) => {
          console.log("Payment successful:", response);
          alert("Payment successful! Your plan will be updated in a few moments.");
          window.location.reload();
        },
        prefill: {
          name: restaurant?.owner_name || "",
          email: restaurant?.email || "",
          contact: restaurant?.phone || "",
        },
        theme: {
          color: "#059669",
        },
      });

    } catch (err: any) {
      console.error("Subscription error:", err);
      alert(err.message || "Failed to initialize payment gateway.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <Loading text="Loading your financial ecosystem..." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
             <CreditCard className="w-3 h-3" /> Billing Infrastructure
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Plans & Subscriptions.</h1>
          <p className="text-slate-500 font-medium mt-1">Select the power level for your digital restaurant OS.</p>
        </div>
        
        {subscription && (
           <Card className="px-6 py-4 bg-slate-900 border-none shadow-xl flex items-center gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Current Active Plan</p>
                <p className="text-white font-black text-lg leading-none">{(subscription as any).plan?.name || subscription.plans?.name}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Next Billing Date</p>
                <p className="text-white font-bold text-sm leading-none">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
           </Card>
        )}
      </div>

      {subscription?.status === 'past_due' && (
        <Alert type="error" message="Your subscription payment failed. Please update your payment details to maintain access." />
      )}

      {/* Plans Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        {plans.map((plan) => (
          <PricingCard 
            key={plan.id}
            plan={plan}
            isCurrent={restaurant?.subscription_plan === plan.id}
            loading={submittingId === plan.id || rzpLoading}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Footer Support */}
      <div className="grid md:grid-cols-2 gap-8 pt-10 border-t-2 border-slate-100">
        <Card className="p-8 bg-slate-50 border-none shadow-sm flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <HelpCircle className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-2 tracking-tight">Need a custom enterprise plan?</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">For franchises with 5+ outlets, we offer custom pricing and dedicated infrastructure.</p>
            <button className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline underline-offset-4">Talk to Sales</button>
          </div>
        </Card>

        <Card className="p-8 bg-slate-50 border-none shadow-sm flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-2 tracking-tight">Secure Payment Processing</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">All transactions are encrypted and processed via Razorpay. We never store your card details.</p>
            <div className="flex gap-4 opacity-30 grayscale">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
