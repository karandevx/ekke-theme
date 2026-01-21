/**
 * ProductCard Component
 *
 * This React component renders a product card with various customizable options such as displaying brand, price, sale badges, wishlist icons, and more. It supports responsive design with different layouts for mobile, tablet, and desktop views.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.product - The product data to be displayed.
 * @param {Array} [props.customClass=[]] - Custom CSS classes to apply to the card.
 * @param {string} [props.listingPrice="range"] - Determines the price display format ("min", "max", or "range").
 * @param {boolean} [props.isHdimgUsed=false] - Flag to determine if high-definition images should be used.
 * @param {number} [props.aspectRatio=0.8] - Aspect ratio for the product image.
 * @param {boolean} [props.isBrand=true] - Flag to display the brand name.
 * @param {boolean} [props.isPrice=true] - Flag to display the price.
 * @param {boolean} [props.isSaleBadge=true] - Flag to display a sale badge if applicable.
 * @param {boolean} [props.isWishlistIcon=true] - Flag to display a wishlist icon.
 * @param {boolean} [props.isImageFill=false] - Flag to determine if the image should fill its container.
 * @param {boolean} [props.showImageOnHover=false] - Flag to show a different image on hover.
 * @param {string} [props.imageBackgroundColor=""] - Background color for the image.
 * @param {string} [props.imagePlaceholder=""] - Placeholder image URL.
 * @param {Object} [props.columnCount={ desktop: 4, tablet: 3, mobile: 1 }] - Number of columns for different viewports.
 * @param {Function} [props.WishlistIconComponent=({ isFollowed }) => <SvgWrapper svgSrc={isFollowed ? "wishlist-plp" : "wishlist-pdp"} />] - Custom component for the wishlist icon.
 * @param {boolean} [props.isRemoveIcon=false] - Flag to display a remove icon.
 * @param {Function} [props.RemoveIconComponent=() => <SvgWrapper svgSrc="item-close" />] - Custom component for the remove icon.
 * @param {Array} [props.followedIdList=[]] - List of followed product IDs.
 * @param {Function} [props.onWishlistClick=() => {}] - Callback function for wishlist icon click.
 * @param {Function} [props.handleAddToCart=() => {}] - Callback function for add to cart action.
 * @param {Function} [props.onRemoveClick=() => {}] - Callback function for remove icon click.
 * @param {boolean} [props.centerAlign=false] - Flag to center align text.
 * @param {boolean} [props.showAddToCart=false] - Flag to display the add to cart button.
 * @param {Function} [props.onClick=() => {}] - Callback function for card click.
 * @param {boolean} [props.showBadge=true] - Flag to display product badges.
 * @param {boolean} [props.isSlider=false] - Flag to indicate if card is used in a slider.
 *
 * @returns {JSX.Element} The rendered product card component.
 *
 * Note: Color variants are now clickable and will change the product image using optimized state management.
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  cn,
  currencyFormat,
  formatLocale,
  sortSizes,
} from "../../helper/utils";
import { useMobile, useViewport } from "../../helper/hooks";
import styles from "./product-card.less";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";

import useProductCardPrice from "./useProductCardPrice";

import SvgWrapper from "../core/svgWrapper/SvgWrapper";
import { useNavigate } from "react-router-dom";
import FyImage from "../core/fy-image/fy-image";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../../queries/plpQuery";

const ProductCard = ({
  product,
  customClass = [],
  listingPrice = "min",
  imgSrcSet = [
    { breakpoint: { min: 1024 }, width: 600 },
    { breakpoint: { min: 768 }, width: 300 },
    { breakpoint: { min: 481 }, width: 300 },
    { breakpoint: { max: 390 }, width: 300 },
    { breakpoint: { max: 480 }, width: 300 },
  ],
  isBrand = true,
  isPrice = true,
  isSaleBadge = true,
  isWishlistIcon = true,
  isImageFill = true,
  showImageOnHover = true,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  isPlp = false,
  columnCount,
  WishlistIconComponent = ({ isFollowed }) => (
    <SvgWrapper svgSrc={isFollowed ? "wishlist-pdp" : "wishlist-plp"} />
  ),
  isRemoveIcon = false,
  RemoveIconComponent = () => (
    <SvgWrapper svgSrc="item-close" className={styles.removeIcon} />
  ),
  actionButtonText,
  followedIdList = [],
  onWishlistClick = () => {},
  handleAddToCart = () => {},
  onRemoveClick = () => {},
  centerAlign = false,
  showAddToCart = false,
  showBadge = true,
  isSlider = false,
  onClick = () => {},
  externalStyles = {},
  mobileAspectRatio = "",
  imageContainerStyle = {},
  mobileImageContainerStyle = {},
}) => {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const navigate = useNavigate();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const locale = i18nDetails?.language?.locale || "en";
  const countryCode = i18nDetails?.countryCode || "IN";
  const isMobile = useMobile();
  const isTablet = useViewport(0, 768);
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const { product_details } = PRODUCT;

  // Merge styles based on screen size
  const finalImageStyle = isMobile
    ? mobileImageContainerStyle
    : imageContainerStyle;

  // =================== OPTIMIZED COLOR VARIANT FUNCTIONALITY ===================

  // Memoized variant processing for better performance
  const colorVariants = useMemo(() => {
    // Handle multiple shapes: color/image types OR text with key primary_color / color headers
    const variants = product.variants?.find((variant) => {
      if (
        variant.display_type === "color" ||
        variant.display_type === "image"
      ) {
        return true;
      }
      if (variant.display_type === "text") {
        const header = (variant.header || "").toLowerCase();
        const key = (variant.key || "").toLowerCase();
        return key === "primary_color" || header.includes("color");
      }
      return false;
    });

    if (!variants?.items?.length) {
      return { items: [], count: 0, defaultVariant: null, hasVariants: false };
    }

    const defaultVariant = variants.items.find(
      (variant) => product.slug === variant.slug
    );

    return {
      items: variants.items,
      count: variants.items.length,
      defaultVariant,
      hasVariants: true,
    };
  }, [product.variants, product.slug]);

  // Optimized state management for selected variant
  const [selectedVariant, setSelectedVariant] = useState(null);

  // State to track fetched sizes for the selected color variant
  const [fetchedVariantSizes, setFetchedVariantSizes] = useState(null);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);

  // Mobile: Track if hover image is visible (for single-tap-to-show, double-tap-to-navigate)
  const [isTabletSizesVisible, setIsTabletSizesVisible] = useState(false);
  const cardRef = useRef(null);
  
  // Global ref to track the currently active card (shared across all cards)
  if (typeof window !== 'undefined' && !window.__activeProductCardRef) {
    window.__activeProductCardRef = { current: null };
  }
  
  const activeCardRef = typeof window !== 'undefined' ? window.__activeProductCardRef : { current: null };

  // Current active variant with fallback
  const currentShade = selectedVariant;

  // Fetch sizes for the selected color variant - only when variant changes
  useEffect(() => {
    const fetchVariantSizes = async () => {
      // Only fetch if a variant is selected and it's different from base product
      if (!currentShade?.slug || currentShade.slug === product.slug) {
        // Clear fetched sizes when no variant is selected - show original sizes
        if (fetchedVariantSizes) {
          setFetchedVariantSizes(null);
        }
        return;
      }

      // Skip if we already have sizes for this exact variant
      if (fetchedVariantSizes?.slug === currentShade.slug) {
        return;
      }

      // If we have sizes for a different variant, clear them to show original sizes
      // This prevents showing wrong sizes while loading new variant sizes
      if (
        fetchedVariantSizes &&
        fetchedVariantSizes.slug !== currentShade.slug
      ) {
        setFetchedVariantSizes(null);
      }

      setIsLoadingSizes(true);

      try {
        const response = await fpi.executeGQL(
          GET_QUICK_VIEW_PRODUCT_DETAILS,
          { slug: currentShade.slug },
          { skipStoreUpdate: true }
        );

        const variantProduct = response?.data?.product;
        if (variantProduct) {
          // Only update sizes once API call completes successfully
          setFetchedVariantSizes({
            slug: currentShade.slug,
            sizes: variantProduct.sizes,
            sizeVariants:
              variantProduct.variants?.find(
                (variant) =>
                  variant.display_type === "text" && variant.key === "size"
              )?.items || [],
          });
        }
      } catch (error) {
        console.error("Error fetching variant sizes:", error);
        // Don't reset on error - keep showing original sizes
      } finally {
        setIsLoadingSizes(false);
      }
    };

    // Only fetch when variant is actually selected (not on initial mount)
    if (currentShade?.slug && currentShade.slug !== product.slug) {
      fetchVariantSizes();
    }
  }, [currentShade?.slug, product.slug, fpi]);

  // Size variants processing - uses fetched sizes if available, otherwise shows original sizes
  const sizeVariants = useMemo(() => {
    // Priority 1: Use fetched sizes from API for the selected color variant (only if variant is selected)
    if (currentShade?.slug && fetchedVariantSizes?.slug === currentShade.slug) {
      // Check if we have size variants from the fetched product
      if (fetchedVariantSizes.sizeVariants?.length > 0) {
        return {
          items: fetchedVariantSizes.sizeVariants,
          hasVariants: true,
        };
      }
      // Check if we have sizes from the fetched product
      if (fetchedVariantSizes.sizes?.sizes?.length > 0) {
        return {
          items: fetchedVariantSizes.sizes.sizes,
          hasVariants: true,
        };
      }
    }

    // Priority 2: Use size variants from base product variants (original sizes)
    const variants = product.variants?.find(
      (variant) => variant.display_type === "text" && variant.key === "size"
    );

    if (variants?.items?.length) {
      return {
        items: variants.items,
        hasVariants: true,
      };
    }

    // Priority 3: Fallback to product sizes (original sizes)
    if (product?.sizes?.sizes?.length || product?.sizes?.length) {
      return {
        items: product.sizes.sizes || product.sizes,
        hasVariants: true,
      };
    }

    return { items: [], hasVariants: false };
  }, [
    currentShade?.slug,
    fetchedVariantSizes,
    product.variants,
    product.sizes,
  ]);

  // Build a displayed product that reflects the selected color variant
  const displayedProduct = useMemo(() => {
    if (!currentShade) return product;
    return {
      ...product,
      uid: currentShade.uid ?? product.uid,
      slug: currentShade.slug ?? product.slug,
      name: currentShade.name ?? product.name,
      media: currentShade.medias?.length ? currentShade.medias : product.media,
    };
  }, [product, currentShade]);

  // Use custom hook to fetch product price data - updated to use current variant
  const {
    priceData,
    isLoading: isPriceLoading,
    getPrice,
    hasDiscount: hasPriceDiscount,
    discount: fetchedDiscount,
  } = useProductCardPrice({
    fpi,
    product: displayedProduct, // Use displayedProduct instead of base product
    slug: currentShade?.slug || product.slug, // Pass the current variant slug
  });

  // Optimized image processing with memoization
  const getProductImages = useCallback(
    (variant = null) => {
      // Priority: variant medias -> base product media -> empty array
      if (variant?.medias?.length) {
        return variant.medias.filter((media) => media.type === "image");
      }
      return product?.media?.filter((media) => media.type === "image") || [];
    },
    [product?.media]
  );

  // Memoized image data to prevent unnecessary recalculations
  const imageData = useMemo(() => {
    const currentImages = getProductImages(currentShade);
    const fallbackImages = getProductImages();

    // For hover image, prioritize the second image from current variant
    const mainImageUrl =
      currentImages[0]?.url || fallbackImages[0]?.url || imagePlaceholder;
    const hoverImageUrl = currentImages[1]?.url || fallbackImages[1]?.url || "";

    return {
      url: mainImageUrl,
      alt:
        currentImages[0]?.alt ||
        fallbackImages[0]?.alt ||
        `${displayedProduct?.brand?.name || product?.brand?.name} | ${displayedProduct?.name || product?.name}`,
      hoverUrl: hoverImageUrl,
      hoverAlt:
        currentImages[1]?.alt ||
        fallbackImages[1]?.alt ||
        `${displayedProduct?.brand?.name || product?.brand?.name} | ${displayedProduct?.name || product?.name}`,
    };
  }, [
    currentShade,
    getProductImages,
    imagePlaceholder,
    displayedProduct?.brand?.name,
    displayedProduct?.name,
  ]);

  // Optimized variant display order with memoization
  const orderedVariants = useMemo(() => {
    if (!colorVariants.hasVariants) return [];

    const { items, defaultVariant } = colorVariants;
    const otherVariants = items.filter((v) => v.uid !== defaultVariant?.uid);

    return defaultVariant ? [defaultVariant, ...otherVariants] : items;
  }, [colorVariants]);

  // Enhanced price calculation logic using fetched price data
  const getListingPrice = (key) => {
    // First priority: Use fetched price data from API (like PDP)

    if (priceData?.price && priceData.price[key]) {
      const price = priceData.price[key];
      const currencySymbol = priceData.price.currency_symbol;

      return (
        currencyFormat(
          price,
          currencySymbol,
          formatLocale(locale, countryCode, true)
        ) || ""
      );
    }

    // Second priority: Use variant-specific price if available (always show min/single)
    if (currentShade?.price && currentShade.price[key]) {
      const priceDetails = currentShade.price[key];
      const priceValue =
        typeof priceDetails === "number"
          ? priceDetails
          : (priceDetails.min ?? priceDetails.max ?? priceDetails);
      return (
        currencyFormat(
          priceValue,
          priceDetails.currency_symbol || "₹",
          formatLocale(locale, countryCode, true)
        ) || ""
      );
    }

    // Third priority: Use sizes price data (from the JSON structure) - always min
    if (product.sizes?.price && product.sizes.price[key]) {
      const priceDetails = product.sizes.price[key];

      return (
        currencyFormat(
          priceDetails.min ?? priceDetails.max,
          priceDetails.currency_symbol,
          formatLocale(locale, countryCode, true)
        ) || ""
      );
    }

    // Fallback: Use original product price data
    const priceDataDefault = product.price;

    if (!priceDataDefault) {
      return "";
    }

    // Handle the price structure similar to PDP component
    const priceDetails = priceDataDefault[key];

    if (!priceDetails) {
      return "";
    }

    // Always show min (or single) price for fallback data
    return (
      currencyFormat(
        priceDetails.min ?? priceDetails.max,
        priceDetails.currency_symbol,
        formatLocale(locale, countryCode, true)
      ) || ""
    );
  };

  // Use fetched discount data or calculate from price comparison or use sizes discount
  const hasDiscount =
    hasPriceDiscount ||
    getListingPrice("effective") !== getListingPrice("marked") ||
    !!product.sizes?.discount;

  const discountText =
    fetchedDiscount || product.discount || product.sizes?.discount;

  const isFollowed = useMemo(() => {
    return !!followedIdList?.includes(displayedProduct?.uid);
  }, [followedIdList, displayedProduct]);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onWishlistClick({ product: displayedProduct, isFollowed });
  };

  const handleSizeClick = (e, size) => {
    e.stopPropagation();
    e.preventDefault();

    // Navigate to PDP with size query parameter
    if (size && product?.slug) {
      navigate(
        `/product/${product.slug}?selected_size=${encodeURIComponent(size)}`
      );
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemoveClick({ product: displayedProduct, isFollowed });
  };

  const gridClass = useMemo(() => {
    const mobileClass =
      columnCount?.mobile === 1
        ? styles["mob-grid-1-card"]
        : columnCount?.mobile === 2
          ? styles["mob-grid-2-card"]
          : columnCount?.mobile === 4
            ? styles["mob-grid-4-card"]
            : styles["mob-grid-2-card"]; // default fallback

    const tabletClass =
      columnCount?.tablet === 2
        ? styles["tablet-grid-2-card"]
        : columnCount?.tablet === 4
          ? styles["tablet-grid-4-card"]
          : styles["tablet-grid-3-card"];
    const desktopClass =
      columnCount?.desktop === 2
        ? styles["desktop-grid-2-card"]
        : columnCount?.desktop === 4
          ? styles["desktop-grid-4-card"]
          : columnCount?.desktop === 8
            ? styles["desktop-grid-8-card"]
            : null;

    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  }, [columnCount?.desktop, columnCount?.tablet, columnCount?.mobile]);

  const handleAddToCartClick = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isTablet && !isTabletSizesVisible) {
      setIsTabletSizesVisible(true);
      return;
    }

    // Create a product object with the smallest size for add to cart
    const productWithSmallestSize = {
      ...displayedProduct,
      selectedSize: getSmallestSize,
    };

    handleAddToCart(productWithSmallestSize);
  };

  // Optimized variant click handler with useCallback
  const handleVariantClick = useCallback(
    (event, variant) => {
      event?.preventDefault();
      event?.stopPropagation();

      // Only update if different variant is selected
      if (variant.uid !== currentShade?.uid) {
        setSelectedVariant(variant);
      }
    },
    [currentShade?.uid]
  );

  const isOutOfStock = !product?.sellable;

  // Hide hover when scrolling
  useEffect(() => {
    if (!isTablet || !isTabletSizesVisible) return;
    
    let scrollTimeout;
    const handleScroll = () => {
      // Clear any existing timeout
      clearTimeout(scrollTimeout);
      
      // Debounce scroll to avoid too many state updates
      scrollTimeout = setTimeout(() => {
        if (isTabletSizesVisible && activeCardRef.current === setIsTabletSizesVisible) {
          setIsTabletSizesVisible(false);
          activeCardRef.current = null;
        }
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isTablet, isTabletSizesVisible]);

  // Hide hover when clicking outside or on another card
  useEffect(() => {
    if (!isTablet || !isTabletSizesVisible) return;
    
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        // Clicked outside this card - hide hover
        if (activeCardRef.current === setIsTabletSizesVisible) {
          setIsTabletSizesVisible(false);
          activeCardRef.current = null;
        }
      }
    };
    
    // Use capture phase to catch clicks before they bubble
    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isTablet, isTabletSizesVisible]);

  // Mobile card click handler
  const handleCardClick = (e) => {
    if (isTablet || isMobile) {
      if (!isTabletSizesVisible) {
        // First tap: show hover image (like desktop hover)
        e.preventDefault();
        e.stopPropagation();
        
        // Hide any previously active card
        if (activeCardRef.current && activeCardRef.current !== setIsTabletSizesVisible) {
          activeCardRef.current(false);
        }
        
        // Show hover for this card
        setIsTabletSizesVisible(true);
        activeCardRef.current = setIsTabletSizesVisible;
        return;
      }
      // Second tap: navigate to PDP (allow default onClick behavior)
      // Reset state for next time
      setIsTabletSizesVisible(false);
      activeCardRef.current = null;
    }
    // Desktop: direct navigation
    onClick(e);
  };

  // ========= SORTED SIZES =========
  // ========= SORTED SIZES =========
  const sortedSizes = useMemo(() => {
    const collected = [];

    // Priority 1: Use fetched sizes from API for the selected color variant (only if variant is selected)
    if (
      currentShade?.slug &&
      fetchedVariantSizes?.slug === currentShade.slug &&
      fetchedVariantSizes?.sizes
    ) {
      // PDP-style sizes: sizes.sizes = [{ value, display, quantity, ... }]
      if (
        Array.isArray(fetchedVariantSizes.sizes.sizes) &&
        fetchedVariantSizes.sizes.sizes.length
      ) {
        collected.push(
          ...fetchedVariantSizes.sizes.sizes.map((s) =>
            typeof s === "string" ? { value: s } : s
          )
        );
      }
      // Simple array like ["S", "M", "L"] or [{ value: "S" }, ...]
      else if (
        Array.isArray(fetchedVariantSizes.sizes) &&
        fetchedVariantSizes.sizes.length
      ) {
        collected.push(
          ...fetchedVariantSizes.sizes.map((s) =>
            typeof s === "string" ? { value: s } : s
          )
        );
      }
    }

    // Priority 2: sizeVariants.items (text variants)
    if (sizeVariants.hasVariants && sizeVariants.items?.length) {
      collected.push(
        ...sizeVariants.items.map((s) =>
          typeof s === "string" ? { value: s } : s
        )
      );
    }

    // Priority 3: PDP-style sizes: product.sizes.sizes = [{ value, display, ... }] (original sizes)
    if (product?.sizes?.sizes?.length) {
      collected.push(
        ...product.sizes.sizes.map((s) =>
          typeof s === "string" ? { value: s } : s
        )
      );
    }
    // Priority 4: Simple array like ["S", "M", "L"] or [{ value: "S" }, ...] (original sizes)
    else if (Array.isArray(product?.sizes) && product.sizes.length) {
      collected.push(
        ...product.sizes.map((s) => (typeof s === "string" ? { value: s } : s))
      );
    }

    // Priority 5: size_options: ["S", "M", "L"] (original sizes)
    if (Array.isArray(product?.size_options) && product.size_options.length) {
      collected.push(...product.size_options.map((s) => ({ value: s })));
    }

    if (!collected.length) return [];

    // Deduplicate by value/display
    const seen = new Set();
    const unique = collected.filter((s) => {
      const key = s.value || s.display;
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return sortSizes(unique);
  }, [
    currentShade?.slug,
    fetchedVariantSizes,
    sizeVariants,
    product?.sizes,
    product?.sizes?.sizes,
    product?.size_options,
  ]);

  // Get the smallest size from sorted sizes for add to cart
  // Get the smallest size from sorted sizes for add to cart
  const getSmallestSize = useMemo(() => {
    if (sortedSizes.length > 0) {
      // First item is already the smallest due to ascending sort
      const first = sortedSizes[0];
      return first?.value || first?.display || first;
    }

    // Fallbacks (very defensive, but should rarely hit if sortedSizes is correct)
    if (product?.sizes?.sizes?.length) {
      const sorted = sortSizes([...product.sizes.sizes]);
      return sorted[0]?.value || sorted[0]?.display;
    }

    if (Array.isArray(product?.sizes) && product.sizes.length) {
      const normalized = product.sizes.map((s) =>
        typeof s === "string" ? { value: s } : s
      );
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    if (Array.isArray(product?.size_options) && product.size_options.length) {
      const normalized = product.size_options.map((s) => ({ value: s }));
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    return null;
  }, [sortedSizes, product?.sizes, product?.size_options]);

  const handleCardTouchStart = (e) => {
    // On touch devices: first tap should show hover image (like desktop hover)
    if ((isTablet || isMobile) && !isTabletSizesVisible) {
      e.preventDefault();
      e.stopPropagation();
      
      // Hide any previously active card
      if (activeCardRef.current && activeCardRef.current !== setIsTabletSizesVisible) {
        activeCardRef.current(false);
      }
      
      // Show hover for this card
      setIsTabletSizesVisible(true);
      activeCardRef.current = setIsTabletSizesVisible;
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        styles.productCard,
        {
          [styles.disableCursor]: !product.sellable,
          [styles[customClass[0]]]: styles[customClass[0]],
          [styles[customClass[1]]]: styles[customClass[1]],
          [styles[customClass[2]]]: styles[customClass[2]],
          [gridClass]: gridClass,
          [styles.sliderCard]: isSlider,
          [styles.mobileSizesVisible]: (isTablet || isMobile) && isTabletSizesVisible,
        },
        externalStyles?.productCard
      )}
      onClick={handleCardClick}
      onTouchStart={handleCardTouchStart}
    >
      <div
        className={cn(styles.imageContainer, externalStyles?.imageContainer)}
        style={{ width: "100%" }} // Ensure full width
      >
        {/* Color variants overlay (top-left) */}
        {orderedVariants.length > 0 && (
          <div
            className={cn(styles.colorVariantsOverlay, {
              "bg-ekke-bg opacity-50": isOutOfStock, // ✅ Dim only text/content area
            })}
          >
            {orderedVariants.slice(0, 4).map((variant) => {
              const rawColor = variant?.color || variant?.value || "#ccc";
              const cssColor =
                typeof rawColor === "string" && rawColor[0] !== "#"
                  ? `#${rawColor}`
                  : rawColor;
              return (
                <button
                  key={variant.uid}
                  className={`${styles.colorDotBtn} ${
                    currentShade?.uid === variant.uid ? styles.currentColor : ""
                  }`}
                  style={{ "--color": cssColor }}
                  onClick={(e) => handleVariantClick(e, variant)}
                  aria-label={`Color ${variant.display || variant.value}`}
                />
              );
            })}
            {orderedVariants.length > 4 && (
              <span className={styles.moreColors} onClick={handleCardClick}>
                <SvgWrapper svgSrc="plusblack" />
              </span>
            )}
          </div>
        )}
        {/* Main Image */}

        <div>
          <FyImage
            src={imageData.url}
            aspectRatio={9 / 16}
            mobileAspectRatio={9 / 16}
            disableAnimation={true}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-ekke-bg bg-opacity-50 flex items-center justify-center h-6 top-1/2">
              <span className="text-black font-archivo text-[11px] font-normal  uppercase py-2">
                Sold Out
              </span>
            </div>
          )}
        </div>
        {/* Hover Image */}
        {showImageOnHover && imageData.hoverUrl && (
          <div
            className={cn(
              styles.hoverImageWrapper,
              { [styles.showHoverOnTouch]: (isTablet || isMobile) && isTabletSizesVisible }
            )}
          >
            <FyImage
              src={imageData.hoverUrl}
              aspectRatio={9 / 16}
              mobileAspectRatio={9 / 16}
              disableAnimation={true}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-ekke-bg bg-opacity-50 flex items-center justify-center h-6 top-1/2">
                <span className="text-black font-archivo text-[11px] font-normal  uppercase py-2">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permanent Add to Cart Button */}
      <div className={styles.addToCartSection}>
        {isOutOfStock ? (
          <button
            className={cn(styles.wishListButton, {
              [styles.mobileSizesVisible]: (isTablet || isMobile) && isTabletSizesVisible,
            })}
            onClick={handleWishlistClick}
          >
            <span className={styles.addToCartText}>WishList</span>
          </button>
        ) : (
          <button
            className={cn(styles.addToCartButton, {
              [styles.mobileSizesVisible]: (isTablet || isMobile) && isTabletSizesVisible,
            })}
            onClick={handleAddToCartClick}
            // disabled={!product.sellable}
          >
            <span className={styles.addToCartText}>ADD TO CART</span>
          </button>
        )}
      </div>

      <div
        className={cn(
          styles.productDescContainer,
          externalStyles?.productDescriptionContainer,
          {
            "bg-ekke-bg opacity-50": isOutOfStock, // ✅ Dim only text/content area,
          }
        )}
      >
        <div
          className={cn(styles.productDesc, externalStyles?.productDescription)}
        >
          <div
            className={cn(
              "md:space-y-2 space-y-2",
              externalStyles?.productDescription
            )}
          >
            {isBrand && (displayedProduct.brand || product.brand) && (
              <h3 className={styles.productBrand}>
                {(displayedProduct.brand || product.brand).name}
              </h3>
            )}
            <h5
              className={cn(
                styles.productName,
                "b2",
                centerAlign ? styles.centerAlign : "",
                externalStyles?.productName
              )}
              title={displayedProduct.name || product.name}
            >
              {displayedProduct.name || product.name}
            </h5>
            {isPrice &&
              (priceData ||
                displayedProduct?.price ||
                product?.price ||
                product.sizes?.price) && (
                <div
                  className={cn(
                    styles.productPrice,
                    centerAlign ? styles.center : "",
                    externalStyles?.productPrice
                  )}
                >
                  {isPriceLoading ? (
                    <span
                      className={`${styles["productPrice--loading"]} captionNormal`}
                    >
                      Loading price...
                    </span>
                  ) : (
                    <>
                      {getListingPrice("effective") && (
                        <span className={`${styles["productPrice--sale"]} h4`}>
                          {getListingPrice("effective")}
                        </span>
                      )}
                      {hasDiscount && getListingPrice("marked") && (
                        <span
                          className={`${styles["productPrice--regular"]} captionNormal`}
                        >
                          {getListingPrice("marked")}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
          </div>
          {/* WISHLIST & SIZE VARIANTS ROW */}
          {(isWishlistIcon ||
            isRemoveIcon ||
            sizeVariants.hasVariants ||
            product?.sizes?.length > 0) && (
            <div className={styles.wishlistAndSizesRow}>
              {/* SIZE VARIANTS SECTION */}
              {(() => {
                const allValidSizes = sortedSizes.filter(
                  (variant) =>
                    (variant.value &&
                      variant.value !== "undefined" &&
                      String(variant.value).trim() !== "") ||
                    (variant.display &&
                      variant.display !== "undefined" &&
                      String(variant.display).trim() !== "")
                );

                if (allValidSizes.length === 0) {
                  return null;
                }

                return (
                  <div className={styles.sizesContainer}>
                    <div className={styles.productVariants}>
                      <div className={styles.sizeVariants}>
                        {allValidSizes.map((variant, index) => (
                          <span
                            key={
                              variant.uid || variant.value || `size-${index}`
                            }
                            className={styles.sizeOption}
                            title={`Size ${variant.display || variant.value}`}
                            onClick={(e) =>
                              handleSizeClick(
                                e,
                                variant.value || variant.display
                              )
                            }
                          >
                            {variant.display || variant.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* WISHLIST BUTTONS */}
              <div className={styles.wishlistContainer}>
                {isWishlistIcon && (
                  <button
                    className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
                    onClick={handleWishlistClick}
                    disabled={isOutOfStock}
                    title={t("resource.product.wishlist_icon")}
                  >
                    <WishlistIconComponent isFollowed={isFollowed} />
                  </button>
                )}
                {isRemoveIcon && (
                  <button
                    className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
                    onClick={handleRemoveClick}
                    disabled={isOutOfStock}
                    title={t("resource.product.wishlist_icon")}
                  >
                    <RemoveIconComponent />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
