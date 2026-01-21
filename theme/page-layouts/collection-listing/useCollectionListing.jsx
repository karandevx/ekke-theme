import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import useSortModal from "./useSortModal";
import useFilterModal from "./useFilterModal";
import { PLP_ADD_TO_CART, PLP_PRODUCTS } from "../../queries/plpQuery";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
  sortSizes,
} from "../../helper/utils";
import productPlaceholder from "../../assets/images/placeholder3x4.png";
import { useAccounts, useWishlist, useThemeConfig } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import { PRODUCT_SIZE_PRICE } from "../../queries/pdpQuery";
import { useToast } from "../../components/custom-toaster";
import {
  COLLECTION_WITH_ITEMS,
  COLLECTION_DETAILS,
} from "../../queries/collectionsQuery";

const PAGES_TO_SHOW = 5;
const PAGE_OFFSET = 2;

const useCollectionListing = ({ fpi, props, slug }) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isInternational, i18nDetails, defaultCurrency } = useInternational({
    fpi,
  });
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);

  const { globalConfig, listingPrice } = useThemeConfig({
    fpi,
    page: "collection-listing",
  });

  const {
    desktop_banner = "",
    mobile_banner = "",
    banner_link = "",
    loading_options = "pagination",
    page_size = 2, // Number of ROWS per page (not total products)
    hide_brand = false,
    grid_desktop = 4,
    grid_tablet = 3,
    grid_mob = 1,
    description = "",
    show_add_to_cart = true,
    card_cta_text = t("resource.common.add_to_cart"),
    img_resize = 300,
    img_resize_mobile = 500,
  } = Object.entries(props).reduce((acc, [key, { value }]) => {
    acc[key] = value;
    return acc;
  }, {});

  const pageSize = Number(page_size);

  const toast = useToast();

  const {
    headerHeight = 0,
    isCollectionsSsrFetched,
    customCollectionList: productsListData,
    customCollection,
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const {
    name: collectionName,
    description: collectionDesc,
    seo,
  } = customCollection || {};



  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);

  const { filters = [], sort_on: sortOn, page, items } = productsListData || {};

  const [productList, setProductList] = useState(items || undefined);
  const currentPage = productsListData?.page?.current ?? 1;
  const [apiLoading, setApiLoading] = useState(!isCollectionsSsrFetched);
  const [isPageLoading, setIsPageLoading] = useState(!isCollectionsSsrFetched);
  const {
    user_plp_columns = {
      desktop: Number(grid_desktop),
      tablet: Number(grid_tablet),
      mobile: Number(grid_mob),
    },
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const [isResetFilterDisable, setIsResetFilterDisable] = useState(true);
  const { product_details } = PRODUCT;

  const isAlgoliaEnabled = globalConfig?.algolia_enabled;

  const isClient = useMemo(() => isRunningOnClient(), []);

  // Track if we've already used SSR data to avoid duplicate API calls
  const hasUsedSsrData = useRef(false);
  const lastSlug = useRef(slug);
  const lastFetchedSlug = useRef(slug);
  // Track previous search to detect filter updates vs initial load
  const previousSearchRef = useRef(undefined);

  // Reset SSR data flag when collection slug changes
  useEffect(() => {
    if (lastSlug.current !== slug) {
      hasUsedSsrData.current = false;
      lastSlug.current = slug;
      previousSearchRef.current = undefined;
    }
  }, [slug]);

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

  // FIXED: Skip API call if SSR data is available on initial load
  useEffect(() => {
    if (!isClient) return;

    const searchParams = new URLSearchParams(location?.search);
    const pageNo = Number(searchParams?.get("page_no"));

    // Check if slug changed (navigating to different collection)
    const isSlugChange = lastFetchedSlug.current !== slug && lastFetchedSlug.current !== undefined;
    
    // Check if filters are being applied (not initial load and not slug change)
    const isFilterUpdate =
      !isSlugChange &&
      previousSearchRef.current !== location?.search &&
      previousSearchRef.current !== undefined;

    // On first render, if SSR data exists, use it and skip API call
    if (
      !hasUsedSsrData.current &&
      isCollectionsSsrFetched &&
      productsListData?.items?.length > 0 &&
      !isSlugChange
    ) {
      hasUsedSsrData.current = true;
      previousSearchRef.current = location?.search;
      setProductList(productsListData.items);
      setApiLoading(false);
      setIsPageLoading(false);

      const resetableFilterKeys =
        Array.from(searchParams?.keys?.() ?? [])?.filter?.(
          (i) => !["q", "sort_on", "page_no"].includes(i)
        ) ?? [];
      setIsResetFilterDisable(!resetableFilterKeys?.length);
      return;
    }

    // Mark that we've processed SSR data (even if it wasn't available)
    hasUsedSsrData.current = true;

    // Build filter query string - GraphQL expects 'search' for filter query, not 'filterQuery'
    const filterQueryString =
      appendDelimiter(searchParams?.toString()) || undefined;

    const payload = {
      slug,
      pageType: "number",
      first: pageSize,
      search: filterQueryString, // GraphQL expects 'search' for filter query
      sortOn: searchParams?.get("sort_on") || undefined,
      // Text search query goes in 'query' parameter if needed, but we're using 'search' for filters
    };

    if (loading_options === "pagination") {
      payload.pageNo = pageNo || 1;
    }

    // Only show full page loading on initial load or slug change, not on filter updates
    fetchProducts(payload, false, !isFilterUpdate || isSlugChange);

    const resetableFilterKeys =
      Array.from(searchParams?.keys?.() ?? [])?.filter?.(
        (i) => !["q", "sort_on", "page_no"].includes(i)
      ) ?? [];
    setIsResetFilterDisable(!resetableFilterKeys?.length);

    // Update previous search ref and last fetched slug
    previousSearchRef.current = location?.search;
    lastFetchedSlug.current = slug;
  }, [location?.search, pincode, slug]);

  const convertQueryParamsForAlgolia = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(location?.search);
    const filterParams = [];

    const skipKeys = new Set(["sort_on", "siteTheme", "page_no", "q"]);

    params.forEach((value, key) => {
      if (skipKeys.has(key)) return;

      const decodedValue = decodeURIComponent(value);

      const existingParam = filterParams.find((param) =>
        param.startsWith(`${key}:`)
      );

      if (existingParam) {
        const updatedParam = `${existingParam}||${decodedValue}`;
        filterParams[filterParams.indexOf(existingParam)] = updatedParam;
      } else {
        filterParams.push(`${key}:${decodedValue}`);
      }
    });

    return filterParams.join(":::");
  };

  const fetchProducts = (
    payload,
    append = false,
    showFullPageLoading = true
  ) => {
    setApiLoading(true);
    // Only show full page loading on initial load, not on filter updates
    if (!append && showFullPageLoading) {
      setIsPageLoading(true);
    }

    if (isAlgoliaEnabled) {
      // Fetch collection details first (for title, breadcrumbs, etc.)
      const fetchCollectionDetails = fpi
        .executeGQL(
          COLLECTION_DETAILS,
          { slug: payload?.slug },
          { skipStoreUpdate: true }
        )
        .then((res) => {
          if (res?.data?.collection) {
            fpi.custom.setValue("customCollection", res?.data?.collection);
          }
        })
        .catch((error) => {
          console.error("Error fetching collection details:", error);
        });

      // Use collections endpoint for collection pages, not products endpoint
      const BASE_URL = `${window.location.origin}/ext/algolia/application/api/v1.0/collections/${payload?.slug}/items`;

      const url = new URL(BASE_URL);
      url.searchParams.append(
        "page_id",
        payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
      );
      url.searchParams.append("page_size", payload?.first);

      const filterQuery = convertQueryParamsForAlgolia();

      if (payload?.sortOn) {
        url.searchParams.append("sort_on", payload?.sortOn);
      }
      if (filterQuery) {
        url.searchParams.append("f", filterQuery);
      }
      // Handle text search query separately (URL param 'q')
      const textSearch = isClient
        ? new URLSearchParams(location?.search)?.get("q")
        : null;
      if (textSearch) {
        url.searchParams.append("q", textSearch);
      }

      Promise.all([
        fetchCollectionDetails,
        fetch(url, {
          headers: {
            "x-location-detail": JSON.stringify({
              country_iso_code: i18nDetails?.countryCode || "IN",
            }),
            "x-currency-code":
              i18nDetails?.currency?.code || defaultCurrency?.code,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const productDataNormalization = data.items?.map((item) => ({
              ...item,
              media: item.medias,
            }));

            data.page.current = payload?.pageNo;

            const productList = {
              filters: data?.filters,
              items: productDataNormalization,
              page: data?.page,
              sort_on: data?.sort_on,
            };

            // Update the store with the correct key that pagination reads from
            fpi.custom.setValue("customCollectionList", productList);
            if (append) {
              setProductList((prevState) => {
                return prevState.concat(productList?.items || []);
              });
            } else {
              setProductList(productList?.items || []);
            }
          }),
      ])
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching products:", error);
          }
          toast.error("Failed to load products. Please try again.");
        })
        .finally(() => {
          setApiLoading(false);
          setIsPageLoading(false);
        });
    } else {
      fpi
        .executeGQL(COLLECTION_WITH_ITEMS, payload, { skipStoreUpdate: false })
        .then((res) => {
          const { collection, collectionItems } = res?.data || {};
          
          // Store collection details (name, description, seo) for title and breadcrumbs
          if (collection) {
            fpi.custom.setValue("customCollection", collection);
          }
          
          // Store collection items
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(collectionItems?.items || []);
            });
          } else {
            setProductList(collectionItems?.items || []);
          }
          // Update the store with the correct key that pagination reads from
          fpi.custom.setValue("customCollectionList", collectionItems);
        })
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching products:", error);
          }
          toast.error("Failed to load products. Please try again.");
        })
        .finally(() => {
          setApiLoading(false);
          setIsPageLoading(false);
        });
    }
  };

  const handleLoadMoreProducts = () => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const payload = {
      slug,
      pageNo: currentPage + 1,
      pageType: "number",
      first: pageSize,
      search: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
    };
    fetchProducts(payload, true);
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
    console.log("Add", product);

    console.log("Size Sort", product?.size_options[0]);
    if (!product?.size_options[0]) {
      toast.error("Product size information is not available");
      console.log("product does not have sizes", product);
      return;
    }

    let sellerId, storeId;

    if (!product?.seller?.uid || !product?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: product?.slug,
          size: product?.size_options[0],
          pincode: "",
        });

        console.log("ProductPRice", productPriceResponse);
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
            item_size: product?.size_options[0],
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
        (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    );
  }

  const getPageUrl = (pageNo) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.set("page_no", pageNo);
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
    // if (!productsListData?.page) {
    //   console.log("No page data found, returning undefined");
    //   return undefined;
    // }

    const {
      current,
      has_next: hasNext,
      has_previous: hasPrevious,
      item_total,
    } = productsListData?.page || {};

    const totalPageCount = Math.ceil(item_total / pageSize);
    const startingPage = getStartPage({ current, totalPageCount });

    const displayPageCount = Math.min(totalPageCount, PAGES_TO_SHOW);

    const pages = [];
    for (let i = 0; i < displayPageCount; i++) {
      pages.push({
        link: getPageUrl(startingPage + i),
        index: startingPage + i,
      });
    }

    // Disable next button on second-to-last page and last page to prevent empty states
    const safeHasNext = hasNext && current < totalPageCount;

    const result = {
      current: current || 1,
      hasNext: safeHasNext,
      hasPrevious,
      prevPageLink: hasPrevious ? getPageUrl(current - 1) : "",
      nextPageLink: safeHasNext ? getPageUrl(current + 1) : "",
      pages,
      user_plp_columns,
      totalPages: totalPageCount,
    };

    return result;
  }, [
    productsListData?.page,
    pageSize,
    user_plp_columns,
    location?.pathname,
    location?.search,
    isClient,
  ]);

  const handleColumnCountUpdate = ({ screen, count }) => {
    fpi.custom.setValue("user_plp_columns", {
      ...user_plp_columns,
      [screen]: count,
    });
  };

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

  // Build applied filters label for breadcrumb (e.g., "Collection / Brand, Category")
  // const appliedFiltersLabel = useMemo(() => {
  //   // Only include category/subcategory filters in breadcrumb
  //   const allowed = new Set(["custom-attribute-2", "custom-attribute-3"]);
  //   const names = [];
  //   selectedFilters
  //     ?.filter(({ key }) => allowed.has(key?.name))
  //     ?.forEach(({ values }) => {
  //       values?.forEach((v) => {
  //         const label = v?.display || v?.value;
  //         if (label) names.push(label);
  //       });
  //     });

  //   return names.length ? names.join(" / ") : "";
  // }, [selectedFilters]);

  const breadcrumb = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      {
        label: collectionName,
      },
    ],
    [collectionName, t]
  );

  const { openFilterModal, ...filterModalProps } = useFilterModal({
    filters: filterList ?? [],
    resetFilters,
    handleFilterUpdate,
  });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 481 }, width: img_resize },
      { breakpoint: { max: 480 }, width: img_resize_mobile },
    ];
  }, [globalConfig?.img_hd, img_resize, img_resize_mobile]);

  return {
    productDetails: product_details || {},
    breadcrumb,
    bannerTitle: collectionName,
    bannerDescription: collectionDesc,
    productCount: page?.item_total,
    title: searchParams.get("q")
      ? `${t("resource.common.result_for")} "${searchParams.get("q")}"`
      : "",
    description: description,
    filterList,
    filters,
    selectedFilters,
    sortList: sortOn,
    productList: productList || items || [],
    columnCount: user_plp_columns,
    isBrand: !hide_brand,
    isSaleBadge: globalConfig?.show_sale_badge,
    isPrice: globalConfig?.show_price,
    globalConfig,
    imgSrcSet,
    isResetFilterDisable,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    isWishlistIcon: true,
    followedIdList,
    isProductLoading: apiLoading,
    banner: {
      desktopBanner: desktop_banner,
      mobileBanner: mobile_banner,
      redirectLink: banner_link,
    },
    isPageLoading,
    listingPrice,
    loadingOption: loading_options,
    paginationProps,
    sortModalProps,
    filterModalProps,
    handleAddToCart,
    isImageFill: globalConfig?.img_fill,
    imageBackgroundColor: globalConfig?.img_container_bg,
    showImageOnHover: globalConfig?.show_image_on_hover,
    imagePlaceholder: productPlaceholder,
    showAddToCart:
      !isInternational && show_add_to_cart && !globalConfig?.disable_cart,
    actionButtonText: card_cta_text,
    stickyFilterTopOffset: 56,
    onResetFiltersClick: resetFilters,
    onColumnCountUpdate: handleColumnCountUpdate,
    onFilterUpdate: handleFilterUpdate,
    onSortUpdate: handleSortUpdate,
    onFilterModalBtnClick: openFilterModal,
    onSortModalBtnClick: openSortModal,
    onWishlistClick: handleWishlistToggle,
    onViewMoreClick: handleLoadMoreProducts,
    onLoadMoreProducts: handleLoadMoreProducts,
    fetchProducts,
  };
};

export default useCollectionListing;
