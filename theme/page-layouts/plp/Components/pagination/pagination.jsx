import React, { useCallback, useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./pagination.less";
import { useGlobalTranslation } from "fdk-core/utils";
import Sort from "../sort/sort";

const Pagination = ({
  current = 1,
  hasPrevious = false,
  hasNext = true,
  prevPageLink = "",
  nextPageLink = "",
  totalPages,
  onViewChange = () => {},
  columnCount,
  onColumnCountUpdate,
  filterList,
  handleFilterButtonClick,
  isFilterModalOpen,
  sortList,
  filter,
  onSortUpdate,
  onFilterUpdate,
  isCollectibles = false,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [screenType, setScreenType] = useState("desktop");

  // Update screen type based on window width
  useEffect(() => {
    const updateScreenType = () => {
      if (typeof window === "undefined") return;

      let newScreenType;
      if (window.innerWidth < 768) {
        newScreenType = "mobile";
      } else if (window.innerWidth < 1024) {
        newScreenType = "tablet";
      } else {
        newScreenType = "desktop";
      }

      setScreenType(newScreenType);
    };

    updateScreenType();
    window.addEventListener("resize", updateScreenType);

    return () => window.removeEventListener("resize", updateScreenType);
  }, []);

  const handleViewChange = (columns) => {
    // Update the parent component state through the callback
    if (onColumnCountUpdate && typeof onColumnCountUpdate === "function") {
      onColumnCountUpdate({ screen: screenType, count: columns });
    }

    // Also trigger the onViewChange callback if provided
    if (onViewChange && typeof onViewChange === "function") {
      onViewChange(columns);
    }
  };

  const scrollToTop = useCallback(() => {
    if (window) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }, 500);
    }
  }, []);

  const formatPageNumber = (num) => {
    // Convert safely into a number
    const parsed = Number(num);

    // If num is not a valid finite number, fallback to 0
    const safeNum = Number.isFinite(parsed) ? parsed : 0;

    // Always convert to string before using padStart
    return String(safeNum).padStart(2, "0");
  };

  // Get the appropriate view options based on screen type
  const getViewOptions = () => {
    switch (screenType) {
      case "mobile":
        return [1, 2, 4];
      case "tablet":
        return [2, 3, 4];
      case "desktop":
      default:
        return [2, 4, 8];
    }
  };

  // Get current active count based on screen type
  const getCurrentActiveCount = () => {
    return (
      columnCount?.[screenType] ||
      (screenType === "mobile" ? 2 : screenType === "tablet" ? 3 : 4)
    );
  };

  const viewOptions = getViewOptions();
  const currentActiveCount = getCurrentActiveCount();

  return (
    <div className={styles.paginationWrapper}>
      {/* Page Counter */}
      <div className={styles.pageCounterWrapper}>
        <div className={styles.pageCounter}>
          <span className={styles.currentPage}>
            {formatPageNumber(current)}
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.totalPages}>
            {formatPageNumber(totalPages)}
          </span>
        </div>

        {/* Navigation Controls */}
        <div className={styles.navigationControls}>
          <FDKLink
            className={`${styles.navButton} ${!hasPrevious ? styles.disabled : ""}`}
            to={prevPageLink}
            onClick={scrollToTop}
            aria-label={t("resource.facets.prev")}
          >
            PREVIOUS
          </FDKLink>

          <FDKLink
            className={`${styles.navButton} ${!hasNext ? styles.disabled : ""}`}
            to={nextPageLink}
            onClick={scrollToTop}
            aria-label={t("resource.facets.next")}
          >
            NEXT
          </FDKLink>
        </div>

        <div className={styles.filterSortSection}>
          {filterList.length > 0 && (
            <button
              className={styles.filterBtn}
              onClick={handleFilterButtonClick}
            >
              <span>{isFilterModalOpen ? "CLOSE INDEX" : "INDEX"}</span>
            </button>
          )}
        </div>
      </div>

      {/* View Options */}
      <div
        className={`${styles.viewOptions} ${
          isCollectibles ? styles.collectibleViewOptions : ""
        }`}
      >
        {!isCollectibles && (
          <>
            <div className={styles.viewOptionWrapper}>
              <span className={styles.viewLabel}>VIEW</span>
              <div className={styles.viewButtons}>
                {viewOptions.map((viewCount) => (
                  <button
                    key={viewCount}
                    className={`${styles.viewButton} ${
                      currentActiveCount === viewCount ? styles.active : ""
                    }`}
                    onClick={() => handleViewChange(viewCount)}
                    aria-label={`View ${viewCount} columns`}
                  >
                    {viewCount}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Sort
          sortList={sortList}
          filter={filterList}
          onSortUpdate={onSortUpdate}
          onFilterUpdate={onFilterUpdate}
        />
      </div>
    </div>
  );
};

export default Pagination;
