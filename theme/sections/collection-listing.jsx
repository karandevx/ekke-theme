import React from "react";
import { useFPI } from "fdk-core/utils";
import { useParams } from "react-router-dom";
import Shimmer from "../components/shimmer/shimmer";

import useCollectionListing from "../page-layouts/collection-listing/useCollectionListing";
import { getHelmet } from "../providers/global-provider";
import { isRunningOnClient } from "../helper/utils";
import {
  COLLECTION_DETAILS,
  COLLECTION_WITH_ITEMS,
} from "../queries/collectionsQuery";
import ProductListing from "../components/product-listing/product-listing";
import { ProductCollectionListing } from "./product-collection-listing";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();
  const params = useParams();
  const slug = params?.slug || props?.collection?.value;
  const listingProps = useCollectionListing({ fpi, slug, props });
  const { seo } = listingProps;
  if (listingProps?.isPageLoading && isRunningOnClient()) {
    return <Shimmer />;
  }

  return (
    <>
      {getHelmet({ seo })}
      <div className="margin0auto basePageContainer">
        <ProductListing {...listingProps} />
        {blocks?.map((block, index) => {
          return (
            <ProductCollectionListing
              key={`${block?.name}-${block?.uid || index}`}
              {...block?.props}
            />
          );
        })}
      </div>
    </>
  );
}

export const settings = {
  label: "t:resource.sections.collections_listing.collection_product_grid",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "t:resource.sections.collections_listing.select_collection",
      info: "t:resource.sections.collections_listing.select_collection_info",
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
      info: "t:resource.sections.collections_listing.loading_options_info",
      default: "pagination",
      label: "t:resource.common.loading_options",
    },
    {
      id: "page_size",
      type: "select",
      options: [
        {
          value: 12,
          text: "12",
        },
        {
          value: 24,
          text: "24",
        },
        {
          value: 36,
          text: "36",
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
    {
      type: "checkbox",
      id: "hide_brand",
      label: "t:resource.common.hide_brand_name",
      default: false,
      info: "t:resource.common.hide_brand_name_info",
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
  ],
};

Component.serverFetch = async ({ fpi, router, props }) => {
  let filterQuery = "";
  let sortQuery = "";
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

  // Parse filter & sort
  Object.keys(router.filterQuery || {})?.forEach((key) => {
    if (key === "page_no") {
      pageNo = parseInt(router.filterQuery[key], 10);
    } else if (key === "sort_on") {
      sortQuery = router.filterQuery[key];
    } else if (typeof router.filterQuery[key] === "string") {
      filterQuery = filterQuery
        ? `${filterQuery}:::${key}:${router.filterQuery[key]}`
        : `${key}:${router.filterQuery[key]}`;
    } else {
      router.filterQuery[key]?.forEach((item) => {
        filterQuery = filterQuery
          ? `${filterQuery}:::${key}:${item}`
          : `${key}:${item}`;
      });
    }
  });

  // Algolia filter formatting
  if (isAlgoliaEnabled) {
    const filterParams = [];
    const skipKeys = new Set(["sort_on", "page_no"]);
    for (const [key, value] of Object.entries(router?.filterQuery || {})) {
      if (skipKeys.has(key)) continue;
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
    slug: router?.params?.slug,
    search: filterQuery || undefined,
    sortOn: sortQuery || undefined,
    first: pageSize,
    pageType: "number",
  };

  if (pageNo) payload.pageNo = pageNo;

  // Fetch data for SSR
  const getCollectionWithItems = async () => {
    if (isAlgoliaEnabled) {
      const BASE_URL = `https://${fpiState?.custom?.appHostName}/ext/algolia/application/api/v1.0/collections/${payload?.slug}/items`;

      const url = new URL(BASE_URL);
      url.searchParams.append(
        "page_id",
        payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
      );
      url.searchParams.append("page_size", "12");

      if (payload?.sortOn) {
        url.searchParams.append("sort_on", payload?.sortOn);
      }
      if (filterQuery) {
        url.searchParams.append("f", filterQuery);
      }

      fpi
        .executeGQL(
          COLLECTION_DETAILS,
          { slug: payload?.slug },
          { skipStoreUpdate: true }
        )
        .then((res) => {
          fpi.custom.setValue("customCollection", res?.data?.collection);
        });

      return fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const productDataNormalization = data.items?.map((item) => ({
            ...item,
            media: item.medias,
          }));

          const productList = {
            filters: data?.filters,
            items: productDataNormalization,
            page: {
              ...data.page,
              current: payload?.pageNo || 1,
            },
            sortOn: data?.sort_on,
          };

          fpi.custom.setValue("customCollectionList", productList);
          fpi.custom.setValue("isCollectionsSsrFetched", true);
        });
    } else {
      return fpi
        .executeGQL(COLLECTION_WITH_ITEMS, payload, { skipStoreUpdate: true })
        .then((res) => {
          const { collection, collectionItems } = res?.data || {};

          if (!collection || !collectionItems) {
            console.warn(
              "⚠️ SSR warning: collection or items missing",
              res?.data
            );
          }

          fpi.custom.setValue("customCollection", collection);
          fpi.custom.setValue("customCollectionList", collectionItems);
          fpi.custom.setValue("isCollectionsSsrFetched", true);
        })
        .catch((err) => {
          console.error("❌ SSR GraphQL error:", err);
        });
    }
  };

  return Promise.all([getCollectionWithItems()]);
};

export default Component;
