import React, { useState, useEffect, useRef } from "react";
import { Download, QrCode as QrCodeIcon, ExternalLink, Copy, Check, Printer, Share2, Store } from "lucide-react";
import { Card, Button, Loading, Alert, ImageUpload } from "../../components/ui";
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
          setError("Session expired. Please login again.");
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
        downloadLink.download = `${restaurant.slug}-menu-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !restaurant) return;

    const svg = document.getElementById("qr-code-svg")?.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${restaurant.name}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
              text-align: center;
            }
            .container { border: 2px solid #eee; padding: 40px; border-radius: 20px; }
            h1 { margin-bottom: 10px; color: #111; }
            p { color: #666; margin-bottom: 30px; }
            .qr-wrapper { margin-bottom: 30px; }
            svg { width: 300px; height: 300px; }
            .footer { font-size: 14px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${restaurant.name}</h1>
            <p>Scan to view our digital menu</p>
            <div class="qr-wrapper">${svg}</div>
            <div class="footer">Powered by FoodOrder</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <Loading text="Loading settings..." />;
  }

  if (error || !restaurant) {
    return <Alert type="error" message={error || "Restaurant not found"} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text mb-1">Restaurant Settings</h2>
          <p className="text-text-secondary">
            Manage your restaurant profile and digital menu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: restaurant.name,
                  text: `Check out our digital menu at ${restaurant.name}`,
                  url: menuUrl,
                });
              } else {
                copyToClipboard();
              }
            }}
          >
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Branding & Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Store className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text">Branding & Logo</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ImageUpload
                label="Restaurant Logo"
                value={restaurant.logo_url || ""}
                onChange={async (url) => {
                  const { error } = await supabase
                    .from("restaurants")
                    .update({ logo_url: url })
                    .eq("id", restaurant.id);
                  if (!error) setRestaurant({ ...restaurant, logo_url: url });
                }}
                bucket="restaurant-assets"
                path={`${restaurant.id}/branding`}
                helperText="Upload your brand logo (1:1 recommended)"
              />
              <ImageUpload
                label="Cover Image"
                value={restaurant.cover_image_url || ""}
                onChange={async (url) => {
                  const { error } = await supabase
                    .from("restaurants")
                    .update({ cover_image_url: url })
                    .eq("id", restaurant.id);
                  if (!error) setRestaurant({ ...restaurant, cover_image_url: url });
                }}
                bucket="restaurant-assets"
                path={`${restaurant.id}/branding`}
                helperText="Banner image for your menu page"
              />
            </div>
          </Card>

          {/* QR Code Main Card */}
          <Card className="overflow-hidden border-2 border-accent/10">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <QrCodeIcon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text">Customer Entry Point</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* QR Display */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  <div 
                    ref={qrRef}
                    className="bg-white p-8 rounded-2xl shadow-xl border border-border/50 relative group"
                  >
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={menuUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="primary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={downloadQRCode}
                      fullWidth
                    >
                      Download PNG
                    </Button>
                  </div>
                </div>

                {/* URL and Sharing */}
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                      Direct Menu Link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-bg-subtle p-3 rounded-xl border border-border font-mono text-sm break-all text-text-secondary flex items-center">
                        {menuUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="shrink-0 h-[46px] w-[46px] !p-0"
                      >
                        {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-success/5 border border-success/10 rounded-xl">
                      <h4 className="text-success font-bold text-sm mb-1 uppercase">Live Status</h4>
                      <p className="text-text text-sm">Active & Public</p>
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                      <h4 className="text-accent font-bold text-sm mb-1 uppercase">Updates</h4>
                      <p className="text-text text-sm">Real-time sync</p>
                    </div>
                  </div>

                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-4 bg-text text-white rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Test Customer Experience
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions & Best Practices */}
        <div className="space-y-6">
          <Card className="bg-bg-subtle border-none">
            <h3 className="font-bold text-text mb-4">Best Practices</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-sm text-text-secondary">Place QR codes in high-visibility areas like table tents or entrance doors.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-sm text-text-secondary">Ensure good lighting so phone cameras can easily scan the code.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-sm text-text-secondary">Include a short instruction like "Scan to Order" near the QR code.</p>
              </li>
            </ul>
          </Card>

          <Card className="bg-accent text-white border-none shadow-lg shadow-accent/20">
            <h3 className="font-bold mb-2">Need Custom Design?</h3>
            <p className="text-sm text-white/80 mb-4">
              Download the QR link and send it to your designer for professional branding.
            </p>
            <Button 
              variant="outline" 
              fullWidth 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={copyToClipboard}
            >
              {copied ? "Copied Link!" : "Copy Menu Link"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
