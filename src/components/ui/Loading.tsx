import React from "react";
import { Loader2, Zap } from "lucide-react";

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  text = "Synthesizing...",
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <Loader2 className="w-16 h-16 text-emerald-600 animate-spin opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
           <Zap className="w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xl flex items-center justify-center z-[100]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20 w-full">{content}</div>
  );
};