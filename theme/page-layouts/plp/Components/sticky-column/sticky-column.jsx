import React, { useEffect, useRef, forwardRef } from "react";
import { isRunningOnClient, isBodyScrollLocked } from "../../../../helper/utils";

const StickyColumn = forwardRef(({ className, topOffset = 0, children }, forwardedRef) => {
  const elementRef = useRef(null);
  const lastKnownY = useRef(0);
  const currentTop = useRef(0);
  const pendingRaf = useRef(false);
  
  // Combine forwarded ref with internal ref
  useEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(elementRef.current);
      } else {
        forwardedRef.current = elementRef.current;
      }
    }
  }, [forwardedRef]);

  const colStyle = {
    position: "sticky",
    alignSelf: "start",
    willChange: "top",
  };

  useEffect(() => {
    if (isRunningOnClient()) {
      getInitialValues();
      window?.addEventListener("scroll", checkPosition);
      return () => {
        window?.removeEventListener("scroll", checkPosition);
      };
    }
  }, []);

  const getInitialValues = () => {
    lastKnownY.current = window?.scrollY || 0;
    currentTop.current = 0;
    pendingRaf.current = false;
  };

  const checkPosition = () => {
    // Skip position calculations when body scroll is locked (e.g., modal/drawer open)
    // This prevents sticky elements from jumping when overflow:hidden is applied
    if (isBodyScrollLocked()) {
      pendingRaf.current = false;
      return;
    }
    
    if (pendingRaf.current) return;
    pendingRaf.current = true;
    requestAnimationFrame(() => {
      // Double-check scroll lock state inside RAF as it may have changed
      if (isBodyScrollLocked()) {
        pendingRaf.current = false;
        return;
      }
      
      if (elementRef?.current) {
        const { top } = elementRef?.current.getBoundingClientRect();
        const maxTop =
          top + window?.scrollY - elementRef?.current.offsetTop + topOffset;
        const minTop =
          elementRef?.current.clientHeight - window?.innerHeight + 30;
        if (window?.scrollY < lastKnownY.current) {
          currentTop.current -= window?.scrollY - lastKnownY.current;
        } else {
          currentTop.current += lastKnownY.current - window?.scrollY;
        }
        lastKnownY.current = window?.scrollY;
        currentTop.current = Math.min(
          Math.max(currentTop.current, -minTop),
          maxTop,
          topOffset
        );
        elementRef.current.style.top = `${currentTop.current}px`;
        pendingRaf.current = false;
      }
    });
  };

  return (
    <div className={className} style={colStyle} ref={elementRef}>
      {children}
    </div>
  );
});

StickyColumn.displayName = "StickyColumn";

export default StickyColumn;
