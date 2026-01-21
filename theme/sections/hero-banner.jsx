import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/hero-banner.less";
import placeholderDesktop from "../assets/images/placeholder/hero-image-desktop.jpg";
import placeholderMobile from "../assets/images/placeholder/hero-image-mobile.jpg";
import Hotspot from "../components/hotspot/product-hotspot";
import { useWindowWidth } from "../helper/hooks";

export function Component({ props, globalConfig, blocks }) {
  const {
    button_link_1,
    button_link_2,
    desktop_banner,
    mobile_banner,
    overlay_option,
    padding_top,
    padding_bottom,
    banner_type,
    video_file,
    desktop_video,
    mobile_video,
    loop_video,
    button_text_1,
    button_text_2,
  } = props;

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 540;
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const videoRef = useRef(null);
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);

  useEffect(() => {
    const updateTooltipDimensions = () => {
      const tooltip = document.querySelector(
        `.${styles["application-banner-container"]} .${styles["tooltip-visible"]}`
      );
      if (tooltip) {
        const newHeight = tooltip.clientHeight - 20;
        const newWidth = tooltip.clientWidth;
        if (newHeight !== tooltipHeight) {
          setTooltipHeight(newHeight);
        }
        if (newWidth !== tooltipWidth) {
          setTooltipWidth(newWidth);
        }
      }
    };

    updateTooltipDimensions();
  }, [tooltipHeight, tooltipWidth]);

  useLayoutEffect(() => {
    const announcementBar = document.querySelector(".announcementBarBody");
    setHasAnnouncementBar(!!announcementBar);
  }, []);

  // Calculate dynamic height based on announcement bar presence
  const dynamicHeight = hasAnnouncementBar
    ? "calc(100vh - 80px)"
    : "calc(100vh - 56px)";

  const getMobileUrl = mobile_banner?.value || placeholderMobile;
  const getDesktopUrl = desktop_banner?.value || placeholderDesktop;
  const bannerType = banner_type?.value || "image";

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [
        { breakpoint: { min: 481 } },
        { breakpoint: { max: 480 }, url: getMobileUrl },
      ];
    }
    return [
      { breakpoint: { min: 1728 }, width: 3564 },
      { breakpoint: { min: 1512 }, width: 3132 },
      { breakpoint: { min: 1296 }, width: 2700 },
      { breakpoint: { min: 1080 }, width: 2250 },
      { breakpoint: { min: 900 }, width: 1890 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { max: 180 }, width: 450, url: getMobileUrl },
      { breakpoint: { max: 360 }, width: 810, url: getMobileUrl },
      { breakpoint: { max: 540 }, width: 1170, url: getMobileUrl },
    ];
  };

  const dynamicBoxStyle = (block) => {
    return {
      "--x_position": `${block?.props?.x_position?.value || 0}%`,
      "--y_position": `${block?.props?.y_position?.value || 0}%`,
      "--box_width": `${block?.props?.box_width?.value || 0}%`,
      "--box_height": `${block?.props?.box_height?.value || 0}%`,
      "--tooltip-height": `${tooltipHeight}px`,
      "--tooltip-width": `${tooltipWidth}px`,
      "--x_offset": `-${block.props?.x_position?.value || 0}%`,
      "--y_offset": `-${block.props?.y_position?.value || 0}%`,
    };
  };

  const displayOverlay =
    !!overlay_option?.value && overlay_option.value !== "no_overlay";

  const getOverlayColor =
    overlay_option?.value === "black_overlay" ? "#000" : "#fff";

  const getHotspots = () => {
    return {
      desktop: blocks?.filter((block) => block?.type === "hotspot_desktop"),
      mobile: blocks?.filter((block) => block?.type === "hotspot_mobile"),
    };
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  const getVideoUrl = () => {
    if (isMobile && mobile_video?.value) {
      return mobile_video.value;
    }
    if (!isMobile && desktop_video?.value) {
      return desktop_video.value;
    }
    // Fallback to legacy video_file prop
    return video_file?.value;
  };

  const renderVideoBanner = () => {
    const videoUrl = getVideoUrl();
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {videoUrl && (
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            autoPlay
            muted
            loop={loop_video?.value}
            playsInline
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play();
              }
            }}
            src={videoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <section style={dynamicStyles}>
        <div className={styles.heroImageContainer}>
          {bannerType === "video" ? (
            renderVideoBanner()
          ) : (
            <FyImage
              src={getDesktopUrl}
              sources={getImgSrcSet()}
              showOverlay={displayOverlay}
              overlayColor={getOverlayColor}
              defer={false}
              isFixedAspectRatio={false}
            />
          )}

          {!isMobile &&
            getHotspots()?.desktop?.map((hotspot, index) => {
              return hotspot?.props?.pointer_type?.value !== "box" ? (
                <Hotspot
                  className={styles["hotspot--desktop"]}
                  key={index}
                  hotspot={hotspot}
                  product={{
                    hotspot_description: hotspot?.props?.hotspot_header?.value,
                    media: [
                      {
                        type: "image",
                        url: hotspot?.props?.hotspot_image?.value,
                      },
                    ],
                    name: hotspot?.props?.hotspot_description?.value,
                  }}
                  hotspot_link_text={hotspot?.props?.hotspot_link_text?.value}
                  redirect_link={hotspot?.props?.redirect_link?.value}
                />
              ) : (
                <FDKLink
                  to={hotspot?.props?.redirect_link?.value}
                  target="_self"
                >
                  <div
                    className={`
                          ${styles["box-wrapper"]}
                          ${hotspot?.props?.edit_visible?.value ? `${styles["box-wrapper-visible"]}` : ""}
                        `}
                    style={dynamicBoxStyle(hotspot)}
                  ></div>
                </FDKLink>
              );
            })}
          {isMobile &&
            getHotspots()?.mobile?.map((hotspot, index) => {
              return hotspot?.props?.pointer_type?.value !== "box" ? (
                <Hotspot
                  className={styles["hotspot--mobile"]}
                  key={index}
                  hotspot={hotspot}
                  product={{
                    hotspot_description: hotspot?.props?.hotspot_header?.value,
                    media: [
                      {
                        type: "image",
                        url: hotspot?.props?.hotspot_image?.value,
                      },
                    ],
                    name: hotspot?.props?.hotspot_description?.value,
                  }}
                  hotspot_link_text={hotspot?.props?.hotspot_link_text?.value}
                  redirect_link={hotspot?.props?.redirect_link?.value}
                />
              ) : (
                <FDKLink to={hotspot?.props?.redirect_link?.value}>
                  <div
                    className={`
                          ${styles["box-wrapper"]}
                          ${hotspot?.props?.edit_visible?.value ? `${styles["box-wrapper-visible"]}` : ""}
                        `}
                    style={dynamicBoxStyle(hotspot)}
                  ></div>
                </FDKLink>
              );
            })}
        </div>
        {/* Sticky buttons that stay fixed on the page */}
        {button_text_1.value ||
          (button_text_2.value && (
            <div className={styles.stickyButtonsContainer}>
              {button_text_1.value && (
                <FDKLink to={button_link_1.value}>
                  <button
                    type="button"
                    className={`fx-button ${styles.stickyButton} ${styles.stickyButton1}`}
                  >
                    {button_text_1.value}
                  </button>
                </FDKLink>
              )}

              {button_text_2.value && (
                <FDKLink to={button_link_2.value}>
                  <button
                    type="button"
                    className={`fx-button ${styles.stickyButton} ${styles.stickyButton2}`}
                  >
                    {button_text_2.value}
                  </button>
                </FDKLink>
              )}
            </div>
          ))}
      </section>
    </>
  );
}

