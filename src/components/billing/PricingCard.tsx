import React from 'react';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { Card, Button, Badge } from '../ui';

interface Plan {
  id: string;
  name: string;
  price?: number;
  price_amount?: number;
  features: string[] | any;
  description?: string;
}

interface PricingCardProps {
  plan: Plan;
  isCurrent?: boolean;
  loading?: boolean;
  onSubscribe: (planId: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isCurrent, 
  loading, 
  onSubscribe 
}) => {
  const isPopular = plan.id === 'growth_pack';
  const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
  const price = plan.price_amount !== undefined ? plan.price_amount : plan.price || 0;

  return (
    <Card className={`relative flex flex-col h-full transition-all duration-500 border-2 overflow-hidden ${
      isPopular 
        ? 'border-emerald-600 shadow-2xl shadow-emerald-600/10 scale-105 z-10 bg-white' 
        : 'border-slate-100 bg-white hover:border-emerald-200 shadow-xl shadow-slate-200/50'
    }`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-2 rotate-45 translate-x-[30px] translate-y-[10px] shadow-lg">
            Popular
          </div>
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${isPopular ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{plan.name}</h3>
            {isCurrent && (
              <Badge variant="success" className="font-black text-[8px] uppercase tracking-[0.2em] py-0.5">Active Plan</Badge>
            )}
          </div>
        </div>

        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
          {plan.description || "The infrastructure you need to scale your restaurant's digital presence."}
        </p>

        <div className="flex items-baseline gap-1 mb-8">
          <span className="text-5xl font-black text-slate-900 tracking-tighter">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/month</span>
        </div>

        <div className="h-px bg-slate-100 w-full mb-8" />

        <ul className="space-y-4 mb-10 flex-1">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600 group">
              <div className="mt-1 flex-shrink-0">
                 <CheckCircle2 className={`w-4 h-4 ${isPopular ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
              <span className="group-hover:text-slate-900 transition-colors">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          fullWidth 
          size="lg" 
          variant={isPopular ? 'primary' : 'outline'}
          loading={loading}
          disabled={isCurrent}
          onClick={() => onSubscribe(plan.id)}
          className={`h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
            isPopular ? 'shadow-xl shadow-emerald-600/20' : ''
          }`}
          icon={isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        >
          {isCurrent ? 'Current Plan' : price === 0 ? 'Get Started' : 'Upgrade to Pro'}
        </Button>
      </div>
    </Card>
  );
};
