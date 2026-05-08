import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { BottomNav } from "./BottomNav";
import { BrandBar } from "./BrandBar";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { screen, dir } = useApp();
  const isSplash = screen === "splash";
  const isMap = screen === "map";

  return (
    <div
      dir={dir}
      className="min-h-screen w-full bg-slate-200 text-ink antialiased"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-cloud shadow-lift">
        {!isSplash && <BrandBar variant={isMap ? "transparent" : "solid"} />}
        <main className="flex-1 overflow-y-auto pb-28">{children}</main>
        {!isSplash && <BottomNav />}
      </div>
    </div>
  );
};
