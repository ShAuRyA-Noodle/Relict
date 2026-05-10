import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

/**
 * Subtle, theme-aware cursor.
 * Disabled on touch devices (no hover capability).
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const springConfig = { damping: 26, stiffness: 320, mass: 0.45 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const dotX = useSpring(0, { damping: 38, stiffness: 600, mass: 0.2 });
  const dotY = useSpring(0, { damping: 38, stiffness: 600, mass: 0.2 });

  useEffect(() => {
    // Only show cursor on devices that support a fine pointer
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 14);
      cursorY.set(e.clientY - 14);
      dotX.set(e.clientX - 2);
      dotY.set(e.clientY - 2);
    };

    const handleHover = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive =
        t.closest("a, button, [role='button'], input, textarea, select, [data-cursor='hover']");
      setHovered(!!interactive);
    };

    const down = () => setClicked(true);
    const up = () => setClicked(false);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mousemove", handleHover, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousemove", handleHover);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [enabled, cursorX, cursorY, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-7 h-7 rounded-full pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          scale: clicked ? 0.85 : hovered ? 1.45 : 1,
          border: "1px solid hsl(var(--foreground) / 0.45)",
          backgroundColor: hovered ? "hsl(var(--primary) / 0.12)" : "transparent",
          mixBlendMode: "difference",
        }}
        transition={{ scale: { type: "spring", stiffness: 360, damping: 24 } }}
      />
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 rounded-full pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          backgroundColor: "hsl(var(--foreground))",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
