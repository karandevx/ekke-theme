import React, { useState, useEffect } from "react";
import styles from "./empty-state.less";
import { detectMobileWidth } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";

const EmptyState = ({
  title,
  description,
  btnLink = "/",
  btnTitle,
  iconSrc,
  Icon = <></>,
  showButton = true,
  showTitle = true,
  customClassName = "",
  customHeaderClass = "",
}) => {
  const { t } = useGlobalTranslation("translation");
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    setIsMobile(detectMobileWidth());
  }, []);
  return (
    <div className={`${styles.error} ${customClassName} fontBody`}>
      {showTitle && (
        <div
          className={
            "flex justify-center items-center font-archivo text-paragraph-1-sm font-normal w-96 my-5"
          }
        >
          {title || t("resource.common.no_data_found")}
        </div>
      )}
      {description && (
        <div
          className={`${styles.description} ${isMobile ? styles.b2 : styles.b1}`}
        >
          <p>{description}</p>
        </div>
      )}
      <SvgWrapper svgSrc="ekke-grey" className={styles.emptyStateIcon} />
      {showButton && (
        <FDKLink
          to={btnLink}
          className={
            "flex opacity-100 py-2 px-2 text-left  pl-2 bg-neutral-lightest border font-archivo text-[11px]  font-[400] text-ekke-black hover:bg-ekke-black  hover:text-white disabled:opacity-50 disabled:cursor-not-allowed  w-96 justify-start rounded-[1px] items-center max-h-8 flex-1 my-6"
          }
        >
          {btnTitle || t("resource.common.return_home")}
        </FDKLink>
      )}
    </div>
  );
};

export default EmptyState;
