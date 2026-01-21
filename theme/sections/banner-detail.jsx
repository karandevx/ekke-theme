import React from "react";
import styles from "../styles/sections/banner-detail.less";

export function Component({ props }) {
  const { heading, description } = props;

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerTitle}>{heading?.value}</div>

        <div className={styles.bannerDescription}>
          <div className={styles.bannerLineClamp}>{description?.value}</div>
        </div>
      </div>
    </div>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Banner Detail",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "<span>SUBTITLE</span>",
      info: "Add Heading of the sections",
    },
    {
      type: "textarea",
      id: "description",
      label: "Description",
      default: "",
      info: "Add description of the bsections",
    },
  ],
};

export default Component;
