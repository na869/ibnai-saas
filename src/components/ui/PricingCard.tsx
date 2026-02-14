import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { Card, Button, Badge } from './index';

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
  };
  isCurrent?: boolean;
  onUpgrade: (planId: string) => void;
  loading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isCurrent, onUpgrade, loading }) => {
  return (
    <Card className={`relative transition-all border-2 flex flex-col h-full ${isCurrent ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200'}`}>
      {isCurrent && (
        <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 font-black uppercase tracking-widest text-[10px]">
          Current Plan
        </Badge>
      )}
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-xl ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Zap className="w-6 h-6" />
          </div>
          {plan.price > 0 && !isCurrent && <Badge variant="neutral" className="font-black text-[10px] uppercase tracking-widest">Recommended</Badge>}
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/{plan.duration === 'Free' ? 'mo' : 'mo'}</span>
        </div>

        <ul className="space-y-4 mb-10 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {!isCurrent && (
          <Button 
            fullWidth 
            size="lg" 
            loading={loading}
            onClick={() => onUpgrade(plan.id)}
            variant={plan.price > 0 ? 'primary' : 'outline'}
            className="rounded-2xl font-black uppercase tracking-widest text-xs h-14"
          >
            {plan.price > 0 ? 'Activate Plan' : 'Select Plan'}
          </Button>
        )}
      </div>
    </Card>
  );
};