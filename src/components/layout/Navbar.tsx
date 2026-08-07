import {
  BellRing,
  CandlestickChart,
  Check,
  Palette,
  SearchIcon,
  Waves,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  applyTheme,
  getStoredTheme,
  type ThemeName,
  themes,
} from "@/config/themes";

const navLinks = [
  { to: "/", label: "Scanner" },
  { to: "/alerts", label: "Alerts" },
  { to: "/analytics", label: "Intelligence" },
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
  color: isActive ? "var(--ds-text-primary)" : "var(--ds-text-secondary)",
  borderBottom: isActive
    ? "2px solid var(--ds-text-primary)"
    : "2px solid transparent",
  transition: "color 0.15s, border-color 0.15s",
});

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>(getStoredTheme);
  const location = useLocation();

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  const handleThemeChange = (nextTheme: ThemeName) => {
    applyTheme(nextTheme);
    setThemeName(nextTheme);
  };

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
          background: "var(--ds-canvas)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 10px 28px rgb(0 0 0 / 12%)",
        }}
      >
        <div className="mx-auto flex h-11 max-w-[1920px] container items-center gap-3 px-4 md:px-6">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-2 no-underline"
            onClick={handleNavClick}
          >
            <img
              src="/dexseer-logo3.svg"
              className="h-6 w-6 object-contain"
              alt="DexSeer logo"
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.02em",
                color: "var(--ds-text-primary)",
              }}
            >
              DEX<span style={{ color: "var(--ds-electric)" }}>SEER</span>
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                fontWeight: 500,
                color: "var(--ds-positive)",
                background:
                  "color-mix(in srgb, var(--ds-positive) 8%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--ds-positive) 22%, transparent)",
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
            style={{ background: "var(--ds-border)" }}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Choose color theme"
                className="flex h-7 items-center gap-2 rounded-md border px-2 text-[var(--ds-text-secondary)] transition-colors hover:border-[var(--ds-border-strong)] hover:bg-white/[0.04] hover:text-[var(--ds-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-electric)]"
                style={{ borderColor: "var(--ds-border)" }}
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] sm:block">
                  {themes[themeName].label}
                </span>
                <span className="flex -space-x-1" aria-hidden="true">
                  {themes[themeName].swatches.map((color) => (
                    <span
                      key={color}
                      className="h-2.5 w-2.5 rounded-full border border-black/30"
                      style={{ background: color }}
                    />
                  ))}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 border-[var(--ds-border)] bg-[var(--ds-surface)] p-1.5 text-[var(--ds-text-primary)] shadow-2xl"
            >
              <p className="px-2 pb-1 pt-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-tertiary)]">
                Color theme
              </p>
              {Object.entries(themes).map(([name, theme]) => (
                <DropdownMenuItem
                  key={name}
                  onSelect={() => handleThemeChange(name as ThemeName)}
                  className="group my-0.5 rounded-md py-2 pl-2 pr-2 focus:bg-white/[0.06] focus:text-[var(--ds-text-primary)]"
                >
                  <span className="flex flex-1 items-center gap-2.5">
                    <span className="flex -space-x-1">
                      {theme.swatches.map((color) => (
                        <span
                          key={color}
                          className="h-3.5 w-3.5 rounded-full border border-black/30"
                          style={{ background: color }}
                        />
                      ))}
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        {theme.label}
                      </span>
                      <span className="block text-[0.64rem] text-[var(--ds-text-tertiary)]">
                        {theme.description}
                      </span>
                    </span>
                  </span>
                  {themeName === name && (
                    <Check className="h-3.5 w-3.5 text-[var(--ds-electric)]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "var(--ds-positive)" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--ds-positive)" }}
              />
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "var(--ds-text-tertiary)",
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
                  ? "var(--ds-electric)"
                  : "var(--ds-text-secondary)",
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
                background: menuOpen
                  ? "transparent"
                  : "var(--ds-text-secondary)",
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
                  ? "var(--ds-electric)"
                  : "var(--ds-text-secondary)",
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
              borderTop: "1px solid var(--ds-border)",
              background:
                "color-mix(in srgb, var(--ds-canvas) 95%, transparent)",
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
                borderColor: "var(--ds-border)",
                background: "rgb(255 255 255 / 4%)",
              }}
            >
              <SearchIcon className="h-3.5 w-3.5 text-white/60" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  color: "var(--ds-text-secondary)",
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
                    background: isActive
                      ? "rgb(255 255 255 / 6%)"
                      : "transparent",
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
