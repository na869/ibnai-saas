import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Mail, Lock, Zap } from "lucide-react";
import { Button, Input, Alert, Card } from "../../components/ui";
import { supabase } from "../../config/supabase";
import { isValidEmail } from "../../utils/helpers";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Credentials required for authentication.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please provide a valid corporate email.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setError("Unauthorized. Access denied.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin", JSON.stringify({ id: profile.id, email: profile.email, name: profile.full_name || "Admin" }));
      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "System encryption error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-600/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 hover:text-white mb-12 font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-3" />
          Return to Terminal
        </Link>

        <Card className="border-none shadow-2xl shadow-black/50 p-10 md:p-16 rounded-[48px] bg-white">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-slate-900 mb-8 shadow-xl shadow-slate-900/20">
              <Shield className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-3">Admin Infrastructure</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
               <Zap className="w-3 h-3 text-emerald-500" /> Secure Encryption Active
            </p>
          </div>

          {error && <Alert type="error" message={error} className="mb-10" />}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Admin ID (Email)"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="root@ibnai.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Security Key (Password)"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Button type="submit" loading={loading} fullWidth size="lg" className="h-20 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-600/20 mt-4">
              Authorize Access
            </Button>
          </form>
        </Card>
        
        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
           Digital Defense Systems v2.4.0
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
