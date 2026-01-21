import React, { useState, useEffect, useRef, useCallback } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../../styles/product-listing.less";
import Sort from "../../page-layouts/plp/Components/sort/sort";
import FilterItem from "../../page-layouts/plp/Components/filter-item/filter-item";
import StickyColumn from "../../page-layouts/plp/Components/sticky-column/sticky-column";
import Pagination from "../../page-layouts/plp/Components/pagination/pagination";
import SortModal from "../sort-modal/sort-modal";
import FilterModal from "../filter-modal/filter-modal";
import EmptyState from "../../components/empty-state/empty-state";
import PageNotFound from "../../components/page-not-found/page-not-found";
import FyImage from "../../components/core/fy-image/fy-image";
import { isRunningOnClient } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import InfiniteLoader from "../core/infinite-loader/infinite-loader";
import Breadcrumb from "../breadcrumb/breadcrumb";
import { useNavigate } from "fdk-core/utils";
import { useSearchParams, useLocation } from "react-router-dom";
import ProductGrid from "./product-grid/product-grid.jsx";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar.jsx";

const ProductListing = ({
  breadcrumb = [],
  bannerTitle,
  bannerDescription,
  filterList = [],
  sortList = [],
  sortModalProps = {},
  filterModalProps = {},
  loadingOption = "pagination",
  paginationProps = {},
  isProductLoading = false,
  isPageLoading = false,
  productList = [],
  columnCount,
  isProductOpenInNewTab = false,
  isBrand = true,
  isSaleBadge = true,
  isPrice = true,
  imgSrcSet,
  isImageFill = false,
  showImageOnHover = false,
  isResetFilterDisable = false,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  aspectRatio,
  isWishlistIcon,
  WishlistIconComponent,
  followedIdList = [],
  listingPrice = "range",
  banner = {},
  showAddToCart = false,
  actionButtonText,
  stickyFilterTopOffset = 0,
  hasFiltersApplied = false,
  onColumnCountUpdate = () => {},
  onFilterUpdate = () => {},
  onSortUpdate = () => {},
  onFilterModalBtnClick = () => {},
  onWishlistClick = () => {},
  onViewMoreClick = () => {},
  onLoadMoreProducts = () => {},
  onProductNavigation = () => {},
  handleAddToCart = () => {},
  EmptyStateComponent,
}) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Check if there's a search query in the URL
  const hasSearchQuery =
    searchParams.get("q") !== null && searchParams.get("q") !== "";

  // State to track if filter modal is open
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Refs to track scroll restoration state
  const scrollRestoredRef = useRef(false);
  const previousLocationKeyRef = useRef(location.key);
  const scrollSaveTimeoutRef = useRef(null);
  const scrollRestoreTimeRef = useRef(0);
  const preventScrollToTopRef = useRef(false);

  // State for smooth scroll restoration transition
  const [isRestoringScroll, setIsRestoringScroll] = useState(() => {
    // Check on initial mount if we need to restore scroll
    if (typeof window === "undefined") return false;
    const savedUrl = sessionStorage.getItem("plp:url");
    const currentUrl = window.location.pathname + window.location.search;
    const cameFromPDP = sessionStorage.getItem("plp:fromPDP") === "true";
    const savedScroll = sessionStorage.getItem("plp:scroll");
    // If we're returning from PDP and have a scroll position to restore, start hidden
    return cameFromPDP && savedUrl === currentUrl && savedScroll && Number(savedScroll) > 100;
  });

  // // Safety timeout to ensure content becomes visible even if scroll restore fails
  // useEffect(() => {
  //   if (!isRestoringScroll) return;
  //   const safetyTimeout = setTimeout(() => {
  //     setIsRestoringScroll(false);
  //   }, 500); // Max 500ms hidden
  //   return () => clearTimeout(safetyTimeout);
  // }, [isRestoringScroll]);

  // Save scroll position when filter modal opens/closes
  const saveCurrentScrollPosition = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear any existing timeout
    if (scrollSaveTimeoutRef.current) {
      clearTimeout(scrollSaveTimeoutRef.current);
    }

    // Debounce scroll save to avoid too many writes
    scrollSaveTimeoutRef.current = setTimeout(() => {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("plp:scroll", String(window.scrollY || 0));
      sessionStorage.setItem("plp:url", currentUrl);
      sessionStorage.setItem("plp:locationKey", location.key || "");
    }, 100);
  }, [location.key]);

  // Uncomment and update the useEffect for body scroll lock
  useEffect(() => {
    if (isFilterModalOpen) {
      // Save scroll position before opening modal
      saveCurrentScrollPosition();

      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden"; // prevent scroll
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        const savedScroll = parseInt(scrollY.replace("-", "") || "0");
        // Restore scroll position after closing modal
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScroll);
          saveCurrentScrollPosition();
        });
      }
    }

    // Cleanup only when component unmounts
    return () => {
      if (scrollSaveTimeoutRef.current) {
        clearTimeout(scrollSaveTimeoutRef.current);
      }
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isFilterModalOpen]);

  const handleFilterButtonClick = () => {
    if (isFilterModalOpen) {
      // Close the modal
      setIsFilterModalOpen(false);
    } else {
      // Open the modal
      setIsFilterModalOpen(true);
      onFilterModalBtnClick();
    }
  };

  // Handle modal close
  const handleFilterModalClose = () => {
    setIsFilterModalOpen(false);
  };

  // Close filter modal when filters are applied and products are loaded
  // Only close in desktop, not in mobile (mobile should stay open for multiple selections)
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    if (!isProductLoading && hasFiltersApplied && !isMobile) {
      setIsFilterModalOpen(false);
    }
  }, [isProductLoading, hasFiltersApplied]);

  // Clear fromPDP flag when filters are applied (new search/filter, not returning from PDP)
  useEffect(() => {
    if (hasFiltersApplied && !isProductLoading) {
      // Small delay to ensure this runs after scroll restore
      const timeout = setTimeout(() => {
        // Only clear if we're not in the middle of a scroll restore
        if (!scrollRestoredRef.current) {
          sessionStorage.removeItem("plp:fromPDP");
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasFiltersApplied, isProductLoading]);

  // Save scroll position on scroll (debounced) and prevent unwanted scroll-to-top
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPageLoading) return;

    let scrollTimeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Prevent scroll-to-top if we just restored scroll (within 3 seconds)
      if (
        preventScrollToTopRef.current &&
        currentScrollY === 0 &&
        lastScrollY > 100
      ) {
        // Someone tried to scroll to top, restore the saved position
        const savedScroll = sessionStorage.getItem("plp:scroll");
        if (savedScroll) {
          const y = Number(savedScroll);
          if (!Number.isNaN(y) && y > 0) {
            requestAnimationFrame(() => {
              window.scrollTo({
                top: y,
                behavior: "instant",
              });
            });
          }
        }
        return;
      }

      lastScrollY = currentScrollY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveCurrentScrollPosition();
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [
    isPageLoading,
    location.pathname,
    location.search,
    saveCurrentScrollPosition,
  ]);

  // Restore scroll position when returning from PDP
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset scroll restored flag when location changes
    if (previousLocationKeyRef.current !== location.key) {
      scrollRestoredRef.current = false;
      previousLocationKeyRef.current = location.key;
    }

    // Only attempt restore when PLP is actually showing products
    if (isPageLoading) return;
    if (!productList || productList.length === 0) return;

    // Don't restore if already restored for this location
    if (scrollRestoredRef.current) return;

    const savedUrl = sessionStorage.getItem("plp:url");
    const currentUrl = window.location.pathname + window.location.search;
    const savedLocationKey = sessionStorage.getItem("plp:locationKey");

    // Check if we came from PDP by checking if previous page was a product page
    const cameFromPDP = sessionStorage.getItem("plp:fromPDP") === "true";

    // Only restore if:
    // 1. URL matches AND
    // 2. We came from PDP (not a fresh page load or filter change)
    if (!savedUrl || savedUrl !== currentUrl) {
      // Clear the fromPDP flag if URL doesn't match (new page/filter)
      sessionStorage.removeItem("plp:fromPDP");
      return;
    }

    // If location key changed significantly, might be a new navigation
    // But still restore if we have saved scroll and came from PDP
    if (!cameFromPDP && savedLocationKey && savedLocationKey !== location.key) {
      // Not from PDP, don't restore
      return;
    }

    const savedScroll = sessionStorage.getItem("plp:scroll");
    if (!savedScroll) return;

    const y = Number(savedScroll);
    if (Number.isNaN(y) || y < 0) return;

    // Mark as restored to prevent multiple restores
    scrollRestoredRef.current = true;
    scrollRestoreTimeRef.current = Date.now();
    preventScrollToTopRef.current = true;

    // Wait for DOM to be fully rendered, then restore scroll position
    // Use multiple delays to ensure layout is complete
    const restoreScroll = () => {
      // Double check we haven't been scrolled elsewhere
      const currentScroll = window.scrollY;
      if (Math.abs(currentScroll - y) > 50) {
        // Only restore if we're not already close to the saved position
        window.scrollTo({
          top: y,
          behavior: "instant", // Use instant for immediate restore
        });
      }

      // Clear the fromPDP flag after restoration
      sessionStorage.removeItem("plp:fromPDP");
    };

    // Use multiple animation frames and timeouts to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          restoreScroll();
          // Additional restore after a short delay to catch any late layout changes
          setTimeout(() => {
            restoreScroll();
            // Fade in the content smoothly after scroll is restored
            setTimeout(() => {
              setIsRestoringScroll(false);
            }, 50);
            // Keep prevent scroll to top active for 3 seconds after restore
            setTimeout(() => {
              preventScrollToTopRef.current = false;
            }, 3000);
          }, 100);
        }, 50);
      });
    });
  }, [
    isPageLoading,
    productList?.length,
    location.pathname,
    location.search,
    location.key,
  ]);

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "80px" : "56px";

  // Refs for height synchronization
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);
  const plpContainerRef = useRef(null);

  // Sync left container height with right container
  useEffect(() => {
    if (
      !isRunningOnClient() ||
      !leftContainerRef.current ||
      !rightContainerRef.current
    ) {
      return;
    }

    const leftContainer = leftContainerRef.current;
    const rightContainer = rightContainerRef.current;
    const plpContainer = plpContainerRef.current;

    const updateLeftHeight = () => {
      if (rightContainer && leftContainer && plpContainer) {
        const viewportHeight = window.innerHeight;
        // const headerOffset = hasAnnouncementBar ? 80 : 56;
        const availableHeight = viewportHeight;

        // Get the right container height (includes banner, header, product grid, etc.)
        const rightHeight = rightContainer.offsetHeight;

        let targetHeight = availableHeight;

        // Calculate number of product rows to determine if we should use default height
        if (productList?.length > 0 && columnCount?.desktop) {
          const desktopCols = columnCount.desktop;
          const productCount = productList.length;
          const numberOfRows = Math.ceil(productCount / desktopCols);

          // If products have 1 row, use default height
          if (numberOfRows === 1) {
            // For 1 row, use a default height that ensures good UX
            // Estimate based on single product row height (approximately 500-600px)
            // Plus spacing for header/banner in right container
            const estimatedSingleRowHeight = 600;
            targetHeight = Math.min(estimatedSingleRowHeight, availableHeight);
          } else {
            // For multiple rows, match the right container height
            // This ensures left sidebar adapts to the actual grid height
            targetHeight = Math.min(rightHeight, availableHeight);
          }
        } else {
          // Fallback: use right container height
          targetHeight = Math.min(rightHeight, availableHeight);
        }

        // Ensure minimum height for usability
        const minHeight = 400;
        targetHeight = Math.max(targetHeight, minHeight);

        // Only update if the height has changed significantly (avoid unnecessary reflows)
        const currentHeight = parseInt(leftContainer.style.height) || 0;
        if (Math.abs(currentHeight - targetHeight) > 1) {
          leftContainer.style.height = `${targetHeight}px`;
          leftContainer.style.maxHeight = `${targetHeight}px`;
        }
      }
    };

    // Initial update with a slight delay to ensure DOM is ready
    const initialTimeout = setTimeout(updateLeftHeight, 100);

    // Use ResizeObserver to watch for changes in right container and plp container height
    // This will fire when grid changes (2/4/8 columns) or products load
    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce the update but ensure it happens
      clearTimeout(initialTimeout);
      requestAnimationFrame(() => {
        updateLeftHeight();
      });
    });

    resizeObserver.observe(rightContainer);
    if (plpContainer) {
      resizeObserver.observe(plpContainer);
    }

    // Also update on window resize
    const handleResize = () => {
      clearTimeout(initialTimeout);
      requestAnimationFrame(() => {
        updateLeftHeight();
      });
    };
    window.addEventListener("resize", handleResize);

    // Update when products change or grid changes - use longer delay for grid changes
    const updateTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        updateLeftHeight();
      });
    }, 300);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(updateTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    productList?.length,
    isProductLoading,
    isPageLoading,
    hasAnnouncementBar,
    columnCount?.desktop,
  ]);

  return (
    <div 
      className={styles.plpWrapper}
      style={{
        opacity: isRestoringScroll ? 0 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {isRunningOnClient() && isPageLoading ? (
        <div className={styles.loader}></div>
      ) : productList?.length === 0 && !(isPageLoading || isPageLoading) ? (
        <div>
          {EmptyStateComponent ? (
            EmptyStateComponent
          ) : (
            <PageNotFound
              title=""
              subtitle="No results. Search again"
              showResultsNotFoundBanner={hasSearchQuery}
            />
          )}
        </div>
      ) : (
        <>
          <div className={styles.breadcrumbWrapper}>
            <Breadcrumb breadcrumb={breadcrumb} />
            <div className={styles.bannerContent}>
              {bannerTitle.length > 0 && (
                <h3 className={styles.bannerTitle}>{bannerTitle}</h3>
              )}
              {bannerDescription.length > 0 && (
                <p className={styles.bannerDescription}>
                  <span className={styles.bannerLineClamp}>
                    {bannerDescription}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className={styles.contentWrapper}>
            {filterList?.length !== 0 && (
              <div className={styles.left} ref={leftContainerRef}>
                {filterList.slice(0, 4)?.map((filter, idx) => (
                  <FilterItem
                    isMobileView={false}
                    key={idx + "-desktop" + filter.key.display}
                    filter={filter}
                    allFilters={filterList}
                    onFilterUpdate={onFilterUpdate}
                  />
                ))}
              </div>
            )}
            <div className={styles.right} ref={rightContainerRef}>
              <div className={styles.rightHeader} style={{ top: topPosition }}>
                <div className={styles.headerRight}>
                  <div className={styles.sortAndPaginationContainer}>
                    {loadingOption === "pagination" && (
                      <div className={styles.inlinePaginationWrapper}>
                        <Pagination
                          {...paginationProps}
                          columnCount={columnCount}
                          onColumnCountUpdate={onColumnCountUpdate}
                          handleFilterButtonClick={handleFilterButtonClick}
                          sortList={sortList}
                          onSortUpdate={onSortUpdate}
                          onFilterUpdate={onFilterUpdate}
                          filterList={filterList}
                          isFilterModalOpen={isFilterModalOpen}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Show hero/banner - always visible, especially when filters are applied */}
              {banner?.desktopBanner && (
                <div
                  className={`${styles.bannerContainer} ${styles.desktopBanner}`}
                >
                  <FDKLink
                    className={styles.redirectionLink}
                    to={banner?.redirectLink}
                  >
                    <FyImage
                      alt={t("resource.product.desktop_banner_alt")}
                      src={banner?.desktopBanner}
                      customClass={styles.banner}
                      isFixedAspectRatio={false}
                      aspectRatio="auto"
                      defer={false}
                    />
                  </FDKLink>
                </div>
              )}
              {banner?.mobileBanner && (
                <div
                  className={`${styles.bannerContainer} ${styles.mobileBanner}`}
                >
                  <FDKLink
                    className={styles.redirectionLink}
                    to={banner?.redirectLink}
                  >
                    <FyImage
                      alt={t("resource.product.mobile_banner")}
                      src={banner?.mobileBanner}
                      customClass={styles.banner}
                      isFixedAspectRatio={false}
                      aspectRatio="auto"
                      defer={false}
                    />
                  </FDKLink>
                </div>
              )}
              <div className={styles["plp-container"]} ref={plpContainerRef}>
                {loadingOption === "infinite" ? (
                  <InfiniteLoader
                    hasNext={paginationProps.hasNext}
                    isLoading={isProductLoading}
                    loadMore={onLoadMoreProducts}
                  >
                    <ProductGrid
                      {...{
                        isProductOpenInNewTab,
                        productList,
                        columnCount,
                        isBrand,
                        isSaleBadge,
                        isPrice,
                        aspectRatio,
                        isWishlistIcon,
                        WishlistIconComponent,
                        followedIdList,
                        listingPrice,
                        showAddToCart,
                        actionButtonText:
                          actionButtonText ?? t("resource.common.add_to_cart"),
                        onWishlistClick,
                        isImageFill,
                        showImageOnHover,
                        imageBackgroundColor,
                        imagePlaceholder,
                        handleAddToCart,
                        imgSrcSet,
                        onProductNavigation,
                      }}
                    />
                  </InfiniteLoader>
                ) : (
                  <ProductGrid
                    {...{
                      isProductOpenInNewTab,
                      productList,
                      columnCount,
                      isBrand,
                      isSaleBadge,
                      isPrice,
                      aspectRatio,
                      isWishlistIcon,
                      WishlistIconComponent,
                      followedIdList,
                      listingPrice,
                      showAddToCart,
                      actionButtonText:
                        actionButtonText ?? t("resource.common.add_to_cart"),
                      onWishlistClick,
                      isImageFill,
                      showImageOnHover,
                      imageBackgroundColor,
                      isProductLoading,
                      imagePlaceholder,
                      handleAddToCart,
                      imgSrcSet,
                      onProductNavigation,
                    }}
                  />
                )}

                {loadingOption === "view_more" && paginationProps.hasNext && (
                  <div className={styles.viewMoreWrapper}>
                    <button
                      className={styles.viewMoreBtn}
                      onClick={onViewMoreClick}
                      tabIndex="0"
                      disabled={isProductLoading}
                    >
                      {t("resource.facets.view_more")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <SortModal {...sortModalProps} />
          <FilterModal
            {...{
              isResetFilterDisable,
              ...filterModalProps,
              isOpen: isFilterModalOpen,
              onCloseModalClick: handleFilterModalClose,
            }}
          />
          {/* {isScrollTop && <ScrollTop />} */}
        </>
      )}
    </div>
  );
};

export default ProductListing;
