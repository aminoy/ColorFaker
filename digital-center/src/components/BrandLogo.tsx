import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  /** Rendered height in pixels */
  size?: number;
  /** Optional fallback element shown if the logo file isn't present */
  fallback?: React.ReactNode;
}

/**
 * JODNA brand mark.
 *
 * Renders /jodna-logo.png exactly as provided. Drop your final logo
 * file at `digital-center/public/jodna-logo.png` (white-on-transparent
 * recommended) and it shows up everywhere with no further changes.
 *
 * If the file isn't present yet, the broken image icon is hidden and
 * the optional `fallback` is rendered instead.
 */
export const BrandLogo = ({
  className = "",
  size = 28,
  fallback = null,
}: BrandLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src="/jodna-logo.png"
      alt="JODNA"
      height={size}
      style={{ height: size, width: "auto" }}
      className={`block select-none ${className}`}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
};
