import React, { useEffect, useState, useCallback } from "react";
import styles from "./filter-modal.less";
import { useViewport } from "../../helper/hooks";

import FilterItem from "../../page-layouts/plp/Components/filter-item/filter-item";
import Modal from "../core/modal/modal";

function FilterModal({
  isOpen = true,
  filters = [],
  onCloseModalClick = () => {},
  onFilterUpdate = () => {},
}) {
  const [isClosing, setIsClosing] = useState(false);
  const isMobile = useViewport(0, 768); // Check if mobile viewport

  // smooth close animation before unmount
  const handleClose = useCallback(() => {
    setIsClosing(true);
    const t = setTimeout(() => {
      onCloseModalClick?.();
      setIsClosing(false);
    }, 300);
    return () => clearTimeout(t);
  }, [onCloseModalClick]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      modalType="right-modal"
      // <- new style hook added below
      position="bottom" // <- slide in from left
      isCancelable={!isMobile} // Don't allow outside click to close in mobile
      closeDialog={isMobile ? undefined : handleClose} // Don't auto-close in mobile
      containerStyle={`${styles.filterModalContainer} ${isClosing ? styles.closing : ""}`}
    >
      {/* Optional: header (kept minimal, feel free to remove if not needed) */}
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>Filters</div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close Filters"
        >
          <div className={styles.closeIcon}>close</div>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className={styles.modalContentWrapper}>
        <div className={styles.modalContent} tabIndex={0}>
          {filters.slice(0, 6).map((filter, idx) => (
            <FilterItem
              key={`${filter.key?.display ?? "filter"}-${idx}`}
              filter={filter}
              allFilters={filters}
              onFilterUpdate={onFilterUpdate}
              isMobileView={true}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default FilterModal;
