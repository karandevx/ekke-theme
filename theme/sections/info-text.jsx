import React from "react";
import styles from "../styles/sections/info-text.less";

export function Component({ props, globalConfig }) {
  const { subtitle, content, text_alignment, background_color, text_color } =
    props;

  // Don't render if no content
  if (!content?.value) {
    return null;
  }

  const sectionStyles = {
    backgroundColor: background_color?.value || "transparent",
    textAlign: text_alignment?.value || "left",
    color: text_color?.value || "#000",
  };

  return (
    <section className={styles.infoTextSection} style={sectionStyles}>
      <div className={styles.container}>
        {subtitle?.value && (
          <div className={styles.subtitleWrapper}>
            {subtitle.type === "code" ? (
              <div
                className={styles.subtitle}
                dangerouslySetInnerHTML={{ __html: subtitle.value }}
              />
            ) : (
              <span className={styles.subtitle}>{subtitle.value}</span>
            )}
          </div>
        )}

        <div className={`${styles.contentWrapper} subheading-2`}>
          {content.type === "code" ? (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: content.value }}
            />
          ) : (
            <p className={styles.content}>{content.value}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Info Text",
  props: [
    {
      type: "code",
      id: "subtitle",
      label: "Subtitle (HTML)",
      default: "<span>SUBTITLE</span>",
      info: "Add your custom HTML code for subtitle. You can use the full screen icon to open a code editor and add your code",
    },
    {
      type: "code",
      id: "content",
      label: "Content (HTML)",
      default:
        "<p>The collections are defined by Jonny Johansson's signature juxtaposing design and attention to detail, with an emphasis on tailoring and an eclectic use of materials and custom-developed fabrics.</p>",
      info: "Add your custom HTML code for main content. You can use the full screen icon to open a code editor and add your code",
    },{
      type:"text",
      id:"title",
      label:"Title",
      default:"INFO TEXT",
      info:"Title for the info text section"
    },
    {
      type: "textarea",
      id: "description",
      label: "Description",
      default:
        "The collections are defined by Jonny Johansson's signature juxtaposing design and attention to detail, with an emphasis on tailoring and an eclectic use of materials and custom-developed fabrics.",
      info: "Description for the info text section",
    },
    {
      type: "select",
      id: "text_alignment",
      label: "Text Alignment",
      default: "center",
      options: [
        { value: "left", text: "Left" },
        { value: "center", text: "Center" },
        { value: "right", text: "Right" },
      ],
      info: "Text alignment for the content",
    },
    {
      type: "color",
      id: "background_color",
      label: "Background Color",
      default: "#f5f5f5",
      info: "Background color for the section",
    },
    {
      type: "color",
      id: "text_color",
      label: "Default Text Color",
      default: "#000000",
      info: "Default text color (can be overridden by inline styles)",
    },
  ],
};

export default Component;
