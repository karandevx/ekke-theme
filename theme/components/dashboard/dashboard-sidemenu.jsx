import React, { useEffect, useState } from "react";
import { ALL_PROFILE_MENU } from "../../helper/constant";
import { FDKLink } from "fdk-core/components";
// import Modal from "../core/modal/modal";
import CustomDrawer from "../custom-slider/custom-slider";

export const DashboardSideMenu = ({
  activeSection,
  onSectionChange,
  userName,
  globalConfig,
  isMobile,
  setActiveSection,
  isMobileProfileMenuOpen,
  setIsMobileProfileMenuOpen,
}) => {
  return (
    <>
      {/* Desktop nav */}
      <aside className="lg:flex hidden w-1/2 h-full items-start relative pt-[10px]">
        <nav className="flex flex-col w-full items-start justify-between pb-6 px-4 h-full">
          <div className="flex flex-col items-start gap-6 relative w-full">
            <ul className="flex flex-col items-start justify-center gap-3 px-0 py-0 relative w-full">
              {ALL_PROFILE_MENU.map((item) => {
                const [isHovered, setIsHovered] = useState(false);
                return (
                  <FDKLink
                    key={item.key}
                    className="flex items-center relative w-full cursor-pointer"
                    to={item.link}
                    onClick={() => onSectionChange(item.key)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div
                      className={`relative w-1 h-1 rounded-[1px] transition-opacity duration-200 ${
                        activeSection === item.key
                          ? "bg-neutral-900 opacity-100"
                          : `bg-[#aaaaaa] ${isHovered ? "opacity-100" : "opacity-0"}`
                      }`}
                    />

                    <button
                      className={`flex items-start gap-1 pl-1 relative h-auto justify-start bg-transparent border-0 hover:opacity-70 transition-opacity`}
                    >
                      <span
                        className={`body-1 ${activeSection === item.key ? "!text-neutral-900" : "!text-[#aaaaaa]"}`}
                      >
                        {item.display}
                      </span>
                    </button>
                  </FDKLink>
                );
              })}
            </ul>
          </div>

          <footer className="flex flex-col items-start justify-end gap-8 relative w-full bg-transparent">
            <div
              className={`fx-footer-logo`}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={globalConfig?.logo}
                loading="lazy"
                alt="logo"
                fetchpriority="low"
                style={
                  isMobile
                    ? {
                        width: "120px",
                        height: "184px",
                        maxHeight: "100%",
                        display: "block",
                      }
                    : {
                        width: "60px",
                        height: "92px",
                      }
                }
                onError={(e) => {
                  console.error("Logo failed to load, using fallback");
                }}
              />
            </div>
          </footer>
        </nav>
      </aside>

      {/* Mobile Navigation Modal */}
      {/* <div
          className="block lg:hidden fixed left-0 right-0 bg-white z-10"
          style={{ top: "85px" }}
        >
          <header
            className="subheading-4 w-full flex items-center pl-[10px]"
            style={{ height: "40px" }}
          >
            HELLO, {userName}bbbb
          </header>

          {isMobileMenuOpen ? (
            <div
              className="flex justify-between p-4"
              style={{
                borderBottom: "1px solid #eeeeee",
                borderTop: "1px solid #eeeeee",
              }}
            >
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="body-1 lg:hidden block !text-[#aaaaaa] w-full text-left"
              >
                DASHBOARDDDDD
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="body-1"
              >
                CLOSE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="body-1 lg:hidden block w-full text-right pr-4 !text-[#000]"
              style={{
                borderBottom: "1px solid #eeeeee",
                borderTop: "1px solid #eeeeee",
                height: "40px",
              }}
            >
              DASHBOARD
            </button>
          )}
        </div> */}
      <CustomDrawer
        open={isMobileProfileMenuOpen}
        onClose={() => setIsMobileProfileMenuOpen(false)}
      >
        <div className="h-full flex flex-col">
          {/* Header with Close Button */}
          {/* <div className="flex justify-between items-start">
            <div>
              <p className="body-1" style={{ letterSpacing: "0.1em" }}>
                DASHBOARD
              </p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="body-1"
              style={{ letterSpacing: "0.1em" }}
            >
              CLOSE
            </button>
          </div> */}

          {/* Menu Items */}
          <div className="flex-1 px-6 pt-8">
            <ul className="space-y-2 flex flex-col gap-[18px]">
              {ALL_PROFILE_MENU.map((item) => (
                <li key={item.key}>
                  <FDKLink
                    to={item.link}
                    className="block text-black hover:text-gray-600 transition-colors"
                    onClick={() => setIsMobileProfileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className={`relative w-1 h-1 rounded-[1px] transition-opacity duration-200 ${
                          activeSection === item.key
                            ? "bg-neutral-900 opacity-100"
                            : "bg-[#aaaaaa] opacity-0"
                        }`}
                      />
                      <span
                        className={`body-1 ${activeSection === item.key ? "!text-neutral-900" : "!text-[#aaaaaa]"}`}
                        style={{ letterSpacing: "0.05em" }}
                      >
                        {item.display}
                      </span>
                    </div>
                  </FDKLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Logo */}
          <div className="flex justify-start p-[0_0_24px_10px]">
            {globalConfig?.logo && (
              <img src={globalConfig.logo} alt="logo" loading="lazy" />
            )}
          </div>
        </div>
      </CustomDrawer>
    </>
  );
};
