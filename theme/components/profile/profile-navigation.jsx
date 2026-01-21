/**
 * ProfileNavigation component renders the navigation structure for a user's profile page.
 * It adjusts the visibility of profile content and navigation bar based on the current route
 * and device type (mobile or not).
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the profile navigation.
 * @param {Function} props.signOut - A function to handle user sign-out.
 * @param {string} props.userProfilePicUrl - The URL of the user's profile picture.
 * @param {string} props.userName - The name of the user.
 *
 * @returns {JSX.Element} The rendered profile navigation component.
 *
 */

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ALL_PROFILE_MENU } from "../../helper/constant";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/profile-navigation.less";
import { useMobile } from "../../helper/hooks/useMobile";
import { useGlobalTranslation, useGlobalStore, useFPI } from "fdk-core/utils";
import { DashboardSideMenu } from "../dashboard/dashboard-sidemenu";
import useHeader from "../header/useHeader";
import { useProfileDashboardContext } from "../../contexts/ProfileDashboardContext";

function ProfileNavigation({ children, signOut, userProfilePicUrl, userName }) {
  const { t } = useGlobalTranslation("translation");
  const isMobile = useMobile(1023); // Use 1024px breakpoint to treat tablets as mobile
  const { pathname } = useLocation();
  const fpi = useFPI();
  const { globalConfig } = useHeader(fpi);

  const { isMobileProfileMenuOpen, setIsMobileProfileMenuOpen } =
    useProfileDashboardContext();

  // Add safety checks for SSR
  const globalStore = fpi?.getters?.i18N_DETAILS
    ? useGlobalStore(fpi.getters.i18N_DETAILS)
    : null;
  const language = globalStore?.language;
  const locale = language?.locale;
  const [activeSection, setActiveSection] = useState("");

  // Set active section based on current pathname
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPath = pathname;

    // Find matching menu item based on pathname
    const activeItem = ALL_PROFILE_MENU.find((item) => {
      if (currentPath.includes("/profile/details"))
        return item.key === "details";
      if (
        currentPath.includes("/wishlist") ||
        currentPath.includes("/c/wishlist")
      )
        return item.key === "wishlist";
      if (currentPath.includes("/profile/orders")) return item.key === "orders";
      if (currentPath.includes("/profile/address"))
        return item.key === "address";
      if (currentPath.includes("/profile/stores")) return item.key === "stores";
      return false;
    });

    if (activeItem) {
      setActiveSection(activeItem.key);
    }
  }, [pathname]);

  const hideProfileContent = useMemo(
    () =>
      pathname === "/profile/profile-tabs" &&
      pathname !== `/${locale}/profile/profile-tabs`,
    [pathname]
  );
  const hideNavBar = useMemo(
    () =>
      isMobile &&
      pathname !== "/profile/profile-tabs" &&
      pathname !== `/${locale}/profile/profile-tabs`,
    [isMobile, pathname]
  );

  const handleSignOut = () => {
    signOut();
  };

  // const renderContent = () => {
  //   switch (activeSection) {
  //     case "wishlist":
  //       return <WishlistContent />;
  //     case "personalDetails":
  //       return <UserDetails />;
  //     case "orderHistory":
  //       return <OrderHistoryContent />;
  //     case "addressBook":
  //       return <AddressBookContent />;
  //     case "stores":
  //       return <StoresContent />;
  //     default:
  //       return <WishlistContent />;
  //   }
  // };

  // const MobileNavigation = () => {
  //   return (
  //     <>
  //       {/* Mobile Menu Button */}
  //       <button
  //         onClick={() => setIsMobileMenuOpen(true)}
  //         className="fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow-md md:hidden"
  //       >
  //         <svg
  //           className="w-6 h-6"
  //           fill="none"
  //           stroke="currentColor"
  //           viewBox="0 0 24 24"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M4 6h16M4 12h16M4 18h16"
  //           />
  //         </svg>
  //       </button>

  //       {/* Mobile Overlay */}
  //       {isMobileMenuOpen && (
  //         <div
  //           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
  //           onClick={() => setIsMobileMenuOpen(false)}
  //         />
  //       )}

  //       {/* Mobile Sidebar */}
  //       <aside
  //         className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
  //           isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
  //         }`}
  //       >
  //         <nav className="flex flex-col h-full">
  //           {/* Header with Close Button */}
  //           <div className="flex justify-between items-center p-6 border-b border-gray-200">
  //             <h2 className="text-lg font-semibold text-gray-900">
  //               HELLO, {userName?.toUpperCase()}
  //             </h2>
  //             <button
  //               onClick={() => setIsMobileMenuOpen(false)}
  //               className="text-gray-500 hover:text-gray-700 text-sm font-medium"
  //             >
  //               CLOSE
  //             </button>
  //           </div>

  //           {/* Dashboard Section */}
  //           <div className="p-6">
  //             <p className="text-sm font-medium text-gray-600 mb-6">
  //               DASHBOARD
  //             </p>

  //             {/* Menu Items */}
  //             <ul className="space-y-1">
  //               {ALL_PROFILE_MENU.map((item) => (
  //                 <li key={item.key}>
  //                   <FDKLink
  //                     to={item.link}
  //                     className="block py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
  //                     onClick={() => setIsMobileMenuOpen(false)}
  //                   >
  //                     {item.display}
  //                   </FDKLink>
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>

  //           {/* Footer Logo */}
  //           <div className="mt-auto p-6 flex justify-center">
  //             {globalConfig?.logo && (
  //               <img
  //                 src={globalConfig.logo}
  //                 alt="logo"
  //                 className="w-16 h-auto opacity-20"
  //                 loading="lazy"
  //               />
  //             )}
  //           </div>
  //         </nav>
  //       </aside>
  //     </>
  //   );
  // };

  return (
    <>
      {/* Desktop Header */}
      <div className="lg:flex hidden p-4 flex-col lg:gap-[20px]">
        <div className="flex flex-col items-start gap-6 relative w-full">
          <header className="subheading-4">HELLO, {userName}</header>
        </div>

        <div className="flex flex-col items-start gap-2 relative w-full">
          <p className="body-1">DASHBOARD</p>
        </div>
      </div>

      {/* Mobile/Tablet Header - Fixed below main navigation */}
      {/* <div
        className="block lg:hidden fixed left-0 right-0 bg-white z-10"
        style={{ top: "85px" }}
      >
        <header
          className="subheading-4 w-full flex items-center pl-[10px]"
          style={{ height: "40px" }}
        >
          HELLO, {userName}
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
              DASHBOARD
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

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row w-full lg:h-[calc(100vh-56px)]">
        {/* Mobile/Tablet spacing for fixed header */}
        <div className="block lg:hidden" style={{ height: "80px" }} />

        {/* Desktop Sidebar - Only visible on desktop (1024px+) */}
        {!isMobile && (
          <div className="hidden lg:block w-1/2">
            <DashboardSideMenu
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              userName={userName}
              isMobile={isMobile}
              globalConfig={globalConfig}
              isMobileProfileMenuOpen={isMobileProfileMenuOpen}
              setIsMobileProfileMenuOpen={setIsMobileProfileMenuOpen}
            />
          </div>
        )}

        {/* Main Content - Full width on mobile/tablet, half width on desktop */}
        {!hideProfileContent && (
          <main className="flex w-full lg:w-1/2 bg-white relative lg:h-auto h-full overflow-y-auto lg:overflow-visible">
            {/* Mobile/Tablet Sidebar Modal - Opens within main content area */}
            {isMobile && (
              <DashboardSideMenu
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                userName={userName}
                isMobile={isMobile}
                globalConfig={globalConfig}
                isMobileProfileMenuOpen={isMobileProfileMenuOpen}
                setIsMobileProfileMenuOpen={setIsMobileProfileMenuOpen}
              />
            )}
            {children}
          </main>
        )}
      </div>
    </>
  );
}

export default ProfileNavigation;
