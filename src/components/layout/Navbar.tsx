import { BellRing, CandlestickChart, SearchIcon, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const navLinks = [
  { to: "/", label: "Scanner" },
  { to: "/alerts/explorer", label: "Alerts" },
  { to: "/analytics", label: "Intelligence" },
  { label: "Watchlists" },
];

const searchGroups = [
  {
    heading: "Assets",
    items: [
      {
        label: "BTC",
        detail: "Bitcoin",
        meta: "$108.4K",
        icon: CandlestickChart,
      },
      {
        label: "ETH",
        detail: "Ethereum",
        meta: "$6.2B vol",
        icon: CandlestickChart,
      },
      { label: "SOL", detail: "Solana", meta: "Breakout setup", icon: Waves },
      {
        label: "HYPE",
        detail: "Hyperliquid",
        meta: "Trend acceleration",
        icon: Waves,
      },
    ],
  },
  {
    heading: "Alerts",
    items: [
      {
        label: "BTC LONG",
        detail: "15m continuation",
        meta: "2m ago",
        icon: BellRing,
      },
      {
        label: "ETH SHORT",
        detail: "4h rejection",
        meta: "11m ago",
        icon: BellRing,
      },
      {
        label: "SOL VOL SPIKE",
        detail: "1h volume anomaly",
        meta: "23m ago",
        icon: BellRing,
      },
    ],
  },
] as const;

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-display)",
  fontSize: "0.88rem",
  fontWeight: isActive ? 600 : 500,
  letterSpacing: "0.01em",
  textDecoration: "none",
  padding: "2px 0",
  borderRadius: "0",
  color: isActive ? "oklch(0.96 0 0)" : "oklch(0.68 0 0)",
  borderBottom: isActive
    ? "2px solid oklch(0.96 0 0)"
    : "2px solid transparent",
  transition: "color 0.15s, border-color 0.15s",
});

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      event.preventDefault();
      setSearchOpen((open) => !open);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.115 0 0 / 96%), oklch(0.095 0 0 / 96%))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid oklch(1 0 0 / 9%)",
          boxShadow: "0 1px 0 oklch(1 0 0 / 3%) inset",
        }}
      >
        <div className="mx-auto flex h-11 max-w-[1700px] items-center gap-3 px-3 sm:px-4">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-2 no-underline"
            onClick={handleNavClick}
          >
            <img
              src="/dexseer-logo3.svg"
              className="h-5 w-5"
              alt="DexSeer logo"
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.02em",
                color: "oklch(0.96 0 0)",
              }}
            >
              DEX<span style={{ color: "oklch(0.72 0.18 248)" }}>SEER</span>
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                fontWeight: 500,
                color: "#5dc887",
                background: "rgba(93,200,135,0.08)",
                border: "1px solid rgba(93,200,135,0.22)",
                borderRadius: "2px",
                padding: "1px 4px",
                letterSpacing: "0.06em",
              }}
            >
              ALPHA
            </span>
          </NavLink>

          {/* Desktop: divider + nav links */}
          <div
            className="hidden h-4 w-px shrink-0 md:block"
            style={{ background: "oklch(1 0 0 / 10%)" }}
          />
          <nav className="hidden items-center gap-5 md:flex">
            {navLinks.map(({ to, label }) =>
              to ? (
                <NavLink
                  key={label}
                  to={to}
                  end={to === "/"}
                  style={({ isActive }) => navLinkStyle(isActive)}
                >
                  {label}
                </NavLink>
              ) : (
                <span
                  key={label}
                  style={{
                    ...navLinkStyle(false),
                    cursor: "default",
                    opacity: 0.75,
                  }}
                >
                  {label}
                </span>
              ),
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden min-w-[260px] items-center gap-2 rounded-[10px] border px-3 py-1.5 text-left lg:flex"
            style={{
              borderColor: "oklch(1 0 0 / 14%)",
              background: "oklch(1 0 0 / 3%)",
            }}
          >
            <SearchIcon className="h-3.5 w-3.5 text-white/60" />
            <span
              style={{
                flex: 1,
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "oklch(0.62 0 0)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              search assets, alerts...
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "oklch(0.72 0 0)",
              }}
            >
              ⌘K
            </span>
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "#5dc887" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: "#5dc887" }}
              />
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "oklch(0.5 0 0)",
                textTransform: "uppercase",
              }}
            >
              Live
            </span>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="flex md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              flexDirection: "column",
              gap: 4,
              padding: "4px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "block",
                width: 18,
                height: 1.5,
                background: menuOpen
                  ? "oklch(0.72 0.18 248)"
                  : "oklch(0.65 0 0)",
                borderRadius: 1,
                transform: menuOpen
                  ? "translateY(5.5px) rotate(45deg)"
                  : "none",
                transition: "transform 0.2s, background 0.2s",
              }}
            />
            <span
              style={{
                display: "block",
                width: 18,
                height: 1.5,
                background: menuOpen ? "transparent" : "oklch(0.65 0 0)",
                borderRadius: 1,
                transition: "background 0.2s",
              }}
            />
            <span
              style={{
                display: "block",
                width: 18,
                height: 1.5,
                background: menuOpen
                  ? "oklch(0.72 0.18 248)"
                  : "oklch(0.65 0 0)",
                borderRadius: 1,
                transform: menuOpen
                  ? "translateY(-5.5px) rotate(-45deg)"
                  : "none",
                transition: "transform 0.2s, background 0.2s",
              }}
            />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              borderTop: "1px solid oklch(1 0 0 / 7%)",
              background: "oklch(0.1 0 0 / 95%)",
              padding: "6px 10px 10px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMenuOpen(false);
              }}
              className="mb-2 flex w-full items-center gap-2 rounded-[8px] border px-3 py-2 text-left"
              style={{
                borderColor: "oklch(1 0 0 / 10%)",
                background: "oklch(1 0 0 / 4%)",
              }}
            >
              <SearchIcon className="h-3.5 w-3.5 text-white/60" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  color: "oklch(0.62 0 0)",
                }}
              >
                search assets, alerts...
              </span>
            </button>
            {navLinks.map(({ to, label }) => {
              const isActive = to ? location.pathname.startsWith(to) : false;

              if (!to) {
                return (
                  <span
                    key={label}
                    style={{
                      ...navLinkStyle(false),
                      display: "block",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      borderBottom: "none",
                      opacity: 0.75,
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </span>
                );
              }

              return (
                <NavLink
                  key={label}
                  to={to}
                  end={to === "/"}
                  onClick={handleNavClick}
                  style={{
                    ...navLinkStyle(isActive),
                    display: "block",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    borderBottom: "none",
                    background: isActive ? "oklch(1 0 0 / 6%)" : "transparent",
                    marginBottom: 2,
                  }}
                >
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search assets and alerts"
        description="Search mocked assets and alerts in the terminal navbar."
        className="border-white/10 bg-black p-0 sm:max-w-[620px]"
      >
        <CommandInput placeholder="Search assets, alerts, setups..." />
        <CommandList className="hide-scrollbar max-h-[360px]">
          <CommandEmpty>No matching assets or alerts.</CommandEmpty>
          {searchGroups.map((group, index) => (
            <div key={group.heading}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <CommandItem
                      key={`${group.heading}-${item.label}`}
                      value={`${item.label} ${item.detail} ${item.meta}`}
                      onSelect={() => setSearchOpen(false)}
                      className="rounded-md px-3 py-3 data-[selected=true]:bg-white/8 data-[selected=true]:text-white"
                    >
                      <Icon className="h-4 w-4 text-white/65" />
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[0.82rem] font-medium text-white">
                            {item.label}
                          </div>
                          <div className="truncate text-[0.72rem] text-white/45">
                            {item.detail}
                          </div>
                        </div>
                        <CommandShortcut className="text-[0.68rem] tracking-[0.08em] text-white/50">
                          {item.meta}
                        </CommandShortcut>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
