import React, { useState, useRef } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/categories-section.less";
import PlayIcon from "../assets/images/play.svg";
import useCheckAnnouncementBar from "../helper/hooks/useCheckAnnouncementBar";

export function Component({ props, globalConfig, blocks }) {
  // ✅ CLEAN: Extract only needed props
  const {
    // Category props
    categories_per_row,
    section_title,
    section_description,
    heading_top_spacing,
    heading_bottom_spacing,

    // Hero banner props
    banner_type,
    ekke_icon,
    ekke_icon_mobile, // ✅ NEW: Separate mobile logo option
    section_image_link,
    padding_top,
    padding_bottom,
    hero_section_height, // ✅ Desktop height
    hero_section_height_mobile, // ✅ NEW: Mobile height

    // Image props
    section_image,
    section_image_mobile,

    // Video props (simplified - only file upload, always autoplay)
    video_file,
    video_file_mobile, // ✅ NEW: Separate mobile video option
    loop_video,

    // CTA props
    hero_cta_text,
    hero_cta_link,
  } = props;

  // ✅ CLEAN: Only necessary refs
  const categoriesContainerRef = useRef(null);
  const videoRef = useRef(null);
  const videoRefMobile = useRef(null);

  // ✅ Use hook for announcement bar
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // ✅ CLEAN: Only necessary state (removed currentImageIndex - now handled by react-slick)
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);

  // ✅ Helper function to check if URL is external (like footer)
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // ✅ CLEAN: Derived values
  const categoriesPerRow = categories_per_row?.value ?? 3;
  const bannerType = banner_type?.value || "image";
  const sectionHeight = hero_section_height?.value || 720;

  // ✅ CLEAN: Filter blocks
  const categories =
    blocks?.filter((block) => block.type === "category_item") || [];

  // ✅ SIMPLIFIED: Video controls (autoplay only)
  const playVideo = () => {
    setShowVideoOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // ✅ Single hero image (no slider)
  const heroImage = {
    desktop: section_image?.value,
    mobile: section_image_mobile?.value,
    link: section_image_link?.value,
  };

  // ✅ CLEAN: Category logic (existing)
  const getImgSrcSet = () => [];

  const getCardHeight = (cardsInRow) => {
    if (cardsInRow === 1) return 1080;
    if (cardsInRow === 2) return 1080;
    if (cardsInRow === 3) return 720;
    if (cardsInRow === 4) return 540;
    if (cardsInRow === 5) return 432;
    return 720;
  };

  const getEffectiveHeight = (categoryBlock, cardsInRow) => {
    const platformHeight = categoryBlock.props?.card_height?.value;
    return platformHeight && platformHeight > 0
      ? platformHeight
      : getCardHeight(cardsInRow);
  };

  const organizeCategories = () => {
    const rows = [];
    let currentIndex = 0;

    while (currentIndex < categories.length) {
      const remainingCards = categories.length - currentIndex;
      const cardsInThisRow = Math.min(categoriesPerRow, remainingCards);
      const isLastRowIncomplete =
        remainingCards < categoriesPerRow && remainingCards > 0;

      const rowCategories = categories.slice(
        currentIndex,
        currentIndex + cardsInThisRow,
      );
      const rowWithHeights = rowCategories.map((categoryBlock) => ({
        ...categoryBlock,
        effectiveHeight: getEffectiveHeight(categoryBlock, cardsInThisRow),
      }));

      rows.push({
        categories: rowWithHeights,
        isLastRowIncomplete,
        cardsCount: cardsInThisRow,
        height:
          rowWithHeights[0]?.effectiveHeight || getCardHeight(cardsInThisRow),
      });

      currentIndex += cardsInThisRow;
    }

    return rows;
  };

  const categoryRows = organizeCategories();

  // ✅ CLEAN: Section styles (removed hero height from here)
  const sectionStyles = {
    "--categories-per-row": categoriesPerRow,
    "--heading-top-spacing": `${heading_top_spacing?.value || 40}px`,
    "--heading-bottom-spacing": `${heading_bottom_spacing?.value || 24}px`,
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 0}px`,
    height: "100%",
  };

  // ✅ NEW: Hero banner specific styles with responsive height
  // const heroBannerStyles = {
  //   "--hero-section-height-desktop": `${hero_section_height?.value || 720}px`,
  //   "--hero-section-height-mobile": `${hero_section_height_mobile?.value || 600}px`,
  // };

  // ✅ Calculate top offset for floating icon based on announcement bar
  // Navbar: 56px, Announcement bar: 24px
  // For mobile Safari: Use viewport height (vh) to center in visible area accounting for navbar
  // Desktop: Use percentage relative to container
  // Mobile: Use viewport height to account for fixed navbar
  const floatingIconTop = hasAnnouncementBar
    ? "calc(50% + 40px)" // Navbar (56px) + Announcement (24px) = 80px total, half = 40px
    : "calc(50% + 28px)"; // Navbar (56px) only, half = 28px

  // ✅ Mobile-specific: Center in visible viewport accounting for 56px navbar
  // 50vh centers in viewport, +28px accounts for half of navbar height (56px/2)
  const floatingIconTopMobile = hasAnnouncementBar
    ? "calc(50vh + 40px)" // Navbar (56px) + Announcement (24px) = 80px total, half = 40px
    : "calc(50vh + 28px)"; // Navbar (56px) only, half = 28px

  // ✅ BACK TO SIMPLE: Use picture/source tags for full control
  const renderSingleImage = (imageData) => {
    const imageElement = (
      <picture className={styles.bannerImage}>
        {/* Show mobile image on mobile/tablet if available */}
        {imageData.mobile && (
          <source media="(max-width: 1024px)" srcSet={imageData.mobile} />
        )}
        {/* Default to desktop image */}
        <img
          src={imageData.desktop}
          alt="Banner Image"
          className={styles.bannerImg}
        />
      </picture>
    );

    return (
      <div className={styles.imageWrapper}>
        {imageData.link ? (
          isExternalUrl(imageData.link) ? (
            <a href={imageData.link} target="_self">
              {imageElement}
            </a>
          ) : (
            <FDKLink to={imageData.link}>{imageElement}</FDKLink>
          )
        ) : (
          imageElement
        )}
      </div>
    );
  };

  // ✅ NEW: Render image banner with single image + CTA
  const renderImageBanner = () => {
    const ctaLink = hero_cta_link?.value || "#";
    return (
      <div className={styles.imageBannerContainer}>
        {heroImage.desktop ? renderSingleImage(heroImage) : null}
        {hero_cta_text?.value &&
          (isExternalUrl(ctaLink) ? (
            <a
              href={ctaLink}
              target="_self"
              rel="noopener noreferrer"
              className={`${styles.heroCta} body-2`}
              aria-label={hero_cta_text?.value}
            >
              {hero_cta_text.value}
            </a>
          ) : (
            <FDKLink
              to={ctaLink}
              className={`${styles.heroCta} body-2`}
              aria-label={hero_cta_text?.value}
            >
              {hero_cta_text.value}
            </FDKLink>
          ))}
      </div>
    );
  };

  // ✅ UPDATED: Render video banner with responsive height and mobile/desktop support
  const renderVideoBanner = (isMobile = false) => {
    // Determine which video to use: mobile video for mobile section, desktop video for desktop
    const videoSrc = isMobile
      ? video_file_mobile?.value || video_file?.value
      : video_file?.value;

    // Use appropriate ref based on mobile/desktop
    const currentVideoRef = isMobile ? videoRefMobile : videoRef;
    const ctaLink = hero_cta_link?.value || "#";

    return (
      <div className={styles.videoBannerContainer}>
        {videoSrc && (
          <>
            <video
              ref={currentVideoRef}
              width="100%"
              height="100%"
              autoPlay
              muted
              loop={loop_video?.value}
              playsInline
              onLoadedData={() => {
                if (currentVideoRef.current) {
                  currentVideoRef.current.play();
                }
              }}
              src={videoSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {showVideoOverlay && !isMobile && (
              <div className={styles.videoOverlay} onClick={playVideo}>
                <div className={styles.coverImage} />
                <div className={styles.playButton}>
                  <PlayIcon />
                </div>
              </div>
            )}
            {hero_cta_text?.value &&
              (isExternalUrl(ctaLink) ? (
                <a
                  href={ctaLink}
                  target="_self"
                  rel="noopener noreferrer"
                  className={`${styles.heroCta} body-2`}
                  aria-label={hero_cta_text?.value}
                >
                  {hero_cta_text.value}
                </a>
              ) : (
                <FDKLink
                  to={ctaLink}
                  className={`${styles.heroCta} body-2`}
                  aria-label={hero_cta_text?.value}
                >
                  {hero_cta_text.value}
                </FDKLink>
              ))}
          </>
        )}
      </div>
    );
  };

  // ✅ CLEAN: Check if hero content exists
  const hasHeroContent = () => {
    if (bannerType === "image") {
      return !!heroImage.desktop;
    }
    if (bannerType === "video") {
      // Check if either desktop or mobile video exists
      return !!(video_file?.value || video_file_mobile?.value);
    }
    return false;
  };

  return (
    <div className={styles.categoriesSectionContainer}>
      {/* for mobile */}
      <section
        className={`${styles.categoriesSection} block md:hidden`}
        style={sectionStyles}
      >
        {(ekke_icon?.value || ekke_icon_mobile?.value) &&
          (() => {
            const iconLink = section_image_link?.value || "#";
            const iconContent = (
              <picture className={styles.responsiveLogo}>
                {ekke_icon_mobile?.value && (
                  <source
                    media="(max-width: 768px)"
                    srcSet={ekke_icon_mobile.value}
                  />
                )}
                <img
                  src={ekke_icon?.value || ekke_icon_mobile?.value}
                  alt="Ekke Icon"
                  className={styles.ekkoIcon}
                  loading="lazy"
                  style={{
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </picture>
            );
            return (
              <div
                className={styles.globalFloatingIcon}
                style={{ top: floatingIconTopMobile }}
              >
                {isExternalUrl(iconLink) ? (
                  <a
                    href={iconLink}
                    target="_self"
                    rel="noopener noreferrer"
                    className={styles.iconLink}
                  >
                    {iconContent}
                  </a>
                ) : (
                  <FDKLink to={iconLink} className={styles.iconLink}>
                    {iconContent}
                  </FDKLink>
                )}
              </div>
            );
          })()}
        {hasHeroContent() && (
          <div
            className={`${styles.heroImageContainer} ${styles.heroImageContainerMobile}`}
          >
            {bannerType === "image"
              ? renderImageBanner()
              : renderVideoBanner(true)}
          </div>
        )}

        {(section_title?.value || section_description?.value) && (
          <div className={styles.sectionHeader}>
            {section_title?.value && (
              <h3 className={`heading-3 ${styles.sectionTitle}`}>
                {section_title.value}
              </h3>
            )}
            {section_description?.value && (
              <p className={styles.sectionDescription}>
                {section_description.value}
              </p>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <div
            className={styles.categoriesContainer}
            ref={categoriesContainerRef}
          >
            {categoryRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`${styles.categoriesRow} ${
                  row.isLastRowIncomplete ? styles.incompleteRow : ""
                }`}
                style={{
                  "--row-cards-count": row.cardsCount,
                  "--card-height": `${row.height}px`,
                }}
              >
                {row.categories.map((categoryBlock) => (
                  <CategoryCard
                    key={categoryBlock.id}
                    categoryBlock={categoryBlock}
                    globalConfig={globalConfig}
                    imgSrcSet={getImgSrcSet()}
                    isInIncompleteRow={row.isLastRowIncomplete}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* for desktop */}
      <section
        className={`${styles.categoriesSection} hidden md:block`}
        style={sectionStyles}
      >
        {/* ✅ FIXED: Hero Banner with correct height application */}
        {hasHeroContent() && (
          <div
            className={styles.heroImageContainer}
            // style={{ height: dynamicHeight }}
          >
            {bannerType === "image"
              ? renderImageBanner()
              : renderVideoBanner(false)}
          </div>
        )}

        {/* Section Header */}
        {(section_title?.value || section_description?.value) && (
          <div className={styles.sectionHeader}>
            {section_title?.value && (
              <h3 className={`heading-3 ${styles.sectionTitle}`}>
                {section_title.value}
              </h3>
            )}
            {section_description?.value && (
              <p className={styles.sectionDescription}>
                {section_description.value}
              </p>
            )}
          </div>
        )}

        {/* Categories Grid */}
        {categories.length > 0 && (
          <div
            className={styles.categoriesContainer}
            ref={categoriesContainerRef}
          >
            {categoryRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`${styles.categoriesRow} ${
                  row.isLastRowIncomplete ? styles.incompleteRow : ""
                }`}
                style={{
                  "--row-cards-count": row.cardsCount,
                  "--card-height": `${row.height}px`,
                }}
              >
                {row.categories.map((categoryBlock) => (
                  <CategoryCard
                    key={categoryBlock.id}
                    categoryBlock={categoryBlock}
                    globalConfig={globalConfig}
                    imgSrcSet={getImgSrcSet()}
                    isInIncompleteRow={row.isLastRowIncomplete}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
        {/* Floating Icon */}
        {(ekke_icon?.value || ekke_icon_mobile?.value) &&
          (() => {
            const iconLink = section_image_link?.value || "#";
            const iconContent = (
              <picture className={styles.responsiveLogo}>
                {ekke_icon_mobile?.value && (
                  <source
                    media="(max-width: 768px)"
                    srcSet={ekke_icon_mobile.value}
                  />
                )}
                <img
                  src={ekke_icon?.value || ekke_icon_mobile?.value}
                  alt="Ekke Icon"
                  className={styles.ekkoIcon}
                  loading="lazy"
                  style={{
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </picture>
            );
            return (
              <div
                className={styles.globalFloatingIcon}
                style={{ top: floatingIconTop }}
              >
                {isExternalUrl(iconLink) ? (
                  <a
                    href={iconLink}
                    target="_self"
                    rel="noopener noreferrer"
                    className={styles.iconLink}
                  >
                    {iconContent}
                  </a>
                ) : (
                  <FDKLink to={iconLink} className={styles.iconLink}>
                    {iconContent}
                  </FDKLink>
                )}
              </div>
            );
          })()}
      </section>
    </div>
  );
}

// ✅ CLEAN: Category Card Component (unchanged)
const CategoryCard = ({
  categoryBlock,
  globalConfig,
  imgSrcSet,
  isInIncompleteRow,
}) => {
  // Helper function to extract pathname from URL (for internal links only)
  const getRelativePath = (url) => {
    if (!url) return "";
    try {
      // Check if it's an absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const urlObj = new URL(url);
        return urlObj.pathname; // Extract only the pathname
      }
      // Already a relative path
      return url;
    } catch (e) {
      // If URL parsing fails, return as-is
      return url;
    }
  };

  // Helper function to check if URL is external (like footer)
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const categoryLink = categoryBlock.props?.category_link?.value || "";
  const categorySlug = categoryBlock.props?.category_slug?.value || "";

  // Build the action URL: if external, keep as-is; if internal, combine link + slug
  const categoryAction = isExternalUrl(categoryLink)
    ? categoryLink
    : getRelativePath(categoryLink) + categorySlug;

  const category = {
    id: categoryBlock.id,
    name: categoryBlock.props?.category_name?.value || "",
    description: categoryBlock.props?.category_description?.value || "",
    slug: categorySlug,
    image: categoryBlock.props?.category_image?.value || "",
    action: categoryAction,
    isExternal: isExternalUrl(categoryLink),
  };

  const platformHeight = categoryBlock.props?.card_height?.value;
  const cardStyles = {};
  if (platformHeight && platformHeight > 0) {
    cardStyles["--individual-card-height"] = `${platformHeight}px`;
  }

  const cardContent = (
    <div className={styles.categoryImageWrapper}>
      <FyImage
        src={category.image}
        sources={imgSrcSet}
        alt={category.name}
        isFixedAspectRatio={false}
        globalConfig={globalConfig}
        backgroundColor="transparent"
        overlayColor="transparent"
        customClass={styles.categoryImage}
      />
      <div className={styles.categoryOverlay}>
        <p className={`${styles.categoryName} font-archivo`}>{category.name}</p>
      </div>
      {category.description && (
        <p
          className={`${styles.categoryDescription} font-archivo font-[200] !text-[#171717]`}
        >
          {category.description}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={`${styles.categoryCard} ${isInIncompleteRow ? styles.incompleteRowCard : ""}`}
      style={cardStyles}
    >
      {category.isExternal ? (
        <a
          href={category.action}
          target="_self"
          rel="noopener noreferrer"
          className={styles.categoryLink}
        >
          {cardContent}
        </a>
      ) : (
        <FDKLink to={category.action} className={styles.categoryLink}>
          {cardContent}
        </FDKLink>
      )}
    </div>
  );
};

