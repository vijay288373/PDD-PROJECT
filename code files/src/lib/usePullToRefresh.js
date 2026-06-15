import { useEffect, useRef, useState } from "react";

/**
 * Pull-to-refresh hook.
 * Returns: { refreshing, containerRef }
 * Usage: attach containerRef to the scrollable container div.
 */
export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = containerRef.current || window;
    const getScrollTop = () =>
      containerRef.current ? containerRef.current.scrollTop : window.scrollY;

    const onTouchStart = (e) => {
      if (getScrollTop() === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchEnd = async (e) => {
      if (!pulling.current) return;
      const dy = e.changedTouches[0].clientY - startY.current;
      pulling.current = false;
      if (dy > 72 && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
    };

    const target = containerRef.current || window;
    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, refreshing]);

  return { refreshing, containerRef };
}