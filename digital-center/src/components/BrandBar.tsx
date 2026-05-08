import { BrandLogo } from "./BrandLogo";

interface BrandBarProps {
  variant?: "solid" | "transparent";
}

/**
 * Persistent top branding strip — always visible across the app
 * (hidden on the splash screen). Renders the JODNA mark + wordmark
 * in white over a midnight gradient (or transparent overlay for
 * full-bleed screens like the map).
 */
export const BrandBar = ({ variant = "solid" }: BrandBarProps) => {
  const bg =
    variant === "solid"
      ? "bg-midnight-gradient"
      : "bg-gradient-to-b from-black/55 to-transparent backdrop-blur";

  return (
    <header
      role="banner"
      className={`absolute inset-x-0 top-0 z-[600] flex items-center justify-center gap-2 px-5 pt-3 pb-2 text-white ${bg}`}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <BrandLogo size={26} className="drop-shadow-sm" />
      <span className="text-base font-semibold tracking-[0.32em]">
        JODNA
      </span>
    </header>
  );
};
