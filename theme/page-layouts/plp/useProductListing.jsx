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

const PAGES_TO_SHOW = 5;
const PAGE_OFFSET = 2;

const useProductListing = ({ fpi, props }) => {
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
    page: "product-listing",
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

    hide_single_size = false,
    preselect_size = true,
    img_resize = 300,
    img_resize_mobile = 500,
    banner_title,
    banner_description,
    collection_title_1,
    collection_title_2,
    collection_title_3,
    collection_url_1,
    collection_url_2,
    collection_url_3,
  } = Object.entries(props).reduce((acc, [key, { value }]) => {
    acc[key] = value;
    return acc;
  }, {});

  const pageSize = Number(page_size);

  const toast = useToast();

  const { isPlpSsrFetched, customProductList: productsListData } =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);

  const { filters = [], sort_on: sortOn, page, items } = productsListData || {};

  const [productList, setProductList] = useState(items || undefined);
  const currentPage = productsListData?.page?.current ?? 1;
  const [apiLoading, setApiLoading] = useState(!isPlpSsrFetched);
  const [isPageLoading, setIsPageLoading] = useState(!isPlpSsrFetched);
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false);
  const previousSearchRef = useRef(location?.search);
  const {
    user_plp_columns = {
      desktop: Number(grid_desktop),
      tablet: Number(grid_tablet),
      mobile: Number(grid_mob),
    },
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const [isResetFilterDisable, setIsResetFilterDisable] = useState(true);
  const { product_details, product_meta, product_price_by_slug } = PRODUCT;

  const isAlgoliaEnabled = globalConfig?.algolia_enabled;

  const isClient = useMemo(() => isRunningOnClient(), []);

  const breadcrumb = useMemo(() => {
    const searchQuery = isClient
      ? new URLSearchParams(location?.search)?.get("q")
      : null;

    const breadcrumbItems = [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
    ];

    if (searchQuery) {
      breadcrumbItems.push({
        label: t("resource.common.breadcrumb.products"),
        link: "/products",
      });
      breadcrumbItems.push({
        label: `${t("resource.common.result_for")} "${searchQuery}"`,
      });
    } else {
      breadcrumbItems.push({ label: t("resource.common.breadcrumb.products") });
    }

    return breadcrumbItems;
  }, [t, location?.search, isClient]);

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

  // FIXED: Removed problematic condition that was blocking pagination
  useEffect(() => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const pageNo = Number(searchParams?.get("page_no"));
    
    // Check if filters are being applied (not initial load)
    const isFilterUpdate = previousSearchRef.current !== location?.search && previousSearchRef.current !== undefined;
    const resetableFilterKeys =
      Array.from(searchParams?.keys?.() ?? [])?.filter?.(
        (i) => !["q", "sort_on", "page_no"].includes(i)
      ) ?? [];
    const hasFilters = resetableFilterKeys.length > 0;
    
    // Update filter state
    if (isFilterUpdate && hasFilters) {
      setHasFiltersApplied(true);
    }
    
    const payload = {
      pageType: "number",
      first: pageSize,
      filterQuery: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
      search: searchParams?.get("q") || undefined,
      enableFilter: true,
    };

    if (loading_options === "pagination") {
      payload.pageNo = pageNo || 1;
    }

    // Only show full page loading on initial load, not on filter updates
    fetchProducts(payload, false, !isFilterUpdate);

    setIsResetFilterDisable(!hasFilters);
    
    // Update previous search ref
    previousSearchRef.current = location?.search;
  }, [location?.search, pincode]);

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

  const fetchProducts = (payload, append = false, showFullPageLoading = true) => {
    setApiLoading(true);
    if (!append && showFullPageLoading) {
      setIsPageLoading(true);
    }

    if (isAlgoliaEnabled) {
      const BASE_URL = `${window.location.origin}/ext/algolia/application/api/v1.0/products`;

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
      if (payload?.search) {
        url.searchParams.append("q", payload?.search);
      }

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

          fpi.custom.setValue("customProductList", productList);
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(productList?.items || []);
            });
          } else {
            setProductList(productList?.items || []);
          }
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
          // Reset filter UI state after products are loaded
          if (hasFiltersApplied) {
            setHasFiltersApplied(false);
          }
        });
    } else {
      fpi
        .executeGQL(PLP_PRODUCTS, payload, { skipStoreUpdate: false })
        .then((res) => {
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(res?.data?.products?.items || []);
            });
          } else {
            setProductList(res?.data?.products?.items || []);
          }
          fpi.custom.setValue("customProductList", res?.data?.products);
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
          // Reset filter UI state after products are loaded
          if (hasFiltersApplied) {
            setHasFiltersApplied(false);
          }
        });
    }
  };

  const handleLoadMoreProducts = () => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const payload = {
      pageNo: currentPage + 1,
      pageType: "number",
      first: pageSize,
      filterQuery: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
      search: searchParams?.get("q") || undefined,
      enableFilter: true,
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

  // Helper function to get the smallest size from product
  const getSmallestSize = (product) => {
    // PDP-style sizes: product.sizes.sizes = [{ value, display, quantity, ... }]
    if (product?.sizes?.sizes?.length) {
      const sorted = sortSizes([...product.sizes.sizes]);
      return sorted[0]?.value || sorted[0]?.display;
    }

    // Simple array like ["S", "M", "L"] or [{ value: "S" }, ...]
    if (Array.isArray(product?.sizes) && product.sizes.length) {
      const normalized = product.sizes.map((s) =>
        typeof s === "string" ? { value: s } : s
      );
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    // size_options: ["S", "M", "L"]
    if (Array.isArray(product?.size_options) && product.size_options.length) {
      const normalized = product.size_options.map((s) => ({ value: s }));
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    // Fallback to first size if available
    return product?.sizes?.[0]?.value || product?.sizes?.[0] || null;
  };

  const handleAddToCart = async (product) => {
    // Get the smallest size from sorted sizes
    const smallestSize = product?.selectedSize || getSmallestSize(product);

    if (!smallestSize) {
      toast.error("Product size information is not available");
      console.log("product does not have sizes", product);
      return;
    }

    let sellerId, storeId;

    if (!product?.seller?.uid || !product?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: product?.slug,
          size: smallestSize,
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
            item_size: smallestSize,
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
  }, [productsListData?.page, pageSize, user_plp_columns]);

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
      const isNameInQuery =
        searchParams?.has(filter?.key?.name) ||
        filter?.values?.some(({ is_selected }) => is_selected);
      return { ...filter, isOpen: isNameInQuery };
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
    bannerTitle: banner_title,
    bannerDescription: banner_description,

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
    hasFiltersApplied,
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
  };
};

export default useProductListing;
