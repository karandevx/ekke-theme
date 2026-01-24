// DesignerSearchTab.jsx
import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "../../../helper/utils";

import { BRAND_LISTING } from "../../../queries/brandsQuery";
import styles from "../search-modal.less";
import FyImage from "../../core/fy-image/fy-image";

export default function DesignerSearchTab({
  fpi,
  auth,
  navigate,
  onClose,
  searchTerm: externalSearchTerm,
  setHoveredDesigner,
  hoveredDesigner,
  setIsLoading: setParentLoading,
}) {
  const [designerResults, setDesignerResults] = useState([]);
  const [isLoadingDesigners, setIsLoadingDesigners] = useState(false);

  // Update parent loading state
  useEffect(() => {
    if (setParentLoading) {
      setParentLoading(isLoadingDesigners);
    }
  }, [isLoadingDesigners, setParentLoading]);

  const [recentDesignerSearches, setRecentDesignerSearches] = useState([]);

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  const getOrCreateAnonId = () => {
    if (!isLocalStorageAvailable()) {
      return "anon-fallback";
    }
    try {
      const KEY = "recent_designer_searches__anon_id";
      let id = localStorage.getItem(KEY);
      if (!id) {
        id =
          crypto?.randomUUID?.() ||
          String(Date.now()) + Math.random().toString(16).slice(2);
        try {
          localStorage.setItem(KEY, id);
        } catch (error) {
          // Handle QuotaExceededError or other storage errors
          console.warn("Failed to save anon ID to localStorage:", error);
          return "anon-fallback";
        }
      }
      return id;
    } catch (error) {
      console.warn("Error accessing localStorage for anon ID:", error);
      return "anon-fallback";
    }
  };

  const getUserStorageKey = () => {
    try {
      const userId = auth?.user_id || getOrCreateAnonId();
      return `recent_designer_searches:${userId}`;
    } catch (error) {
      console.warn("Error generating storage key:", error);
      return "recent_designer_searches:fallback";
    }
  };

  const loadRecentDesignerSearches = () => {
    if (!isLocalStorageAvailable()) {
      return [];
    }
    try {
      const storageKey = getUserStorageKey();
      const raw = localStorage.getItem(storageKey);

      // Check if raw is null or empty before parsing
      if (!raw || raw === "null" || raw === "undefined") {
        return [];
      }

      const parsed = JSON.parse(raw);

      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        // If corrupted data, clear it
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        return [];
      }

      // Validate array items have required structure
      const validItems = parsed.filter(
        (item) => item && typeof item === "object" && item.title,
      );

      return validItems;
    } catch (error) {
      console.warn("Error loading recent designer searches:", error);
      // If data is corrupted, try to clear it
      try {
        const storageKey = getUserStorageKey();
        localStorage.removeItem(storageKey);
      } catch {}
      return [];
    }
  };

  const saveRecentSearches = (list) => {
    if (!isLocalStorageAvailable()) {
      return;
    }
    try {
      // Limit list size to prevent storage issues
      const limitedList = Array.isArray(list) ? list.slice(0, 50) : [];
      const storageKey = getUserStorageKey();
      const serialized = JSON.stringify(limitedList);

      // Check size before saving (rough estimate: 5MB limit)
      if (serialized.length > 5000000) {
        console.warn("Recent searches data too large, truncating");
        const truncated = limitedList.slice(0, 10);
        localStorage.setItem(storageKey, JSON.stringify(truncated));
        return;
      }

      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      // Handle QuotaExceededError and other storage errors gracefully
      if (error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, clearing old data");
        try {
          // Try to save a smaller list
          const smallerList = Array.isArray(list) ? list.slice(0, 10) : [];
          const storageKey = getUserStorageKey();
          localStorage.setItem(storageKey, JSON.stringify(smallerList));
        } catch (retryError) {
          console.warn("Failed to save even smaller list:", retryError);
        }
      } else {
        console.warn("Error saving recent designer searches:", error);
      }
    }
  };

  // Accepts either a string or a brand object
  const addRecentDesignerSearch = (brandOrTitle) => {
    if (!brandOrTitle) return;

    let item;

    try {
      if (typeof brandOrTitle === "string") {
        const t = brandOrTitle.trim();
        if (!t) return;
        item = { title: t };
      } else if (brandOrTitle && typeof brandOrTitle === "object") {
        const title =
          brandOrTitle.title || brandOrTitle.name || brandOrTitle.slug || "";
        if (!title) return;
        item = {
          title,
          banner_image: brandOrTitle.banner_image,
          page_url: brandOrTitle.page_url,
        };
      } else {
        return; // Invalid input
      }

      if (!item || !item.title) return;

      setRecentDesignerSearches((prev) => {
        try {
          const next = [
            item,
            ...(Array.isArray(prev) ? prev : []).filter(
              (x) =>
                x &&
                x.title &&
                x.title.toLowerCase() !== item.title.toLowerCase(),
            ),
          ];
          saveRecentSearches(next);
          return next;
        } catch (error) {
          console.warn("Error adding recent designer search:", error);
          return prev; // Return previous state on error
        }
      });
    } catch (error) {
      console.warn("Error processing recent designer search:", error);
    }
  };

  const clearRecentSearches = () => {
    setRecentDesignerSearches([]);
    if (!isLocalStorageAvailable()) {
      return;
    }
    try {
      const storageKey = getUserStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Error clearing recent designer searches:", error);
    }
  };

  // ==== DESIGNER SEARCH GQL/HTTP ====
  const executeDesignerSearch = async (search) => {
    try {
      const url = `https://asia-south1.workflow.boltic.app/265a0728-3561-4da1-9e20-f17611189230?keyword=${encodeURIComponent(
        search,
      )}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data?.data) && data?.data;
    } catch (error) {
      console.error("Designer search error:", error);
      throw error;
    }
  };

  const handleDesignerSearch = async (value) => {
    if (!value.trim()) {
      setDesignerResults([]);
      return;
    }

    setIsLoadingDesigners(true);
    try {
      const results = await executeDesignerSearch(value);

      console.log("Result", results);
      setDesignerResults(results || []);
    } catch (error) {
      console.error("Designer search failed:", error);
    } finally {
      setIsLoadingDesigners(false);
    }
  };

  const debouncedDesignerSearch = useCallback(
    debounce((value) => handleDesignerSearch(value), 300),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Trigger search when external search term changes
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      debouncedDesignerSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDesignerSuggestionClick = async (brand) => {
    console.log("DesingerSuggest click");
    // Store full brand info so recent search has banner + page_url
    addRecentDesignerSearch(brand);
    await handleDesignerSearch(brand.title);
  };

  const handleDesignerNavigation = async (slug) => {
    await navigate(slug);
  };

  const handleRecentDesignerClick = async (item) => {
    const t = item?.title?.trim();
    if (!t) return;

    addRecentDesignerSearch(item); // bump to top
    setHoveredDesigner && setHoveredDesigner(item);
    await handleDesignerSearch(t);
  };

  // Load recent designer searches on mount
  useEffect(() => {
    try {
      const loaded = loadRecentDesignerSearches();
      if (Array.isArray(loaded)) {
        setRecentDesignerSearches(loaded);
      }
    } catch (error) {
      console.warn("Error loading recent designer searches on mount:", error);
      setRecentDesignerSearches([]);
    }
  }, []);

  return (
    <div className={styles.emptyState}>
      {/* Last Designer Searches */}
      {recentDesignerSearches.length > 0 && (
        <div className={styles.suggestionsSection}>
          <div className={styles.suggestionsHeader}>
            LAST SEARCHED
            <button
              type="button"
              onClick={clearRecentSearches}
              className={styles.clearButton}
              style={{
                float: "right",
                fontSize: 12,
                textDecoration: "underline",
                background: "none",
                border: 0,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {recentDesignerSearches.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className={styles.recentItemDesktop}
              onClick={() => handleRecentDesignerClick(item)}
              onMouseEnter={() =>
                setHoveredDesigner && setHoveredDesigner(item)
              }
              onMouseLeave={() =>
                setHoveredDesigner && setHoveredDesigner(null)
              }
            >
              <span className={styles.recentName}>{item.title}</span>
              {hoveredDesigner === item && hoveredDesigner && (
                <>
                  <span className={styles.ekkeDot}></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // don’t trigger handleRecentClick
                      handleDesignerNavigation(item?.page_url);
                      onClose(e);
                    }}
                    className={styles.addToCartButton}
                  >
                    Read More
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {externalSearchTerm && designerResults.length > 0 && (
        <>
          <div className={styles.suggestionsSection}>
            <div className={styles.suggestionsHeader}>DESIGNER RESULTS</div>
            <div className={styles.searchResultDesignerContainer}>
              {/* Desktop list */}
              {designerResults.map((brand, index) => (
                <div
                  key={brand.id || index}
                  className={styles.resultImageContainer}
                  onClick={() => {
                    (onDesignerSuggestionClick(brand),
                      handleDesignerNavigation(brand?.page_url));
                    onClose();
                  }}
                >
                  <FyImage
                    src={brand?.banner_image}
                    aspectRatio={4 / 5}
                    mobileAspectRatio={4 / 5}
                  />
                  <div className={styles.addToCartTag}>
                    <span
                      className={styles.addToCartTagText}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        handleDesignerNavigation(brand?.page_url);
                      }}
                    >
                      Read Designer
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer count */}
          <button
            className={styles.footer}
            // onClick={() => {
            //   const trimmedSearch = externalSearchTerm?.trim();
            //   if (trimmedSearch) {
            //     navigate(`/designers?q=${encodeURIComponent(trimmedSearch)}`);
            //     onClose();
            //   }
            // }}
          >
            <span className={styles.footerText}>SEARCH ALL</span>
          </button>
        </>
      )}

      {/* No results */}
      {externalSearchTerm &&
        designerResults.length === 0 &&
        !isLoadingDesigners && (
          <div className={styles.noResults}>
            <p className={styles.noResultsText}>NO DESIGNERS FOUND</p>
          </div>
        )}
    </div>
  );
}
