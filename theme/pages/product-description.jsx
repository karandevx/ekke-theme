import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import styles from "../styles/sections/product-description.less";
import useCheckAnnouncementBar from "../helper/hooks/useCheckAnnouncementBar";

function ProductDescription({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const seo = PRODUCT?.product_details?.seo || {};
  const productDescription = PRODUCT?.product_meta?.short_description;
  const { hasAnnouncementBar } = useCheckAnnouncementBar();
  const { isProductNotFound } =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};

  const mergedSeo = {
    ...seo,
    description: seo?.description || productDescription,
  };

  // Calculate margin-top based on announcement bar presence (desktop only)
  const marginTopValue = hasAnnouncementBar ? "80px" : "0px";

  return (
    <>
      {getHelmet({ seo: mergedSeo })}
      <style>{`
        @media (min-width: 1225px) {
          .pdp-margin-top {
            margin-top: ${isProductNotFound ? "0" : `calc(100vh - ${marginTopValue})`};
          }
        }
      `}</style>
      <div
        className={`${styles.productDescWrapper} basePageContainer margin0auto pdp-margin-top`}
      >
        {page?.value === "product-description" && (
          <SectionRenderer
            sections={sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        )}
      </div>
      {/* Note: Do not remove the below empty div, it is required to insert sticky add to cart at the bottom of the sections */}
      <div id="sticky-add-to-cart" className={styles.stickyAddToCart}></div>
    </>
  );
}

// export const sections = JSON.stringify([
//   {
//     attributes: {
//       page: "product-description",
//     },
//   },
// ]);

export const settings = JSON.stringify({
  label: "Product Description",
  props: [
    {
      type: "extension",
      id: "extension",
      label: "Extension Positions",
      info: "Handle extension in these positions",
      positions: [
        {
          value: "product_description_bottom",
          text: "Below Product Description",
        },
      ],
    },
  ],
});

export default ProductDescription;
