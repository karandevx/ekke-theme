import React, { useEffect, useState } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../../helper/utils";
import CartLandingSection from "../../sections/cart-landing";

const CartDrawer = ({ isOpen, onClose, fpi }) => {
  const [show, setShow] = useState(false);

  // Animation control and body scroll lock
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 100);
      lockBodyScroll();
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
      unlockBodyScroll();
    }, 300);
  };

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
