import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import styles from "../styles/brands.less";
import useBrandListing from "../page-layouts/brands/useBrandListing";
import { getConfigFromProps } from "../helper/utils";
import EmptyState from "../components/empty-state/empty-state";
import { BRAND_LISTING } from "../queries/brandsQuery";
import DesignersPage from "../components/designer/designer";

export function Component({ props }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");

  const { brands, isLoading, pageData, fetchBrands, globalConfig } =
    useBrandListing(fpi);

  const pageConfig = getConfigFromProps(props);

  const { title } = pageConfig ?? {};

  if (!isLoading && Boolean(brands) && !brands?.length) {
    return <EmptyState title={t("resource.brand.no_brand_found")} />;
  }
  return (
    <div className={`${styles.brands} basePageContainer margin0auto fontBody`}>
      <div className={`${styles.brands__breadcrumbs} captionNormal`}>
        <span>
          <FDKLink to="/">{t("resource.common.breadcrumb.home")}</FDKLink>&nbsp;
          / &nbsp;
        </span>
        <span className={styles.active}>
          {t("resource.common.breadcrumb.brands")}
        </span>
      </div>
      <div>
        <DesignersPage />
      </div>
    </div>
  );
}

export const settings = {
  label: "Designer Listing",
  props: [
    {
      type: "text",
      id: "title",
      default: "",
      label: "t:resource.common.heading",
      info: "t:resource.sections.brand_landing.heading_info",
    },
  ],
};

Component.serverFetch = async ({ fpi }) => {
  try {
    const values = {
      pageNo: 1,
      pageSize: 20,
    };
    await fpi.executeGQL(BRAND_LISTING, values).then((res) => {
      return res;
    });
  } catch (error) {
    console.log(error);
  }
};

export default Component;
