interface BrandLogoProps {
  className?: string;
  /** Rendered height in pixels */
  size?: number;
}

/**
 * JODNA brand mark.
 *
 * Renders the asset at /jodna-logo.png (or /jodna-logo.svg — see public/
 * README) exactly as provided. Drop your final logo file in
 * `digital-center/public/jodna-logo.png` and it shows up everywhere.
 *
 * Use a white-on-transparent export (PNG with alpha or SVG) to avoid
 * background fringing on dark surfaces. No filters or color changes
 * are applied.
 */
export const BrandLogo = ({ className = "", size = 28 }: BrandLogoProps) => {
  return (
    <img
      src="/jodna-logo.png"
      alt="JODNA"
      height={size}
      style={{ height: size, width: "auto" }}
      className={`block select-none ${className}`}
      draggable={false}
    />
  );
};
