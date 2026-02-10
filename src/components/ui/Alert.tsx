import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  onClose,
  className = "",
}) => {
  const styles = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-600",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-600",
      icon: AlertCircle,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-slate-50",
      border: "border-slate-100",
      text: "text-slate-600",
      icon: Info,
    },
  };

  const config = styles[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border-2 ${config.border} p-5 rounded-2xl ${className} animate-in fade-in slide-in-from-top-2`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0`}>
           <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`text-sm font-black uppercase tracking-widest ${config.text} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm font-bold ${title ? 'text-slate-500' : config.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};