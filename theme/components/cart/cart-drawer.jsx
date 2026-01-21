import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { lockBodyScroll, unlockBodyScroll } from "../../helper/utils";
import CartLandingSection from "../../sections/cart-landing";

const CartDrawer = ({ isOpen, onClose, fpi }) => {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      onClose();
      unlockBodyScroll();
    }, 300);
  }, [onClose]);

  // Animation control and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Lock scroll first to prevent any scroll jumps
      lockBodyScroll();
      // Then trigger animation
      requestAnimationFrame(() => {
        setTimeout(() => setShow(true), 10);
      });
    } else {
      setShow(false);
      unlockBodyScroll();
    }

    // Cleanup: unlock scroll when component unmounts
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  // Close cart drawer when location changes (navigation)
  useEffect(() => {
    // Only close if pathname actually changed and drawer is open
    if (previousPathname.current !== location.pathname && isOpen) {
      handleClose();
      previousPathname.current = location.pathname;
    }
  }, [location.pathname, isOpen, handleClose]);

  return (
    <>
      {/* Overlay - only on mobile */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          show
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:max-w-[50%] md:right-0 md:w-full bg-[#F7F7F5] shadow-xl z-50 transition-opacity duration-300 overflow-y-auto ${
          show
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <CartLandingSection handleClose={handleClose} />
      </div>
    </>
  );
};

export default CartDrawer;
