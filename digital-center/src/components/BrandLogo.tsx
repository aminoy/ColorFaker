interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * JODNA brand mark — flowing wave glyph.
 * Renders in `currentColor`, so wrap in any text-color utility (e.g. text-white).
 * Replace the <path> data with the official SVG export when ready.
 */
export const BrandLogo = ({ className = "", size = 28 }: BrandLogoProps) => {
  return (
    <svg
      viewBox="0 0 64 50"
      width={size}
      height={(size * 50) / 64}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Upper curl — the rising hook */}
      <path d="M28.5 1.2 c6.4 -2 13.2 2.6 13.2 9.4 0 5.4 -3.6 9.4 -8.4 10.4 -2.4 0.5 -3.4 1.6 -3.6 3.4 -0.2 1.5 1 2.2 0.2 2.6 -1.4 0.7 -3.4 -0.4 -4.4 -2 -1.4 -2.4 -1 -5.6 1 -7.4 1.6 -1.4 4 -2 5.8 -2.6 1.8 -0.6 2.6 -2 2.6 -3.6 0 -2.6 -2.6 -4.4 -5.4 -3.6 -2.6 0.7 -4 3.2 -4 5.4 0 0.8 -1 1 -1.4 0.4 -2.4 -3.6 -0.4 -10.6 4.4 -12 z" />
      {/* Upper wave — long flowing curve, top stroke */}
      <path d="M2 26.5 c4 -3.6 11.6 -5.6 18 -3.4 4 1.4 8.6 4.4 13.2 5 7 1 13.4 -1.6 18 -4.6 4.6 -3 8.4 -3 10.6 -0.4 0.4 0.4 0.2 1 -0.4 1 -2.6 0.2 -5.4 1.6 -8.4 3.6 -5.4 3.6 -12.6 6.2 -20 5.6 -7 -0.6 -12.4 -3.4 -16.6 -4.6 -4.4 -1.2 -10.6 -1 -14 0.6 -0.6 0.3 -1 -0.4 -0.4 -0.8 z" />
      {/* Lower wave — second sweeping stroke */}
      <path d="M6 38.5 c5 -3.4 12.4 -3.6 18 -2 4.4 1.2 9.4 3.4 14.4 3.6 7.4 0.3 14 -2.4 19 -5 1.4 -0.7 2.6 -0.4 3.4 0.4 0.4 0.4 0.2 1 -0.4 1.2 -2.4 1 -5 2.4 -8 4 -5.4 2.8 -12 4.8 -19 4.4 -6.4 -0.4 -11.4 -2.6 -15.6 -3.6 -4 -1 -8.6 -1 -11.4 -0.2 -0.6 0.2 -1 -0.6 -0.4 -0.8 z" />
    </svg>
  );
};
