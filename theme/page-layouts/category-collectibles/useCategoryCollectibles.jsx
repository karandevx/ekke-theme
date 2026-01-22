import React, { useEffect, useState, useMemo } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useLocation, useSearchParams } from "react-router-dom";

import { PLP_ADD_TO_CART, PLP_PRODUCTS } from "../../queries/plpQuery";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
} from "../../helper/utils";
import { useAccounts, useWishlist, useThemeConfig } from "../../helper/hooks";
import { PRODUCT_SIZE_PRICE } from "../../queries/pdpQuery";
import { useToast } from "../../components/custom-toaster";
import useSortModal from "../plp/useSortModal";
import useFilterModal from "../plp/useFilterModal";
import { COLLECTION_WITH_ITEMS } from "../../queries/collectionsQuery";

const PAGE_OFFSET = 2;
const PAGES_TO_SHOW = 5;
const PAGE_SIZE = 18; // ✅ fixed: 18 products per page

const useCategoryCollectibles = ({ fpi, props, slug: slugProp }) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { globalConfig, listingPrice } = useThemeConfig({
    fpi,
  });

  const pageSize = PAGE_SIZE; // ✅ always 18

  const toast = useToast();

  const { isPlpSsrFetched, customProductList: productsListData } =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);

  const { filters = [], sort_on: sortOn, page, items } = productsListData || {};

  const [productList, setProductList] = useState(items || []);
  const currentPage = productsListData?.page?.current ?? 1;
  const [apiLoading, setApiLoading] = useState(!isPlpSsrFetched);
  const [isPageLoading, setIsPageLoading] = useState(!isPlpSsrFetched);
  const [isResetFilterDisable, setIsResetFilterDisable] = useState(true);
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  const isClient = useMemo(() => isRunningOnClient(), []);

  const pincode = useMemo(() => {
    if (!isClient) {
      return "";
    }
    return (
      pincodeDetails?.localityValue ||
      locationDetails?.pincode ||
      locationDetails?.sector ||
      ""
    );
  }, [pincodeDetails, locationDetails, isClient]);

  useEffect(() => {
    fpi.custom.setValue("isPlpSsrFetched", false);
  }, [fpi]);

  useEffect(() => {
    // Get slug from prop or props, skip if no slug
    const slug = slugProp || props?.collectionSelection?.value;
    
    if (!slug) {
      // No slug available, don't fetch
      return;
    }

    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const pageNo = Number(searchParams?.get("page_no")) || 1;

    const payload = {
      slug, // ✅ collection slug from prop or props
      pageType: "number",
      first: pageSize, // ✅ 18 products per page
      pageNo,
      search: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
    };

    fetchProducts(payload, false);

    const resetableFilterKeys =
      Array.from(searchParams?.keys?.() ?? [])?.filter?.(
        (i) => !["q", "sort_on", "page_no"].includes(i)
      ) ?? [];
    setIsResetFilterDisable(!resetableFilterKeys?.length);
  }, [location?.search, pincode, slugProp]);

  const fetchProducts = (payload, append = false) => {
    setApiLoading(true);
    setIsPageLoading(true);

    fpi
      .executeGQL(COLLECTION_WITH_ITEMS, payload, { skipStoreUpdate: true })
      .then((res) => {
        // ✅ align with COLLECTION_WITH_ITEMS shape (collectionItems)
        const collectionItems = res?.data?.collectionItems;
        const newItems = collectionItems?.items || [];

        // Always replace list (no infinite-append)
        setProductList(newItems);

        // Store in customProductList like PLP does (used above as productsListData)
        fpi.custom.setValue("customProductList", collectionItems);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again.");
      })
      .finally(() => {
        setApiLoading(false);
        setIsPageLoading(false);
      });
  };

  // ✅ Simple handler to go to next page using normal pagination (18 each)
  const handleLoadMoreProducts = () => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const nextPageNo = currentPage + 1;
    searchParams?.set("page_no", String(nextPageNo));

    navigate?.(
      location?.pathname +
        (searchParams?.toString() ? `?${searchParams?.toString()}` : "")
    );
  };

  function appendDelimiter(queryString) {
    const searchParams = isClient ? new URLSearchParams(queryString) : null;
    const params = Array.from(searchParams?.entries() || []);

    const result = params.reduce((acc, [key, value]) => {
      if (key !== "page_no" && key !== "sort_on" && key !== "q") {
        acc.push(`${key}:${value}`);
      }
      return acc;
    }, []);
    return result.join(":::");
  }

  const handleAddToCart = async (product) => {
    console.log("handleAddToCart called with product:", product);
    // if (
    //   !product?.sizes?.[0] ||
    //   !product?.size_options[0] ||
    //   !product.sellable
    // ) {
    //   console.log("product does not have sizes", product);
    //   return;
    // }

    let sellerId, storeId;

    if (!product?.seller?.uid || !product?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: product?.slug,
          size:
            product?.sizes?.sizes?.[0]?.value ||
            product?.sizes?.[0] ||
            product?.size_options[0],
          pincode: "",
        });

        const freshProductPriceData = productPriceResponse?.data?.productPrice;

        if (
          !freshProductPriceData?.seller?.uid ||
          !freshProductPriceData?.store?.uid
        ) {
          console.error("PLP page exception. " + product?.item_code);
          toast.error("Unable to add product to cart. Please try again later.");
          return;
        }

        sellerId = freshProductPriceData.seller.uid;
        storeId = freshProductPriceData.store.uid;
        console.log("Fetched sellerId and storeId:", sellerId, storeId);
      } catch (error) {
        console.log("Error in ATC");
        toast.error("Unable to fetch product price. Please try again later.");
        return;
      }
    } else {
      sellerId = product.seller.uid;
      storeId = product.store.uid;
    }

    const payload = {
      addCartRequestInput: {
        items: [
          {
            item_id: product?.uid,
            item_size:
              product?.sizes?.sizes?.[0].value ||
              product?.sizes?.[0] ||
              product?.size_options[0],
            quantity: 1,
            seller_id: sellerId,
            store_id: storeId,
          },
        ],
      },
      buyNow: false,
    };

    try {
      const { data } = await fpi.executeGQL(PLP_ADD_TO_CART, payload);

      if (data?.addItemsToCart?.success) {
        toast.success(
          "Product added successfully" || data?.addItemsToCart?.message
        );

        setTimeout(() => {
          fpi.custom.setValue("isCartDrawerOpen", true);
        }, 900);
      } else {
        throw new Error(
          data?.addItemsToCart?.message || "Failed to add product to cart"
        );
      }
    } catch (error) {
      console.error("Failed to add product to cart", error);
      toast.error("Failed to add product to cart. Please try again.");
    }
  };

  const handleFilterUpdate = ({ filter, item }) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const {
      key: { name, kind },
    } = filter;
    const { value, is_selected } = item;
    if (kind === "range") {
      if (value) {
        searchParams?.set(name, value);
      } else {
        searchParams?.delete(name);
      }
    } else {
      const existingValues = searchParams?.getAll(name) || [];

      if (is_selected) {
        const newValues = existingValues.filter((v) => v !== value);
        searchParams.delete(name);
        newValues.forEach((v) => searchParams.append(name, v));
      } else {
        if (!existingValues.includes(value)) {
          searchParams.append(name, value);
        }
      }
    }
    searchParams?.delete("page_no");
    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
  };

  const handleSortUpdate = (value) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    if (value) {
      searchParams?.set("sort_on", value);
    } else {
      searchParams?.delete("sort_on");
    }
    searchParams?.delete("page_no");
    navigate?.(
      location?.pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    );
  };

  function resetFilters() {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    filters?.forEach((filter) => {
      searchParams?.delete(filter.key.name);
    });
    searchParams?.delete("page_no");
    navigate?.(
      location?.pathname +
        (searchParams?.toString() ? `?${searchParams?.toString()}` : "")
    );
  }

  const getPageUrl = (pageNo) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.set("page_no", String(pageNo));
    return `${location?.pathname}?${searchParams?.toString()}`;
  };

  const getStartPage = ({ current, totalPageCount }) => {
    const index = Math.max(current - PAGE_OFFSET, 1);
    const lastIndex = Math.max(totalPageCount - PAGES_TO_SHOW + 1, 1);

    if (index <= 1) {
      return 1;
    } else if (index > lastIndex) {
      return lastIndex;
    } else {
      return index;
    }
  };

  const paginationProps = useMemo(() => {
    if (!productsListData?.page) {
      console.log("No page data found, returning undefined");
      return undefined;
    }

    const {
      current,
      has_next: hasNext,
      has_previous: hasPrevious,
      item_total,
    } = productsListData?.page || {};

    const totalPageCount = Math.ceil(item_total / pageSize); // ✅ total pages based on 18/page
    const startingPage = getStartPage({ current, totalPageCount });

    const displayPageCount = Math.min(totalPageCount, PAGES_TO_SHOW);

    const pages = [];
    for (let i = 0; i < displayPageCount; i++) {
      pages.push({
        link: getPageUrl(startingPage + i),
        index: startingPage + i,
      });
    }

    return {
      current: current || 1,
      hasNext,
      hasPrevious,
      prevPageLink: hasPrevious ? getPageUrl(current - 1) : "",
      nextPageLink: hasNext ? getPageUrl(current + 1) : "",
      pages,
      totalPages: totalPageCount,
    };
  }, [productsListData?.page, pageSize, location?.search]);

  const { openSortModal, ...sortModalProps } = useSortModal({
    sortOn,
    handleSortUpdate,
  });

  const filterList = useMemo(() => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;

    const mappedFilters = (filters ?? []).map((filter) => {
      const urlSelectedValues = searchParams?.getAll(filter?.key?.name) || [];

      // Sync is_selected with URL so toggling works (e.g., brand double-click)
      const updatedValues = (filter?.values || []).map((value) => {
        const isSelectedInUrl = urlSelectedValues.includes(value?.value);
        return {
          ...value,
          is_selected: isSelectedInUrl || value?.is_selected,
        };
      });

      const isNameInQuery =
        searchParams?.has(filter?.key?.name) ||
        updatedValues.some(({ is_selected }) => is_selected);

      return { ...filter, values: updatedValues, isOpen: isNameInQuery };
    });

    // Sort filters: categories first, then brands, then everything else
    return mappedFilters.sort((a, b) => {
      const aName = a?.key?.name || "";
      const bName = b?.key?.name || "";

      // Priority order: custom-attribute-2 (categories) > brand > everything else
      const getPriority = (name) => {
        if (name === "custom-attribute-2") return 1;
        if (name === "brand") return 2;
        return 3;
      };

      const aPriority = getPriority(aName);
      const bPriority = getPriority(bName);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // If same priority, maintain original order
      return 0;
    });
  }, [filters, location?.search, isClient]);

  const isFilterOpen = filterList.some((filter) => filter.isOpen);
  if (!isFilterOpen && filterList.length > 0) {
    filterList[0].isOpen = true;
  }

  const selectedFilters = useMemo(() => {
    const searchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;
    return filterList?.reduce((acc, curr) => {
      const selectedValues = curr?.values?.filter(
        (filter) =>
          searchParams?.getAll(curr?.key?.name).includes(filter?.value) ||
          filter?.is_selected
      );
      if (selectedValues.length > 0) {
        return [...acc, { key: curr?.key, values: selectedValues }];
      }
      return acc;
    }, []);
  }, [filterList, location?.search]);

  const { openFilterModal, ...filterModalProps } = useFilterModal({
    filters: filterList ?? [],
    resetFilters,
    handleFilterUpdate,
  });

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin({ wishlistProduct: data?.product });
      return;
    }
    toggleWishlist(data);
  };

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [{ breakpoint: { min: 481 } }, { breakpoint: { max: 480 } }];
  }, [globalConfig?.img_hd]);

  const searchParamsForInitial = isClient
    ? new URLSearchParams(location?.search)
    : null;

  const hasAnyFiltersInUrl = Array.from(
    searchParamsForInitial?.keys?.() ?? []
  )?.some?.((k) => !["q", "sort_on", "page_no"].includes(k));

  const isInitialCustomLayout =
    (productsListData?.page?.current ?? 1) === 1 &&
    !hasAnyFiltersInUrl &&
    !searchParamsForInitial?.get("sort_on");

  console.log("productList props", props?.collectionSelection?.value);

  return {
    heroBanner: props?.desktop_banner,
    mobileBanner: props?.mobile_banner,
    desktopMiddleBanner: props?.desktop_inbetween_banner,
    mobileMiddleBanner: props?.mobile_inbetween_banner,
    sideDesktopBanner: props?.desktop_side_image_banner,
    sideMobileBanner: props?.mobile_side_image_banner,
    productCount: page?.item_total,
    title: searchParams.get("q")
      ? `${t("resource.common.result_for")} "${searchParams.get("q")}"`
      : "",
    filterList,
    filters,
    selectedFilters,
    sortList: sortOn,
    productList: productList || items || [], // ✅ will always be max 18 now

    globalConfig,
    imgSrcSet,
    isResetFilterDisable,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    isWishlistIcon: true,
    followedIdList,
    isProductLoading: apiLoading,
    isInitialCustomLayout,
    isPageLoading,
    listingPrice,
    loadingOption: "pagination", // (optional) if you want to force pagination mode
    paginationProps,
    sortModalProps,
    filterModalProps,
    handleAddToCart,
    isImageFill: globalConfig?.img_fill,
    imageBackgroundColor: globalConfig?.img_container_bg,
    showImageOnHover: globalConfig?.show_image_on_hover,

    onResetFiltersClick: resetFilters,
    onFilterUpdate: handleFilterUpdate,
    onSortUpdate: handleSortUpdate,
    onFilterModalBtnClick: openFilterModal,
    onSortModalBtnClick: openSortModal,
    onWishlistClick: handleWishlistToggle,
    onViewMoreClick: handleLoadMoreProducts, // now just goes to next page
    onLoadMoreProducts: handleLoadMoreProducts,
  };
};

export default useCategoryCollectibles;
