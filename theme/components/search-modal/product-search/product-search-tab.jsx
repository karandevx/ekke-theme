// ProductSearchTab.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "../../../helper/utils";
import { FDKLink } from "fdk-core/components";
import { PRODUCTS_SEARCH } from "../../../queries/productQuery";
import { PLP_ADD_TO_CART } from "../../../queries/plpQuery";
import { PRODUCT_SIZE_PRICE } from "../../../queries/pdpQuery";
import { useToast } from "../../custom-toaster";
import SvgWrapper from "../../core/svgWrapper/SvgWrapper";
import useCategories from "../../../page-layouts/categories/useCategories";
import styles from "../search-modal.less";
import FyImage from "../../core/fy-image/fy-image";

export default function ProductSearchTab({
  fpi,
  auth,
  navigate,
  onClose,
  searchTerm: externalSearchTerm,
  setSearchTerm,
  focusSearchInput,
  hoveredProduct,
  setHoveredProduct,
  setIsLoading: setParentLoading,
}) {
  // PRODUCT tab state
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update parent loading state
  useEffect(() => {
    if (setParentLoading) {
      setParentLoading(isLoading);
    }
  }, [isLoading, setParentLoading]);

  // recent searches
  const [recentSearches, setRecentSearches] = useState([]);

  const toast = useToast();
  const [hoveredRecentTerm, setHoveredRecentTerm] = useState(null);
  
  // Ref to track the currently hovered term for race condition handling
  const hoveredTermRef = useRef(null);

  // ==== RECENT SEARCHES ====
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
      const KEY = "recent_searches__anon_id";
      let id = localStorage.getItem(KEY);
      if (!id) {
        id =
          crypto?.randomUUID?.() ||
          String(Date.now()) + Math.random().toString(16).slice(2);
        try {
          localStorage.setItem(KEY, id);
        } catch (error) {
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
      return `recent_product_searches:${userId}`;
    } catch (error) {
      console.warn("Error generating storage key:", error);
      return "recent_product_searches:fallback";
    }
  };

  const loadRecentSearches = () => {
    if (!isLocalStorageAvailable()) {
      return [];
    }
    try {
      const storageKey = getUserStorageKey();
      const raw = localStorage.getItem(storageKey);
      if (!raw || raw === "null" || raw === "undefined") {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        // If corrupted data, clear it
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        return [];
      }
      // Filter out objects and only keep strings (product search stores strings, not objects)
      // This handles cases where designer/journal search might have stored objects in the same key
      const validStrings = parsed.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      );
      return validStrings;
    } catch (error) {
      console.warn("Error loading recent searches:", error);
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
      // Ensure we only save strings
      const validList = Array.isArray(list)
        ? list.filter(
            (item) => typeof item === "string" && item.trim().length > 0
          )
        : [];
      // Limit to 50 items to prevent storage issues
      const limitedList = validList.slice(0, 50);
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
          const smallerList = Array.isArray(list)
            ? list
                .filter(
                  (item) => typeof item === "string" && item.trim().length > 0
                )
                .slice(0, 10)
            : [];
          const storageKey = getUserStorageKey();
          localStorage.setItem(storageKey, JSON.stringify(smallerList));
        } catch (retryError) {
          console.warn("Failed to save even smaller list:", retryError);
        }
      } else {
        console.warn("Error saving recent searches:", error);
      }
    }
  };

  const addRecentSearch = (term) => {
    if (!term) return;
    // Ensure we only add strings, not objects
    const t =
      typeof term === "string"
        ? term.trim()
        : (term?.name || term?.title || "").trim();
    if (!t) return;
    setRecentSearches((prev) => {
      // Ensure prev is an array of strings
      const validPrev = Array.isArray(prev)
        ? prev.filter((x) => typeof x === "string" && x.trim().length > 0)
        : [];
      const next = [
        t,
        ...validPrev.filter((x) => x.toLowerCase() !== t.toLowerCase()),
      ];
      saveRecentSearches(next);
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (!isLocalStorageAvailable()) {
      return;
    }
    try {
      const storageKey = getUserStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Error clearing recent searches:", error);
    }
  };

  // ==== GQL HELPERS ====
  const executeSearch = async (search) => {
    try {
      const payload = {
        search,
        enableFilter: true,
        filterQuery: "",
        pageType: "number",
        first: 8,
      };
      const response = await fpi.executeGQL(PRODUCTS_SEARCH, payload);
      const data = response?.data?.products?.items;
      return data || [];
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await executeSearch(value);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => handleSearch(value), 300),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Trigger search when external search term changes
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      debouncedSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSuggestionClick = async (name) => {
    addRecentSearch(name);
    await handleSearch(name);
  };

  // Preview first product for recent search
  const previewRecentSearch = async (term) => {
    const t = term?.trim();
    if (!t) return;

    try {
      const items = await executeSearch(t);
      // Only update hoveredProduct if the term is still the one being hovered
      // This prevents race conditions where mouse leaves before API completes
      if (hoveredTermRef.current === t) {
        if (Array.isArray(items) && items[0]) {
          setHoveredProduct(items[0]);
        } else {
          setHoveredProduct(null);
        }
      }
    } catch (e) {
      console.error("Preview recent search failed:", e);
      // Only clear if still hovering the same term
      if (hoveredTermRef.current === t) {
        setHoveredProduct(null);
      }
    }
  };

  // Click recent search → populate search input field
  const handleRecentClick = async (term) => {
    const t = term?.trim();
    if (!t) return;

    // Update the parent search input field
    if (setSearchTerm) {
      setSearchTerm(t);
    }
    
    // Focus the search input
    if (focusSearchInput) {
      focusSearchInput();
    }
    
    // Trigger search by updating search results
    try {
      const items = await executeSearch(t);
      setSearchResults(items);
      addRecentSearch(t);
    } catch (e) {
      console.error("Recent search click failed:", e);
    }
  };

  // ==== ADD TO CART ====
  const handleAddToCart = async (product) => {
    console.log("Adding to cart:", product);
    if (!product?.sizes?.[0]) {
      return;
    }

    if (!product?.sellable) {
      toast.error("We do not have enough pieces at the moment.");
    }

    let sellerId, storeId;

    if (!product?.seller?.uid || !product?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: product?.slug,
          size: product?.sizes?.[0],
          pincode: "",
        });

        const freshProductPriceData = productPriceResponse?.data?.productPrice;

        if (
          !freshProductPriceData?.seller?.uid ||
          !freshProductPriceData?.store?.uid
        ) {
          if (typeof Sentry !== "undefined") {
            Sentry.captureException(
              "PLP page exception. " + product?.item_code
            );
          }
          toast.error("Unable to add product to cart. Please try again later.");
          return;
        }

        sellerId = freshProductPriceData.seller.uid;
        storeId = freshProductPriceData.store.uid;
      } catch (error) {
        toast.error("Unable to fetch product price. Please try again later.");
        return;
      }
    } else {
      sellerId = product.seller.uid;
      storeId = product.store.uid;
    }

    const payload = {
      addCartRequestInput: {
        items: [
          {
            item_id: product?.uid,
            item_size: product?.sizes?.[0],
            quantity: 1,
            seller_id: sellerId,
            store_id: storeId,
          },
        ],
      },
      buyNow: false,
    };

    try {
      const { data } = await fpi.executeGQL(PLP_ADD_TO_CART, payload);

      if (data?.addItemsToCart?.success) {
        toast.success(
          "Product added successfully" || data?.addItemsToCart?.message,
          "success"
        );
        setTimeout(() => {
          fpi.custom.setValue("isCartDrawerOpen", true);
        }, 200);

        if (typeof fireCustomGtmEvent === "function") {
          fireCustomGtmEvent("cart.customAdd", {
            responseData: data?.addItemsToCart?.cart,
            productDetails: product,
          });
        }
      } else {
        throw new Error(
          data?.addItemsToCart?.message || "Failed to add product to cart"
        );
      }
    } catch (error) {
      console.error("Failed to add product to cart", error);
    }
  };

  // Initial load recent searches
  useEffect(() => {
    try {
      const loaded = loadRecentSearches();
      if (Array.isArray(loaded)) {
        // Ensure all items are strings
        const validSearches = loaded.filter(
          (item) => typeof item === "string" && item.trim().length > 0
        );
        setRecentSearches(validSearches);
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.warn("Error loading recent searches on mount:", error);
      setRecentSearches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user_id]);

  const redirectToProduct = (link) => {
    navigate(link);
    onClose();
  };

  const getImageUrl = (result) => {
    return;
  };

  return (
    <>
      {/* Last Searches */}
      {recentSearches.length > 0 && (
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

          {recentSearches
            .filter(
              (term) => typeof term === "string" && term.trim().length > 0
            )
            .map((term, idx) => {
              const termString = typeof term === "string" ? term.trim() : "";
              if (!termString) return null;

              return (
                <div
                  key={`${termString}-${idx}`}
                  className={styles.recentItemDesktop}
                  onMouseEnter={() => {
                    hoveredTermRef.current = termString; // Track the hovered term
                    setHoveredRecentTerm(termString);
                    previewRecentSearch(termString); // this sets hoveredProduct to first product
                  }}
                  onMouseLeave={() => {
                    hoveredTermRef.current = null; // Clear the ref to prevent stale updates
                    setHoveredProduct && setHoveredProduct(null);
                    setHoveredRecentTerm && setHoveredRecentTerm(null);
                  }}
                  onClick={() => handleRecentClick(termString)} // navigate to first product
                >
                  <span className={styles.recentName}>{termString}</span>

                  {hoveredRecentTerm === termString && hoveredProduct && (
                    <>
                      <span className={styles.ekkeDot}></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // don't trigger handleRecentClick
                          handleAddToCart(hoveredProduct); // use actual product object
                          onClose(e);
                        }}
                        className={styles.addToCartButton}
                      >
                        Add to Cart
                      </button>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Suggestions */}
      {externalSearchTerm && searchResults.length > 0 && (
        <div className={styles.suggestionsSection}>
          <div className={styles.suggestionsHeader}>EKKE SUGGESTIONS</div>
          <div className={styles.searchResultContainer}>
            {searchResults.map((result, index) => (
              <div
                key={result.uid || index}
                className={styles.resultImageContainer}
                // onMouseEnter={() => setHoveredProduct(result)}
                onClick={() => {
                  navigate(`/product/${result.slug}`);
                  onSuggestionClick(result.name);
                  handleRecentClick(result);
                  onClose();
                }}
              >
                <FyImage
                  src={result?.media?.[0]?.url}
                  aspectRatio={4 / 5}
                  mobileAspectRatio={4 / 5}
                />
                <div className={styles.addToCartTag}>
                  <span
                    className={styles.addToCartTagText}
                    onClick={() => {
                      handleAddToCart(result);
                      onClose();
                    }}
                  >
                    ADD TO CART
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile grid */}
          <div className={styles.mobileGrid}>
            {searchResults.map((result, index) => (
              <div
                key={result.uid || index}
                className={styles.mobileResultItem}
              >
                <span
                  onClick={() => {
                    navigate(`/product/${result.slug}`);
                    onSuggestionClick(result.name);
                    onClose();
                  }}
                >
                  <FyImage
                    src={result?.media?.[0]?.url}
                    aspectRatio={4 / 5}
                    mobileAspectRatio={4 / 5}
                  />
                </span>

                <button
                  onClick={() => {
                    handleAddToCart(result);
                    onClose();
                  }}
                  className={styles.mobileAddButton}
                >
                  <SvgWrapper svgSrc="plusblack" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {externalSearchTerm && searchResults.length === 0 && !isLoading && (
        <div className={styles.noResults}>
          <p className={styles.noResultsText}>No results. Search again</p>
        </div>
      )}

      {/* Footer count */}
      {externalSearchTerm && searchResults.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerText}>SEARCH ALL</div>
        </div>
      )}
    </>
  );
}
