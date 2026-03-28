export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1700px] mx-auto container px-2">{children}</div>
  );
}
