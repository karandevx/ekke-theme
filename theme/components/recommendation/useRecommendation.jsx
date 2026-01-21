import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";

const useRecommendation = ({ fpi, slug, wrapperName }) => {
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const [recommendationData, setRecommendationData] = useState({});

  const THEME = useGlobalStore(fpi.getters.THEME);
  const mode = THEME?.config?.list?.find(
    (f) => f.name === THEME?.config?.current
  ) || { global_config: {}, page: [] };
  const pageConfig =
    mode?.page?.find((f) => f.page === "product-description")?.settings
      ?.props || {};

  console.log("configggg", pageConfig);

  // the template should be dynamic like if similar product or brand
  const getExtWrapper = (template) => {
    switch (template) {
      case "Brand":
        return "brand";
      case "Recently Launched":
        return "recently-launched";
      case "Wishlisted Products":
        return "wishlisted-products";
      case "Category":
        return "category";
      case "Most Compared":
        return "most-compared";
      case "Similar Products":
        return "similar-products";
      case "Bought Together":
        return "bought-together";
      case "Trending Products":
        return "trending-products";
      default:
        return null;
    }
  };

  // useEffect(() => {
  //   if (!isRunningOnClient()) {
  //     return;
  //   }

  //   const RecommendationSlug = PRODUCT?.product_details?.slug;
  //   const extensions = pageConfig?.extension?.product_description_bottom || [];

  //   if (!RecommendationSlug || !extensions.length) return;

  //   // Fetch all recommendation APIs dynamically
  //   const fetchAllRecommendations = async () => {
  //     const responses = {};

  //     // Create an array of fetch promises
  //     const fetchPromises = extensions.map(async (extension) => {
  //       const displayName = extension.template?.display;
  //       const wrapper = getExtWrapper(displayName);

  //       if (!wrapper || !displayName) return null;

  //       const url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}?item_slug=${RecommendationSlug}`;

  //       try {
  //         const res = await fetch(url);
  //         if (!res.ok) throw new Error(`Failed to fetch ${displayName}`);
  //         const data = await res.json();

  //         // Create a key from display name (e.g., "Similar Products" -> "similar_products")
  //         const key = displayName.toLowerCase().replace(/\s+/g, "_");
  //         return { key, data, displayName };
  //       } catch (error) {
  //         console.error(
  //           `Recommendation fetch error for ${displayName}:`,
  //           error
  //         );
  //         return null;
  //       }
  //     });

  //     // Wait for all fetches to complete
  //     const results = await Promise.all(fetchPromises);

  //     // Build the responses object
  //     results.forEach((result) => {
  //       if (result) {
  //         responses[result.key] = {
  //           data: result.data,
  //           displayName: result.displayName,
  //         };
  //       }
  //     });

  //     setRecommendationData(responses);
  //   };

  //   fetchAllRecommendations();
  // }, [PRODUCT?.product_details?.slug, pageConfig?.extension]);

  // Fetch recommendation data
  useEffect(() => {
    if (!isRunningOnClient()) {
      return;
    }

    const RecommendationSlug = PRODUCT?.product_details?.slug;
    const wrapper = getExtWrapper(wrapperName);

    if (!RecommendationSlug || !wrapper) return;

    const fetchData = async () => {
      const url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}?item_slug=${RecommendationSlug}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok.");
        const data = await res.json();
        setRecommendationData(data);
      } catch (error) {
        console.error("Recommendation fetch error:", error);
      }
    };

    fetchData();
  }, [PRODUCT?.product_details?.slug, wrapperName]);

  return {
    recommendationData,
  };
};

export default useRecommendation;

// M7011029A8VC,M7011029AZTV
