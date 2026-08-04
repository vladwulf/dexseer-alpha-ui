import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "scanner-terminal-panel-sizes-v2";
const DEFAULT_SIZES = { scanner: 32, inspector: 28, content: 78 };
const COMPACT_DEFAULT_SIZES = { scanner: 75, inspector: 0, content: 78 };
const MIN_SCANNER = 22;
const MIN_INSPECTOR = 25;
const MAX_INSPECTOR = 50;
const MIN_ACTIVE = 25;
const MIN_CONTENT = 55;
const MAX_CONTENT = 85;

type ResizeTarget = "scanner" | "inspector" | "dock";
type PanelSizes = typeof DEFAULT_SIZES;

type TerminalWorkspaceProps = {
  controls: ReactNode;
  scanner: ReactNode;
  activeAsset: ReactNode;
  inspector: ReactNode;
  bottomDock?: ReactNode;
  isAlertsMode?: boolean;
  showInspector?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TerminalWorkspace({
  controls,
  scanner,
  activeAsset,
  inspector,
  bottomDock,
  isAlertsMode = false,
  showInspector = false,
}: TerminalWorkspaceProps) {
  const defaultSizes = showInspector ? DEFAULT_SIZES : COMPACT_DEFAULT_SIZES;
  const [sizes, setSizes] = useState<PanelSizes>(defaultSizes);
  const [isHydrated, setIsHydrated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<ResizeTarget | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const verticalGroupRef = useRef<HTMLDivElement>(null);

  const activeSize = showInspector
    ? 100 - sizes.scanner - sizes.inspector
    : 100 - sizes.scanner;
  const dockSize = 100 - sizes.content;
  const hasDock = Boolean(bottomDock);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<PanelSizes>;
        if (
          typeof parsed.scanner === "number" &&
          typeof parsed.inspector === "number" &&
          typeof parsed.content === "number"
        ) {
          setSizes({
            scanner: parsed.scanner,
            inspector: parsed.inspector,
            content: parsed.content,
          });
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  }, [isHydrated, sizes]);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
    },
    [],
  );

  const updateFromPointer = (
    target: ResizeTarget,
    event: Pick<PointerEvent<HTMLDivElement>, "clientX" | "clientY">,
  ) => {
    const group =
      target === "dock" ? contentRef.current : verticalGroupRef.current;
    if (!group) return;

    const rect = group.getBoundingClientRect();
    if (target === "scanner") {
      const maximum = showInspector
        ? 100 - sizes.inspector - MIN_ACTIVE
        : 100 - MIN_ACTIVE;
      const scanner = clamp(
        ((event.clientX - rect.left) / rect.width) * 100,
        MIN_SCANNER,
        maximum,
      );
      setSizes((current) => ({ ...current, scanner }));
    }
    if (target === "inspector") {
      const inspector = clamp(
        ((rect.right - event.clientX) / rect.width) * 100,
        MIN_INSPECTOR,
        MAX_INSPECTOR,
      );
      setSizes((current) => ({ ...current, inspector }));
    }
    if (target === "dock") {
      const content = clamp(
        ((event.clientY - rect.top) / rect.height) * 100,
        MIN_CONTENT,
        MAX_CONTENT,
      );
      setSizes((current) => ({ ...current, content }));
    }
  };

  const handlePointerDown = (
    target: ResizeTarget,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    resizingRef.current = target;
    updateFromPointer(target, event);

    resizeCleanupRef.current?.();
    const handleWindowPointerMove = (moveEvent: globalThis.PointerEvent) => {
      updateFromPointer(target, moveEvent);
    };
    const handleWindowPointerUp = () => {
      resizingRef.current = null;
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      resizeCleanupRef.current = null;
    };
    resizeCleanupRef.current = handleWindowPointerUp;
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
  };

  const handlePointerMove = (
    target: ResizeTarget,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (resizingRef.current === target) updateFromPointer(target, event);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizingRef.current = null;
    resizeCleanupRef.current?.();
  };

  const handleKeyDown = (
    target: ResizeTarget,
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    const isVertical = target !== "dock";
    const decrease = isVertical
      ? event.key === "ArrowLeft"
      : event.key === "ArrowUp";
    const increase = isVertical
      ? event.key === "ArrowRight"
      : event.key === "ArrowDown";
    if (!decrease && !increase) return;

    event.preventDefault();
    const amount = event.shiftKey ? 5 : 2;
    const delta = decrease ? -amount : amount;

    setSizes((current) => {
      if (target === "scanner") {
        return {
          ...current,
          scanner: clamp(
            current.scanner + delta,
            MIN_SCANNER,
            showInspector
              ? 100 - current.inspector - MIN_ACTIVE
              : 100 - MIN_ACTIVE,
          ),
        };
      }
      if (target === "inspector") {
        return {
          ...current,
          inspector: clamp(
            current.inspector - delta,
            MIN_INSPECTOR,
            MAX_INSPECTOR,
          ),
        };
      }
      return {
        ...current,
        content: clamp(current.content + delta, MIN_CONTENT, MAX_CONTENT),
      };
    });
  };

  const resetSize = (target: ResizeTarget) => {
    setSizes((current) => ({
      ...current,
      [target]: defaultSizes[target === "dock" ? "content" : target],
    }));
  };

  const getHandleProps = (
    target: ResizeTarget,
  ): HTMLAttributes<HTMLDivElement> => ({
    "aria-label":
      target === "dock" ? "Resize activity dock" : `Resize ${target} panel`,
    "aria-orientation": (target === "dock" ? "horizontal" : "vertical") as
      | "horizontal"
      | "vertical",
    "aria-valuemax":
      target === "dock"
        ? MAX_CONTENT
        : target === "inspector"
          ? MAX_INSPECTOR
          : 100 - MIN_ACTIVE,
    "aria-valuemin":
      target === "dock"
        ? MIN_CONTENT
        : target === "scanner"
          ? MIN_SCANNER
          : MIN_INSPECTOR,
    "aria-valuenow": target === "dock" ? sizes.content : sizes[target],
    "aria-valuetext": `${Math.round(target === "dock" ? sizes.content : sizes[target])}%`,
    onDoubleClick: () => resetSize(target),
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) =>
      handleKeyDown(target, event),
    onPointerDown: (event: PointerEvent<HTMLDivElement>) =>
      handlePointerDown(target, event),
    onPointerMove: (event: PointerEvent<HTMLDivElement>) =>
      handlePointerMove(target, event),
    onPointerUp: handlePointerUp,
    role: "slider" as const,
    tabIndex: 0,
  });

  return (
    <div
      className={`terminal-workspace${isAlertsMode ? " terminal-workspace--alerts" : ""}${showInspector ? "" : " terminal-workspace--compact"}${hasDock ? "" : " terminal-workspace--no-dock"}`}
      ref={verticalGroupRef}
    >
      <div className="terminal-workspace__main">
        <div className="terminal-workspace__toolbar">{controls}</div>
        <div className="terminal-workspace__content" ref={contentRef}>
          <div
            className="terminal-workspace__panels"
            style={
              { flex: `${hasDock ? sizes.content : 100} 1 0px` } as CSSProperties
            }
          >
          <section
            className="terminal-workspace__scanner"
            data-panel="true"
            id="scanner"
            style={{ flex: `${sizes.scanner} 1 0px` } as CSSProperties}
            aria-label="Market scanner"
          >
            {scanner}
          </section>
          <div
            className="terminal-resize-handle terminal-resize-handle--vertical"
            {...getHandleProps("scanner")}
          />
          <section
            className="terminal-workspace__active"
            data-panel="true"
            id="chart"
            style={{ flex: `${activeSize} 1 0px` } as CSSProperties}
            aria-label="Active asset analysis"
          >
            {activeAsset}
          </section>
          </div>
          <div
            className="terminal-resize-handle terminal-resize-handle--horizontal"
            {...getHandleProps("dock")}
          />
          <section
            className="terminal-workspace__dock"
            data-panel="true"
            id="tables"
            style={{ flex: `${dockSize} 1 0px` } as CSSProperties}
            aria-label="Asset activity"
          >
            {bottomDock}
          </section>
        </div>
      </div>
      <div
        className="terminal-resize-handle terminal-resize-handle--vertical"
        {...getHandleProps("inspector")}
      />
      <aside
        className="terminal-workspace__inspector"
        data-panel="true"
        id="inspector"
        style={
          {
            flex: "0 1 auto",
            width: `clamp(25%, ${sizes.inspector}%, 50%)`,
          } as CSSProperties
        }
        aria-label="Asset inspector"
      >
        {inspector}
      </aside>
    </div>
  );
}
