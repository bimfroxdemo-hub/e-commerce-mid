import { useState } from "react";

export default function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallback = null, 
  width = 48, 
  height = 48,
  rounded = false,
  placeholderColor = "#1A1A3A", // Deep Navy Blue
  textColor = "#D4AF37", // Gold
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src || "");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback placeholder generator using Kabiraaz Fashion colors
  const getFallbackUrl = () => {
    if (fallback) return fallback;
    
    // Use brand colors for placeholder with loading text
    const placeholderText = alt?.substring(0, 2).toUpperCase() || "IMG";
    const encodedText = encodeURIComponent(placeholderText);
    
    // Luxury gradient style using brand colors
    return `https://placehold.co/${width}x${height}/${placeholderColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodedText}`;
  };

  const displaySrc = hasError ? (fallback || getFallbackUrl()) : imgSrc;

  return (
    <div 
      className={`relative overflow-hidden ${rounded ? 'rounded-xl sm:rounded-2xl' : ''} ${className}`}
      style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      {/* Loading State - Brand Colors */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#F8F8F8] via-[#E0E0E0] to-[#F8F8F8] animate-pulse"
          aria-label="Loading image"
        />
      )}

      {/* Image */}
      <img
        src={displaySrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        loading="lazy"
        {...props}
      />

      {/* Error State - Brand Badge */}
      {hasError && !fallback && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-[#1A1A3A]"
          role="alert"
          aria-label="Image failed to load"
        >
          <span 
            className="text-xs font-bold text-[#D4AF37]"
            style={{ fontSize: `${width * 0.3}px`, lineHeight: `${height * 0.3}px` }}
          >
            {alt?.substring(0, 2).toUpperCase() || "IMG"}
          </span>
        </div>
      )}

      {/* Quality Indicator - Subtle Brand Accent */}
      {!hasError && (
        <div className="absolute bottom-2 right-2 bg-[#007A8A]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
          <span className="text-[6px] text-white font-bold uppercase tracking-wider">HD</span>
        </div>
      )}
    </div>
  );
}