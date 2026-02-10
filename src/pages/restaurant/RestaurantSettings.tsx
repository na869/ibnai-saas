import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Download, 
  QrCode as QrCodeIcon, 
  ExternalLink, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  Settings2,
  Image as ImageIcon
} from "lucide-react";
import { Card, Button, Loading, ImageUpload, Badge } from "../../components/ui";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../config/supabase";
import type { Restaurant } from "../../config/supabase";

const RestaurantSettings: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("Session expired.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.restaurant_id) {
          setError("Restaurant ID not found");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", user.restaurant_id)
          .single();

        if (fetchError) throw fetchError;
        setRestaurant(data);
      } catch (err: any) {
        console.error("Error fetching restaurant:", err);
        setError("Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  const menuUrl = restaurant 
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQRCode = () => {
    if (!restaurant) return;

    const svg = document.getElementById("qr-code-svg") as SVGElement | null;
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    const scale = 4;
    const size = 256 * scale;
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `IBNai-QR-${restaurant.slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading text="Syncing restaurant configuration..." />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
             <Settings2 className="w-3 h-3" /> Core Infrastructure
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Restaurant Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Configure your digital presence and customer touchpoints.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<Share2 className="w-4 h-4" />}
            className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest px-8"
            onClick={copyToClipboard}
          >
            {copied ? "Link Copied" : "Share Menu"}
          </Button>
          <Link to={`/menu/${restaurant?.slug}`} target="_blank">
            <Button icon={<ExternalLink className="w-4 h-4" />} className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest px-8 shadow-xl shadow-emerald-600/20">
               Live Preview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity & Branding */}
          <Card className="border-none shadow-xl shadow-slate-200/50 p-8 md:p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity & Branding</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Visual assets for your digital menu</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <ImageUpload
                label="Corporate Logo"
                value={restaurant?.logo_url || ""}
                onChange={async (url) => {
                  const { error } = await supabase.from("restaurants").update({ logo_url: url }).eq("id", restaurant?.id);
                  if (!error && restaurant) setRestaurant({ ...restaurant, logo_url: url });
                }}
                bucket="restaurant-assets"
                path={`${restaurant?.id}/branding`}
              />
              <ImageUpload
                label="Hero Cover Asset"
                value={restaurant?.cover_image_url || ""}
                onChange={async (url) => {
                  const { error } = await supabase.from("restaurants").update({ cover_image_url: url }).eq("id", restaurant?.id);
                  if (!error && restaurant) setRestaurant({ ...restaurant, cover_image_url: url });
                }}
                bucket="restaurant-assets"
                path={`${restaurant?.id}/branding`}
              />
            </div>
          </Card>

          {/* Customer Access Point (QR) */}
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
             <div className="bg-slate-900 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                <div 
                  ref={qrRef}
                  className="bg-white p-6 rounded-[32px] shadow-2xl relative group flex-shrink-0"
                >
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={menuUrl}
                    size={180}
                    level="H"
                    includeMargin={false}
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none" />
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                   <div className="space-y-2">
                     <Badge variant="success" className="bg-emerald-500 text-white border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">Primary Entry Point</Badge>
                     <h3 className="text-3xl font-black text-white tracking-tight">Digital Access Vector</h3>
                     <p className="text-slate-400 font-medium">This QR code connects your physical tables to your digital profit engine.</p>
                   </div>
                   
                   <div className="flex flex-wrap justify-center md:justify-start gap-4">
                     <Button 
                       onClick={downloadQRCode}
                       className="bg-emerald-600 hover:bg-emerald-700 border-none font-black text-xs uppercase tracking-widest h-14 px-8 rounded-2xl shadow-xl shadow-emerald-600/40"
                       icon={<Download className="w-4 h-4" />}
                     >
                       Download Master
                     </Button>
                     <Button 
                       variant="outline"
                       className="border-slate-700 text-white hover:bg-white/10 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest"
                       onClick={() => window.print()}
                       icon={<Printer className="w-4 h-4" />}
                     >
                       Direct Print
                     </Button>
                   </div>
                </div>
             </div>
             
             <div className="p-8 md:p-10 bg-white">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Encrypted Access URL</label>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 font-mono text-sm break-all text-slate-500 flex items-center">
                    {menuUrl}
                  </div>
                  <Button
                    variant="outline"
                    className={`h-14 w-14 rounded-2xl border-2 transition-all ${copied ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100'}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </Button>
                </div>
             </div>
          </Card>
        </div>

        {/* Strategic Intelligence Sidebar */}
        <div className="space-y-8">
          <Card className="bg-emerald-600 text-white border-none shadow-2xl shadow-emerald-600/20 p-10">
            <TrendingUp className="w-10 h-10 mb-8" />
            <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">Conversion Optimization</h3>
            <p className="text-emerald-50/80 font-medium leading-relaxed mb-10 text-sm">
              Placing your QR codes in <span className="text-white font-black underline">high-contrast table tents</span> can improve scan rates by up to <span className="text-white font-black underline">32%</span>.
            </p>
            <div className="space-y-4">
               {[
                 "Use clear 'Scan to Order' text",
                 "Ensure 300dpi print quality",
                 "Add brand logo to QR center"
               ].map((tip, i) => (
                 <div key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                   <Check className="w-4 h-4 text-emerald-300" /> {tip}
                 </div>
               ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 p-10">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
               <ShieldCheck className="w-6 h-6 text-emerald-600" />
             </div>
             <h4 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Security & Compliance</h4>
             <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
               Your digital menu is protected by bank-grade encryption and isolated from other partners.
             </p>
             <div className="flex items-center gap-3 py-4 border-t border-slate-50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status: Secure</span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;