import { useEffect } from "react";

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      const el = ref.current;
      if (!el) return;
      // if click was not inside the target element
      if (!el.contains(e.target)) {
        onOutside?.(e);
      }
    }

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

export default useClickOutside;
