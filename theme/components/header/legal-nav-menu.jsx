import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import { FDKLink } from "fdk-core/components";

const navigationItems = [
  { label: "Terms and conditions", path: "/terms-and-conditions" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Shipping policy", path: "/shipping-policy" },
  { label: "Return Policy", path: "/return-policy" },
  // { label: "FAQ", path: "/faq" },
  // { label: "SIZING GUIDE", path: "/sizing-guide" },
  // { label: "GIFT CARDS", path: "/gift-cards" },
  // { label: "PRESS FEATURES", path: "/press-features" },
  // { label: "CONTACT US", path: "/contact-us" },
  // { label: "LOYALTY PROGRAM", path: "/loyalty-program" },
];

export const LegalNavMenu = () => {
  const { hasAnnouncementBar } = useCheckAnnouncementBar();
  const navRef = useRef(null);
  const location = useLocation();

  // Ensure the first item is visible on initial render
  useEffect(() => {
    if (navRef.current) {
      navRef.current.scrollLeft = 0;
    }
  }, []);

  // Check if current path matches any navigation item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className="w-full bg-[#f7f7f5]"
      style={{
        position: "sticky",
        top: hasAnnouncementBar ? "80px" : "56px",
        zIndex: 1,
      }}
    >
      <div
        ref={navRef}
        className="w-full overflow-x-auto scrollbar-hide"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="inline-flex w-full justify-center items-center px-4 py-4 h-10 min-w-max">
          <div className="flex items-center gap-6">
            {navigationItems.map((item, index) => (
              <FDKLink
                key={index}
                to={item.path}
                className={`inline-flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0 ${
                  isActive(item.path) ? "font-medium" : ""
                }`}
              >
                <div
                  className={`w-1 h-1 bg-neutral-900 rounded-[1px] ${
                    isActive(item.path) ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="body-1 tracking-[0] leading-[13.2px] whitespace-nowrap">
                  {item.label}
                </span>
              </FDKLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNavMenu;
