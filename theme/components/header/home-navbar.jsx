import React, { useMemo, useEffect, useState } from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./styles/home-navbar.less";
import UserIcon from "../../assets/images/logo/user-logo.svg";
import SearchIcon from "../../assets/images/search-menu.svg";
import SearchModal from "../search-modal/search-modal";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";
import { useMobile } from "../../helper/hooks/useMobile";
import { useLocation } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";

// Transform platform navigation data to component format
const transformNavigationData = (navigationList) => {
  // Find the active dropdown category (Women, Men, or Living)
  const findCategoryData = (categoryName) => {
    const category = navigationList.find(
      (item) =>
        item.active &&
        item.display?.toUpperCase() === categoryName.toUpperCase(),
    );
    return category?.sub_navigation || [];
  };

  // Transform sub_navigation items to our format
  const transformSubNavigation = (subNavItems, categoryPrefix = "") => {
    return subNavItems
      .filter((item) => item.active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((item, index) => ({
        text: item.display,
        image:
          item.image ||
          `${categoryPrefix}-${item.display?.toLowerCase().replace(/\s+/g, "-")}`,
        action: item.action,
      }));
  };

  // Get category data for current active dropdown
  const getCategoryDropdownData = (categoryName) => {
    const categoryData = findCategoryData(categoryName);
    const result = {};

    categoryData.forEach((section) => {
      // Create a clean key from the section display name
      const sectionKey = section.display
        ?.toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[&-]/g, "");

      // Transform the section data dynamically
      if (section.sub_navigation?.length > 0) {
        result[sectionKey] = {
          displayName: section.display, // Store original display name
          items: transformSubNavigation(
            section.sub_navigation,
            section.display?.toLowerCase().replace(/\s+/g, "-"),
          ),
        };
      }
    });

    return result;
  };

  return { getCategoryDropdownData };
};

