import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import styles from "./sort.less";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";

import { useMobile } from "../../../../helper/hooks";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import useCheckAnnouncementBar from "../../../../helper/hooks/useCheckAnnouncementBar";

/**
 * Goal: Use ONE reusable dropdown UI for ALL filters (Size, Color, Occasion, etc.)
 * - Keeps special behaviors for Size (grouping) and Color (swatches)
 * - Renders every other filter in the exact same dropdown pattern
 */

function Sort({
  sortList = [],
  onSortUpdate = () => {},
  filter = [],
  onFilterUpdate = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const [sortOpen, setSortOpen] = useState(false);
  // Only one section can be open at a time
  const [expandedId, setExpandedId] = useState(null); // string | null
  const [markdownOnly, setMarkdownOnly] = useState(true);

  const location = useLocation();
  const isMobile = useMobile(768);

  // API-provided filters ------------------------------------------------------
  const sizeFilter = filter.find((f) => f.key?.name === "sizes");
  const colorFilter = filter.find(
    (f) =>
      f.key?.name === "primary_color" || f.key?.display === "Primary Colour"
  );

  // The rest of the filters (after the first 6) should also show as the same dropdowns
  // Sort filters alphabetically by display name
  const filterSet = useMemo(() => {
    const remainingFilters = filter.slice(3);
    return remainingFilters;
  }, [filter]);

  // Selected label helpers ----------------------------------------------------
  const sizeOptions = sizeFilter?.values || [];
  const colorOptions = colorFilter?.values || [];

  const selectedSort = useMemo(() => {
    const selectedItem = sortList?.find((x) => x.is_selected);
    return selectedItem?.value ?? null;
  }, [sortList]);

  const selectedSizesLabel = useMemo(() => {
    const selected = sizeOptions.filter((s) => s.selected || s.is_selected);
    return selected.map((s) => s.display).join(", ");
  }, [sizeOptions]);

  const selectedColorsLabel = useMemo(() => {
    const selected = colorOptions.filter((c) => c.selected || c.is_selected);
    return selected.map((c) => c.display).join(", ");
  }, [colorOptions]);

  // Group sizes ---------------------------------------------------------------
  // const groupedSizes = useMemo(() => {
  //   return sizeOptions.reduce(
  //     (acc, size) => {
  //       const d = size.display;
  //       if (d?.includes?.("YRS")) acc.kids.push(size);
  //       else if (d?.includes?.("M")) acc.infants.push(size);
  //       else if (["XS", "S", "M", "L", "XL", "XXL", "3XL"].includes(d))
  //         acc.letter.push(size);
  //       else if (!isNaN(d)) acc.numeric.push(size);
  //       else acc.misc.push(size);
  //       return acc;
  //     },
  //     { letter: [], numeric: [], kids: [], infants: [], misc: [] }
  //   );
  // }, [sizeOptions]);
  const groupedSizes = useMemo(() => {
    const LETTER_SET = new Set([
      "XXS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
      "2XL",
      "3XL",
      "4XL",
      "5XL",
      "6XL",
      "7XL",
      "8XL",
      "9XL",
      "10XL",
    ]);

    const isNumericSize = (d) => {
      // allow "28", "30", "32.5" etc.
      const cleaned = String(d).trim();
      return cleaned !== "" && !Number.isNaN(Number(cleaned));
    };

    const isUKSize = (d) => {
      // matches: "UK 6", "uk6", "UK-10", "UK10", "UK 10/12"
      const s = String(d).trim().toUpperCase();
      return /^UK[\s\-]?\d+([\/\-]\d+)?/.test(s);
    };

    const isFreeOrOneSize = (d) => {
      const s = String(d).trim().toUpperCase();
      return (
        s === "FREE" ||
        s === "FREESIZE" ||
        s === "FREE SIZE" ||
        s === "ONE SIZE" ||
        s === "ONESIZE" ||
        s === "OS" ||
        s === "O/S" ||
        s === "FREE-SIZE" ||
        s === "ONE-SIZE"
      );
    };

    return sizeOptions.reduce(
      (acc, size) => {
        const d = String(size.display ?? "").trim();

        if (LETTER_SET.has(d.toUpperCase())) acc.letter.push(size);
        else if (isNumericSize(d)) acc.numeric.push(size);
        else if (isUKSize(d)) acc.uk.push(size);
        else if (isFreeOrOneSize(d)) acc.free.push(size);
        else acc.custom.push(size);

        return acc;
      },
      { letter: [], numeric: [], uk: [], free: [], custom: [] }
    );
  }, [sizeOptions]);

  // Handlers -----------------------------------------------------------------
  const toggleSection = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const prevPathRef = useRef(location.pathname);

  const handleFilterClick = useCallback(
    (targetFilter, item) => {
      if (!targetFilter) return;
      onFilterUpdate({ filter: targetFilter, item });
      setSortOpen(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [onFilterUpdate]
  );

  function updateSortOption(sortValue) {
    onSortUpdate(sortValue);
  }

  function closeSortOption() {
    setSortOpen(false);
  }

  function clearAll() {
    setExpandedId(null);
    setMarkdownOnly(false);
    onSortUpdate(null);
    setSortOpen(true);
    navigate("/products");
  }

  // Effects ------------------------------------------------------------------
  // useEffect(() => {
  //   closeSortOption();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location?.search]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = sortOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [sortOpen]);

  // useEffect(() => {
  //   if (location.pathname !== prevPathRef.current) {
  //     closeSortOption(); // close only on actual page change
  //     prevPathRef.current = location.pathname;
  //   }
  // }, [location.pathname]);

  // Header label --------------------------------------------------------------
  const selectedSortName = useMemo(() => {
    const selectedItem = sortList?.find((x) => x.is_selected);
    if (selectedItem) return selectedItem.name;
    if (selectedSizesLabel) return `Size: ${selectedSizesLabel}`;
    if (selectedColorsLabel) return `Color: ${selectedColorsLabel}`;
    return t("resource.facets.sort_by");
  }, [sortList, selectedSizesLabel, selectedColorsLabel, t]);

  // Reusable section renderer -------------------------------------------------
  const SectionHeader = ({ id, label, hasSelection }) => {
    const isExpanded = expandedId === id;
    return (
      <button
        className={`${styles.filterHeader} ${hasSelection ? styles.hasSelection : ""}`}
        onClick={() => toggleSection(id)}
      >
        <span>{label}</span>
        <span className={styles.expandIcon}>{isExpanded ? "−" : "+"}</span>
      </button>
    );
  };

  const Checkbox = ({ checked }) =>
    checked ? (
      <SvgWrapper
        className={`${styles.checkboxIcon} ${styles.selected}`}
        svgSrc="checkbox-selected"
      />
    ) : (
      <SvgWrapper className={styles.checkboxIcon} svgSrc="checkbox" />
    );

  const renderSimpleOptions = (f) => {
    // Sort: selected first, then alphabetical by display name
    const sortedValues = [...(f.values || [])].sort((a, b) => {
      const aChecked = a.selected || a.is_selected;
      const bChecked = b.selected || b.is_selected;
      if (aChecked !== bChecked) return bChecked ? 1 : -1; // selected first
      // Alphabetical order by display name
      const aDisplay = String(a?.display || "").toLowerCase();
      const bDisplay = String(b?.display || "").toLowerCase();
      return aDisplay.localeCompare(bDisplay);
    });

    return (
      <div className={styles.filterContent}>
        {sortedValues.map((opt) => {
          const checked = opt.selected || opt.is_selected;
          return (
            <div
              key={opt.value ?? opt.display}
              className={`${styles.sortOption} ${checked ? styles.selected : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleFilterClick(f, opt);
              }}
            >
              <div className={styles.checkboxContainer}>
                <Checkbox checked={checked} />
              </div>
              <span className={styles.sortLabel}>{opt.display}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderColorOptions = (f) => {
    // Sort: selected first, then alphabetical by display name
    const sortedValues = [...(f.values || [])].sort((a, b) => {
      const aChecked = a.selected || a.is_selected;
      const bChecked = b.selected || b.is_selected;
      if (aChecked !== bChecked) return bChecked ? 1 : -1; // selected first
      // Alphabetical order by display name
      const aDisplay = String(a?.display || "").toLowerCase();
      const bDisplay = String(b?.display || "").toLowerCase();
      return aDisplay.localeCompare(bDisplay);
    });

    return (
      <div className={styles.filterContent}>
        {sortedValues.map((opt) => {
          const checked = opt.selected || opt.is_selected;
          const hex = `${(opt.value || "").toString().replace(/^#/, "")}`;
          return (
            <div
              key={opt.display}
              className={`${styles.colorOption} ${checked ? styles.selected : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleFilterClick(f, opt);
              }}
            >
              <div
                className={styles.colorSwatch}
                style={{ backgroundColor: `#${hex}` }}
              />
              <span className={styles.sortLabel}>{opt.display}</span>
            </div>
          );
        })}
      </div>
    );
  };
  const sortSelectedThenAlpha = (a, b) => {
    const aChecked = a.selected || a.is_selected;
    const bChecked = b.selected || b.is_selected;

    if (aChecked !== bChecked) return aChecked ? -1 : 1; // ✅ selected first
    return String(a.display || "")
      .toLowerCase()
      .localeCompare(String(b.display || "").toLowerCase());
  };

  const renderSizeOptions = (f) => {
    // Define order for letter sizes
    const LETTER_ORDER = [
      "XXS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "2XL",
      "XXXL",
      "3XL",
      "4XL",
      "5XL",
      "6XL",
      "7XL",
      "8XL",
      "9XL",
      "10XL",
    ];

    // Sort sizes within each group: selected first, then by proper sequence
    const sortedGroupedSizes = Object.keys(groupedSizes).reduce(
      (acc, group) => {
        if (groupedSizes[group]?.length > 0) {
          acc[group] = [...groupedSizes[group]].sort((a, b) => {
            const aChecked = a.selected || a.is_selected;
            const bChecked = b.selected || b.is_selected;
            if (aChecked !== bChecked) return bChecked ? 1 : -1; // selected first

            const aDisplay = String(a?.display || "").trim();
            const bDisplay = String(b?.display || "").trim();

            // Letter sizes: sort by predefined order
            if (group === "letter") {
              const aIndex = LETTER_ORDER.indexOf(aDisplay.toUpperCase());
              const bIndex = LETTER_ORDER.indexOf(bDisplay.toUpperCase());
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              return aDisplay.localeCompare(bDisplay);
            }

            // Numeric sizes: sort numerically
            if (group === "numeric") {
              const aNum = Number(aDisplay);
              const bNum = Number(bDisplay);
              if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
              return aDisplay.localeCompare(bDisplay);
            }

            // UK sizes: extract number and sort
            if (group === "uk") {
              const aMatch = aDisplay.toUpperCase().match(/UK[\s\-]?(\d+)/);
              const bMatch = bDisplay.toUpperCase().match(/UK[\s\-]?(\d+)/);
              if (aMatch && bMatch) {
                const aNum = Number(aMatch[1]);
                const bNum = Number(bMatch[1]);
                return aNum - bNum;
              }
              return aDisplay.localeCompare(bDisplay);
            }

            // Free and Custom: alphabetical
            return aDisplay.toLowerCase().localeCompare(bDisplay.toLowerCase());
          });
        }
        return acc;
      },
      {}
    );

    return (
      <div className={styles.filterContent}>
        {["letter", "numeric", "uk", "free", "custom"].map(
          (group) =>
            sortedGroupedSizes[group]?.length > 0 && (
              <div className={styles.sizeGroup} key={group}>
                {/* <div className={styles.sizeGroupLabel}>
                  {groupLabels[group]}
                </div> */}
                <div className={styles.sizeOptions}>
                  {sortedGroupedSizes[group].map((size) => {
                    const checked = size.selected || size.is_selected;
                    return (
                      <label
                        key={size.value ?? size.display}
                        className={styles.sizeOption}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            handleFilterClick(f, size);
                          }}
                          className={styles.checkboxContainer}
                        >
                          <Checkbox checked={checked} />
                          <span className={styles.sizeLabel}>
                            {size.display}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )
        )}
      </div>
    );
  };

  const renderSection = (f) => {
    const id = f.key?.name || f.key?.display || f.key || String(f.key);
    const hasSelection = f.values?.some((v) => v.selected || v.is_selected);

    // Section label (UPPERCASE with current selections like Size/Color)
    let headerText = (f.key?.display || f.key?.name || "").toUpperCase();
    if (!headerText) headerText = "FILTER";

    const selectedLabels = (f.values || [])
      .filter((v) => v.selected || v.is_selected)
      .map((v) => v.display)
      .join(", ");

    if (selectedLabels) headerText = `${headerText}: ${selectedLabels}`;

    const isExpanded = expandedId === id;

    // Render
    return (
      <div className={styles.filterSection} key={id}>
        <SectionHeader id={id} label={headerText} hasSelection={hasSelection} />
        {isExpanded &&
          (f === sizeFilter
            ? renderSizeOptions(f)
            : f === colorFilter
              ? renderColorOptions(f)
              : renderSimpleOptions(f))}
      </div>
    );
  };
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "80px" : "56px";

  // Render -------------------------------------------------------------------
  return (
    <>
      <div className={styles.dropdown}>
        <div
          className={styles.selectedSortWrapper}
          onClick={() => setSortOpen(true)}
        >
          <span className={styles.sortLabel}>Sort & Refine</span>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${sortOpen ? styles.isOpen : ""}`}
        onClick={() => setSortOpen(false)}
      />

      {/* Sort Panel */}
      <div
        className={`${styles.sortPanel} ${sortOpen ? styles.isOpen : ""}  
        `}
        style={{ top: topPosition }}
      >
        <div
          className={styles.sortContent}
          style={{ height: `calc(100vh - ${topPosition})` }}
        >
          <div className={styles.sortHeader}>
            <button className={styles.closeButton} onClick={closeSortOption}>
              CLOSE
            </button>
            <div className={styles.sortLabel}>
              <p className={styles.sortTitle}>{t("resource.facets.sort_by")}</p>
              <button className={styles.clearAll} onClick={clearAll}>
                Clear all
              </button>
            </div>
          </div>

          {/* Sort options */}
          <div className={styles.sortOptions}>
            {sortList?.map((sortType, index) => (
              <div
                key={sortType.value + index}
                className={styles.sortOption}
                onClick={() => updateSortOption(sortType.value)}
              >
                <div className={styles.checkboxContainer}>
                  {selectedSort === sortType.value ? (
                    <SvgWrapper
                      className={`${styles.radioIcon} ${styles.selected}`}
                      svgSrc="checkbox-selected"
                    />
                  ) : (
                    <SvgWrapper
                      svgSrc="checkbox"
                      className={`${styles.radioIcon}`}
                    />
                  )}
                </div>
                <span className={styles.sortLabel}>{sortType.name}</span>
              </div>
            ))}
          </div>

          {/* Dedicated Size + Color sections using the same dropdown UI */}
          {/* {sizeFilter && renderSection(sizeFilter)}
          {colorFilter && renderSection(colorFilter)} */}

          {/* Generic sections for ALL remaining filters using the SAME dropdown UI */}
          {filterSet.map((f) => renderSection(f))}
        </div>
      </div>
    </>
  );
}

export default Sort;
