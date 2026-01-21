import { useState, useEffect } from "react";
import { isRunningOnClient } from "../utils";

export const useMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isRunningOnClient()) {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= breakpoint);
      };

      // Set initial value
      checkMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkMobile);

      // Cleanup event listener on unmount
      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }
  }, [breakpoint]);

  return isMobile;
};
