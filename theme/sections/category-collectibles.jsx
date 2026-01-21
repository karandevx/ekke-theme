import React from "react";
import { useFPI } from "fdk-core/utils";
import Shimmer from "../components/shimmer/shimmer";
import { isRunningOnClient } from "../helper/utils";
import useCategoryCollectibles from "../page-layouts/category-collectibles/useCategoryCollectibles";
import CategoryCollectibles from "../components/category-collectibles/category-collectibles";
import { COLLECTION_DETAILS } from "../queries/collectionsQuery";
import PageNotFound from "../components/page-not-found/page-not-found";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();
  
  
  // Get slug from router params if collectionSelection is not provided
  const slug = props?.collectionSelection?.value;
  
  // Show nothing if slug is not available
  if (!slug) {
    return <PageNotFound />;
  }

  const listingProps = useCategoryCollectibles({ fpi, props, slug });

  if (isRunningOnClient() && listingProps?.isPageLoading) {
    return <Shimmer />;
  }

  return (
    <div className="margin0auto basePageContainer">
      <CategoryCollectibles customLayout={true} {...listingProps} />
    </div>
  );
}

export const settings = {
  label: "Category Collectibles",
  props: [
    {
      id: "collectionSelection",
      label: "Choose Collection",
      type: "collection",
      default: "",
      info: "Select a collection from the dropdown.",
    },
    {
      id: "desktop_banner",
      type: "image_picker",
      label: "Hero Desktop Banner",
      default: "",
    },
    {
      id: "mobile_banner",
      type: "image_picker",
      label: "Hero Mobile Banner",
      default: "",
    },
    {
      id: "desktop_inbetween_banner",
      type: "image_picker",
      label: "Desktop Image banner inbetween",
      default: "",
    },
    {
      id: "mobile_inbetween_banner",
      type: "image_picker",
      label: " Mobile Image  banner inbetween",
      default: "",
    },
    {
      id: "desktop_side_image_banner",
      type: "image_picker",
      label: "Side Desktop Image ",
      default: "",
    },
    {
      id: "mobile_side_image_banner",
      type: "image_picker",
      label: "Side Mobile Image",
      default: "",
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

  // Get slug from router params or props, return early if no slug
  const slug = router?.params?.slug || props?.collectionSelection?.value;
  
  if (!slug) {
    // No slug available, return early without fetching
    return Promise.resolve();
  }

  const payload = {
    slug,
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