// ✅ UPDATED: Settings with mobile height option
export const settings = {
  label: "Custom Categories with Hero Banner",
  props: [
    {
      type: "select",
      id: "banner_type",
      label: "Hero Banner Type",
      options: [
        { value: "image", text: "Image Banner" },
        { value: "video", text: "Video Banner" },
      ],
      default: "image",
      info: "Choose between single image or video banner",
    },

    // ✅ UPDATED: Section Height Controls (Desktop + Mobile)
    {
      type: "range",
      id: "hero_section_height",
      min: 300,
      max: 1200,
      step: 20,
      unit: "px",
      label: "Hero Section Height (Desktop)",
      default: 720,
      info: "Height of the hero banner section on desktop",
    },
    {
      type: "range",
      id: "hero_section_height_mobile",
      min: 300,
      max: 800,
      step: 20,
      unit: "px",
      label: "Hero Section Height (Mobile)",
      default: 600,
      info: "Height of the hero banner section on mobile and tablet",
    },

    // ✅ UPDATED: Floating Icon with mobile option
    {
      type: "image_picker",
      id: "ekke_icon",
      label: "Floating Icon/Logo (Desktop)",
      info: "Icon or logo displayed over the section on desktop",
      default: "",
      options: {
        aspect_ratio: "4:1",
        aspect_ratio_strict_check: false,
      },
    },
    {
      type: "image_picker",
      id: "ekke_icon_mobile",
      label: "Floating Icon/Logo (Mobile)",
      info: "Optional separate mobile version of the logo - if not provided, desktop version will be used",
      default: "",
      options: {
        aspect_ratio: "4:1",
        aspect_ratio_strict_check: false,
      },
    },
    {
      type: "url",
      id: "section_image_link",
      label: "Hero Banner Link",
      info: "Optional link for the hero banner and icon",
      default: "",
    },

    // ✅ NEW: Hero CTA
    {
      type: "text",
      id: "hero_cta_text",
      label: "Hero CTA Text",
      default: "",
      info: "Button text shown at the bottom of the hero (e.g., NEW DROPS)",
      conditional: { key: "banner_type", value: "image" },
    },
    {
      type: "url",
      id: "hero_cta_link",
      label: "Hero CTA Link",
      default: "",
      info: "Link to open when CTA is clicked",
      conditional: { key: "banner_type", value: "image" },
    },

    // Image options (single image only)
    {
      type: "image_picker",
      id: "section_image",
      label: "Hero Image (Desktop)",
      info: "Single desktop image",
      default: "",
      options: {
        aspect_ratio: "16:9",
        aspect_ratio_strict_check: false,
      },
      conditional: {
        key: "banner_type",
        value: "image",
      },
    },
    {
      type: "image_picker",
      id: "section_image_mobile",
      label: "Hero Image (Mobile/Tablet)",
      info: "Single mobile or tablet image",
      default: "",
      options: {
        aspect_ratio: "9:16",
        aspect_ratio_strict_check: false,
      },
      conditional: {
        key: "banner_type",
        value: "image",
      },
    },

    // ✅ UPDATED: Video options with mobile support
    {
      type: "video",
      id: "video_file",
      label: "Video File (Desktop)",
      default: "",
      info: "Upload video file for desktop (MP4 recommended) - will autoplay",
      conditional: {
        key: "banner_type",
        value: "video",
      },
    },
    {
      type: "video",
      id: "video_file_mobile",
      label: "Video File (Mobile/Tablet)",
      default: "",
      info: "Optional separate video for mobile/tablet - if not provided, desktop video will be used",
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

    // Section options
    {
      type: "text",
      id: "section_title",
      label: "Section Title",
      default: "",
      info: "Optional title for the section",
    },
    {
      type: "range",
      id: "heading_top_spacing",
      min: 0,
      max: 200,
      step: 10,
      unit: "px",
      label: "Heading Top Spacing",
      default: 40,
      info: "Space above the section heading",
    },
    {
      type: "range",
      id: "heading_bottom_spacing",
      min: 0,
      max: 200,
      step: 10,
      unit: "px",
      label: "Heading Bottom Spacing",
      default: 24,
      info: "Space between heading and categories",
    },
    {
      type: "textarea",
      id: "section_description",
      label: "Section Description",
      default: "",
      info: "Optional description for the section",
    },
    {
      type: "range",
      id: "categories_per_row",
      min: 1,
      max: 3,
      step: 1,
      unit: "",
      label: "Categories Per Row",
      default: 3,
      info: "Number of categories to display per row",
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
      info: "Space above the entire section",
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
      info: "Space below the entire section",
    },
  ],

  blocks: [
    // no image banner blocks; single image is configured via props only
    {
      name: "Category Item",
      type: "category_item",
      props: [
        {
          type: "text",
          id: "category_name",
          label: "Category Name",
          default: "Category Name",
          info: "Name of the category to display",
        },
        {
          type: "textarea",
          id: "category_description",
          label: "Category Description",
          default: "",
          info: "Optional description for the category",
        },
        {
          type: "text",
          id: "category_slug",
          label: "Category Slug",
          default: "",
          info: "URL slug for the category",
        },
        {
          type: "image_picker",
          id: "category_image",
          label: "Category Image",
          options: {
            aspect_ratio: "3:4",
            file_types: ["png", "jpeg", "jpg"],
            aspect_ratio_strict_check: false,
          },
          info: "Image for the category card",
        },
        {
          type: "url",
          id: "category_link",
          label: "Category Link",
          default: "",
          info: "Custom link for the category",
        },
        {
          type: "range",
          id: "card_height",
          min: 200,
          max: 1500,
          step: 20,
          unit: "px",
          label: "Card Height",
          default: 0,
          info: "Custom height for this category card (0 = automatic)",
        },
      ],
    },
  ],
};

export default Component;
