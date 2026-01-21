import React, { useEffect, useState } from "react";

const useCheckAnnouncementBar = () => {
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);
  useEffect(() => {
    // Function to check for announcement bar
    const checkAnnouncementBar = () => {
      const announcementBar = document.querySelector(".announcementBarBody");
      const exists = !!announcementBar;
      setHasAnnouncementBar(exists);
      return exists;
    };

    // Initial check
    const initialCheck = checkAnnouncementBar();

    // If not found initially, set up observer and fallback
    if (!initialCheck) {
      let isCleanedUp = false;

      // Fallback: Check again after a short delay
      const timeoutId = setTimeout(() => {
        if (!isCleanedUp) {
          checkAnnouncementBar();
        }
      }, 100);

      // MutationObserver to detect when announcement bar is added to DOM
      const observer = new MutationObserver(() => {
        if (checkAnnouncementBar()) {
          observer.disconnect();
          isCleanedUp = true;
        }
      });

      // Observe the body for child additions
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Maximum wait time: Stop observing after 2 seconds if not found
      const maxWaitTimeout = setTimeout(() => {
        if (!isCleanedUp) {
          observer.disconnect();
          isCleanedUp = true;
          // Announcement bar doesn't exist, keep hasAnnouncementBar as false
        }
      }, 2000);

      // Cleanup
      return () => {
        isCleanedUp = true;
        clearTimeout(timeoutId);
        clearTimeout(maxWaitTimeout);
        observer.disconnect();
      };
    }
  }, []);

  return {
    hasAnnouncementBar,
    setHasAnnouncementBar,
  };
};

export default useCheckAnnouncementBar;
