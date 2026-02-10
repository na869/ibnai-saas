import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "neutral" | "accent-secondary";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variants = {
    success: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    neutral: "bg-slate-100 text-slate-500 border-slate-200",
    "accent-secondary": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};