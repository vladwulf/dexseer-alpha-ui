import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function RootLayout() {
  return (
    <div className="min-h-[100dvh] bg-[var(--ds-canvas)]">
      <Navbar />
      <main className="min-h-[calc(100dvh-2.75rem)]">
        <Outlet />
      </main>
    </div>
  );
}
