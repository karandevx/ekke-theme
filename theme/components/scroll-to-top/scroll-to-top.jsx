import React, { useState, useEffect } from "react";
import styles from "./scroll-to-top.less";
import { isRunningOnClient } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";


const ScrollToTop = () => {
  const { t } = useGlobalTranslation("translation");
  const [isToTopActive, setIsToTopActive] = useState(false);

  useEffect(() => {
    if (isRunningOnClient()) {
      const handleScroll = () => {
        setIsToTopActive(window.scrollY > 200);
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    window?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };
  return (
    isToTopActive && (
      <button
        type="button"
        className={styles["back-top"]}
        onClick={scrollToTop}
      >
        <SvgWrapper svgSrc="ScrollTopIcon" />
      </button>
    )
  );
};

export default ScrollToTop;
