import React from "react";
import styles from "./page-not-found.less";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { useThemeConfig } from "../../helper/hooks";

function PageNotFound({
  title,
  subtitle,
  svgSrc,
  showResultsNotFoundBanner = false,
}) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { globalConfig } = useThemeConfig({ fpi });

  const pageHeader = globalConfig?.header;
  const errorText = globalConfig?.largeheader;

  // Category suggestions
  const suggestions = [
    {
      text: globalConfig?.suggestionText1 || "BAGS",
      link: globalConfig?.suggestionLink1 || "/products?category=bags",
    },
    {
      text: globalConfig?.suggestionText2 || "FOOTWEAR",
      link: globalConfig?.suggestionLink2 || "/products?category=footwear",
    },
    {
      text: globalConfig?.suggestionText3 || "OUTERWEAR",
      link: globalConfig?.suggestionLink3 || "/products?category=outerwear",
    },
    {
      text: globalConfig?.suggestionText4 || "ACCESSORIES",
      link: globalConfig?.suggestionLink4 || "/products?category=accessories",
    },
    {
      text: globalConfig?.suggestionText5 || "LIVING",
      link: globalConfig?.suggestionLink5 || "/products?category=living",
    },
    {
      text: globalConfig?.suggestionText6 || "YOUNG COLLECTIBLES",
      link:
        globalConfig?.suggestionLink6 ||
        "/products?category=young-collectibles",
    },
  ].filter((item) => item.text); // Filter out empty items

  const banners = [
    {
      text: globalConfig?.bannerText1 || "",
      link: globalConfig?.bannerLink1 || "",
      image: globalConfig?.banner_image_1 || "",
    },
    {
      text: globalConfig?.bannerText2 || "",
      link: globalConfig?.bannerLink2 || "",
      image: globalConfig?.banner_image_2 || "",
    },
    {
      text: globalConfig?.bannerText3 || "",
      link: globalConfig?.bannerLink3 || "",
      image: globalConfig?.banner_image_3 || "",
    },
    {
      text: globalConfig?.bannerText4 || "",
      link: globalConfig?.bannerLink4 || "",
      image: globalConfig?.banner_image_4 || "",
    },
  ].filter((item) => item.image); // Filter out items without images

  const displayTitle = showResultsNotFoundBanner ? title : pageHeader;
  const displaySubtitle = showResultsNotFoundBanner ? subtitle : errorText;

  return (
    <div className={styles.notFoundContainer}>
      {showResultsNotFoundBanner && (
        <div className={styles.resultsNotFoundBanner}>
          We cannot seem to find this. Begin again.
        </div>
      )}
      <div className={styles.container}>
        {/* Error Message Section */}
        <div className={styles.messageSection}>
          <div className={styles.errorSection}>
            {displayTitle && (
              <div className={styles.errorTitle}>{displayTitle}</div>
            )}
            {!displayTitle && <div className={styles.errorTitle} />}

            <p className={styles.errorSubtitle}>{displaySubtitle}</p>
          </div>

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className={styles.suggestionsSection}>
              <div className={styles.suggestionsTitle}>Explore EKKE:</div>
              <div className={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <FDKLink
                    key={index}
                    action={suggestion.link}
                    className={styles.suggestionLink}
                  >
                    {suggestion.text}
                  </FDKLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Banner/Product Images Section */}
        {banners.length > 0 && (
          <div className={styles.bannersSection}>
            <div className={styles.bannersGrid}>
              {banners.map((banner, index) => (
                <div key={index} className={styles.bannerCard}>
                  <FDKLink
                    action={banner.link || "#"}
                    className={styles.bannerLink}
                  >
                    {banner.image && (
                      <div className={styles.bannerImageWrapper}>
                        <FyImage
                          src={banner.image}
                          alt={banner.text || `Banner ${index + 1}`}
                          backgroundColor="transparent"
                          overlayColor="transparent"
                          isFixedAspectRatio={false}
                          customClass={styles.bannerImage}
                        />
                        {banner.text && (
                          <div className={styles.bannerOverlay}>
                            <p className={`${styles.bannerName} font-archivo`}>
                              {banner.text}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </FDKLink>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
PageNotFound.defaultProps = {
  title: "Uupps! Page not found",
  subtitle: "WE CANNOT FIND THE PAGE YOU ARE LOOKING FOR.",
};

export default PageNotFound;
