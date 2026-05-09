import { NavLink } from "react-router";

const navLinks = [
  { to: "/", label: "Screener" },
  { to: "/alerts/explorer", label: "Alerts" },
  { to: "/patterns", label: "Patterns" },
  { to: "/chart", label: "Chart" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "oklch(0.1 0 0 / 85%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(1 0 0 / 7%)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1700px] items-center gap-6 px-4">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-2.5 no-underline"
        >
          <img
            src="/dexseer-logo3.svg"
            className="h-7 w-7"
            alt="DexSeer logo"
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.04em",
              color: "oklch(0.96 0 0)",
            }}
          >
            DEX<span style={{ color: "oklch(0.72 0.18 248)" }}>SEER</span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              fontWeight: 500,
              color: "#5dc887",
              background: "rgba(93,200,135,0.1)",
              border: "1px solid rgba(93,200,135,0.25)",
              borderRadius: "3px",
              padding: "1px 5px",
              letterSpacing: "0.08em",
            }}
          >
            ALPHA
          </span>
        </NavLink>

        {/* Divider */}
        <div
          className="h-5 w-px shrink-0"
          style={{ background: "oklch(1 0 0 / 12%)" }}
        />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                color: isActive
                  ? "oklch(0.72 0.18 248)"
                  : "oklch(0.58 0 0)",
                background: isActive
                  ? "oklch(0.72 0.18 248 / 10%)"
                  : "transparent",
                transition: "color 0.15s, background 0.15s",
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "#5dc887" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "#5dc887" }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "oklch(0.55 0 0)",
              textTransform: "uppercase",
            }}
          >
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
