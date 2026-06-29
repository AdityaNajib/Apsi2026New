import { useRef, useCallback } from "react";

/**
 * Hook to preserve scroll position across data refetches.
 *
 * Usage:
 *   const { saveScroll, restoreScroll } = useScrollRestore();
 *
 *   const fetchData = async () => {
 *     saveScroll();
 *     setLoading(true);
 *     // ... fetch ...
 *     setData(result);
 *     setLoading(false);
 *     restoreScroll();
 *   };
 *
 * By default it tracks window scroll. Pass a ref to a scrollable container
 * to track that element instead.
 */
export function useScrollRestore(containerRef?: React.RefObject<HTMLElement | null>) {
  const savedY = useRef<number>(0);

  const saveScroll = useCallback(() => {
    if (containerRef?.current) {
      savedY.current = containerRef.current.scrollTop;
    } else {
      savedY.current = window.scrollY;
    }
  }, [containerRef]);

  const restoreScroll = useCallback(() => {
    // Use requestAnimationFrame to wait for DOM paint before restoring
    requestAnimationFrame(() => {
      if (containerRef?.current) {
        containerRef.current.scrollTop = savedY.current;
      } else {
        window.scrollTo({ top: savedY.current, behavior: "instant" });
      }
    });
  }, [containerRef]);

  return { saveScroll, restoreScroll };
}
