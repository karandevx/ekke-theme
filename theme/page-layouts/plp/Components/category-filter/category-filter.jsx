import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { isRunningOnClient } from "../../../../helper/utils";
import styles from "./category-filter.less";

const CategorySidebar = ({ data, filter, allFilters = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openIndexes, setOpenIndexes] = useState([]); // multiple open parents

  // Render only once for custom-attribute-2
  const ALLOWED_TITLES = new Set(["custom-attribute-2", "custom-attribute-3"]);
  if (!ALLOWED_TITLES.has(filter?.key?.name)) return null;
  if (filter?.key?.name === "custom-attribute-3") return null;

  // Pull both filters from allFilters
  const categoryFilter =
    filter?.key?.name === "custom-attribute-2"
      ? filter
      : allFilters.find((f) => f?.key?.name === "custom-attribute-2");

  const subcategoryFilter = allFilters.find(
    (f) => f?.key?.name === "custom-attribute-3"
  );

  // ---------- 1) Build "available" sets from API filters ----------
  const apiAvailableParents = useMemo(() => {
    const vals = categoryFilter?.values;
    if (!Array.isArray(vals)) return new Set();
    return new Set(
      vals
        .map((v) => (v?.display || v?.value || "").trim().toLowerCase())
        .filter(Boolean)
    );
  }, [categoryFilter]);

  const apiAvailableSubs = useMemo(() => {
    const vals = subcategoryFilter?.values;
    if (!Array.isArray(vals)) return new Set();
    return new Set(
      vals
        .map((v) => (v?.display || v?.value || "").trim().toLowerCase())
        .filter(Boolean)
    );
  }, [subcategoryFilter]);

  // If API provides no values at all, treat as "show everything"
  const shouldShowAllFromTree = useMemo(() => {
    return apiAvailableParents.size === 0 && apiAvailableSubs.size === 0;
  }, [apiAvailableParents, apiAvailableSubs]);

  // ---------- 2) Create a filtered tree based on API availability ----------
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((parent) => {
        const parentName = (parent?.display || "").trim();
        const parentKey = parentName.toLowerCase();

        const subNav = Array.isArray(parent?.sub_navigation)
          ? parent.sub_navigation
          : [];

        // visible subcategories strictly by API availability
        const visibleSubs = shouldShowAllFromTree
          ? subNav
          : subNav.filter((sub) => {
              const subName = (sub?.display || "").trim().toLowerCase();
              return subName && apiAvailableSubs.has(subName);
            });

        const isParentAvailableInApi =
          shouldShowAllFromTree ||
          (parentKey && apiAvailableParents.has(parentKey));

        // parent visible if:
        // - API says parent is available OR
        // - at least one subcategory is available
        const shouldShowParent =
          shouldShowAllFromTree ||
          isParentAvailableInApi ||
          visibleSubs.length > 0;

        return {
          ...parent,
          __shouldShowParent: shouldShowParent,
          __isParentAvailableInApi: isParentAvailableInApi,
          __visibleSubs: visibleSubs,
        };
      })
      .filter((p) => p.__shouldShowParent);
  }, [data, apiAvailableParents, apiAvailableSubs, shouldShowAllFromTree]);

  // ---------- 3) Active helpers ----------
  const isItemLabelActive = (displayName) => {
    if (!isRunningOnClient()) return false;
    const vals = searchParams.getAll("custom-attribute-2") || [];
    return vals.includes(displayName);
  };

  const isSubLinkActive = (displayName) => {
    if (!isRunningOnClient()) return false;
    const vals = searchParams.getAll("custom-attribute-3") || [];
    return vals.includes(displayName);
  };

  const isViewAllActive = () => {
    if (!isRunningOnClient()) return true;
    const parentVals = searchParams.getAll("custom-attribute-2") || [];
    const childVals = searchParams.getAll("custom-attribute-3") || [];
    return parentVals.length === 0 && childVals.length === 0;
  };

  // "All" active for a parent: all visible subcategories are selected
  const isSubAllActive = (parentDisplay, visibleSubs = []) => {
    if (!isRunningOnClient()) return false;
    if (visibleSubs.length === 0) return false;

    const childVals = new Set(searchParams.getAll("custom-attribute-3") || []);
    const visibleSubNames = visibleSubs.map((s) => s.display);

    // All is active if all visible subcategories are selected
    return visibleSubNames.every((name) => childVals.has(name));
  };

  // ---------- 4) Auto open: open parents that are selected OR have selected subcats ----------
  useEffect(() => {
    if (!isRunningOnClient()) return;
    if (!filteredData.length) return;
    if (openIndexes.length > 0) return;

    const selectedParents = new Set(
      searchParams.getAll("custom-attribute-2") || []
    );
    const selectedSubs = new Set(
      searchParams.getAll("custom-attribute-3") || []
    );

    const toOpen = [];
    filteredData.forEach((p, idx) => {
      if (selectedParents.has(p.display)) {
        toOpen.push(idx);
        return;
      }
      const visibleSubs = p.__visibleSubs || [];
      const hasSelectedSub = visibleSubs.some((s) =>
        selectedSubs.has(s.display)
      );
      if (hasSelectedSub) toOpen.push(idx);
    });

    if (toOpen.length) setOpenIndexes(toOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  // ---------- 5) Click handlers ----------
  const handleViewAllClick = (e) => {
    e.preventDefault();
    if (!isRunningOnClient()) return;

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("custom-attribute-2");
    newSearchParams.delete("custom-attribute-3");
    newSearchParams.delete("page_no");

    setSearchParams(newSearchParams, { replace: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // Parent label click: only open/close, no filtering
  const handleParentToggle = (e, index) => {
    e.preventDefault();
    if (!isRunningOnClient()) return;

    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Subcategory click: toggle custom-attribute-3, do not change parent selections
  const handleSubLinkClick = (e, displayName) => {
    e.preventDefault();
    if (!isRunningOnClient()) return;

    const newSearchParams = new URLSearchParams(searchParams);
    const key = "custom-attribute-3";

    const existing = newSearchParams.getAll(key) || [];
    const isSelected = existing.includes(displayName);

    newSearchParams.delete(key);
    const next = isSelected
      ? existing.filter((v) => v !== displayName)
      : [...existing, displayName];
    next.forEach((v) => newSearchParams.append(key, v));

    newSearchParams.delete("page_no");
    setSearchParams(newSearchParams, { replace: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // "All" click: toggle all visible subcategories in custom-attribute-3
  // Select all visible subcategories if not all are selected, otherwise deselect all
  const handleSubAllClick = (e, parentDisplay, visibleSubs = []) => {
    e.preventDefault();
    if (!isRunningOnClient()) return;
    if (visibleSubs.length === 0) return;

    const newSearchParams = new URLSearchParams(searchParams);
    const childKey = "custom-attribute-3";

    const existingChildren = new Set(newSearchParams.getAll(childKey) || []);
    const visibleSubNames = visibleSubs.map((s) => s.display);

    // Check if all visible subcategories are already selected
    const allSelected = visibleSubNames.every((name) =>
      existingChildren.has(name)
    );

    // Remove all visible subcategories first
    newSearchParams.delete(childKey);

    // Get all other subcategories (not belonging to this parent)
    const otherChildren = Array.from(existingChildren).filter(
      (v) => !visibleSubNames.includes(v)
    );

    // If all were selected, just keep the other children (deselect all visible)
    // If not all were selected, add all visible subcategories
    if (!allSelected) {
      // Select all visible subcategories
      visibleSubNames.forEach((v) => newSearchParams.append(childKey, v));
    }

    // Add back other children that don't belong to this parent
    otherChildren.forEach((v) => newSearchParams.append(childKey, v));

    newSearchParams.delete("page_no");
    setSearchParams(newSearchParams, { replace: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // ---------- 6) Render ----------
  return (
    <div className={styles["category-sidebar"]}>
      <div className={styles["category-sidebar__title"]}>CATEGORIES</div>

      <div className={styles["category-sidebar__list"]}>
        <button
          type="button"
          className={styles["category-sidebar__item-btn"]}
          onClick={handleViewAllClick}
        >
          <span
            className={`${styles["category-sidebar__item-label"]} ${
              isViewAllActive()
                ? styles["category-sidebar__item-label--active"]
                : ""
            }`}
          >
            <span
              className={`${styles["category-sidebar__bullet"]} ${
                isViewAllActive()
                  ? styles["category-sidebar__bullet--visible"]
                  : ""
              }`}
            />
            View All
          </span>
        </button>

        {filteredData.map((parent, index) => {
          const isOpen = openIndexes.includes(index);

          // dropdown visible only if sub category is visible (your requirement)
          const visibleSubs = parent.__visibleSubs || [];
          const showDropdown = visibleSubs.length > 0;

          // "All" visible only if API says parent is available
          // const showAllRow = parent.__isParentAvailableInApi;

          return (
            <div key={parent.display}>
              <div
                className={`${styles["category-sidebar__item"]} ${
                  isOpen ? styles["category-sidebar__item--open"] : ""
                }`}
              >
                <button
                  type="button"
                  className={styles["category-sidebar__item-btn"]}
                  onClick={(e) => handleParentToggle(e, index)}
                >
                  <span
                    className={`${styles["category-sidebar__item-label"]} `}
                  >
                    {/* <span
                      className={`${styles["category-sidebar__bullet"]} ${
                        isItemLabelActive(parent.display)
                          ? styles["category-sidebar__bullet--visible"]
                          : ""
                      }`}
                    /> */}
                    {parent.display}
                  </span>
                </button>

                {showDropdown && (
                  <div
                    className={`${styles["category-sidebar__sub-list"]} ${
                      isOpen ? styles["category-sidebar__sub-list--open"] : ""
                    }`}
                  >
                    {visibleSubs.map((sub) => {
                      const href =
                        sub.action?.page?.url || sub.action?.page?.query || "#";
                      const isActive = isSubLinkActive(sub.display);

                      return (
                        <div
                          key={sub.display}
                          className={`${styles["category-sidebar__sub-item"]} ${
                            isActive
                              ? styles["category-sidebar__sub-item--active"]
                              : ""
                          }`}
                        >
                          <a
                            href={href}
                            className={`${styles["category-sidebar__sub-link"]} ${
                              isActive
                                ? styles["category-sidebar__sub-link--active"]
                                : ""
                            }`}
                            onClick={(e) => handleSubLinkClick(e, sub.display)}
                          >
                            <span
                              className={`${styles["category-sidebar__bullet"]} ${styles["category-sidebar__bullet--sub"]} ${
                                isActive
                                  ? styles["category-sidebar__bullet--visible"]
                                  : ""
                              }`}
                            />
                            {sub.display}
                          </a>
                        </div>
                      );
                    })}
                    {/* {showAllRow && ( */}
                    <div
                      className={`${styles["category-sidebar__sub-item"]} ${
                        isSubAllActive(parent.display, visibleSubs)
                          ? styles["category-sidebar__sub-item--active"]
                          : ""
                      }`}
                    >
                      <a
                        href="#"
                        className={`${styles["category-sidebar__sub-link"]} ${
                          isSubAllActive(parent.display, visibleSubs)
                            ? styles["category-sidebar__sub-link--active"]
                            : ""
                        }
                          ${
                            isItemLabelActive(parent.display)
                              ? styles["category-sidebar__sub-link--active"]
                              : ""
                          }`}
                        onClick={(e) =>
                          handleSubAllClick(e, parent.display, visibleSubs)
                        }
                      >
                        <span
                          className={`${styles["category-sidebar__bullet"]} ${styles["category-sidebar__bullet--sub"]} ${
                            isSubAllActive(parent.display, visibleSubs)
                              ? styles["category-sidebar__bullet--visible"]
                              : ""
                          }`}
                        />
                        <span
                          className={`${styles["category-sidebar__bullet"]} ${
                            isItemLabelActive(parent.display)
                              ? styles["category-sidebar__bullet--visible"]
                              : ""
                          }`}
                        />
                        All
                      </a>
                    </div>
                    {/* // )} */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySidebar;
