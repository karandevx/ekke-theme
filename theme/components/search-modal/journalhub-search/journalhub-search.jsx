// JournalHubTab.jsx
import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "../../../helper/utils";
import styles from "../search-modal.less";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import FyImage from "../../core/fy-image/fy-image";

export default function JournalHubTab({
  fpi: fpiProp, // optional, if you already pass fpi from parent
  auth,
  navigate,
  onClose,
  searchTerm: externalSearchTerm,
  hoveredArticle,
  setHoveredArticle,
  setIsLoading: setParentLoading,
}) {
  const fpi = fpiProp || useFPI();
  const [journalResults, setJournalResults] = useState([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);

  // Update parent loading state
  useEffect(() => {
    if (setParentLoading) {
      setParentLoading(isLoadingJournal);
    }
  }, [isLoadingJournal, setParentLoading]);

  // ==== RECENT SEARCHES ====
  const [recentJournalSearches, setRecentJournalSearches] = useState([]);

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
      const KEY = "recent_journal_searches__anon_id";
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
      return `recent_journal_searches:${userId}`;
    } catch (error) {
      console.warn("Error generating storage key:", error);
      return "recent_journal_searches:fallback";
    }
  };

  const loadRecentJournalSearches = () => {
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
        (item) => item && typeof item === "object" && item.title
      );

      return validItems;
    } catch (error) {
      console.warn("Error loading recent journal searches:", error);
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
        console.warn("Error saving recent journal searches:", error);
      }
    }
  };

  // Accepts either a string or an article object
  const addRecentJournalSearch = (articleOrTitle) => {
    if (!articleOrTitle) return;

    let item;

    try {
      if (typeof articleOrTitle === "string") {
        const t = articleOrTitle.trim();
        if (!t) return;
        item = { title: t };
      } else if (articleOrTitle && typeof articleOrTitle === "object") {
        const title =
          articleOrTitle.title ||
          articleOrTitle.name ||
          articleOrTitle.slug ||
          "";
        if (!title) return;
        item = {
          title,
          hero_banner: articleOrTitle.hero_banner,
          slug: articleOrTitle.slug,
        };
      } else {
        return; // Invalid input
      }

      if (!item || !item.title) return;

      setRecentJournalSearches((prev) => {
        try {
          const next = [
            item,
            ...(Array.isArray(prev) ? prev : []).filter(
              (x) =>
                x &&
                x.title &&
                x.title.toLowerCase() !== item.title.toLowerCase()
            ),
          ];
          saveRecentSearches(next);
          return next;
        } catch (error) {
          console.warn("Error adding recent journal search:", error);
          return prev; // Return previous state on error
        }
      });
    } catch (error) {
      console.warn("Error processing recent journal search:", error);
    }
  };

  const clearRecentJournalSearches = () => {
    setRecentJournalSearches([]);
    if (!isLocalStorageAvailable()) {
      return;
    }
    try {
      const storageKey = getUserStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Error clearing recent journal searches:", error);
    }
  };

  // ==== JOURNAL SEARCH API ====
  const executeJournalSearch = async (search) => {
    try {
      const url = `https://asia-south1.workflow.boltic.app/50605dbc-b5e9-496c-b114-3e8f4fa13b0f?keyword=${encodeURIComponent(
        search
      )}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      console.error("Journal search error:", error);
      throw error;
    }
  };

  const handleJournalSearch = async (value) => {
    if (!value.trim()) {
      setJournalResults([]);
      return;
    }

    setIsLoadingJournal(true);
    try {
      const results = await executeJournalSearch(value);
      setJournalResults(results || []);
    } catch (error) {
      console.error("Journal search failed:", error);
    } finally {
      setIsLoadingJournal(false);
    }
  };

  const debouncedJournalSearch = useCallback(
    debounce((value) => handleJournalSearch(value), 300),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Trigger search when external search term changes
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      debouncedJournalSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load recent searches on mount
  useEffect(() => {
    try {
      const loaded = loadRecentJournalSearches();
      if (Array.isArray(loaded)) {
        setRecentJournalSearches(loaded);
      }
    } catch (error) {
      console.warn("Error loading recent journal searches on mount:", error);
      setRecentJournalSearches([]);
    }
  }, []);

  const onJournalSuggestionClick = async (article) => {
    console.log("JournalSuggest click");
    // Store full article info so recent search has hero_banner + slug
    addRecentJournalSearch(article);
    await handleJournalSearch(article.title);
  };

  const handleJournalNavigation = async (slug) => {
    if (slug) {
      // Extract slug from full URL if needed
      let slugPath = slug;
      if (slug.includes("/blog/")) {
        slugPath = slug.split("/blog/")[1];
      } else if (slug.includes("test-zion.fynd.io/blog/")) {
        slugPath = slug.replace("https://test-zion.fynd.io/blog/", "");
      }
      navigate(`/blog/${slugPath}`);
      onClose();
    }
  };

  const handleRecentJournalClick = async (item) => {
    const t = item?.title?.trim();
    if (!t) return;

    addRecentJournalSearch(item); // bump to top
    setHoveredArticle && setHoveredArticle(item);
    await handleJournalSearch(t);
  };

  return (
    <div className={styles.emptyState}>
      {/* Last Journal Searches */}
      {recentJournalSearches.length > 0 && (
        <div className={styles.suggestionsSection}>
          <div className={styles.suggestionsHeader}>
            LAST SEARCHED
            <button
              type="button"
              onClick={clearRecentJournalSearches}
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

          {recentJournalSearches.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className={styles.recentItemDesktop}
              onClick={() => handleRecentJournalClick(item)}
              onMouseEnter={() => setHoveredArticle && setHoveredArticle(item)}
              onMouseLeave={() => setHoveredArticle && setHoveredArticle(null)}
            >
              <span className={styles.recentName}>{item.title}</span>
              {hoveredArticle === item && hoveredArticle && (
                <>
                  <span className={styles.ekkeDot}></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // don't trigger handleRecentClick
                      // use actual article object
                      handleJournalNavigation(item?.slug);
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
      {externalSearchTerm && journalResults.length > 0 && (
        <>
          <div className={styles.suggestionsSection}>
            <div className={styles.suggestionsHeader}>JOURNAL RESULTS</div>
            <div className={styles.searchResultDesignerContainer}>
              {/* Desktop list */}
              {journalResults.map((article, index) => (
                <div
                  key={article.id || index}
                  className={styles.resultImageContainer}
                  onClick={() => {
                    onJournalSuggestionClick(article);
                    handleJournalNavigation(article?.slug);
                    onClose();
                  }}
                >
                  <FyImage
                    src={article?.hero_banner}
                    aspectRatio={4 / 5}
                    mobileAspectRatio={4 / 5}
                  />
                  <div className={styles.addToCartTag}>
                    <span
                      className={styles.addToCartTagText}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        handleJournalNavigation(article?.slug);
                      }}
                    >
                      Read Article
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer count */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.footerText}
              onClick={() => {
                const trimmedSearch = externalSearchTerm?.trim();
                if (trimmedSearch) {
                  navigate(`/blog?search=${encodeURIComponent(trimmedSearch)}`);
                  onClose();
                }
              }}
              
            >
              SEARCH ALL
            </button>
          </div>
        </>
      )}

      {/* No Results */}
      {externalSearchTerm &&
        journalResults.length === 0 &&
        !isLoadingJournal && (
          <div className={styles.noResults}>
            <p className={styles.noResultsText}>NO JOURNAL ARTICLES FOUND</p>
          </div>
        )}
    </div>
  );
}
