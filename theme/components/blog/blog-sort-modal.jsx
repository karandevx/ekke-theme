import React, { useId, useMemo, useState } from "react";
import styles from "./styles/blog-sort-modal.less";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";
import { useViewport } from "../../helper/hooks";
import Modal from "../core/modal/modal";
import { useGlobalTranslation } from "fdk-core/utils";

function Section({
  title,
  items = [],
  selectedLookup,
  onClickItem,
  defaultOpen = false,
}) {
  if (!items.length) return null;

  const [open, setOpen] = useState(defaultOpen);
  const id = useId(); // creates unique ids for a11y

  // Compute selected items within this section
  const selectedInSection = useMemo(
    () => items.filter((tag) => !!selectedLookup?.[tag.display]),
    [items, selectedLookup]
  );

  // Build a friendly display title:
  // - if nothing selected: show the given title
  // - if selected: show up to 2 names, then “+N more”
  const displayTitle = useMemo(() => {
    if (!selectedInSection.length) return title;
    const names = selectedInSection
      .map((t) => t.displaytext || t.display)
      .filter(Boolean);
    const shown = names.slice(0, 1).join(", ");
    const moreCount = Math.max(0, names.length - 1);
    return moreCount
      ? `${title} : ${shown} +${moreCount} more`
      : `${title} : ${shown}`;
  }, [selectedInSection, title]);

  return (
    <div className={`${styles.section} ${open ? styles.sectionOpen : ""}`}>
      <button
        type="button"
        className={styles.sectionRow}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        aria-label={
          selectedInSection.length
            ? `Selected: ${displayTitle}`
            : `Open ${title} filters`
        }
      >
        <span className={styles.sectionRowTitle}>{displayTitle}</span>
        <span className={styles.sectionRowIcon}>
          <span className={styles.expandIcon}>{open ? "−" : "+"}</span>
        </span>
      </button>

      {open && (
        <div id={`${id}-panel`} className={styles.tags}>
          {items.map((tag) => {
            const isSelected = !!selectedLookup[tag.display];
            return (
              <button
                type="button"
                key={tag.key}
                className={`${styles.tagBtn} ${
                  isSelected ? styles.tagBtnSelected : ""
                }`}
                onClick={() => onClickItem(tag)}
                aria-pressed={isSelected}
                title={tag.display}
              >
                {tag.displaytext || tag.display}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BlogSortModal({
  isOpen,
  onClose,
  categoryTags = {},
  normalTags = {},
  authorTags = {},
  selected = [],
  onSelectTag,
  blogFilter,
  blogs,
  onReset,
}) {
  // convert selected array to O(1) lookup

  const { t } = useGlobalTranslation("translation");
  const selectedLookup = useMemo(() => {
    const map = {};
    selected.forEach((f) => (map[f.display] = true));
    return map;
  }, [selected]);

  const categoryItems = useMemo(
    () => Object.values(categoryTags || {}),
    [categoryTags]
  );
  const normalItems = useMemo(
    () => Object.values(normalTags || {}),
    [normalTags]
  );

  const seriesItems = useMemo(
    () => Object.values(authorTags || {}),
    [authorTags]
  );

  // Choose position based on viewport
  const isMobile = useViewport(0, 768); // assumes your hook returns true for <768
  const position = isMobile ? "bottom" : "right"; // ✅ right on desktop, bottom on mobile

  return (
    <Modal
      isOpen={isOpen}
      closeDialog={onClose}
      position={position} // ✅ correct prop name
      modalType="right-modal" // optional style modifier
      isCancelable={true}
      blogContainer={true}
    >
      <div className={styles.drawer}>
        <button
          className={styles.closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}> Sort by</div>
          <button className={styles.clearAll} onClick={() => onReset()}>
            ClearAll
          </button>
        </div>
        {/* </div> */}

        <div className={styles.body}>
          <Section
            title="Contributor"
            items={seriesItems}
            selectedLookup={selectedLookup}
            onClickItem={onSelectTag}
          />
          <Section
            title="Series"
            items={normalItems}
            selectedLookup={selectedLookup}
            onClickItem={onSelectTag}
          />
        </div>
        {blogFilter?.length > 0 && (
          <span className={styles.resultCount}>
            Show {blogs?.page?.item_total} items
          </span>
        )}
      </div>
    </Modal>
  );
}
