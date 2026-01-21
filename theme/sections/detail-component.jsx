import React from "react";
import styles from "../styles/sections/detail-section.less";

export function Component({ props, globalConfig }) {
  const { subtitle, content, background_color } = props;

  // Don't render if no content
  if (!content?.value) {
    return null;
  }

  const sectionStyles = {
    backgroundColor: background_color?.value || "transparent",
  };

  return (
    <section className={styles.infoTextSection} style={sectionStyles}>
      <div className={styles.container}>
        {subtitle?.value && (
          <div className={styles.subtitleWrapper}>
            <span className={styles.subtitle}>{subtitle.value}</span>
          </div>
        )}

        <div className={`${styles.contentWrapper} `}>
          <p className={styles.content}>{content.value}</p>
        </div>
      </div>
    </section>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Detail section",
  props: [
    {
      type: "text",
      id: "subtitle",
      label: "Subtitle (HTML)",
      default: "",
      info: "Header",
    },
    {
      type: "textarea",
      id: "content",
      label: "Content",
      default: "",
      info: "Content",
    },
    {
      type: "color",
      id: "background_color",
      label: "Background Color",
      default: "#f5f5f5",
      info: "Background color for the section",
    },
  ],
};

export default Component;
