import React, { useEffect, useLayoutEffect, useState } from "react";

function CustomDrawer({ open, onClose, children }) {
  // Prevent body scroll when slider is open (mobile only)
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      // Only on mobile screens
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  useLayoutEffect(() => {
    const announcementBar = document.querySelector(".announcementBarBody");
    setHasAnnouncementBar(!!announcementBar);
  }, []);

  // Calculate dynamic height based on announcement bar presence
  const dynamicPosition = hasAnnouncementBar ? "166px" : "136px"; // 30px announcement bar + 56px navbar + 80px profile navigation header

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 bg-black/30 pointer-events-auto"
          onClick={onClose}
        />
      )}

      {/* Panel (slides from left) */}
      <div
        className={`fixed left-0 h-full bg-white shadow-xl transform transition-transform duration-300 pointer-events-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "80%", top: dynamicPosition }}
      >
        {children}
      </div>
    </div>
  );
}

export default CustomDrawer;
