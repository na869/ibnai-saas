import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./index";
import { uploadImage } from "../../services/restaurantService";

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  path: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  bucket,
  path,
  helperText,
  className = "",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploading(true);
    const url = await uploadImage(file, bucket, path);
    setUploading(false);

    if (url) {
      onChange(url);
    } else {
      alert("Failed to upload image. Make sure the storage bucket exists.");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="label">{label}</label>}
      
      <div className="relative">
        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-border group">
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-40 object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-text"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
                <Button 
                  type="button" 
                  variant="danger" 
                  size="sm"
                  onClick={removeImage}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
            className={`
              h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 
              transition-all
              ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:border-accent hover:bg-accent/5 cursor-pointer"}
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-medium text-text-secondary">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-bg-subtle rounded-full">
                  <Upload className="w-6 h-6 text-text-secondary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-text">Click to upload</p>
                  <p className="text-xs text-text-secondary">PNG, JPG up to 2MB</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {helperText && !value && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};

