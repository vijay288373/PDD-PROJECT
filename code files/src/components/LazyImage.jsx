import { useState } from "react";

/**
 * Lazy-loaded image with a green shimmer placeholder.
 */
export default function LazyImage({ src, alt = "", className = "", style }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e8f5e9] via-[#c8e6c9] to-[#e8f5e9] animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}