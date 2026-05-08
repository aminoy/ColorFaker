import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  /** Rendered height in pixels */
  size?: number;
  /** Optional fallback element shown if the logo file isn't present */
  fallback?: React.ReactNode;
  /** Override which asset to load (default: /jodna-logo.png) */
  src?: string;
}

/**
 * JODNA brand mark.
 *
 * Renders /jodna-logo.png (or any `src` you pass) exactly as
 * provided. Drop your final logo file in `digital-center/public/`
 * (white-on-transparent recommended) and it shows up everywhere
 * with no further changes.
 *
 * If the file isn't present yet, the broken image icon is hidden
 * and the optional `fallback` is rendered instead.
 */
export const BrandLogo = ({
  className = "",
  size = 28,
  fallback = null,
  src = "/jodna-logo.png",
}: BrandLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt="JODNA"
      height={size}
      style={{ height: size, width: "auto" }}
      className={`block select-none ${className}`}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
};
