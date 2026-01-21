import React, { useEffect, useRef } from "react";
import styles from "./modal.less";
import { cn } from "../../../helper/utils";
import useCheckAnnouncementBar from "../../../helper/hooks/useCheckAnnouncementBar";

function Modal({
  isOpen,
  isCancelable = true,
  childHandleFocus = false,
  modalType = "",
  closeDialog,
  children,
  // postion = "right",
  position = "center", // ✅ rename
  containerStyle,
  blogContainer = false,
}) {
  const modalRef = useRef(null);
  const modalContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !childHandleFocus && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen, childHandleFocus]);

  useEffect(() => {
    if (!isCancelable || !closeDialog) return;
    
    const handleClickOutside = (event) => {
      if (
        modalContainerRef.current &&
        !modalContainerRef.current.contains(event.target)
      ) {
        closeDialog();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDialog, isCancelable]);

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "80px" : "56px";

  return (
    isOpen && (
      <div
        role="button"
        className={`${styles.modal} ${styles[modalType]} ${styles[position]}`} // ✅ uses the correct prop
        ref={modalRef}
        tabIndex="0"
        onKeyDown={(e) => e.key === "Escape" && isCancelable && closeDialog()}
        style={{ 
          top: topPosition,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div
          className={cn(styles.modalContainer, containerStyle)}
          ref={modalContainerRef}
          style={blogContainer ? { padding: "24px 12px" } : {}}
        >
          {children}
        </div>
      </div>
    )
  );
}

export default Modal;
