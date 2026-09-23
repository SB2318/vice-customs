import { useRef, useCallback, MouseEvent, WheelEvent } from 'react';

export function useDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const onMouseLeave = useCallback(() => {
    isMouseDown.current = false;
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('cursor-grabbing');
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isMouseDown.current = false;
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('cursor-grabbing');
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.6;
    
    // Only engage drag scrolling after moving more than 4px (threshold protects normal clicks)
    if (Math.abs(x - startX.current) > 4) {
      isDragging.current = true;
      scrollRef.current.classList.add('cursor-grabbing');
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  }, []);

  // Smooth mousewheel horizontal scroll
  const onWheel = useCallback((e: WheelEvent) => {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY * 0.8;
    }
  }, []);

  return {
    scrollRef,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onWheel
  };
}