export const settings = {
  label: "Hero Banner",
  props: [
    {
      id: "banner_type",
      type: "select",
      options: [
        {
          value: "image",
          text: "Image Banner",
        },
        {
          value: "video",
          text: "Video Banner",
        },
      ],
      default: "image",
      label: "Banner Type",
      info: "Choose between image or video banner",
    },
    {
      id: "overlay_option",
      type: "select",
      options: [
        {
          value: "no_overlay",
          text: "t:resource.sections.hero_image.no_overlay",
        },
        {
          value: "white_overlay",
          text: "t:resource.sections.hero_image.white_overlay",
        },
        {
          value: "black_overlay",
          text: "t:resource.sections.hero_image.black_overlay",
        },
      ],
      default: "no_overlay",
      label: "t:resource.sections.hero_image.overlay_option",
      info: "t:resource.sections.hero_image.image_overlay_opacity",
      conditional: {
        key: "banner_type",
        value: "image",
      },
    },
    {
      id: "desktop_banner",
      type: "image_picker",
      label: "t:resource.sections.hero_image.desktop_banner",
      default: "",
      options: {
        aspect_ratio: "16:9",
      },
      conditional: {
        key: "banner_type",
        value: "image",
      },
    },
    {
      id: "mobile_banner",
      type: "image_picker",
      label: "t:resource.sections.hero_image.mobile_tablet_banner",
      default: "",
      options: {
        aspect_ratio: "9:16",
      },
      conditional: {
        key: "banner_type",
        value: "image",
      },
    },
    {
      type: "video",
      id: "video_file",
      label: "Video File (Legacy)",
      default: "",
      info: "Fallback video if desktop/mobile videos are not set",
      conditional: {
        key: "banner_type",
        value: "video",
      },
    },
    {
      type: "video",
      id: "desktop_video",
      label: "Desktop Video",
      default: "",
      info: "Video for desktop devices (MP4 recommended)",
      options: {
        fileTypes: ["mp4"],
      },
      conditional: {
        key: "banner_type",
        value: "video",
      },
    },
    {
      type: "video",
      id: "mobile_video",
      label: "Mobile Video",
      default: "",
      info: "Upload video file (MP4 recommended) - will autoplay",
      options: {
        fileTypes: ["mp4"],
      },
      conditional: {
        key: "banner_type",
        value: "video",
      },
    },
    {
      type: "checkbox",
      id: "loop_video",
      label: "Loop Video",
      default: true,
      info: "Continuously repeat video",
      conditional: {
        key: "banner_type",
        value: "video",
      },
    },
    {
      type: "text",
      id: "button_text_1",
      default: "",
      label: "Button 1 Text",
      info: "First sticky button text",
    },
    {
      type: "url",
      id: "button_link_1",
      default: "",
      label: "Button 1 Link",
      info: "First sticky button link",
    },
    {
      type: "text",
      id: "button_text_2",
      default: "",
      label: "Button 2 Text",
      info: "Second sticky button text",
    },
    {
      type: "url",
      id: "button_link_2",
      default: "",
      label: "Button 2 Link",
      info: "Second sticky button link",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Section Top Padding",
      default: 0,
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Section Bottom Padding",
      default: 16,
    },
  ],
  blocks: [
    {
      type: "hotspot_desktop",
      name: "t:resource.common.hotspot_desktop",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "t:resource.common.pointer_type",
          options: [
            {
              value: "box",
              text: "t:resource.common.box",
            },
            {
              value: "pointer",
              text: "t:resource.common.pointer",
            },
          ],
          default: "box",
        },
        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "t:resource.common.show_clickable_area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.vertical_position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          placeholder: "t:resource.common.description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.common.redirect_link",
        },
      ],
    },
    {
      type: "hotspot_mobile",
      name: "t:resource.common.hotspot_mobile",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "t:resource.common.pointer_type",
          options: [
            {
              value: "box",
              text: "t:resource.common.box",
            },
            {
              value: "pointer",
              text: "t:resource.common.pointer",
            },
          ],
          default: "box",
        },
        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "t:resource.common.show_clickable_area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.vertical_position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          placeholder: "t:resource.common.description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.common.redirect_link",
        },
      ],
    },
  ],
};

export default Component;
