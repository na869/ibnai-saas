import React from "react";
import { Link } from "react-router-dom";
import { Store, Menu as MenuIcon, X } from "lucide-react";
import { Button } from "./ui";
import logo from "../assets/ibnai-dineos-logo.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative flex items-center justify-center">
            {/* The 'Hologram' Logo Integration */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src={logo} 
              alt="IBNai DineOS" 
              className="h-12 w-auto mix-blend-screen drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] filter contrast-125 brightness-110"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
            <span className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-black">IBNai</span>
            <span className="text-2xl font-black text-white tracking-tighter">DineOS</span>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</a>
          <div className="h-4 w-px bg-white/10"></div>
          <Link to="/login">
            <Button variant="ghost" className="text-white font-black uppercase tracking-widest text-xs">Log In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">
              Launch My DineOS Free
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/5 px-6 py-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <a href="#features" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-400">Features</a>
          <a href="#pricing" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-400">Pricing</a>
          <Link to="/login" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="text-white font-black uppercase tracking-widest text-xs w-full justify-start px-0">Log In</Button>
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full h-14 rounded-xl font-black uppercase tracking-widest text-xs">
              Launch My DineOS Free
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;