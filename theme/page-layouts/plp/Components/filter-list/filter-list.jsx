import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./filter-list.less";
import { isRunningOnClient } from "../../../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import useHeader from "../../../../components/header/useHeader";

function FilterList({
  filter,
  isCollapsedView = false,
  onFilterUpdate = () => {},
  isOpen,
}) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const navigate = useNavigate();

  // Keep expansion state per filter name so remounts/re-renders don't reset it
  const [expandedByFilter, setExpandedByFilter] = useState({});
  const isExpanded = !!expandedByFilter?.[filter?.key?.name];

  const MAX_ITEM_COUNT = 5;

  // Safeguards
  const filterName = filter?.key?.name || "";
  const values = useMemo(
    () => (Array.isArray(filter?.values) ? filter.values : []),
    [filter?.values]
  );

  const searchParams = isRunningOnClient()
    ? new URLSearchParams(location?.search)
    : null;

  // Helper to know if an item is selected (via URL or data)
  const isFilterSelected = (filterItem) =>
    searchParams?.getAll(filterName).includes(filterItem?.value) ||
    !!filterItem?.is_selected;

  // remove a param entirely and navigate (also resets page_no)
  const removeFilterAndNavigate = (paramName) => {
    if (!isRunningOnClient()) return;
    const sp = new URLSearchParams(location?.search || "");
    // Don't navigate if no filter is selected for this param
    if (!sp.has(paramName)) return;
    sp.delete(paramName);
    sp.delete("page_no");
    navigate(
      { pathname: location?.pathname, search: sp.toString() },
      { replace: true, preventScrollReset: true }
    );
  };

  const clearCategoryFilters = () => removeFilterAndNavigate("category");
  const clearBrandFilters = () => removeFilterAndNavigate("brand");

  const getFilteredItems = (searchText) => {
    if (!searchText) return values;
    return values.filter((item) =>
      String(item?.display || "")
        .toLowerCase()
        .includes(String(searchText).toLowerCase())
    );
  };

  // If you later add a search box, wire its value here.
  // Sort: selected first, then alphabetical by display name
  const filteredItems = useMemo(() => {
    const items = getFilteredItems();
    const currentSearchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;

    // Create a copy of the array before sorting to avoid mutating read-only arrays
    return [...items].sort((a, b) => {
      // Check if items are selected (via URL or data)
      const aSel =
        currentSearchParams?.getAll(filterName).includes(a?.value) ||
        !!a?.is_selected
          ? 1
          : 0;
      const bSel =
        currentSearchParams?.getAll(filterName).includes(b?.value) ||
        !!b?.is_selected
          ? 1
          : 0;
      if (aSel !== bSel) return bSel - aSel; // selected first
      // Alphabetical order by display name
      const aDisplay = String(a?.display || "").toLowerCase();
      const bDisplay = String(b?.display || "").toLowerCase();
      return aDisplay.localeCompare(bDisplay);
    });
  }, [location?.search, values, filterName]); // re-evaluate when URL or values change

  const showViewMore =
    isCollapsedView &&
    Array.isArray(filteredItems) &&
    filteredItems.length > MAX_ITEM_COUNT;

  function getFilteredValues() {
    if (!showViewMore) return filteredItems;
    return isExpanded ? filteredItems : filteredItems.slice(0, MAX_ITEM_COUNT);
  }

  const filterClicked = (item) => {
    onFilterUpdate({ filter, item });
    isOpen = true;
    if (typeof window !== "undefined") {
      window?.scrollTo({ top: 0 });
    }
  };

  const toggleExpanded = () =>
    setExpandedByFilter((prev) => ({
      ...prev,
      [filterName]: !prev?.[filterName],
    }));

  const ViewToggle = () =>
    showViewMore ? (
      <button
        type="button"
        className={styles["view-more"]}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`filter-items-${filterName}`}
      >
        {isExpanded
          ? "View less"
          : `View more (${filteredItems.length - MAX_ITEM_COUNT})`}
      </button>
    ) : null;

  const renderColorDot = (filterItem) =>
    filterName === "primary_color" ? (
      <div
        className={`
          ${styles["filter__item--color"]} ${
            String(filterItem?.value).toLowerCase() === "none"
              ? styles.multiIcon
              : ""
          }
        `}
        style={{ backgroundColor: `#${filterItem?.value}` }}
      />
    ) : null;

  const renderLabel = (filterItem) => (
    <div
      className={`${styles["filter__item--value"]} ${
        styles["caption-normal"]
      } ${isFilterSelected(filterItem) ? styles.active : ""}`}
    >
      {/* label + optional count, e.g. Shoes (23) */}
      {filterItem?.display}
      {typeof filterItem?.count === "number" ? ` (${filterItem.count})` : ""}
    </div>
  );

  return (
    <div
      className={`${styles["filter__list"]} ${
        !filter?.isOpen ? styles.open : ""
      }`}
    >
      {/* BRAND */}
      {filterName === "brand" && (
        <div>
          <button
            className={styles.clearAll}
            tabIndex={0}
            onClick={clearBrandFilters}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && clearBrandFilters()
            }
          >
            Clear all
          </button>

          <div className={`brand-filter ${styles["filter-items-container"]}`}>
            <ul
              className={styles["filter__list--items"]}
              id={`filter-items-${filterName}`}
            >
              {getFilteredValues()?.length ? (
                getFilteredValues().map((filterItem, index) => (
                  <li
                    key={`filter-${index}`}
                    className={styles["filter__list--item"]}
                  >
                    <div
                      className={`${styles["filter__item"]} ${
                        styles["filter__item--brand"]
                      } ${styles.flexAlignCenter} ${styles["caption-normal"]} ${
                        isFilterSelected(filterItem) ? styles.active : ""
                      }`}
                      onClick={() => filterClicked(filterItem)}
                    >
                      <div className={styles["checkbox-icon-container"]}>
                        {isFilterSelected(filterItem) ? (
                          <SvgWrapper
                            className={`${styles.icon} ${styles["checkbox-icon"]} ${styles.selected}`}
                            svgSrc="checkbox-selected"
                          />
                        ) : (
                          <SvgWrapper
                            className={`${styles.icon} ${styles["checkbox-icon"]}`}
                            svgSrc="checkbox"
                          />
                        )}
                      </div>
                      {renderLabel(filterItem)}
                    </div>
                  </li>
                ))
              ) : (
                <li className={styles["filter__list--item"]}>
                  <div
                    className={`${styles["filter__item"]} ${styles.flexCenter} ${styles["caption-normal"]}`}
                  >
                    {t("resource.common.empty_state")}
                  </div>
                </li>
              )}
            </ul>

            <ViewToggle />
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterList;
