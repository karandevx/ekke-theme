import React, { useMemo } from "react";
import useHeader from "../header/useHeader";
import styles from "./customer-experience.less";
import { FDKLink } from "fdk-core/components";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import { CustomerExperienceNavigation } from "../../helper/utils";

function CustomerExperience() {
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Safely read current path from window (works on client)
  const currentPathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Normalize a nav url to a pathname for comparison (handles absolute/relative)
  const toPathname = (url) => {
    if (!url) return "";
    try {
      // If absolute url
      if (/^https?:\/\//i.test(url)) return new URL(url).pathname || "";
      // If relative url
      return url.startsWith("/") ? url : `/${url}`;
    } catch {
      return url;
    }
  };

  const isActive = (url) => {
    let path = toPathname(url);
    if (!path) return false;
    return currentPathname === path;
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        position: "sticky",
        top: hasAnnouncementBar ? "80px" : "56px",
        zIndex: 11,
      }}
    >
      {CustomerExperienceNavigation.map((navItem, index) => {
        const active = isActive(navItem?.url);
        return (
          <div className={styles.list} key={index}>
            <FDKLink
              to={navItem?.url}
              className={`${styles.navigation} ${active ? styles.navigationActive : ""}`}
            >
              {navItem?.display?.toUpperCase()}
            </FDKLink>
          </div>
        );
      })}
    </div>
  );
}

export default CustomerExperience;
