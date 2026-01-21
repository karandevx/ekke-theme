import React, { useState } from "react";
import MinusIcon from "../../../assets/images/minus.svg";
import AddIcon from "../../../assets/images/add.svg";
import { cn } from "../../../helper/utils";

function FyAccordion({
  isOpen: initialIsOpen,
  children,
  index,
  totalLength = 0,
  onToggle, // Add this line
  containerClassName,
  buttonClassName,
  iconClassName,
  contentClassName,
  containerStyles = {},
  hideIcon = false, // Add hideIcon prop
}) {
  const [isOpenState, setIsOpenState] = useState(initialIsOpen);

  const toggleAccordion = () => {
    if (onToggle) {
      // If onToggle is provided, call it (external state management)
      onToggle();
    } else {
      // Otherwise, use internal state
      setIsOpenState(!isOpenState);
    }
  };

  // Use external isOpen if provided, otherwise use internal state
  const isOpen = initialIsOpen !== undefined ? initialIsOpen : isOpenState;

  return (
    <div
      className={cn("w-full overflow-hidden md:w-full", containerClassName)}
      style={containerStyles}
    >
      <button
        type="button"
        className={cn(
          "flex items-center justify-between cursor-pointer w-full",
          buttonClassName
        )}
        onClick={toggleAccordion}
      >
        <div>{children[0]}</div>
        {!hideIcon && (
          <div className={cn("", iconClassName)}>
            <span className="text-black font-normal text-[11px]">
              {isOpen ? "−" : "+"}
            </span>
          </div>
        )}
      </button>
      <div
        className={cn("", contentClassName)}
        style={{ display: isOpen ? "block" : "none" }}
      >
        {children[1]}
      </div>
    </div>
  );
}

export default FyAccordion;
