// SearchModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useGlobalStore, useFPI } from "fdk-core/utils";
import styles from "./search-modal.less";
import useHeader from "../header/useHeader";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";

import ProductSearchTab from "./product-search/product-search-tab";
import DesignerSearchTab from "./designer-search/designer-search";
import JournalHubTab from "./journalhub-search/journalhub-search";
import FyImage from "../core/fy-image/fy-image";

const TABS = ["PRODUCTS", "DESIGNERS", "JOURNAL HUB"];

export default function SearchModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("PRODUCTS");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredDesigner, setHoveredDesigner] = useState(null);
  const [hoveredArticle, setHoveredArticle] = useState(null);

  // Shared search term across all tabs
  const [searchTerm, setSearchTerm] = useState("");

  const searchInputRef = useRef(null);
  const fpi = useFPI();
  const auth = useGlobalStore(fpi.getters.USER_DATA);
  const navigate = useNavigate();
  const { SearchNavigation = [], SearchNavigationCollection } = useHeader(fpi);
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Clear search term and hover states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHoveredProduct(null);
      setHoveredDesigner(null);
      setHoveredArticle(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search input clear
  const handleSearchClear = () => {
    setSearchTerm("");
  };

  // Handle Enter key press - navigate based on active tab
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmedSearch = searchTerm.trim();
      if (!trimmedSearch) return;

      if (activeTab === "PRODUCTS") {
        // Navigate to products page with search query
        navigate(`/products?q=${encodeURIComponent(trimmedSearch)}`);
        onClose();
      } else if (activeTab === "JOURNAL HUB") {
        // Navigate to blog page with search query
        navigate(`/blog?search=${encodeURIComponent(trimmedSearch)}`);
        onClose();
      }
      // DESIGNERS tab doesn't have a specific navigation route on Enter
    }
  };

  // Track loading states from child components
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isDesignerLoading, setIsDesignerLoading] = useState(false);
  const [isJournalLoading, setIsJournalLoading] = useState(false);

  // Determine which loading state to show
  const isLoading =
    (activeTab === "PRODUCTS" && isProductLoading) ||
    (activeTab === "DESIGNERS" && isDesignerLoading) ||
    (activeTab === "JOURNAL HUB" && isJournalLoading);

  // Escape key + body scroll handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent background scrolling on all devices including mobile
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topPosition = hasAnnouncementBar ? "80px" : "56px";

  const handleOverlayClick = (e) => {
    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      style={{ top: topPosition }}
      onMouseLeave={() => {
        setHoveredProduct(null);
        setHoveredDesigner(null); // 👈 NEW
      }}
      onTouchMove={(e) => {
        // Prevent scroll on overlay background
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        style={{ top: topPosition }}
      >
        {/* Left side - Product Image Preview (only for PRODUCTS tab) */}
        <div className={styles.previewSection}>
          {activeTab === "PRODUCTS" && hoveredProduct && (
            <div
              className={styles.imageContainer}
              onClick={() => {
                navigate(`/product/${hoveredProduct?.slug}`);
                onClose();
              }}
            >
              <FyImage
                src={hoveredProduct.media?.[0]?.url}
                alt={hoveredProduct.name}
                customClass={styles.previewImage}
                aspectRatio={556 / 639}
                mobileAspectRatio={556 / 639}
              />
            </div>
          )}
          {activeTab === "DESIGNERS" && hoveredDesigner && (
            <div
              className={styles.imageContainer}
              onClick={() => {
                // adjust route/slug as per your brand page
                const slug = hoveredDesigner.slug || hoveredDesigner.uid;
                if (slug) {
                  navigate(`/brand/${slug}`);
                  onClose();
                }
              }}
            >
              <FyImage
                src={hoveredDesigner.banner_image || "/api/placeholder/400/500"}
                alt={
                  hoveredDesigner.title || hoveredDesigner.name || "Designer"
                }
                customClass={styles.previewImage}
                aspectRatio={556 / 639}
                mobileAspectRatio={556 / 639}
              />
            </div>
          )}
          {activeTab === "JOURNAL HUB" && hoveredArticle && (
            <div
              className={styles.imageContainer}
              onClick={() => {
                const slug = hoveredArticle.slug || hoveredArticle.uid;
                if (slug) {
                  // Extract slug from full URL if needed
                  let slugPath = slug;
                  if (slug.includes("/blog/")) {
                    slugPath = slug.split("/blog/")[1];
                  } else if (slug.includes("test-zion.fynd.io/blog/")) {
                    slugPath = slug.replace(
                      "https://test-zion.fynd.io/blog/",
                      ""
                    );
                  }
                  navigate(`/blog/${slugPath}`);
                  onClose();
                }
              }}
            >
              <FyImage
                src={
                  hoveredArticle.hero_banner ||
                  hoveredArticle.feature_image?.secure_url ||
                  hoveredArticle.cover_image?.url ||
                  hoveredArticle.media?.[0]?.url ||
                  "/api/placeholder/400/500"
                }
                alt={hoveredArticle.title || hoveredArticle.name || "Journal"}
                customClass={styles.previewImage}
                aspectRatio={556 / 639}
                mobileAspectRatio={556 / 639}
              />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className={styles.contentSection}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <button onClick={onClose} className={styles.closeButton}>
                CLOSE
              </button>
            </div>

            {/* Tabs */}
            <div
              className={styles.filterTabs}
              role="tablist"
              aria-label="Search categories"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`${styles.filterTab} ${
                    activeTab === tab ? styles.activeTab : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Department tabs - only for PRODUCTS */}
            {SearchNavigation.length !== 0 && activeTab === "PRODUCTS" && (
              <div className="flex py-4 px-6 justify-start items-center gap-14">
                {SearchNavigation.slice(0, 3).map((navItem, index) => {
                  const isExternal = navItem?.action?.page?.type === "external";
                  const actionUrl = convertActionToUrl(navItem?.action);

                  return isExternal ? (
                    <a
                      key={index}
                      href={navItem?.action?.page?.query?.url?.[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.departmentTab}
                      onClick={() => onClose()}
                    >
                      {navItem?.display?.toUpperCase()}
                    </a>
                  ) : actionUrl && actionUrl.length > 0 ? (
                    <FDKLink
                      key={index}
                      action={navItem?.action}
                      className={styles.departmentTab}
                      onClick={() => onClose()}
                    >
                      {navItem?.display?.toUpperCase()}
                    </FDKLink>
                  ) : (
                    <button className={styles.departmentTab} key={index}>
                      {navItem?.display?.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Common Search Input */}
            <div className={styles.searchContainer}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeTab === "PRODUCTS"
                    ? "SEARCH"
                    : activeTab === "DESIGNERS"
                      ? "SEARCH"
                      : "SEARCH"
                }
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleSearchClear}
                >
                  DELETE
                </button>
              )}
              {isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.resultsContainer}>
            {activeTab === "PRODUCTS" && (
              <ProductSearchTab
                fpi={fpi}
                auth={auth}
                navigate={navigate}
                onClose={onClose}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                focusSearchInput={() => searchInputRef.current?.focus()}
                hoveredProduct={hoveredProduct}
                setHoveredProduct={setHoveredProduct}
                setIsLoading={setIsProductLoading}
                SearchNavigationCollection={SearchNavigationCollection}
              />
            )}

            {activeTab === "DESIGNERS" && (
              <DesignerSearchTab
                fpi={fpi}
                auth={auth}
                navigate={navigate}
                onClose={onClose}
                searchTerm={searchTerm}
                setHoveredDesigner={setHoveredDesigner}
                hoveredDesigner={hoveredDesigner}
                setIsLoading={setIsDesignerLoading}
              />
            )}

            {activeTab === "JOURNAL HUB" && (
              <JournalHubTab
                fpi={fpi}
                auth={auth}
                navigate={navigate}
                onClose={onClose}
                searchTerm={searchTerm}
                hoveredArticle={hoveredArticle}
                setHoveredArticle={setHoveredArticle}
                setIsLoading={setIsJournalLoading}
              />
            )}
          </div>

          {/* {SearchNavigationCollection.length > 0 && !searchTerm && (
            <div className={styles.collectionNavigation}>
              {SearchNavigationCollection[0].sub_navigation.map(
                (collect, idx) => (
                  <div
                    key={collect?.action?.page?.url || `collect-${idx}`}
                    className={styles.resultImageContainer}
                    onClick={() => {
                      navigate(`/${collect.action?.page?.url}`);
                      onClose();
                    }}
                  >
                    <FyImage
                      src={collect?.image}
                      aspectRatio={4 / 5}
                      mobileAspectRatio={4 / 5}
                    />
                    <div className={styles.addToCartTag}>
                      <FDKLink
                        className={styles.addToCartTagText}
                        to={`${collect.action?.page?.url}`}
                      >
                        Read More
                      </FDKLink>
                    </div>
                  </div>
                )
              )}
            </div>
          )} */}
          {SearchNavigationCollection.length > 0 && !searchTerm && (
            <div className={styles.collectionNavigation}>
              {SearchNavigationCollection[0].sub_navigation
                .filter((collect) => collect.active)
                .map((collect, idx) => {
                  const isExternal = collect?.action?.page?.type === "external";

                  console.log("collect", collect);

                  return (
                    <div
                      key={collect?.action?.page?.url || `collect-${idx}`}
                      className={styles.resultImageContainer}
                    >
                      <FyImage
                        src={collect?.image}
                        aspectRatio={4 / 5}
                        mobileAspectRatio={4 / 5}
                      />

                      <div className={styles.addToCartTag}>
                        {isExternal ? (
                          <a
                            href={collect?.action?.page?.query?.url?.[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.addToCartTagText}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                          >
                            {collect?.display || "Read More"}
                          </a>
                        ) : (
                          <FDKLink
                            action={collect?.action}
                            className={styles.addToCartTagText}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                          >
                            {collect?.display || "Read More"}
                          </FDKLink>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
