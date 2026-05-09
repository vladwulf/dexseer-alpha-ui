import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1700px] px-2">
        <Outlet />
      </main>
    </div>
  );
}
