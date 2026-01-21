import React, { useState } from "react";

/**
 * MediaDisplay - Simple Image Component
 *
 * ONE JOB: Display images without distortion, regardless of container size.
 *
 * HOW IT WORKS:
 * - Container takes the space defined by parent/Figma dimensions
 * - Image fills container using object-fit: cover (no distortion)
 * - Automatically responsive on all screen sizes
 *
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes from parent
 * @param {boolean} outOfStock - If true, displays "SOLD OUT" overlay
 */
const MediaDisplay = ({
  src,
  alt = "Product Image",
  className = "",
  outOfStock = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fallbackSrc =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239ca3af" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Image */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className="w-full h-full object-cover object-center"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
      />

      {/* Out of Stock Overlay */}
      {outOfStock && (
        <div className="absolute inset-0 bg-ekke-bg bg-opacity-50 flex items-center justify-center h-6 top-1/2">
          <span className="text-black font-archivo text-[11px] font-normal  uppercase py-2">
            Sold Out
          </span>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;
