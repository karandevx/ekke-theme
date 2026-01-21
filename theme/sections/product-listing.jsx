import React from "react";
import { useFPI } from "fdk-core/utils";
import Shimmer from "../components/shimmer/shimmer";
import useProductListing from "../page-layouts/plp/useProductListing";
import { isRunningOnClient } from "../helper/utils";
import { PLP_PRODUCTS, BRAND_META, CATEGORY_META } from "../queries/plpQuery";
import ProductListing from "../components/product-listing/product-listing";
import { ProductCollectionListing } from "./product-collection-listing";
import { Component as ProductRecommendation } from "./product-recommendation";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();

  const listingProps = useProductListing({ fpi, props });

  if (isRunningOnClient() && listingProps?.isPageLoading) {
    return <Shimmer />;
  }

  // Check if product list is empty (empty state or not found state)
  const hasProducts = listingProps?.productList?.length > 0;

  return (
    <div className="margin0auto basePageContainer">
      <ProductListing {...listingProps} />
      {/* Only render blocks when there are products */}
      {hasProducts &&
        blocks?.map((block, index) => {
          // Check if block is custom-product recommendation
          if (block?.name === "custom-product recommendation") {
            return (
              <ProductRecommendation
                key={`${block?.name}-${block?.uid || index}`}
                props={block?.props || {}}
                globalConfig={globalConfig}
              />
            );
          }
          // Default to ProductCollectionListing for other blocks
          return (
            <ProductCollectionListing
              key={`${block?.name}-${block?.uid || index}`}
              {...block?.props}
            />
          );
        })}
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.products_listing.product_listing",
  props: [
    {
      type: "text",
      id: "banner_title",
      label: "Banner Title",
      default: "Collection Title",
      info: "Main title for the collection banner",
    },
    {
      id: "banner_description",
      type: "textarea",
      label: "Banner Description",
      default: "Enter collection description here",
      info: "Detailed description for the collection",
    },
    {
      id: "loading_options",
      type: "select",
      options: [
        {
          value: "pagination",
          text: "t:resource.common.pagination",
        },
      ],
      default: "pagination",
      info: "t:resource.sections.collections_listing.loading_options_info",
      label: "t:resource.sections.products_listing.page_loading_options",
    },
    {
      id: "page_size",
      type: "select",
      options: [
        {
          value: 6,
          text: "6",
        },
        {
          value: 12,
          text: "12",
        },
        {
          value: 24,
          text: "24",
        },
        {
          value: 32,
          text: "32",
        },
        {
          value: 36,
          text: "36",
        },
        {
          value: 40,
          text: "40",
        },
        {
          value: 48,
          text: "48",
        },
        {
          value: 60,
          text: "60",
        },
      ],
      default: 24,
      info: "",
      label: "t:resource.sections.products_listing.products_per_page",
    },
    {
      type: "checkbox",
      id: "hide_brand",
      label: "t:resource.common.hide_brand_name",
      default: false,
      info: "t:resource.common.hide_brand_name_info",
    },
    {
      id: "grid_desktop",
      type: "select",
      options: [
        {
          value: "8",
          text: "8 cards",
        },
        {
          value: "4",
          text: "t:resource.common.four_cards",
        },
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
      ],
      default: "4",
      label: "t:resource.common.default_grid_layout_desktop",
    },
    {
      id: "grid_tablet",
      type: "select",
      options: [
        {
          value: "4",
          text: "t:resource.common.four_cards",
        },
        {
          value: "3",
          text: "t:resource.common.three_cards",
        },
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
      ],
      default: "2",
      label: "t:resource.common.default_grid_layout_tablet",
    },
    {
      id: "grid_mob",
      type: "select",
      options: [
        {
          value: "4",
          text: "4 cards",
        },
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
        {
          value: "1",
          text: "t:resource.common.one_card",
        },
      ],
      default: "1",
      label: "t:resource.common.default_grid_layout_mobile",
    },
  ],
  blocks: [
    {
      label: "Product Slider",
      type: "gallery",
      name: "Product Slider",
      props: [
        {
          type: "text",
          id: "heading",
          default: "",
          label: "Title",
        },
        {
          type: "collection",
          id: "collection_name",
          label: "Select Collection",
          info: "Choose a collection to display in the carousel",
        },
        {
          id: "number_of_products",
          label: "Number of Products",
          type: "range",
          default: 4,
          info: "Select a value from the range slider.",
          min: 0,
          max: 8,
          step: 1,
          unit: "",
        },
        {
          id: "with_slider",
          label: "Include Slider",
          type: "checkbox",
          default: false,
          info: "Enable or disable the slider.",
        },
      ],
    },
    {
      label: "Custom Product Recommendation",
      type: "recommendation",
      name: "custom-product recommendation",
      props: [
        {
          type: "text",
          id: "heading",
          default: "YOU MAY ALSO LIKE",
          label: "Heading",
          info: "Title for the recommendation section",
        },
        {
          type: "checkbox",
          id: "with_slider",
          default: true,
          label: "Enable Slider",
          info: "Show products in a slider (true) or grid (false)",
        },
        {
          type: "select",
          id: "wrapper_name",
          default: "similar-products",
          label: "Recommendation Type",
          info: "Select the type of recommendations to display",
          options: [
            {
              value: "similar-products",
              text: "Similar Products",
            },
            {
              value: "brand",
              text: "Brand",
            },
            {
              value: "recently-launched",
              text: "Recently Launched",
            },
            {
              value: "wishlisted-products",
              text: "Wishlisted Products",
            },
            {
              value: "category",
              text: "Category",
            },
            {
              value: "most-compared",
              text: "Most Compared",
            },
            {
              value: "bought-together",
              text: "Bought Together",
            },
            {
              value: "trending-products",
              text: "Trending Products",
            },
          ],
        },
        {
          type: "range",
          id: "products_to_show",
          min: 2,
          max: 8,
          step: 1,
          default: 4,
          label: "Products to Show (Desktop)",
          info: "Number of products visible in slider on desktop",
        },
        {
          type: "select",
          id: "page_context",
          default: "plp",
          label: "Page Context",
          info: "Choose where this section is used",
          options: [
            { value: "pdp", text: "PDP" },
            { value: "plp", text: "PLP" },
          ],
        },
      ],
    },
  ],
};

