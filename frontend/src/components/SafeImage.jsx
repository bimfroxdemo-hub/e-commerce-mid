import { useState } from "react";

export default function SafeImage({ src, alt, className, fallback = "https://placehold.co/48x48/E5E7EB/6B7280?text=No+Img", ...props }) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
      {...props}
    />
  );
}