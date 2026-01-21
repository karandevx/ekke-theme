import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isRunningOnClient } from "../../../../helper/utils";
import FilterList from "../filter-list/filter-list.jsx";
import styles from "./filter-item.less";
import { useFPI } from "fdk-core/utils";
import useHeader from "../../../../components/header/useHeader.jsx";
import CategorySidebar from "../category-filter/category-filter.jsx";

const FilterItem = ({
  filter,
  isMobileView,
  onFilterUpdate = () => {},
  allFilters = [],
}) => {
  const fpi = useFPI();

  const { FilterCategoriesList } = useHeader(fpi);

  const location = useLocation();

  // Detect if this filter has any active value via props (is_selected) or URL query (?brand=..., ?color=..., etc.)
  const hasActiveValue = useMemo(() => {
    const key = filter?.key?.name;
    if (!key) return false;
    const selectedInData =
      Array.isArray(filter.values) &&
      filter.values.some((v) => !!v?.is_selected);
    const selectedInUrl =
      isRunningOnClient() &&
      new URLSearchParams(location?.search || "").getAll(key).length > 0;
    return selectedInData || selectedInUrl;
  }, [filter?.key?.name, filter?.values, location?.search]);

  // section open/close (dropdown) — default open if something is selected
  const [isOpen, setIsOpen] = useState(() => hasActiveValue);

  // If selection changes later (e.g., user hits Apply elsewhere), auto-open this section
  useEffect(() => {
    if (hasActiveValue) setIsOpen(true);
  }, [hasActiveValue]);
  const ALLOWED_TITLES = new Set(["Brand"]);
  if (
    !filter ||
    !filter.key ||
    // !ALLOWED_TITLES.has(filter.key.name) ||
    !Array.isArray(filter.values) ||
    filter.values.length === 0
  ) {
    return null;
  }

  return (
    <div className={styles.filter}>
      <CategorySidebar
        data={FilterCategoriesList}
        filter={filter}
        allFilters={allFilters}
      />
      <>
        {filter.values.length > 0 && filter.key.name === "brand" && (
          <button
            className={`${styles["filter__title"]} ${styles.flexAlignCenter} ${styles.justifyBetween}`}
          >
            <p className={`${styles.name} ${styles.b2}`}>
              {filter.key.display}
            </p>
          </button>
        )}
        {filter.key.name === "brand" && (
          <div className={`${styles["filter__list"]} `}>
            <FilterList
              filter={{ ...filter, isOpen }}
              isMobileView={isMobileView}
              onFilterUpdate={onFilterUpdate}
            />
          </div>
        )}
      </>
    </div>
  );
};

export default FilterItem;
