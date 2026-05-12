import { useRef } from "react";
import type { ReactNode } from "react";

interface DragScrollProps {
  children: ReactNode;
  gap?: number;
}

export default function DragScroll({ children, gap = 12 }: DragScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  return (
    <div
      ref={ref}
      className="no-scrollbar"
      style={{
        display: "flex",
        gap,
        overflowX: "auto",
        paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
        userSelect: "none",
        scrollSnapType: "x mandatory",
      }}
      onMouseDown={(e) => {
        if (!ref.current) return;
        dragging.current = true;
        startX.current = e.pageX;
        startScroll.current = ref.current.scrollLeft;
      }}
      onMouseMove={(e) => {
        if (!dragging.current || !ref.current) return;
        e.preventDefault();
        ref.current.scrollLeft = startScroll.current - (e.pageX - startX.current) * 1.2;
      }}
      onMouseUp={() => {
        dragging.current = false;
      }}
      onMouseLeave={() => {
        dragging.current = false;
      }}
    >
      {children}
    </div>
  );
}
