import React, { useRef, useState, useEffect, type ReactNode } from "react";

interface GlideMenuProps {
  children: ReactNode;
  rowSelector?: string;
  highlightClassName?: string;
  className?: string;
  activeSelector?: string;
}

export default function GlideMenu({
  children,
  rowSelector = "[data-row]",
  highlightClassName = "rounded-[8px] bg-slate-100",
  className = "",
  activeSelector,
}: GlideMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const updateHighlight = (el: HTMLElement) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = el.getBoundingClientRect();

    setHighlightStyle({
      top: targetRect.top - containerRect.top,
      left: targetRect.left - containerRect.left,
      width: targetRect.width,
      height: targetRect.height,
      opacity: 1,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest(rowSelector) as HTMLElement | null;
    if (target && containerRef.current?.contains(target)) {
      updateHighlight(target);
    }
  };

  const handlePointerLeave = () => {
    if (activeSelector && containerRef.current) {
      const activeEl = containerRef.current.querySelector(activeSelector) as HTMLElement | null;
      if (activeEl) {
        updateHighlight(activeEl);
        return;
      }
    }
    setHighlightStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  useEffect(() => {
    if (activeSelector && containerRef.current) {
      const activeEl = containerRef.current.querySelector(activeSelector) as HTMLElement | null;
      if (activeEl) {
        updateHighlight(activeEl);
      }
    }
  }, [activeSelector]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative ${className}`}
    >
      {/* Gliding Highlight Pill */}
      <div
        className={`pointer-events-none absolute z-0 transition-all duration-150 ${highlightClassName}`}
        style={{
          transform: `translate3d(${highlightStyle.left}px, ${highlightStyle.top}px, 0)`,
          width: highlightStyle.width,
          height: highlightStyle.height,
          opacity: highlightStyle.opacity,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      {children}
    </div>
  );
}
