import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
