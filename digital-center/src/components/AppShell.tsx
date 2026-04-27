import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { screen, dir } = useApp();
  const showNav = screen !== "splash";

  return (
    <div
      dir={dir}
      className="min-h-screen w-full bg-slate-200 text-ink antialiased"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-cloud shadow-lift relative overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-28">{children}</main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};
