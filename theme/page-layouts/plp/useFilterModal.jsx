import React, { useState } from "react";
import { useViewport } from "../../helper/hooks";

const useFilterModal = ({
  filters = [],
  resetFilters = () => {},
  handleFilterUpdate = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useViewport(0, 768); // Check if mobile viewport

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleApplyClick = () => {
    // Close modal when filters are applied (both mobile and desktop)
    closeModal();
  };

  const handleResetClick = () => {
    resetFilters();
    closeModal();
  };

  // In mobile, don't auto-close when filter is updated
  // Filters already support multiple selections via handleFilterUpdate
  const handleFilterUpdateWrapper = (filterData) => {
    handleFilterUpdate(filterData);
    // Don't auto-close in mobile - let user select multiple filters
    // Modal will only close when user clicks Apply or Close button
  };

  return {
    isOpen,
    filters,
    onCloseModalClick: closeModal,
    onResetBtnClick: handleResetClick,
    onApplyBtnClick: handleApplyClick,
    onFilterUpdate: handleFilterUpdateWrapper,
    openFilterModal: openModal,
  };
};

export default useFilterModal;