Component.serverFetch = async ({ fpi, router, props }) => {
  let filterQuery = "";
  let sortQuery = "";
  let search = "";
  let pageNo = null;
  const pageSize =
    props?.loading_options?.value === "infinite"
      ? 12
      : (props?.page_size?.value ?? 12);
  const fpiState = fpi.store.getState();

  const globalConfig =
    fpiState?.theme?.theme?.config?.list?.[0]?.global_config?.custom?.props ||
    {};
  const isAlgoliaEnabled = globalConfig?.algolia_enabled || false;

  Object.keys(router.filterQuery)?.forEach((key) => {
    if (key === "page_no") {
      pageNo = parseInt(router.filterQuery[key], 10);
    } else if (key === "sort_on") {
      sortQuery = router.filterQuery[key];
    } else if (key === "q") {
      search = router.filterQuery[key];
    } else if (typeof router.filterQuery[key] === "string") {
      if (filterQuery.includes(":")) {
        filterQuery = `${filterQuery}:::${key}:${router.filterQuery[key]}`;
      } else {
        filterQuery = `${key}:${router.filterQuery[key]}`;
      }
    } else {
      router.filterQuery[key]?.forEach((item) => {
        if (filterQuery.includes(":")) {
          filterQuery = `${filterQuery}:::${key}:${item}`;
        } else {
          filterQuery = `${key}:${item}`;
        }
      });
    }

    if (key === "category") {
      const slug = Array.isArray(router.filterQuery[key])
        ? router.filterQuery[key][0]
        : router.filterQuery[key];
      fpi.executeGQL(CATEGORY_META, { slug });
    }
    if (key === "brand") {
      const slug = Array.isArray(router.filterQuery[key])
        ? router.filterQuery[key][0]
        : router.filterQuery[key];
      fpi.executeGQL(BRAND_META, { slug });
    }
  });

  if (isAlgoliaEnabled) {
    const filterParams = [];
    const skipKeys = new Set(["q", "sort_on", "page_no"]);

    for (const [key, value] of Object.entries(router?.filterQuery || {})) {
      if (skipKeys.has(key)) continue;
      // Decode value to handle URL encoding
      const decodedValue = Array.isArray(value)
        ? value.map((v) => decodeURIComponent(v)).join("||")
        : decodeURIComponent(value);

      const existingParam = filterParams.find((param) =>
        param.startsWith(`${key}:`)
      );

      if (existingParam) {
        const updatedParam = `${existingParam}||${decodedValue}`;
        filterParams[filterParams.indexOf(existingParam)] = updatedParam;
      } else {
        filterParams.push(`${key}:${decodedValue}`);
      }
    }

    filterQuery = filterParams.join(":::");
  }

  const payload = {
    filterQuery,
    sortOn: sortQuery,
    search,
    enableFilter: true,
    first: pageSize,
    pageType: "number",
  };
  if (pageNo) payload.pageNo = pageNo;

  if (isAlgoliaEnabled) {
    const BASE_URL = `https://${fpiState?.custom?.appHostName}/ext/algolia/application/api/v1.0/products`;

    const url = new URL(BASE_URL);
    url.searchParams.append(
      "page_id",
      payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
    );
    url.searchParams.append("page_size", payload?.first);

    if (payload?.sortOn) {
      url.searchParams.append("sort_on", payload?.sortOn);
    }
    if (filterQuery) {
      url.searchParams.append("f", filterQuery);
    }
    if (payload?.search) {
      url.searchParams.append("q", payload?.search);
    }

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const productDataNormalization = data.items?.map((item) => ({
          ...item,
          media: item.medias,
        }));

        data.page.current = payload?.pageNo || 1;

        const productList = {
          filters: data?.filters,
          items: productDataNormalization,
          page: data?.page,
          sort_on: data?.sort_on,
        };
        fpi.custom.setValue("customProductList", productList);
        fpi.custom.setValue("isPlpSsrFetched", true);
      });
  } else {
    return fpi
      .executeGQL(PLP_PRODUCTS, payload, { skipStoreUpdate: false })
      .then(({ data }) => {
        fpi.custom.setValue("customProductList", data?.products);
        fpi.custom.setValue("isPlpSsrFetched", true);
      });
  }
};

export default Component;