function HomeNavbar({
  navigationList = [],
  checkLogin,
  cartItemCount,
  globalConfig,
  profileUserName,
  isMobileProfileMenuOpen,
  setIsMobileProfileMenuOpen,
}) {
  // State management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileMenuItem, setActiveMobileMenuItem] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const { logo } = globalConfig || {};
  const location = useLocation();
  const isMobile = useMobile(1023);
  const { t } = useGlobalTranslation("translation");
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Check if current route is a profile route
  const isProfileRoute =
    location.pathname.startsWith("/profile") ||
    location.pathname.includes("/profile") ||
    location.pathname === "/c/wishlist";

  // Get categories with dropdowns dynamically
  const categoriesWithDropdowns = useMemo(() => {
    return navigationList
      .filter((item) => item.sub_navigation && item.sub_navigation.length > 0)
      .map((item) => item.display?.toUpperCase())
      .filter(Boolean);
  }, [navigationList]);

  const [selectedMobileFilter, setSelectedMobileFilter] = useState(
    categoriesWithDropdowns[0] || "WOMEN",
  );

  console.log("selectedMobileFilter", navigationList);

  // Transform navigation data
  const { getCategoryDropdownData } = transformNavigationData(navigationList);

  // Get current dropdown data based on active category
  const currentDropdownData = activeDropdown
    ? getCategoryDropdownData(activeDropdown)
    : {};

  // Helper function to recursively find item with tagLink in sub_navigation
  const findTagLinkItem = (subNavigation) => {
    if (!subNavigation || subNavigation.length === 0) return null;

    for (const item of subNavigation) {
      // Check if current item has tagLink tag
      if (item.tags?.[0]?.toLowerCase().includes("taglink")) {
        return item;
      }
      // Recursively search in nested sub_navigation
      if (item.sub_navigation && item.sub_navigation.length > 0) {
        const found = findTagLinkItem(item.sub_navigation);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to get Brands link from current active category
  const getBrandsLinkData = (categoryName) => {
    const category = navigationList.find(
      (item) =>
        item.active &&
        item.display?.toUpperCase() === categoryName?.toUpperCase(),
    );

    if (!category?.sub_navigation) {
      return { action: null, url: "/brands", display: "Link" };
    }

    // Recursively search for item with tagLink in all sub_navigation levels
    const brandsItem = findTagLinkItem(category.sub_navigation);

    console.log("Brands Item", brandsItem);

    if (!brandsItem) {
      return { action: null, url: "/brands", display: "Link" };
    }

    const isExternal = brandsItem?.action?.page?.type === "external";
    const url = isExternal
      ? brandsItem?.action?.page?.query?.url?.[0]
      : convertActionToUrl(brandsItem?.action);

    return {
      action: brandsItem?.action,
      url: url,
      display: brandsItem?.display || "Link",
      isExternal,
    };
  };

  const isOnCheckoutPage = useMemo(() => {
    return window.location.pathname.includes("/cart/checkout");
  }, [window.location.pathname]);

  // Helper functions - Dynamic check for dropdown
  const shouldShowDropdown = (navItem) => {
    // Check if the navigation item has sub_navigation (dropdown content)
    return navItem.sub_navigation && navItem.sub_navigation.length > 0;
  };

  // Navigation click handlers
  const handleNavClick = (e, navItem) => {
    if (shouldShowDropdown(navItem)) {
      e.preventDefault(); // Prevent navigation redirect
      const category = navItem.display?.toUpperCase();

      // Close search modal when opening nav dropdown
      if (isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }

      if (activeDropdown === category && isDropdownOpen) {
        // Close if clicking same category
        setIsDropdownOpen(false);
        setActiveDropdown(null);
        setCurrentImage(null);
      } else {
        // Open dropdown with new category
        setIsDropdownOpen(true);
        setActiveDropdown(category);
        setCurrentImage(null); // Set default visible image for testing
      }
    }
  };

  // Click outside handler for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle clicks when desktop dropdown is open (desktop only)
      if (isDropdownOpen && !isMobileMenuOpen) {
        const dropdownContainer = document.querySelector(
          `.${styles.dropdownContainer}`,
        );
        const navbar = document.querySelector(`.${styles.homeNavbar}`);
        const desktopLayout = document.querySelector(
          `.${styles.desktopLayout}`,
        );

        // Check if click is outside both navbar and dropdown
        const isOutsideNavbarAndDropdown =
          dropdownContainer &&
          navbar &&
          !dropdownContainer.contains(event.target) &&
          !navbar.contains(event.target);

        // Check if click is on other header elements (search, accounts, cart)
        // but not on the nav items that toggle the dropdown
        const isClickOnOtherHeaderElement =
          desktopLayout &&
          desktopLayout.contains(event.target) &&
          !event.target.closest(`.${styles.navItem}`) &&
          !dropdownContainer?.contains(event.target);

        // Close dropdown if clicking outside OR on other header elements
        if (isOutsideNavbarAndDropdown || isClickOnOtherHeaderElement) {
          setIsDropdownOpen(false);
          setActiveDropdown(null);
          setCurrentImage(null);
        }
      }
    };

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);
  // Check if current page is home page
  useEffect(() => {
    const checkHomePage = () => {
      const pathname = window.location.pathname;
      // Check if we're on the home page (root path)
      setIsHomePage(pathname === "/" || pathname === "");
    };

    checkHomePage();
  }, [window.location.pathname]);

  // Update selectedMobileFilter when categories change
  useEffect(() => {
    if (
      categoriesWithDropdowns.length > 0 &&
      !categoriesWithDropdowns.includes(selectedMobileFilter)
    ) {
      setSelectedMobileFilter(categoriesWithDropdowns[0]);
    }
  }, [categoriesWithDropdowns, selectedMobileFilter]);

  // Mobile menu handlers
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileFilterClick = (filter) => {
    // If clicking on the already selected filter, close the menu
    if (filter === selectedMobileFilter) {
      setIsMobileMenuOpen(false);
      return;
    }
    // Otherwise, switch to the new filter
    setSelectedMobileFilter(filter);
    setActiveMobileMenuItem(null); // Reset active item when filter changes
  };

  const handleMobileMenuItemClick = (item, index, sectionKey) => {
    setActiveMobileMenuItem(`${sectionKey}-${item.text}-${index}`);
  };

  // Subcategory hover handlers
  const handleSubcategoryMouseEnter = (item) => {
    setCurrentImage(item.image); // Only changes the second image
  };

  const handleSubcategoryMouseLeave = () => {
    // Return to default subcategory image
    setCurrentImage("");
  };

  // Handler to close desktop dropdown
  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
    setActiveDropdown(null);
    setCurrentImage(null);
    // Also close search modal when navigating
    if (isSearchModalOpen) {
      setIsSearchModalOpen(false);
    }
  };

  // Render menu item with dynamic action handling
  const renderMenuItem = (item, index) => {
    if (!item.action) {
      return (
        <button
          key={index}
          className={styles.dropdownMenuItem}
          onMouseEnter={() => handleSubcategoryMouseEnter(item)}
          onMouseLeave={handleSubcategoryMouseLeave}
        >
          <div className={styles.menuItemBullet}>
            <div className={styles.menuItemIndicator} />
          </div>
          <span className={styles.menuItemText}>{item.text}</span>
        </button>
      );
    }

    const isExternal = item?.action?.page?.type === "external";
    const url = isExternal
      ? item?.action?.page?.query?.url?.[0]
      : convertActionToUrl(item?.action);

    if (!url || url.length === 0) {
      return (
        <button
          key={index}
          className={styles.dropdownMenuItem}
          onMouseEnter={() => handleSubcategoryMouseEnter(item)}
          onMouseLeave={handleSubcategoryMouseLeave}
        >
          <div className={styles.menuItemBullet}>
            <div className={styles.menuItemIndicator} />
          </div>
          <span className={styles.menuItemText}>{item.text}</span>
        </button>
      );
    }

    return isExternal ? (
      <a
        key={index}
        href={url}
        target="_self"
        rel="noopener noreferrer"
        className={styles.dropdownMenuItem}
        onMouseEnter={() => handleSubcategoryMouseEnter(item)}
        onMouseLeave={handleSubcategoryMouseLeave}
        onClick={handleCloseDropdown}
      >
        <div className={styles.menuItemBullet}>
          <div className={styles.menuItemIndicator} />
        </div>
        <span className={styles.menuItemText}>{item.text}</span>
      </a>
    ) : (
      <FDKLink
        key={index}
        action={item.action}
        className={styles.dropdownMenuItem}
        onMouseEnter={() => handleSubcategoryMouseEnter(item)}
        onMouseLeave={handleSubcategoryMouseLeave}
        onClick={handleCloseDropdown}
      >
        <div className={styles.menuItemBullet}>
          <div className={styles.menuItemIndicator} />
        </div>
        <span className={styles.menuItemText}>{item.text}</span>
      </FDKLink>
    );
  };

  // Handler to close mobile menu
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveMobileMenuItem(null);
  };

  // Render mobile menu item with dynamic action handling
  const renderMobileMenuItem = (
    item,
    index,
    sectionKey,
    hasIndicator = false,
  ) => {
    const uniqueItemId = `${sectionKey}-${item.text}-${index}`;

    if (!item.action) {
      return (
        <div
          key={index}
          className={`${styles.mobileMenuItem} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
        >
          {hasIndicator && (
            <div className={styles.mobileMenuItemBullet}>
              <div className={styles.mobileMenuIndicator} />
            </div>
          )}
          <button
            className={`${styles.mobileMenuItemText} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
            onClick={() => {
              handleMobileMenuItemClick(item, index, sectionKey);
            }}
          >
            {item.text}
          </button>
        </div>
      );
    }

    const isExternal = item?.action?.page?.type === "external";
    const url = isExternal
      ? item?.action?.page?.query?.url?.[0]
      : convertActionToUrl(item?.action);

    if (!url || url.length === 0) {
      return (
        <div
          key={index}
          className={`${styles.mobileMenuItem} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
        >
          {hasIndicator && (
            <div className={styles.mobileMenuItemBullet}>
              <div className={styles.mobileMenuIndicator} />
            </div>
          )}
          <button
            className={`${styles.mobileMenuItemText} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
            onClick={() => {
              handleMobileMenuItemClick(item, index, sectionKey);
            }}
          >
            {item.text}
          </button>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`${styles.mobileMenuItem} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
      >
        {hasIndicator && (
          <div className={styles.mobileMenuItemBullet}>
            <div className={styles.mobileMenuIndicator} />
          </div>
        )}
        {isExternal ? (
          <a
            href={url}
            target="_self"
            rel="noopener noreferrer"
            className={`${styles.mobileMenuItemText} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
            onClick={() => {
              handleMobileMenuItemClick(item, index, sectionKey);
              handleCloseMobileMenu();
            }}
          >
            {item.text}
          </a>
        ) : (
          <FDKLink
            action={item.action}
            className={`${styles.mobileMenuItemText} ${activeMobileMenuItem === uniqueItemId ? styles.active : ""}`}
            onClick={() => {
              handleMobileMenuItemClick(item, index, sectionKey);
              handleCloseMobileMenu();
            }}
          >
            {item.text}
          </FDKLink>
        )}
      </div>
    );
  };

  // Get current category image from navigationList
  const getCurrentCategoryImage = () => {
    if (!activeDropdown) return null;
    const category = navigationList.find(
      (item) =>
        item.active &&
        item.display?.toUpperCase() === activeDropdown.toUpperCase(),
    );
    const categoryImage = category?.image;

    // Return platform image or fallback dummy image
    return categoryImage && categoryImage.trim() !== ""
      ? categoryImage
      : "https://via.placeholder.com/230x400/f0f0f0/999999?text=Category+Image";
  };

  // Get current subcategory image based on currentImage state
  const getCurrentSubcategoryImage = () => {
    // Return null if no image is set or it's the default
    if (
      !currentImage ||
      currentImage === "default-subcategory" ||
      currentImage === ""
    ) {
      return null;
    }

    // Find the item with matching image identifier
    for (const [sectionKey, sectionData] of Object.entries(
      currentDropdownData,
    )) {
      const item = sectionData.items.find(
        (item) => item.image === currentImage,
      );
      if (item) {
        // Return platform image if exists and not empty, otherwise null
        const itemImage = item.image;
        if (
          itemImage &&
          itemImage.trim() !== "" &&
          !itemImage.includes("default-subcategory") &&
          !itemImage.includes("placeholder") &&
          (itemImage.startsWith("http") || itemImage.startsWith("/"))
        ) {
          return itemImage;
        }
      }
    }

    // Return null if no valid image found
    return null;
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.homeNavbar}>
        {/* DESKTOP LAYOUT */}
        <div className={styles.desktopLayout}>
          {/* LEFT SIDE */}
          <div className={styles.leftNav}>
            {navigationList.slice(0, 3).map((navItem, index) => (
              <div
                key={index}
                className={`${styles.navItem} ${
                  shouldShowDropdown(navItem) &&
                  isDropdownOpen &&
                  activeDropdown === navItem.display?.toUpperCase()
                    ? styles.activeNavItem
                    : ""
                }`}
              >
                <span className={styles.hoverBullet}></span>
                {shouldShowDropdown(navItem) ? (
                  // Clickable navigation for MEN/WOMEN
                  <button
                    className={styles.navButton}
                    onClick={(e) => handleNavClick(e, navItem)}
                  >
                    <span className={styles.navText}>{navItem.display}</span>
                  </button>
                ) : (
                  // Regular link for other navigation items
                  (() => {
                    const isExternal =
                      navItem?.action?.page?.type === "external";
                    const url = isExternal
                      ? navItem?.action?.page?.query?.url?.[0]
                      : convertActionToUrl(navItem?.action);

                    if (!url || url.length === 0) {
                      return (
                        <span className={styles.navLink}>
                          <span className={styles.navText}>
                            {navItem.display}
                          </span>
                        </span>
                      );
                    }

                    return isExternal ? (
                      <a
                        href={url}
                        target="_self"
                        rel="noopener noreferrer"
                        className={styles.navLink}
                        onClick={handleCloseDropdown}
                      >
                        <span className={styles.navText}>
                          {navItem.display}
                        </span>
                      </a>
                    ) : (
                      <FDKLink
                        action={navItem?.action}
                        className={styles.navLink}
                        onClick={handleCloseDropdown}
                      >
                        <span className={styles.navText}>
                          {navItem.display}
                        </span>
                      </FDKLink>
                    );
                  })()
                )}
              </div>
            ))}
          </div>

          {!isHomePage && (
            <FDKLink to="/" className={`h-4 ${styles.logoLink}`}>
              <SvgWrapper
                svgSrc="ekke-header-logo"
                className={styles.logoImage}
              />
            </FDKLink>
          )}

          {/* RIGHT SIDE */}

          {/* {!isOnCheckoutPage && ( */}
          <div className={styles.rightNav}>
            <button
              className={`${styles.navAction} ${isSearchModalOpen ? styles.activeNavAction : ""}`}
              onClick={() => {
                setIsSearchModalOpen(!isSearchModalOpen);
                // Close dropdown when opening search modal
                if (isDropdownOpen) {
                  setIsDropdownOpen(false);
                  setActiveDropdown(null);
                  setCurrentImage(null);
                }
              }}
            >
              <span className={styles.hoverBullet}></span>
              <span className={styles.actionText}>Search</span>
            </button>
            {navigationList.slice(3).map((navItem, index) => {
              const isExternal = navItem?.action?.page?.type === "external";
              const url = isExternal
                ? navItem?.action?.page?.query?.url?.[0]
                : convertActionToUrl(navItem?.action);

              const handleClick = () => {
                // Close dropdown when clicking on right-side nav items (e.g., ACCOUNTS)
                if (isDropdownOpen) {
                  setIsDropdownOpen(false);
                  setActiveDropdown(null);
                  setCurrentImage(null);
                }
                // Close search modal when clicking on other header items
                if (isSearchModalOpen) {
                  setIsSearchModalOpen(false);
                }
              };

              return (
                <div key={`right-${index}`} className={styles.navItem}>
                  <span className={styles.hoverBullet}></span>
                  {!url || url.length === 0 ? (
                    <span className={styles.navLink} onClick={handleClick}>
                      <span className={styles.navText}>{navItem.display}</span>
                    </span>
                  ) : isExternal ? (
                    <a
                      href={url}
                      target="_self"
                      rel="noopener noreferrer"
                      className={styles.navLink}
                      onClick={handleClick}
                    >
                      <span className={styles.navText}>{navItem.display}</span>
                    </a>
                  ) : (
                    <FDKLink
                      action={navItem?.action}
                      className={styles.navLink}
                      onClick={handleClick}
                    >
                      <span className={styles.navText}>{navItem.display}</span>
                    </FDKLink>
                  )}
                </div>
              );
            })}

            {/* Cart Button */}
            {!globalConfig?.disable_cart && (
              <button
                type="button"
                className={styles.navAction}
                onClick={() => {
                  checkLogin("cart");
                  if (isDropdownOpen) {
                    setIsDropdownOpen(false);
                    setActiveDropdown(null);
                    setCurrentImage(null);
                  }
                  // Close search modal when clicking cart
                  if (isSearchModalOpen) {
                    setIsSearchModalOpen(false);
                  }
                }}
              >
                <span className={styles.hoverBullet}></span>
                <span className={styles.actionText}>
                  CART{" "}
                  <span style={{ color: "#aaaaaa" }}>
                    {`${String(cartItemCount).padStart(2, "0")} 
                     `}
                  </span>
                </span>
              </button>
            )}
          </div>
          {/* )} */}
        </div>

        {/* MOBILE LAYOUT */}
        <div className={styles.mobileLayout}>
          <div className={styles.mobileLeft}>
            <FDKLink
              className={styles.mobileMenuButton}
              onClick={() => {
                handleMobileMenuClick();
                // Close search modal when opening mobile menu
                if (isSearchModalOpen) {
                  setIsSearchModalOpen(false);
                }
              }}
            >
              {isMobileMenuOpen && <div className={styles.mobileMenuBullet} />}
              <span className={styles.menuText}>MENU</span>
            </FDKLink>
            <FDKLink
              className={styles.mobileIcon}
              onClick={() => {
                setIsSearchModalOpen(!isSearchModalOpen);
                // Close mobile menu when opening search
                if (isMobileMenuOpen) {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <SearchIcon className={styles.mobileSearchIcon} />
            </FDKLink>
          </div>
          {!isHomePage && (
            <FDKLink to="/" className={styles.logoLink}>
              <SvgWrapper
                svgSrc="ekke-header-logo"
                className={styles.logoImage}
              />
            </FDKLink>
          )}

          <div className={styles.mobileRight}>
            <button
              type="button"
              className={styles.mobileIcon}
              onClick={() => {
                checkLogin("profile");
                // Close mobile menu when clicking profile/accounts
                if (isMobileMenuOpen) {
                  setIsMobileMenuOpen(false);
                }
                // Close search modal when clicking profile
                if (isSearchModalOpen) {
                  setIsSearchModalOpen(false);
                }
              }}
            >
              <UserIcon className={styles.mobileUserIcon} />
            </button>

            <button
              type="button"
              className={styles.mobileCartButton}
              onClick={() => {
                checkLogin("cart");
                // Close mobile menu when clicking cart
                if (isMobileMenuOpen) {
                  setIsMobileMenuOpen(false);
                }
                // Close search modal when clicking cart
                if (isSearchModalOpen) {
                  setIsSearchModalOpen(false);
                }
              }}
            >
              <span className={styles.mobileCartText}>
                CART{" "}
                <span style={{ color: "#aaaaaa" }}>
                  {`${String(cartItemCount).padStart(2, "0")}`}
                </span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* DESKTOP DROPDOWN MENU - 50/50 LAYOUT */}
      {isDropdownOpen && activeDropdown && (
        <div className={styles.dropdownContainer}>
          <div className={styles.dropdownContent}>
            {/* LEFT SECTION - 50% - NAVIGATION */}
            <div className={styles.leftSection}>
              {(() => {
                const sections = Object.keys(currentDropdownData);
                const sectionEntries = Object.entries(currentDropdownData);

                // Organize sections into columns based on typical structure
                const columns = [];

                // Column 1: First section (usually Highlights) + About section
                if (sections.length > 0) {
                  const firstSection = sectionEntries[0];
                  columns.push(
                    <div key="column-1" className={styles.navigationColumn}>
                      <div className={styles.columnHeader}>
                        <span className={styles.headerText}>
                          {firstSection[1].displayName.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.columnContent}>
                        {firstSection[1].items.map(renderMenuItem)}
                        <div className={styles.sectionSpacer}>
                          {/* Static About section for consistency */}
                          {[
                            { text: "ABOUT", image: "about" },
                            { text: "JOURNAL", image: "journal" },
                            // { text: "RADIO", image: "radio" },
                          ].map(renderMenuItem)}
                        </div>
                      </div>
                    </div>,
                  );
                }

                // Column 2: Handle different scenarios based on total sections
                if (sections.length > 1) {
                  const secondSection = sectionEntries[1];

                  // For 4 categories: Second section gets full height
                  if (sections.length === 4) {
                    columns.push(
                      <div key="column-2" className={styles.navigationColumn}>
                        <div className={styles.columnHeader}>
                          <span className={styles.headerText}>
                            {secondSection[1].displayName.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.columnScrollContent}>
                          {secondSection[1].items.map(renderMenuItem)}
                        </div>
                      </div>,
                    );
                  }

                  // For 5+ categories: Second and Third sections stacked
                  if (sections.length >= 5) {
                    const thirdSection = sectionEntries[2];
                    columns.push(
                      <div key="column-2" className={styles.navigationColumn}>
                        <div className={styles.columnHeader}>
                          <span className={styles.headerText}>
                            {secondSection[1].displayName.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.columnScrollContent}>
                          {secondSection[1].items.map(renderMenuItem)}
                        </div>

                        <div className={styles.columnHeader}>
                          <span className={styles.headerText}>
                            {thirdSection[1].displayName.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.columnScrollContent}>
                          {thirdSection[1].items.map(renderMenuItem)}
                        </div>
                      </div>,
                    );
                  }

                  // For 2-3 categories: Handle normally
                  if (sections.length <= 3) {
                    columns.push(
                      <div key="column-2" className={styles.navigationColumn}>
                        <div className={styles.columnHeader}>
                          <span className={styles.headerText}>
                            {secondSection[1].displayName.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.columnScrollContent}>
                          {secondSection[1].items.map(renderMenuItem)}
                        </div>

                        {/* For 3 sections: put 3rd section in column 2 */}
                        {sections.length === 3 && sectionEntries[2] && (
                          <>
                            <div className={styles.columnHeader}>
                              <span className={styles.headerText}>
                                {sectionEntries[2][1].displayName.toUpperCase()}
                              </span>
                            </div>
                            <div className={styles.columnScrollContent}>
                              {sectionEntries[2][1].items.map(renderMenuItem)}
                            </div>
                          </>
                        )}
                      </div>,
                    );
                  }
                }

                // Column 3: Handle third column scenarios
                if (sections.length === 4) {
                  // For 4 categories: Third and Fourth sections stacked
                  const thirdSection = sectionEntries[2];
                  const fourthSection = sectionEntries[3];

                  columns.push(
                    <div key="column-3" className={styles.navigationColumn}>
                      <div className={styles.columnHeader}>
                        <span className={styles.headerText}>
                          {thirdSection[1].displayName.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.columnScrollContent}>
                        {thirdSection[1].items.map(renderMenuItem)}
                      </div>

                      <div className={styles.columnHeader}>
                        <span className={styles.headerText}>
                          {fourthSection[1].displayName.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.columnScrollContent}>
                        {fourthSection[1].items.map(renderMenuItem)}
                      </div>
                    </div>,
                  );
                }

                if (sections.length >= 5) {
                  // For 5+ categories: Fourth and Fifth sections stacked
                  const fourthSection = sectionEntries[3];
                  const fifthSection = sectionEntries[4];

                  columns.push(
                    <div key="column-3" className={styles.navigationColumn}>
                      <div className={styles.columnHeader}>
                        <span className={styles.headerText}>
                          {fourthSection[1].displayName.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.columnScrollContent}>
                        {fourthSection[1].items.map(renderMenuItem)}
                      </div>

                      {fifthSection && (
                        <>
                          <div className={styles.columnHeader}>
                            <span className={styles.headerText}>
                              {fifthSection[1].displayName.toUpperCase()}
                            </span>
                          </div>
                          <div className={styles.columnScrollContent}>
                            {fifthSection[1].items.map(renderMenuItem)}
                          </div>
                        </>
                      )}
                    </div>,
                  );
                }

                return columns;
              })()}
            </div>

            {/* RIGHT SECTION - 50% - TWO IMAGES */}
            <div className={styles.rightSection}>
              <div className={styles.imageContainer}>
                {/* Fixed Category Image - 230px width */}
                <div className={styles.categoryImageContainer}>
                  <div
                    className={styles.categoryImage}
                    data-category={activeDropdown}
                  >
                    <img src={getCurrentCategoryImage()} alt={activeDropdown} />
                    <div className={styles.imageButtonContainer}>
                      {(() => {
                        const brandsData = getBrandsLinkData(activeDropdown);
                        const handleBrandsClick = () => {
                          setIsDropdownOpen(false);
                          setActiveDropdown(null);
                          setCurrentImage(null);
                        };

                        if (!brandsData.url || brandsData.url.length === 0) {
                          return (
                            <button
                              className={styles.imageButton}
                              onClick={handleBrandsClick}
                            >
                              {brandsData.display}
                            </button>
                          );
                        }

                        return brandsData.isExternal ? (
                          <a
                            href={brandsData.url}
                            target="_self"
                            rel="noopener noreferrer"
                            className={styles.imageButton}
                            onClick={handleBrandsClick}
                          >
                            {brandsData.display}
                          </a>
                        ) : brandsData.action ? (
                          <FDKLink
                            action={brandsData.action}
                            className={styles.imageButton}
                            onClick={handleBrandsClick}
                          >
                            {brandsData.display}
                          </FDKLink>
                        ) : (
                          <FDKLink
                            to={brandsData.url}
                            className={styles.imageButton}
                            onClick={handleBrandsClick}
                          >
                            {brandsData.display}
                          </FDKLink>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Dynamic Subcategory Image - Remaining width - Only show if valid image exists */}
                {getCurrentSubcategoryImage() && (
                  <div className={styles.subcategoryImageContainer}>
                    <div
                      className={styles.subcategoryImage}
                      data-image={currentImage}
                    >
                      <img
                        src={getCurrentSubcategoryImage()}
                        alt={currentImage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDropdownContainer}>
          {/* Mobile Filter Section */}
          <div className={styles.mobileFiltersSection}>
            <nav className={styles.mobileFiltersNav}>
              <div className={styles.mobileFiltersContent}>
                {categoriesWithDropdowns.map((filter) => (
                  <FDKLink
                    key={filter}
                    className={styles.mobileFilterButton}
                    onClick={() => handleMobileFilterClick(filter)}
                  >
                    <div className={styles.mobileFilterBullet}>
                      {selectedMobileFilter === filter && (
                        <div className={styles.mobileFilterIndicator} />
                      )}
                    </div>
                    <span className={styles.mobileFilterText}>{filter}</span>
                  </FDKLink>
                ))}
              </div>
            </nav>
          </div>

          {/* Mobile Menu Content */}
          <div className={styles.mobileMenuContent}>
            {(() => {
              // Get mobile dropdown data based on selected filter
              const mobileDropdownData =
                getCategoryDropdownData(selectedMobileFilter);

              return Object.entries(mobileDropdownData).map(
                ([sectionKey, sectionData], index) => (
                  <div key={index} className={styles.mobileMenuSection}>
                    <div className={styles.mobileMenuHeader}>
                      <span className={styles.mobileMenuHeaderText}>
                        {sectionData.displayName.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.mobileMenuItems}>
                      {sectionData.items.map((item, itemIndex) =>
                        renderMobileMenuItem(item, itemIndex, sectionKey),
                      )}
                    </div>
                  </div>
                ),
              );
            })()}

            {/* Static About section for mobile */}
            {(() => {
              const mobileDropdownData =
                getCategoryDropdownData(selectedMobileFilter);
              return (
                Object.keys(mobileDropdownData).length > 0 && (
                  <div className={styles.mobileMenuSection}>
                    <div className={styles.mobileMenuHeader}>
                      <span className={styles.mobileMenuHeaderText}>ABOUT</span>
                    </div>
                    <div className={styles.mobileMenuItems}>
                      {[
                        { text: "ABOUT EKKE", image: "about-ekke" },
                        { text: "EDITORIAL HUB", image: "editorial-hub" },
                        // { text: "RADIO", image: "radio" },
                      ].map((item, index) =>
                        renderMobileMenuItem(item, index, "about"),
                      )}
                    </div>
                  </div>
                )
              );
            })()}
          </div>
        </div>
      )}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Profile Header - Only on mobile/tablet profile routes */}
      {isMobile && isProfileRoute && (
        <div
          className="block lg:hidden fixed left-0 right-0 bg-white z-10"
          style={{ top: hasAnnouncementBar ? "80px" : "56px" }}
        >
          <header
            className="subheading-4 w-full flex items-center pl-[10px]"
            style={{ height: "40px" }}
          >
            HELLO, {profileUserName}
          </header>

          {isMobileProfileMenuOpen ? (
            <div
              className="flex justify-between p-4"
              style={{
                borderBottom: "1px solid #eeeeee",
                borderTop: "1px solid #eeeeee",
              }}
            >
              <button
                className="body-1 lg:hidden block !text-[#aaaaaa] w-full text-left"
                style={{ letterSpacing: "0.05em" }}
              >
                DASHBOARD
              </button>
              <button
                onClick={() =>
                  setIsMobileProfileMenuOpen &&
                  setIsMobileProfileMenuOpen(false)
                }
                className="body-1"
                style={{ letterSpacing: "0.05em" }}
              >
                CLOSE
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                setIsMobileProfileMenuOpen && setIsMobileProfileMenuOpen(true)
              }
              className="body-1 lg:hidden block w-full text-right pr-4 !text-[#000]"
              style={{
                borderBottom: "1px solid #eeeeee",
                borderTop: "1px solid #eeeeee",
                height: "40px",
                letterSpacing: "0.05em",
              }}
            >
              DASHBOARD
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HomeNavbar;
