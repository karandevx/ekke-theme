import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import FyAccordion from "../core/fy-accordion/fy-accordion";
import { ProductDetailsZoom } from "./product-details-zoom";
import { useWishlist, useAccounts } from "../../helper/hooks";
import useProductDescription from "../../page-layouts/pdp/product-description/useProductDescription";
import { useForm } from "react-hook-form";
import {
  ATTRIBUTE_LABELS,
  calculateGetItByDate,
  CATEGORY_ATTRIBUTES,
  colorOptions,
  generateAccordionData,
  getAvailableColors,
} from "./utils";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";
import { useToast } from "../custom-toaster";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import SizeGuide from "../../page-layouts/plp/Components/size-guide/size-guide";
import useCart from "../../page-layouts/cart/useCart";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import ShareItem from "../share-item/share-item";
import { useGlobalStore } from "fdk-core/utils";
import { NotifyMeModal } from "./notify-me-modal";
import { FDKLink } from "fdk-core/components";
import { PRODUCT_SIZE_PRICE } from "../../queries/pdpQuery";
import { RETURN_CONFIG } from "../../queries/productQuery";
import { currencyFormat, numberWithCommas } from "../../helper/utils";

// Helper function to check if ProductDetailsRenderer will render content
const hasProductDetailsContent = (productData) => {
  const attributes = productData?.attributes || {};

  const getCategory = () => {
    const l3 = (attributes.l3_category_names?.[0] || "").toLowerCase();

    if (
      l3.includes("trouser") ||
      l3.includes("dress") ||
      l3.includes("top") ||
      l3.includes("shirt") ||
      l3.includes("kurta")
    ) {
      return "fashion";
    }
    if (
      l3.includes("bag") ||
      l3.includes("jewel") ||
      l3.includes("belt") ||
      l3.includes("watch")
    ) {
      return "accessories";
    }
    if (l3.includes("shoe") || l3.includes("sandal") || l3.includes("boot")) {
      return "footwear";
    }
    if (
      l3.includes("eyewear") ||
      l3.includes("sunglass") ||
      l3.includes("glass")
    ) {
      return "eyewear";
    }

    return "fashion";
  };

  const category = getCategory();
  const relevantAttributes = CATEGORY_ATTRIBUTES[category] || [];

  // Check if any relevant attributes have valid values
  const hasValidAttributes = relevantAttributes.some((key) => {
    const value = attributes[key];
    return (
      value &&
      value !== "" &&
      value !== "No" &&
      !(Array.isArray(value) && value.length === 0)
    );
  });

  // Check if highlights exist
  const highlights = productData?.highlights || [];
  const hasHighlights = highlights.some(
    (highlight) => highlight && highlight.trim() !== "",
  );

  return hasValidAttributes || hasHighlights;
};

const ProductDetailsRenderer = ({ productData }) => {
  const attributes = productData?.attributes || {};

  // Determine category
  const getCategory = () => {
    const l3 = (attributes.l3_category_names?.[0] || "").toLowerCase();

    if (
      l3.includes("trouser") ||
      l3.includes("dress") ||
      l3.includes("top") ||
      l3.includes("shirt") ||
      l3.includes("kurta")
    ) {
      return "fashion";
    }
    if (
      l3.includes("bag") ||
      l3.includes("jewel") ||
      l3.includes("belt") ||
      l3.includes("watch")
    ) {
      return "accessories";
    }
    if (l3.includes("shoe") || l3.includes("sandal") || l3.includes("boot")) {
      return "footwear";
    }
    if (
      l3.includes("eyewear") ||
      l3.includes("sunglass") ||
      l3.includes("glass")
    ) {
      return "eyewear";
    }

    return "fashion";
  };

  const category = getCategory();
  const relevantAttributes = CATEGORY_ATTRIBUTES[category] || [];

  // Build product features list from attributes
  const productFeatures = relevantAttributes
    .map((key) => {
      const value = attributes[key];

      // Skip empty values
      if (
        !value ||
        value === "" ||
        value === "No" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return null;
      }

      const label = ATTRIBUTE_LABELS[key];

      // Format value
      const formattedValue = Array.isArray(value) ? value.join(", ") : value;
      return `${label ? label : ""}${formattedValue}`;
    })
    .filter(Boolean);

  // Add highlights from root level of productData
  const highlights = productData?.highlights || [];
  const highlightFeatures = highlights
    .filter((highlight) => highlight && highlight.trim() !== "")
    .map((highlight) => `${highlight}`);

  // Combine all features
  const allFeatures = [...productFeatures, ...highlightFeatures];

  if (allFeatures.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <ul className="flex flex-col items-start w-full pl-2">
        {allFeatures.map((feature, i) => (
          <li
            key={`${feature}-${i}`}
            className="flex items-start gap-2 relative self-stretch w-full"
          >
            <span className="w-[3px] h-[3px] bg-[#171717] rounded-full flex-shrink-0 mt-[6px]" />
            <span className="body-2 text-[#171717]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProductSideDetails = ({
  productData,
  fpi,
  slug,
  productMeta,
  setCurrentSize,
  currentSize,
}) => {
  console.log("pdppppp", productData);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef(null);
  const middleSectionRef = useRef(null); // Ref for middle image section only
  const lastScrollY = useRef(0);
  const imageRefs = useRef([]); // Refs for each image in the gallery
  const isScrollingProgrammatically = useRef(false); // Flag to prevent scroll listener interference
  const [selectedColor, setSelectedColor] = useState(
    getAvailableColors(productData)?.find((c) => c.selected),
  );
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [isFetchingDelivery, setIsFetchingDelivery] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [fulfillmentData, setFulfillmentData] = useState(null);
  const [pincodeError, setPincodeError] = useState("");
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [sizeBasedPrice, setSizeBasedPrice] = useState(null); // Dynamic price based on selected size
  const [internalSize, setInternalSize] = useState(null); // Internal size for API calls (not shown in UI)
  const [returnConfig, setReturnConfig] = useState(null); // Return configuration for the product
  const isAddingToCartRef = useRef(false); // Track if we're clearing size after add to cart
  const { addToWishList, followedIdList } = useWishlist({ fpi });
  const { openLogin } = useAccounts({ fpi });
  const { getFulfillmentOptions } = useCart(fpi);
  const application = useGlobalStore(fpi.getters.APPLICATION);
  const userData = useGlobalStore(fpi.getters.USER_DATA);
  const location = useLocation();

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Reset everything when location (URL) changes - handles browser back/forward
  useEffect(() => {
    // Close zoom if open
    setIsZoomOpen(false);

    // Reset image index to first image
    setCurrentImageIndex(0);

    // Set programmatic scrolling flag to prevent scroll listener interference
    isScrollingProgrammatically.current = true;

    // Reset all scroll positions
    // 1. Main section scroll
    if (sectionRef.current) {
      sectionRef.current.scrollTop = 0;
    }

    // 2. Middle section scroll (desktop image gallery)
    if (middleSectionRef.current) {
      middleSectionRef.current.scrollTop = 0;
    }

    // 3. Any other scrollable containers
    const middleSection = document.querySelector("[data-middle-section]");
    if (middleSection) {
      middleSection.scrollTop = 0;
    }

    // 4. Window scroll to top
    window.scrollTo(0, 0);

    // Reset the programmatic scrolling flag after a short delay
    const timeoutId = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Only trigger on pathname change, not search params

  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle share functionality - always show custom dropdown
  const handleShare = () => {
    setShowSocialLinks(true);
  };

  // Handle color variant click - navigate to variant product page
  const handleColorClick = (color) => {
    if (color.slug && color.slug !== productData?.slug) {
      // Navigate to the variant's product page
      navigate(`/product/${color.slug}`);
    }
  };

  // Update selected color when productData changes (after navigation)
  useEffect(() => {
    const colors = getAvailableColors(productData);
    const currentColor = colors?.find((c) => c.selected);
    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, [productData?.uid]); // Re-run when product UID changes

  // Use useLayoutEffect to check before browser paint (prevents flash)
  // Announcement bar is static, so we only need to check once on mount
  // useLayoutEffect(() => {
  //   const announcementBar = document.querySelector(".announcementBarBody");
  //   setHasAnnouncementBar(!!announcementBar);
  // }, []);

  // Calculate dynamic height based on announcement bar presence
  const viewportHeight = hasAnnouncementBar
    ? "calc(100vh - 80px)"
    : "calc(100vh - 56px)";

  // Check if size guide is available
  const isSizeGuideAvailable = useMemo(() => {
    const sizeChartHeader = productMeta?.size_chart?.headers || {};
    return (
      Object.keys(sizeChartHeader).length > 0 || productMeta?.size_chart?.image
    );
  }, [productMeta]);

  const accordionData = useMemo(
    () =>
      generateAccordionData(
        productData,
        isSizeGuideAvailable,
        sizeBasedPrice,
        returnConfig,
      ),
    [productData, isSizeGuideAvailable, sizeBasedPrice, returnConfig],
  );

  // Initialize image refs array
  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(
      0,
      productData?.media?.length || 0,
    );
  }, [productData?.media?.length]);

  // Function to handle thumbnail click and smooth scroll to image (Desktop only)
  const handleThumbnailClick = (index) => {
    // Set flag to prevent scroll listener from interfering
    isScrollingProgrammatically.current = true;

    setCurrentImageIndex(index);

    // Scroll the middle section container to show the specific image
    if (middleSectionRef.current && imageRefs.current[index]) {
      const section = middleSectionRef.current;
      const targetImage = imageRefs.current[index];

      // Get the position of the target image relative to the section
      const imageOffsetTop = targetImage.offsetTop;

      // Calculate the scroll position to center the image in the viewport
      // We want to scroll to: imageTop - (viewportHeight - imageHeight) / 2
      const sectionHeight = section.clientHeight;
      const imageHeight = targetImage.clientHeight;
      const scrollPosition = imageOffsetTop - (sectionHeight - imageHeight) / 2;

      // Add a small offset (5px) to ensure we cross the activation threshold
      const adjustedScrollPosition = scrollPosition + 5;

      // Smooth scroll the section container
      section.scrollTo({
        top: adjustedScrollPosition,
        behavior: "smooth",
      });

      // Clear the flag after scroll animation completes (typically 300-500ms)
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 600);
    }
  };

  // Form validation setup
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      pincode: pinCode || "",
      selectedSize: selectedSize || null,
    },
    mode: "onChange",
  });

  // Reset scroll position, image index, and all form states when product changes
  useEffect(() => {
    // Reset image index to first image
    setCurrentImageIndex(0);

    // Reset size selection
    setSelectedSize(null);
    setInternalSize(null);

    // Reset pincode
    setPinCode("");

    // Reset estimated delivery date
    setEstimatedDeliveryDate(null);

    // Reset pincode error
    setPincodeError("");

    // Reset size-based price
    setSizeBasedPrice(null);

    // Reset form values
    setValue("selectedSize", null);
    setValue("pincode", "");

    // Sync with useProductDescription hook
    if (setCurrentSize) {
      setCurrentSize(null);
    }

    // Close size dropdown if open
    setShowSizeDropdown(false);

    // Scroll main section to top
    if (sectionRef.current) {
      sectionRef.current.scrollTop = 0;
    }

    // Reset any other scroll positions in the middle section
    const middleSection = document.querySelector("[data-middle-section]");
    if (middleSection) {
      middleSection.scrollTop = 0;
    }

    // Check for selected_size query parameter and auto-select size
    const sizeFromUrl = searchParams.get("selected_size");
    if (sizeFromUrl && productData?.sizes?.sizes?.length > 0) {
      // Find matching size from available sizes
      const matchingSize = productData.sizes.sizes.find(
        (size) => size.value === sizeFromUrl || size.display === sizeFromUrl,
      );

      if (matchingSize) {
        // Auto-select the size
        setSelectedSize(matchingSize);
        setValue("selectedSize", matchingSize);
        trigger("selectedSize");
        // Sync with useProductDescription hook
        if (setCurrentSize) {
          setCurrentSize(matchingSize);
        }
      }
    } else if (!sizeFromUrl && productData?.sizes?.sizes?.length > 0) {
      // Auto-select first available size internally (for API call only, not shown in UI)
      // This ensures PRODUCT_SIZE_PRICE API is called to get manufacturer/marketer details
      const firstSize = productData.sizes.sizes[0];
      if (firstSize) {
        setInternalSize(firstSize);
      }
    }
  }, [
    slug,
    productData?.uid,
    setValue,
    searchParams,
    productData?.sizes?.sizes,
    trigger,
    setCurrentSize,
  ]); // Reset when product changes

  //Get brand detail api call
  // useEffect(() => {
  //   const fetchBrands = async () => {
  //     try {
  //       const response = await fpi.executeGQL(BRAND_DETAILS, {
  //         slug: productData?.brand?.action?.page?.query?.brand?.[0] || "",
  //       });

  //       if (response?.data) {
  //         setBrandData(response?.data?.brand?.description);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   fetchBrands();
  // }, [slug]);

  // Validation rules
  const validationRules = {
    pincode: {
      // required: "Pincode is required for delivery",
      validate: (value) => {
        // Allow empty value (not required)
        if (!value || value === "") {
          return true;
        }

        // Check if contains only numbers
        if (!/^[0-9]+$/.test(value)) {
          return "Pincode must contain only numbers";
        }

        // Check if exactly 6 digits
        if (value.length !== 6) {
          return "Pincode must be exactly 6 digits";
        }

        // Check if starts with 0 (invalid Indian pincode)
        if (value.startsWith("0")) {
          return "Invalid pincode format";
        }

        return true;
      },
    },
    selectedSize: {
      required: "Please select a size",
      validate: (value) => {
        if (!value || !value.value) {
          return "Please select a size";
        }
        return true;
      },
    },
  };

  useEffect(() => {
    setValue("selectedSize", selectedSize);
    setValue("pincode", pinCode);
  }, [selectedSize, setValue, pinCode]);

  // Close size dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSizeDropdown &&
        !event.target.closest(".size-dropdown-container")
      ) {
        setShowSizeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSizeDropdown]);

  // Fetch delivery date when pincode and size are available
  useEffect(() => {
    const fetchDeliveryDate = async () => {
      // Clear previous error
      setPincodeError("");

      // Check if user entered valid pincode but hasn't selected size
      if (
        pinCode &&
        pinCode.length === 6 &&
        !selectedSize?.value &&
        !isAddingToCartRef.current
      ) {
        setPincodeError("Please select a size first");
        return;
      }

      // Don't make API call if size is not selected
      if (!selectedSize?.value || !slug) {
        setEstimatedDeliveryDate(null);
        setFulfillmentData(null);
        return;
      }

      // Don't make API call if pincode is entered but not 6 digits
      if (pinCode && pinCode.length > 0 && pinCode.length < 6) {
        setEstimatedDeliveryDate(null);
        setFulfillmentData(null);
        return;
      }

      try {
        // Call getFulfillmentOptions API with size value
        // Pass pincode if available (6 digits), otherwise pass empty string
        const pincodeToUse = pinCode && pinCode.length === 6 ? pinCode : "";

        // Only show "CALCULATING DELIVERY DATE..." when pincode is provided
        if (pincodeToUse) {
          setIsFetchingDelivery(true);
        }

        const fulfillmentOptions = await getFulfillmentOptions(
          slug,
          selectedSize.value,
          pincodeToUse,
        );

        // Check if fulfillment options are valid
        // If pincode was provided but no delivery options returned, it's likely an invalid pincode
        if (
          pincodeToUse &&
          (!fulfillmentOptions || fulfillmentOptions.length === 0)
        ) {
          setPincodeError("Delivery not available for this pincode");
          setEstimatedDeliveryDate(null);
          setFulfillmentData(null);
          setIsFetchingDelivery(false);
          return;
        }

        // Store the first fulfillment option for Add to Cart
        if (fulfillmentOptions && fulfillmentOptions.length > 0) {
          setFulfillmentData(fulfillmentOptions[0]);
        } else {
          setFulfillmentData(null);
        }

        // Calculate the GET IT BY date only if pincode is provided
        if (pincodeToUse) {
          const deliveryDate = calculateGetItByDate(
            productData,
            fulfillmentOptions,
          );

          if (!deliveryDate) {
            setPincodeError(
              "Unable to calculate delivery date for this pincode",
            );
            setEstimatedDeliveryDate(null);
          } else {
            setEstimatedDeliveryDate(deliveryDate);
            setPincodeError(""); // Clear error on success
          }
        } else {
          setEstimatedDeliveryDate(null);
        }
      } catch (error) {
        console.error("Error fetching delivery date:", error);
        if (pinCode && pinCode.length === 6) {
          setPincodeError("Invalid pincode or delivery not available");
        }
        setEstimatedDeliveryDate(null);
        setFulfillmentData(null);
      } finally {
        setIsFetchingDelivery(false);
      }
    };

    fetchDeliveryDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinCode, selectedSize?.value, slug]);

  // Fetch size-based price when size is selected (or internal size for API)
  useEffect(() => {
    const fetchSizePrice = async () => {
      // Use selectedSize if available, otherwise use internalSize for API call
      const sizeToUse = selectedSize || internalSize;

      // Only fetch if size is available
      if (!sizeToUse?.value || !slug) {
        setSizeBasedPrice(null);
        return;
      }
      try {
        const response = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: slug,
          size: sizeToUse.value,
          pincode: pinCode || null,
        });
        if (response?.data?.productPrice) {
          setSizeBasedPrice(response.data.productPrice);
        }
      } catch (error) {
        setSizeBasedPrice(null);
      }
    };

    fetchSizePrice();
  }, [selectedSize?.value, internalSize?.value, slug, pinCode, fpi]);

  // Fetch return configuration for the product
  useEffect(() => {
    const fetchReturnConfig = async () => {
      // Get the size to use: selectedSize, internalSize, or first available size
      let sizeToUse = selectedSize || internalSize;

      // If no size is selected, use the first available size from the dropdown
      if (!sizeToUse && productData?.sizes?.sizes?.length > 0) {
        const firstSize = productData.sizes.sizes[0];
        sizeToUse = {
          value: firstSize.value,
          display: firstSize.display,
        };
      }

      // Only fetch if we have both slug and size
      if (!sizeToUse?.value || !slug) {
        setReturnConfig(null);
        return;
      }

      try {
        const response = await fpi.executeGQL(RETURN_CONFIG, {
          slug: slug,
          size: sizeToUse.value,
        });
        if (response?.data?.productPrice?.return_config) {
          setReturnConfig(response.data.productPrice.return_config);
        } else {
          setReturnConfig(null);
        }
      } catch (error) {
        console.error("Error fetching return config:", error);
        setReturnConfig(null);
      }
    };

    fetchReturnConfig();
  }, [
    selectedSize?.value,
    internalSize?.value,
    slug,
    productData?.sizes?.sizes,
    fpi,
  ]);

  const { addProductForCheckout, isLoading } = useProductDescription({
    fpi,
    slug,
    props: { mandatory_pincode: pinCode },
  });

  // Check if current product is in wishlist
  const isInWishlist = useMemo(() => {
    return followedIdList?.includes(productData?.uid);
  }, [followedIdList, productData?.uid]);

  const handleAddToWishlist = () => {
    // Check if user is logged in
    if (!userData?.active) {
      // Redirect to login page with product info for wishlist
      openLogin({ wishlistProduct: productData });
      return;
    }

    if (isInWishlist) {
      toast.error("It's already in your wishlist");
    } else {
      addToWishList(productData);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Don't update currentImageIndex if we're scrolling programmatically (thumbnail click)
      if (isScrollingProgrammatically.current) return;

      if (!middleSectionRef.current) return;
      const middleSection = middleSectionRef.current;
      const scrollY = middleSection.scrollTop;
      const sectionHeight =
        middleSection.scrollHeight - middleSection.clientHeight;
      if (sectionHeight <= 0) return;
      // Calculate scroll progress within the section (0 to 1)
      const scrollProgress = scrollY / sectionHeight;
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      // Calculate which image should be shown based on scroll progress
      const totalImages = productData?.media?.length || 1;
      const imageIndex = Math.floor(clampedProgress * (totalImages - 1));
      const finalIndex = Math.max(0, Math.min(imageIndex, totalImages - 1));
      if (finalIndex !== currentImageIndex) {
        setCurrentImageIndex(finalIndex);
      }

      lastScrollY.current = scrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    const middleSection = middleSectionRef.current;
    if (middleSection) {
      middleSection.addEventListener("scroll", throttledScroll, {
        passive: true,
      });
    }

    return () => {
      if (middleSection) {
        middleSection.removeEventListener("scroll", throttledScroll);
      }
    };
  }, [currentImageIndex]);

  const handleAddToCartWithValidation = async (e) => {
    e.preventDefault();

    // Set current size value before validation
    setValue("selectedSize", selectedSize);

    // Trigger size validation only
    const isSizeValid = await trigger("selectedSize");

    if (!isSizeValid) {
      // Show toast error message for size only
      toast.error("Please select a size");
      return;
    }

    // If validation passes, call existing function with fulfillment data
    await addProductForCheckout(e, selectedSize?.value, false, fulfillmentData); // Pass fulfillment data

    // Set flag before clearing size to prevent toast
    isAddingToCartRef.current = true;
    setValue("selectedSize", null);
    setSelectedSize(null);

    // Reset flag after a short delay
    setTimeout(() => {
      isAddingToCartRef.current = false;
    }, 100);
  };

  const productFeatures = useMemo(() => {
    const attrs = productData?.attributes?.["custom-attribute-7"] || [];

    // custom-attribute-7 is already an array, so just filter empty values
    return Array.isArray(attrs)
      ? attrs.filter((item) => item && item.trim() !== "")
      : [];
  }, [productData]);

  // const availableColors = useMemo(() => {
  //   return getAvailableColors(productData);
  // }, [productData]);

  // Check if product is a custom/made-to-order product
  const isCustomOrder = useMemo(() => {
    return productData?.custom_order?.is_custom_order === true;
  }, [productData]);

  // For custom orders, inventory is not involved - always available
  // For regular products, check inventory availability
  const isOutOfStock = useMemo(() => {
    // if (isCustomOrder) {
    //   return false; // Custom orders are never out of stock
    // }
    return !productData?.sizes?.sellable;
  }, [productData, isCustomOrder]);

  console.log("SideDetails productData", sizeBasedPrice);

  return (
    <>
      <section
        ref={sectionRef}
        className=" w-full justify-center"
        style={{
          height: viewportHeight,
          position: "fixed",
          top: hasAnnouncementBar ? "80px" : "56px",
          display: window.innerWidth >= 1126 ? "flex" : "none",
        }}
      >
        {/* Left Section - Independently Scrollable */}
        <div className="flex flex-col flex-1 items-start gap-4 pl-3 pr-0 pt-3 sticky top-0 h-full overflow-y-auto">
          <div className="flex flex-col items-start justify-between relative w-full flex-1">
            <div className="flex flex-col items-start gap-4 relative w-full">
              {/* Your existing header content */}
              <header className="flex flex-col items-start gap-3 relative w-full">
                <div className="flex flex-col items-start w-full relative">
                  <FDKLink
                    to={`products?brand=${productData?.brand?.action?.page?.query?.brand?.[0]}`}
                  >
                    <p className="font-road-radio subheading-1">
                      {productData?.brand?.name}
                    </p>
                  </FDKLink>
                  <div className="pt-2">
                    <p className="body-3 text-[#aaaaaa]">
                      {productData?.name}
                      <br />
                    </p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: productData?.description,
                      }}
                      className="body-3 text-[#aaaaaa]"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center justify-center gap-2 relative flex-[0_0_auto] mb-4 pt-3">
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#171717] text-xs tracking-[0] leading-[14.4px] whitespace-nowrap">
                    {sizeBasedPrice
                      ? `${sizeBasedPrice.price?.currency_symbol} ${currencyFormat(numberWithCommas(sizeBasedPrice.price?.effective))}`
                      : `${productData?.sizes?.price?.effective?.currency_symbol} ${currencyFormat(numberWithCommas(productData?.sizes?.price?.effective?.min))}`}
                  </span>
                  {sizeBasedPrice
                    ? // When size is selected: show marked price only if different from effective
                      sizeBasedPrice.price?.marked &&
                      sizeBasedPrice.price?.effective !==
                        sizeBasedPrice.price?.marked && (
                        <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#aaaaaa] text-xs tracking-[0] leading-[14.4px] line-through whitespace-nowrap">
                          {sizeBasedPrice.price?.currency_symbol}{" "}
                          {currencyFormat(
                            numberWithCommas(sizeBasedPrice.price?.marked),
                          )}
                        </span>
                      )
                    : // When no size selected: show marked price only if different from effective
                      productData?.sizes?.price?.effective?.min !==
                        productData?.sizes?.price?.marked?.max && (
                        <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#aaaaaa] text-xs tracking-[0] leading-[14.4px] line-through whitespace-nowrap">
                          {productData?.sizes?.price?.marked?.currency_symbol}{" "}
                          {currencyFormat(
                            numberWithCommas(
                              productData?.sizes?.price?.marked?.max,
                            ),
                          )}
                        </span>
                      )}
                </div>
              </header>

              {/* product material */}
              <div className="flex flex-col">
                <div className="body-2 text-[#171717]">
                  {productData?.attributes?.primary_material}
                </div>
                <div className="body-2 text-[#171717]">
                  {productData?.attributes?.model_info}
                </div>
                <div className="body-2 text-[#171717]">
                  {productData?.attributes?.item_code}
                </div>
              </div>

              {/* Product details and features sections */}
              <div className="flex flex-col w-[246px] items-start gap-4 relative flex-[0_0_auto]">
                {/* Only show Product Details heading if there is content */}
                {hasProductDetailsContent(productData) && (
                  <>
                    <p className="body-2 text-neutral-light">Product Details</p>
                    <ProductDetailsRenderer productData={productData} />
                  </>
                )}

                {/* Only show Features heading if there are valid features */}
                {productFeatures &&
                  productFeatures.length > 0 &&
                  productFeatures.some((f) => f && f.trim() !== "") && (
                    <>
                      <p className="body-2 text-neutral-light">Features</p>
                      <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                        <ul className="flex flex-col items-start relative self-stretch w-full pl-2">
                          {productFeatures
                            .filter((label) => label && label.trim() !== "")
                            .map((label, i) => (
                              <li
                                key={`${label}-${i}`}
                                className="flex items-center gap-2 relative self-stretch w-full text-[#171717]"
                              >
                                <span className="w-[3px] h-[3px] bg-[#171717] rounded-full flex-shrink-0" />
                                <span className="body-2">{label}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </>
                  )}
              </div>

              <div className="inline-flex items-center gap-2.5 flex-[0_0_auto]">
                <div>
                  <button
                    className="body-2 !font-archivo underline mt-4 flex items-center gap-2 text-[#171717]"
                    onClick={handleShare}
                  >
                    {/* <ShareDesktopIcon className="w-5 h-5" /> */}
                    Share
                  </button>
                  {showSocialLinks && (
                    <ShareItem
                      setShowSocialLinks={setShowSocialLinks}
                      handleShare={handleShare}
                      description={`Check out this amazing product on ${application?.name || "our store"}`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="flex flex-col w-full items-start relative">
              {accordionData.map((accordion, index, arr) => (
                <FyAccordion
                  key={accordion.id}
                  isOpen={
                    accordion.isTrigger
                      ? false
                      : openAccordionId === accordion.id
                  }
                  onToggle={() => {
                    if (accordion.isTrigger) {
                      // Trigger size guide instead of expanding
                      setShowSizeGuide(true);
                    } else {
                      setOpenAccordionId(
                        openAccordionId === accordion.id ? null : accordion.id,
                      );
                    }
                  }}
                  containerStyles={{
                    borderBottom:
                      arr.length === index + 1 ? "none" : "1px solid #EEEEEE",
                  }}
                  buttonClassName={`${!accordion.isTrigger && openAccordionId === accordion.id ? "!pb-[10px]" : ""} py-3 px-2`}
                  hideIcon={accordion.isTrigger}
                >
                  <div className="flex items-center justify-between text-left group hover:cursor-pointer">
                    {accordion.hasIcon ? (
                      <div className="flex items-start gap-1 relative flex-1">
                        {!accordion.isTrigger &&
                          openAccordionId !== accordion.id && (
                            <div className="w-1 h-1 bg-neutral-900 rounded-[1px] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex-shrink-0 mt-[3px]" />
                          )}
                        {accordion.isTrigger && (
                          <div className="w-1 h-1 bg-neutral-900 rounded-[1px] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex-shrink-0 mt-[3px]" />
                        )}
                        <span
                          className={`body-1 transition-colors duration-200 break-words ${
                            !accordion.isTrigger &&
                            openAccordionId === accordion.id
                              ? "text-[#aaaaaa]"
                              : "text-[#171717]"
                          }`}
                        >
                          {accordion.title}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1 relative flex-1">
                        {!accordion.isTrigger &&
                          openAccordionId !== accordion.id && (
                            <div className="w-1 h-1 bg-neutral-900 rounded-[1px] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex-shrink-0 mt-[3px]" />
                          )}
                        {accordion.isTrigger && (
                          <div className="w-1 h-1 bg-neutral-900 rounded-[1px] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex-shrink-0 mt-[3px]" />
                        )}
                        <span
                          className={`body-2 transition-colors duration-200 uppercase break-words ${
                            !accordion.isTrigger &&
                            openAccordionId === accordion.id
                              ? "text-[#aaaaaa]"
                              : "text-[#171717]"
                          }`}
                        >
                          {accordion.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pl-2 pb-3">
                    <div className="flex-col items-start justify-center gap-3 flex relative pl-[5px]">
                      {accordion.content.type === "list" ? (
                        <ul className="flex flex-col items-start gap-2 relative self-stretch w-full pl-2">
                          {accordion.content.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 relative self-stretch w-full list-none"
                            >
                              <span className="w-[3px] h-[3px] bg-[#171717] rounded-full flex-shrink-0 mt-[6px]" />
                              <span className="body-2 text-[#171717]">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="body-2 text-[#171717] whitespace-pre-line">
                          {accordion.content.text}
                        </p>
                      )}
                      {accordion.content.hasButton &&
                        accordion.content.buttonUrl && (
                          <div className="gap-2.5 flex items-center relative">
                            <FDKLink
                              to={accordion.content.buttonUrl}
                              className="body-2 underline text-[#171717] cursor-pointer"
                              target="_self"
                            >
                              {accordion.content.buttonText}
                            </FDKLink>
                          </div>
                        )}
                    </div>
                  </div>
                </FyAccordion>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section - Vertical Scrolling Images */}
        <div
          ref={middleSectionRef}
          className="flex flex-col items-center relative px-[13px] hover:cursor-zoom-in overflow-y-auto"
          style={{ height: viewportHeight }}
          onClick={() => {
            setIsZoomOpen(true);
            setCurrentImageIndex(0);
          }}
        >
          <div className="flex flex-col items-center gap-0 relative w-full">
            {productData?.media?.map((image, index) => (
              <div
                key={image.id}
                ref={(el) => (imageRefs.current[index] = el)}
                className={`w-fit relative overflow-hidden transition-opacity duration-500`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-auto max-w-full object-cover object-center relative block"
                  style={{ height: viewportHeight }}
                />
                {index === 0 && (
                  <div className={`absolute top-0 left-0 uppercase`}>
                    {/* Display Tags */}
                    {productData?.attributes?.tags &&
                      productData?.attributes?.tags?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {productData?.attributes?.tags?.map(
                            (tag, tagIndex) => (
                              <p
                                key={tagIndex}
                                className="body-2 bg-[#DDDACE] !text-[#9B907D] px-1 py-2 w-fit"
                              >
                                {tag}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    {productData?.discount ||
                      (productData?.sizes?.discount && (
                        <p className="subheading-5 px-1 py-2 text-[#DDDACE] bg-[#5C2E20] tracking-[2px] w-fit">
                          Markdown
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))}
            {/* Image Tags - Positioned at top-left */}
          </div>
        </div>

        {/* Right Section - Fixed */}
        <div className="flex flex-col flex-1 items-end pl-0 pr-3 py-3 sticky top-0 h-full overflow-hidden">
          <div className="flex flex-col items-start relative self-stretch w-full flex-1">
            {/* Thumbnail images */}
            <div className="flex w-fit relative overflow-x-auto max-w-full">
              <div className="flex gap-0">
                {productData?.media?.map((image, index) => (
                  <div key={index} className="flex flex-col">
                    <div
                      className={`w-[90.25px] h-[103.72px] relative cursor-pointer overflow-hidden`}
                      onClick={() => handleThumbnailClick(index)}
                      style={{
                        borderBottom:
                          index === currentImageIndex
                            ? "2px solid #000"
                            : "2px solid #aaaaaa",
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className={`w-full object-cover transition-opacity duration-200 h-[103px] ${
                          index === currentImageIndex
                            ? "opacity-30"
                            : "opacity-100"
                        }`}
                      />
                      {index === currentImageIndex && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-neutral-900 rounded-[1px]" />
                      )}
                    </div>

                    {/* Image counter - Show below last thumbnail ONLY if less than 4 images */}
                    {productData?.media?.length <= 4 &&
                      index === productData?.media.length - 1 && (
                        <div className="flex items-start px-0 py-2 justify-end">
                          <span className="text-[#aaaaaa] body-2 whitespace-nowrap">
                            {String(currentImageIndex + 1).padStart(2, "0")}/
                            {String(productData?.media.length).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Image counter - Show separately ONLY if 4 or more images */}
            {productData?.media?.length > 4 && (
              <div className="flex items-start px-0 py-2 justify-end w-full">
                <span className="text-[#aaaaaa] body-2 whitespace-nowrap">
                  {String(currentImageIndex + 1).padStart(2, "0")}/
                  {String(productData?.media?.length || 0).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Your existing right section content (colors, delivery, etc.) */}
          <div className="inline-flex flex-col items-start gap-4 relative w-full">
            <div className="flex flex-col items-start gap-2 relative w-full">
              <div className="flex items-start gap-4 relative w-full">
                <p className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-[11px] tracking-[0] leading-[13.2px] whitespace-nowrap">
                  COLORS
                </p>
              </div>

              <div className="flex items-start gap-4 relative w-full">
                <div className="inline-flex items-center gap-1 relative">
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[#aaaaaa] text-[8px] tracking-[0] leading-[9.6px] whitespace-nowrap">
                    {productData?.variants?.[0]?.display_type === "image"
                      ? productData?.attributes?.primary_color || "Color name"
                      : selectedColor?.name || "Color name"}
                  </span>
                </div>
              </div>

              {/* Variant Images (Temporary - replacing color boxes) */}
              {/* Commented out image variant logic
              <div className="flex items-center gap-2 relative">
                {productData?.variants?.[0]?.items &&
                productData.variants[0].items.length > 0
                  ? productData.variants[0].items.map((variant) => {
                      const isActive = productData?.uid === variant.uid;
                      return (
                        <div
                          key={variant.uid}
                          className={`w-6 h-6 cursor-pointer border-2 relative ${
                            isActive ? "border-black" : "border-gray-300"
                          }`}
                          onClick={() => {
                            if (
                              variant.slug &&
                              variant.slug !== productData?.slug
                            ) {
                              navigate(`/product/${variant.slug}`);
                            }
                          }}
                        >
                          <img
                            src={variant.medias?.[0]?.url}
                            alt={variant.color_name}
                            className="w-full h-full object-cover"
                          />
                          {isActive && (
                            <div
                              className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                              style={{ marginTop: "4px" }}
                            />
                          )}
                        </div>
                      );
                    })
                  : // Show current product's first image when no variants
                    productData?.media?.[0] && (
                      <div className="w-6 h-6 border-2 border-black relative">
                        <img
                          src={productData.media[0].url}
                          alt={productData.name}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                          style={{ marginTop: "4px" }}
                        />
                      </div>
                    )}
              </div>
              */}

              {/* Color boxes or Image swatches */}
              <div className="flex items-center gap-2 relative">
                {productData?.variants?.[0]?.items &&
                productData.variants[0].items.length > 0
                  ? productData.variants[0].items.map((variant) => {
                      const isActive = productData?.uid === variant.uid;
                      const displayType =
                        productData.variants[0].display_type || "color";

                      return (
                        <div
                          key={variant.uid}
                          className="w-6 h-6 cursor-pointer relative"
                          style={{
                            backgroundColor:
                              displayType === "color"
                                ? `#${variant.value}`
                                : undefined,
                            border: isActive
                              ? "none"
                              : displayType === "color" &&
                                  variant.value?.toLowerCase() === "ffffff"
                                ? "1px solid #aaaaaa"
                                : "none",
                          }}
                          onClick={() => {
                            if (
                              variant.slug &&
                              variant.slug !== productData?.slug
                            ) {
                              navigate(`/product/${variant.slug}`);
                            }
                          }}
                        >
                          {displayType === "image" &&
                            variant.medias?.[0]?.url && (
                              <img
                                src={variant.medias[0].url}
                                alt={variant.color_name || "Color swatch"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          {isActive && (
                            <div
                              className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                              style={{ marginTop: "2px" }}
                            />
                          )}
                        </div>
                      );
                    })
                  : // Show primary color when no variants
                    productData?.attributes?.["primary-colour-hex-code"] && (
                      <div
                        className="w-6 h-6 relative"
                        style={{
                          background: `#${productData.attributes["primary-colour-hex-code"]}`,
                          border:
                            productData.attributes[
                              "primary-colour-hex-code"
                            ]?.toLowerCase() === "ffffff"
                              ? "1px solid #aaaaaa"
                              : "none",
                        }}
                      >
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                          style={{ marginTop: "2px" }}
                        />
                      </div>
                    )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 relative w-full pt-1">
              <div className="flex items-start gap-4 relative w-full">
                <div className="inline-flex items-center gap-1 relative">
                  <p className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-[11px] tracking-[0] leading-[13.2px] whitespace-nowrap uppercase">
                    Get it by
                  </p>
                </div>
              </div>

              <div className="flex-col w-full items-start gap-4 bg-white flex relative">
                <div className="flex items-center gap-2.5 px-2 py-1 relative self-stretch w-full rounded-[1px] overflow-hidden border border-solid border-[#aaaaaa] placeholder:text-[#AAAAAA] body-2 placeholder:[font-family:'Archivo',Helvetica]">
                  <input
                    {...register("pincode", validationRules.pincode)}
                    type="text"
                    placeholder="Enter your pincode to view delivery details."
                    maxLength="6"
                    className="relative flex-1 mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-xs tracking-[0] leading-3 border-none bg-transparent p-0 h-auto focus:outline-none"
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      e.target.value = numericValue;
                      setPinCode(numericValue);
                      setValue("pincode", numericValue);
                      setPincodeError(""); // Clear pincode error on change
                      // Trigger validation on every change
                      trigger("pincode");
                    }}
                    style={{
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                    }}
                    value={pinCode}
                  />

                  {/* <button
                    className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-[11px] tracking-[0] leading-[13.2px] whitespace-nowrap h-auto p-0 bg-transparent border-none cursor-pointer hover:text-gray-700"
                    onClick={() => {
                      setPinCode("");
                      setValue("pincode", "");
                    }}
                  >
                    CHANGE
                  </button> */}
                </div>
                {errors.pincode && (
                  <div className="absolute top-full left-0 right-0 text-[#5c2e20] text-xs mt-2 z-10">
                    {errors.pincode.message}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 relative self-stretch w-full" />

              <div
                className="inline-flex flex-col items-center justify-center gap-2.5 pl-2 pr-0 pt-[34px] pb-0 relative"
                style={{ minHeight: "24px" }}
              >
                {pincodeError && !errors.pincode ? (
                  <p
                    className="body-1 text-[#5c2e20]"
                    style={{ minHeight: "1.2em" }}
                  >
                    {pincodeError.toUpperCase()}
                  </p>
                ) : (
                  <p
                    className="body-1"
                    style={{
                      visibility:
                        isFetchingDelivery || estimatedDeliveryDate
                          ? "visible"
                          : "hidden",
                      minHeight: "1.2em",
                    }}
                  >
                    {isFetchingDelivery ? (
                      "CALCULATING DELIVERY DATE..."
                    ) : estimatedDeliveryDate && !errors.pincode ? (
                      <>
                        GET IT BY{" "}
                        <span className="font-medium">
                          {estimatedDeliveryDate.toUpperCase()}
                        </span>
                      </>
                    ) : (
                      "\u00A0"
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
              {/* Size Selector Dropdown Button */}
              <div className="size-dropdown-container relative w-full">
                {/* Show OUT OF STOCK when all sizes are out OR when selected size is out of stock */}
                {(isOutOfStock ||
                  (selectedSize &&
                    (isCustomOrder
                      ? productData?.sizes?.sellable === false
                      : productData?.sizes?.sellable === false ||
                        !selectedSize.is_available ||
                        selectedSize.quantity === 0))) && (
                  <p className="body-1 !text-ekke-brown text-center mb-2">
                    OUT OF STOCK
                  </p>
                )}
                <button
                  className="flex items-center justify-between w-full p-2 bg-[#e3e3e3] border-2 text-left font-normal [font-family:'Archivo',Helvetica] text-[11px] tracking-[0] leading-[13.2px] hover:bg-gray-50"
                  onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                  style={{
                    border: "1px solid #171717",
                  }}
                >
                  <span
                    className={
                      selectedSize &&
                      (isCustomOrder
                        ? productData?.sizes?.sellable === false
                        : productData?.sizes?.sellable === false ||
                          !selectedSize.is_available ||
                          selectedSize.quantity === 0)
                        ? "text-[#aaaaaa]"
                        : "text-[#171717]"
                    }
                  >
                    {selectedSize ? selectedSize.display : "SELECT A SIZE"}
                  </span>
                  <span className="body-1">{showSizeDropdown ? "−" : "+"}</span>
                </button>
                {/* Dropdown Options - Opens above the button */}
                {showSizeDropdown && (
                  <div
                    className="absolute bottom-full left-0 right-0 bg-white z-10 mb-0"
                    style={{
                      border: "1px solid #eeeeee",
                    }}
                  >
                    {productData?.sizes?.sizes?.length > 0 ? (
                      productData?.sizes?.sizes?.map((option) => {
                        // Allow selection of all sizes (including out of stock)
                        // User can select out-of-stock sizes to trigger notify me
                        const isSizeInStock = isCustomOrder
                          ? productData?.sizes?.sellable !== false
                          : productData?.sizes?.sellable !== false &&
                            option.is_available &&
                            option.quantity > 0;

                        return (
                          <button
                            key={option.value}
                            className={`w-full px-4 py-1 text-left body-1 ${
                              !isSizeInStock
                                ? "text-gray-400 bg-gray-100 cursor-pointer"
                                : "text-[#171717] hover:bg-gray-100 cursor-pointer"
                            }`}
                            style={{ border: "1px solid #eeeeee" }}
                            onClick={() => {
                              setSelectedSize(option);
                              setValue("selectedSize", option);
                              trigger("selectedSize");
                              setShowSizeDropdown(false);
                              // Sync with useProductDescription hook to populate productPriceBySlug
                              if (setCurrentSize) {
                                setCurrentSize(option);
                              }
                            }}
                          >
                            {option.display}
                            {!isCustomOrder &&
                              option.quantity > 0 &&
                              option.quantity <= 5 &&
                              ` - ONLY ${option.quantity} REMAINING`}
                            {!isCustomOrder &&
                              (!option.is_available || option.quantity === 0) &&
                              " - OUT OF STOCK"}
                          </button>
                        );
                      })
                    ) : (
                      <p className="body-1 w-full p-2 whitespace-nowrap">
                        No sizes available
                      </p>
                    )}
                  </div>
                )}
                {errors.selectedSize && (
                  <div className="absolute top-full left-0 right-0 text-[#5c2e20] text-xs mt-2 z-10 bg-white">
                    {errors.selectedSize.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full h-6 items-start gap-2.5 relative">
              <button
                className="flex px-1 py-2 flex-1 grow bg-[#eeeeee] flex-col items-start justify-center gap-2.5 relative rounded-[1px] overflow-hidden h-auto hover:bg-[#e0e0e0] cursor-pointer border-none"
                onClick={handleAddToWishlist}
              >
                <span className="text-neutral-900 relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-[11px] tracking-[0] text-center leading-[8px] whitespace-nowrap uppercase">
                  Add To Wishlist
                </span>
              </button>

              <button
                className="flex flex-col items-start justify-center gap-2.5 px-1 py-2 relative flex-1 grow bg-neutral-900 rounded-[1px] overflow-hidden h-auto hover:bg-neutral-800 cursor-pointer border-none"
                onClick={(e) => {
                  // Check if selected size is out of stock
                  const isSelectedSizeOutOfStock = selectedSize
                    ? isCustomOrder
                      ? productData?.sizes?.sellable === false
                      : productData?.sizes?.sellable === false ||
                        !selectedSize.is_available ||
                        selectedSize.quantity === 0
                    : false;

                  if (isSelectedSizeOutOfStock) {
                    // Open notify me modal for out of stock size
                    setShowNotifyModal(true);
                    return;
                  }
                  // Call validation function for in-stock items
                  handleAddToCartWithValidation(e);
                }}
                disabled={isLoading || (isOutOfStock && !selectedSize)}
                style={{
                  cursor:
                    isLoading || (isOutOfStock && !selectedSize)
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isLoading || (isOutOfStock && !selectedSize) ? 0.5 : 1,
                }}
              >
                <span className="relative w-fit mt-[-1.00px] [font-family:'Archivo'] font-normal text-[#f7f7f5] text-[11px] tracking-[0] leading-[8px] text-center whitespace-nowrap">
                  {(() => {
                    // Determine button text based on selected size
                    if (!selectedSize && isOutOfStock) {
                      return "NOTIFY ME";
                    }
                    if (selectedSize) {
                      const isSelectedSizeOutOfStock = isCustomOrder
                        ? productData?.sizes?.sellable === false
                        : productData?.sizes?.sellable === false ||
                          !selectedSize.is_available ||
                          selectedSize.quantity === 0;
                      return isSelectedSizeOutOfStock
                        ? "NOTIFY ME"
                        : "ADD TO BAG";
                    }
                    return "ADD TO BAG";
                  })()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* -------------------------Mobile Layout - Visible only on mobile/tablet ----------------------------*/}
      <div
        className="flex-col w-full"
        style={{ display: window.innerWidth >= 1125 ? "none" : "flex" }}
        // onClick={() => setIsZoomOpen(true)}
      >
        {/* Mobile Main Image with Thumbnails on Right */}
        <div className="flex gap-4">
          {/* Main Image */}
          <div className="flex-1">
            <div className="w-full h-auto relative">
              <img
                src={productData?.media[currentImageIndex]?.url}
                alt={productData?.media[currentImageIndex]?.alt}
                className="w-full h-full object-cover relative"
                onClick={() => {
                  setIsZoomOpen(true);
                  setCurrentImageIndex(0);
                }}
              />

              <div className={`absolute top-0 left-0 uppercase`}>
                {/* Display Tags */}
                {productData?.attributes?.tags &&
                  productData?.attributes?.tags?.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {productData?.attributes?.tags?.map((tag, tagIndex) => (
                        <p
                          key={tagIndex}
                          className="body-2 bg-[#DDDACE] !text-[#9B907D] px-1 py-2 w-fit"
                        >
                          {tag}
                        </p>
                      ))}
                    </div>
                  )}
                {productData?.discount ||
                  (productData?.sizes?.discount && (
                    <p className="subheading-5 px-1 py-2 text-[#DDDACE] bg-[#5C2E20] tracking-[2px] w-fit">
                      Markdown
                    </p>
                  ))}
              </div>

              {/* Thumbnails - Absolute positioned at top right with scroll */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  .mobile-thumbnail-scroll::-webkit-scrollbar {
                    width: 4px;
                  }
                  .mobile-thumbnail-scroll::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .mobile-thumbnail-scroll::-webkit-scrollbar-thumb {
                    background: #000000;
                    border-radius: 2px;
                  }
                  .mobile-thumbnail-scroll::-webkit-scrollbar-thumb:hover {
                    background: #333333;
                  }
                  .mobile-thumbnail-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #000000 transparent;
                  }
                `,
                }}
              />
              <div className="mobile-thumbnail-scroll absolute top-0 right-0 flex flex-col overflow-y-auto h-[400px]">
                {productData?.media?.map((image, index) => (
                  <div
                    key={index}
                    className={`w-12 h-16 md:w-32 md:h-36 relative cursor-pointer overflow-hidden flex-shrink-0`}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      borderRight: "1px solid #171717",
                      backgroundColor: "white",
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className={`w-full h-full object-cover bg-white ${
                        index === currentImageIndex
                          ? "bg-white opacity-60"
                          : "bg-white opacity-100"
                      }`}
                    />
                    {index === currentImageIndex && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-neutral-900 rounded-[1px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Product Details */}
        <div className="px-[10px] pb-6 pt-3 space-y-8">
          {/* Product Description */}
          <div className="flex items-center justify-end">
            <div>
              <button
                className="body-2 text-[#171717] underline [font-family:'Archivo',Helvetica] flex items-center gap-2"
                onClick={handleShare}
              >
                {/* <ShareDesktopIcon className="w-5 h-5" /> */}
                Share
              </button>
              {showSocialLinks && (
                <ShareItem
                  setShowSocialLinks={setShowSocialLinks}
                  handleShare={handleShare}
                  description={`Check out this amazing product on ${application?.name || "our store"}`}
                />
              )}
            </div>
          </div>
          <div>
            <FDKLink
              to={`products?brand=${productData?.brand?.action?.page?.query?.brand?.[0]}`}
            >
              <p className="font-road-radio subheading-1">
                {productData?.brand?.name}
              </p>
            </FDKLink>
            <div className="pt-2">
              <p className="body-3 text-[#aaaaaa]">
                {productData?.name}
                <br />
              </p>
              <p
                dangerouslySetInnerHTML={{
                  __html: productData?.description,
                }}
                className="body-3 text-[#aaaaaa]"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <span className="body-3 !text-ekke-brown">
                {sizeBasedPrice
                  ? `${sizeBasedPrice.price?.currency_symbol} ${currencyFormat(
                      numberWithCommas(sizeBasedPrice.price?.effective),
                    )}`
                  : `${productData?.sizes?.price?.effective?.currency_symbol} ${currencyFormat(
                      numberWithCommas(
                        productData?.sizes?.price?.effective?.min,
                      ),
                    )}`}
              </span>
              {sizeBasedPrice
                ? // When size is selected: show marked price only if different from effective
                  sizeBasedPrice.price?.marked &&
                  sizeBasedPrice.price?.effective !==
                    sizeBasedPrice.price?.marked && (
                    <span className="body-3 !text-neutral-light line-through">
                      {sizeBasedPrice.price?.currency_symbol}{" "}
                      {currencyFormat(
                        numberWithCommas(sizeBasedPrice.price?.marked),
                      )}
                    </span>
                  )
                : // When no size selected: show marked price only if different from effective
                  productData?.sizes?.price?.effective?.min !==
                    productData?.sizes?.price?.marked?.min && (
                    <span className="body-3 !text-neutral-light line-through">
                      {productData?.sizes?.price?.marked?.currency_symbol}{" "}
                      {productData?.sizes?.price?.marked?.min}
                    </span>
                  )}
            </div>
          </div>

          {/* Size Selection - Mobile optimized */}
          <div className="size-dropdown-container relative w-full">
            {(isOutOfStock ||
              (selectedSize &&
                (isCustomOrder
                  ? productData?.sizes?.sellable === false
                  : productData?.sizes?.sellable === false ||
                    !selectedSize.is_available ||
                    selectedSize.quantity === 0))) && (
              <p className="body-1 !text-ekke-brown text-center mb-2">
                OUT OF STOCK
              </p>
            )}
            <button
              className="flex items-center justify-between w-full p-2 bg-[#e3e3e3] border-2 text-left font-normal [font-family:'Archivo',Helvetica] text-[11px] tracking-[0] leading-[13.2px] hover:bg-gray-50"
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
              style={{
                border: "1px solid #171717",
              }}
            >
              <span
                className={
                  selectedSize &&
                  (isCustomOrder
                    ? productData?.sizes?.sellable === false
                    : productData?.sizes?.sellable === false ||
                      !selectedSize.is_available ||
                      selectedSize.quantity === 0)
                    ? "text-[#aaaaaa]"
                    : "text-[#171717]"
                }
              >
                {selectedSize ? selectedSize.display : "SELECT A SIZE"}
              </span>
              <span className="body-1">{showSizeDropdown ? "−" : "+"}</span>
            </button>

            {showSizeDropdown && (
              <div className="border border-t-0 border-gray-300 bg-white">
                {productData?.sizes?.sizes?.map((option) => {
                  // For custom orders, check sellable flag only (no inventory)
                  // For regular products, check sellable flag + inventory
                  // Allow selection of all sizes (including out of stock)
                  // User can select out-of-stock sizes to trigger notify me
                  const isSizeInStock = isCustomOrder
                    ? productData?.sizes?.sellable !== false
                    : productData?.sizes?.sellable !== false &&
                      option.is_available &&
                      option.quantity > 0;

                  return (
                    <button
                      key={option.value}
                      className={`w-full px-3 py-2 text-left body-1 bg-gray-100 ${
                        !isSizeInStock
                          ? "text-gray-400 bg-gray-100 cursor-pointer"
                          : "text-[#171717] hover:bg-gray-100 cursor-pointer"
                      }`}
                      style={{ border: "1px solid #eeeeee" }}
                      onClick={() => {
                        setSelectedSize(option);
                        setValue("selectedSize", option);
                        trigger("selectedSize");
                        setShowSizeDropdown(false);
                        // Sync with useProductDescription hook to populate productPriceBySlug
                        if (setCurrentSize) {
                          setCurrentSize(option);
                        }
                      }}
                    >
                      {option.display}
                      {!isCustomOrder &&
                        option.quantity > 0 &&
                        option.quantity <= 5 &&
                        ` - ONLY ${option.quantity} REMAINING`}
                      {!isCustomOrder &&
                        (!option.is_available || option.quantity === 0) &&
                        " - OUT OF STOCK"}
                    </button>
                  );
                })}
                {errors.selectedSize && (
                  <div className="text-[#5c2e20] text-xs mt-2">
                    {errors.selectedSize.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colors - Mobile optimized */}
          <div>
            <div className="body-1 mb-3">
              <p>COLORS</p>
              <p className="text-[8px] pt-2 text-neutral-light">
                {productData?.variants?.[0]?.display_type === "image"
                  ? productData?.attributes?.primary_color || "Color name"
                  : selectedColor?.name || "Color name"}
              </p>
            </div>
            {/* Variant Images (Temporary - replacing color boxes) */}
            {/* Commented out image variant logic
            <div className="flex items-center gap-3">
              {productData?.variants?.[0]?.items &&
              productData.variants[0].items.length > 0
                ? productData.variants[0].items.map((variant) => {
                    const isActive = productData?.uid === variant.uid;
                    return (
                      <div
                        key={variant.uid}
                        className={`w-6 h-6 cursor-pointer border-2 relative ${
                          isActive ? "border-black" : "border-gray-300"
                        }`}
                        onClick={() => {
                          if (
                            variant.slug &&
                            variant.slug !== productData?.slug
                          ) {
                            navigate(`/product/${variant.slug}`);
                          }
                        }}
                      >
                        <img
                          src={variant.medias?.[0]?.url}
                          alt={variant.color_name}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div
                            className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                            style={{ marginTop: "4px" }}
                          />
                        )}
                      </div>
                    );
                  })
                : // Show current product's first image when no variants
                  productData?.media?.[0] && (
                    <div className="w-6 h-6 border-2 border-black relative">
                      <img
                        src={productData.media[0].url}
                        alt={productData.name}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                        style={{ marginTop: "4px" }}
                      />
                    </div>
                  )}
            </div>
            */}
            {/* Color boxes or Image swatches */}
            <div className="flex items-center gap-3">
              {productData?.variants?.[0]?.items &&
              productData.variants[0].items.length > 0
                ? productData.variants[0].items.map((variant) => {
                    const isActive = productData?.uid === variant.uid;
                    const displayType =
                      productData.variants[0].display_type || "color";

                    return (
                      <div
                        key={variant.uid}
                        className="w-6 h-6 cursor-pointer relative"
                        style={{
                          backgroundColor:
                            displayType === "color"
                              ? `#${variant.value}`
                              : undefined,
                          border: isActive
                            ? "none"
                            : displayType === "color" &&
                                variant.value?.toLowerCase() === "ffffff"
                              ? "1px solid #aaaaaa"
                              : "none",
                        }}
                        onClick={() => {
                          if (
                            variant.slug &&
                            variant.slug !== productData?.slug
                          ) {
                            navigate(`/product/${variant.slug}`);
                          }
                        }}
                      >
                        {displayType === "image" &&
                          variant.medias?.[0]?.url && (
                            <img
                              src={variant.medias[0].url}
                              alt={variant.color_name || "Color swatch"}
                              className="w-full h-full object-cover"
                            />
                          )}
                        {isActive && (
                          <div
                            className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                            style={{ marginTop: "2px" }}
                          />
                        )}
                      </div>
                    );
                  })
                : // Show primary color when no variants
                  productData?.attributes?.["primary-colour-hex-code"] && (
                    <div
                      className="w-6 h-6 relative"
                      style={{
                        backgroundColor: `#${productData.attributes["primary-colour-hex-code"]}`,
                        border:
                          productData.attributes[
                            "primary-colour-hex-code"
                          ]?.toLowerCase() === "ffffff"
                            ? "1px solid #aaaaaa"
                            : "none",
                      }}
                    >
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                        style={{ marginTop: "2px" }}
                      />
                    </div>
                  )}
            </div>
          </div>

          {/* product material */}
          <div className="flex flex-col">
            <div className="body-2 text-[#171717]">
              {productData?.attributes?.primary_material}
            </div>
            <div className="body-2 text-[#171717]">
              {productData?.attributes?.model_info}
            </div>
            <div className="body-2 text-[#171717]">
              {productData?.attributes?.item_code}
            </div>
          </div>

          {/* Product details and features sections */}
          <div className="flex flex-col w-[246px] items-start gap-4 relative flex-[0_0_auto] pt-[6px]">
            {/* Only show Product Details heading if there is content */}
            {hasProductDetailsContent(productData) && (
              <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <p className="body-2 text-neutral-light">Product Details</p>
                <ProductDetailsRenderer productData={productData} />
              </div>
            )}

            {/* Only show Features heading if there are valid features */}
            {productFeatures &&
              productFeatures.length > 0 &&
              productFeatures.some((f) => f && f.trim() !== "") && (
                <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                  <p className="body-2 text-neutral-light">Features</p>
                  <ul className="flex flex-col items-start relative self-stretch w-full pl-2">
                    {productFeatures
                      .filter((label) => label && label.trim() !== "")
                      .map((label, i) => (
                        <li
                          key={`label - ${i}`}
                          className="flex items-center gap-2 relative self-stretch w-full"
                        >
                          <span className="w-[3px] h-[3px] bg-[#171717] rounded-full flex-shrink-0"></span>
                          <span className="body-2 text-[#171717]">{label}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            {/* {productData?.grouped_attributes?.map((attribute) => {
              return (
                <div
                  key={attribute.id}
                  className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]"
                >
                  <p className="body-2 text-neutral-light">
                    {attribute?.title}
                  </p>
                  <ul className="flex flex-col items-start gap-1 relative self-stretch w-full">
                    {attribute?.details?.map((detail) => (
                      <li
                        key={detail.key}
                        className="flex items-center gap-2 relative self-stretch w-full"
                      >
                        <span className="w-[3px] h-[3px] bg-neutral-900 rounded-full flex-shrink-0"></span>
                        <span className="body-2">{detail.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })} */}
          </div>
        </div>
        {/* Accordions for mobile */}
        <div className="space-y-6 px-[10px] md:pb-0 pb-[100px]">
          <div>
            {accordionData.map((accordion, index, arr) => (
              <FyAccordion
                key={accordion.id}
                isOpen={
                  accordion.isTrigger ? false : openAccordionId === accordion.id
                }
                onToggle={() => {
                  if (accordion.isTrigger) {
                    // Trigger size guide instead of expanding
                    setShowSizeGuide(true);
                  } else {
                    setOpenAccordionId(
                      openAccordionId === accordion.id ? null : accordion.id,
                    );
                  }
                }}
                containerStyles={{
                  borderBottom:
                    arr.length === index + 1 ? "none" : "1px solid #EEEEEE",
                }}
                buttonClassName={`${!accordion.isTrigger && openAccordionId === accordion.id ? "!pb-[10px]" : ""} py-3 px-2`}
                hideIcon={accordion.isTrigger}
              >
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-start gap-1 relative flex-1">
                    {!accordion.isTrigger &&
                    openAccordionId === accordion.id ? (
                      <div
                        style={{
                          opacity: openAccordionId === accordion.id ? 1 : 0,
                          transition: "opacity 0.2s ease",
                        }}
                        className="relative w-1 h-1 bg-neutral-900 rounded-[1px] flex-shrink-0 mt-[3px]"
                      />
                    ) : null}
                    <span
                      style={{
                        color:
                          !accordion.isTrigger &&
                          openAccordionId === accordion.id
                            ? "#aaaaaa"
                            : "#171717",
                        transition: "color 0.2s ease",
                      }}
                      className="body-1 break-words"
                    >
                      {accordion.title}
                    </span>
                  </div>
                </div>
                <div className="px-2 pb-3">
                  <div className="flex-col items-start justify-center gap-3 px-[5px] py-0 self-stretch w-full flex-[0_0_auto] flex relative">
                    {accordion.content.type === "list" ? (
                      <ul className="flex flex-col items-start gap-2 relative self-stretch w-full pl-2">
                        {accordion.content.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 relative self-stretch w-full"
                          >
                            <span className="w-[3px] h-[3px] bg-neutral-900 rounded-full flex-shrink-0 mt-[6px]" />
                            <span className="body-2 text-[#171717]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="body-2 text-[#171717] whitespace-pre-line">
                        {accordion.content.text}
                      </p>
                    )}
                    {accordion.content.hasButton &&
                      accordion.content.buttonUrl && (
                        <div className="gap-2.5 flex items-center relative">
                          <FDKLink
                            to={accordion.content.buttonUrl}
                            className="body-2 underline text-[#171717] cursor-pointer"
                          >
                            {accordion.content.buttonText}
                          </FDKLink>
                        </div>
                      )}
                  </div>
                </div>
              </FyAccordion>
            ))}
          </div>
          <div>
            <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                <p className="body-1 uppercase"> Get it by</p>
              </div>
            </div>

            <div className="flex-col w-full items-start bg-white flex relative flex-[0_0_auto] pt-2">
              <div className="flex items-center gap-2.5 px-2 py-1 relative self-stretch w-full flex-[0_0_auto] rounded-[1px] overflow-hidden border border-solid border-[#aaaaaa]">
                <input
                  {...register("pincode", validationRules.pincode)}
                  type="text"
                  placeholder="Enter your pincode to view delivery details."
                  maxLength="6"
                  className="relative flex-1 mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-xs tracking-[0] leading-3 border-none bg-transparent p-0 h-auto focus:outline-none placeholder:text-neutral-light"
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    e.target.value = numericValue;
                    setPinCode(numericValue);
                    setValue("pincode", numericValue);
                    setPincodeError(""); // Clear pincode error on change
                    // Trigger validation on every change
                    trigger("pincode");
                  }}
                  value={pinCode}
                />

                {/* <button
                  className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-neutral-900 text-[11px] tracking-[0] leading-[13.2px] whitespace-nowrap h-auto p-0 bg-transparent border-none cursor-pointer hover:text-gray-700"
                  onClick={() => {
                    setPinCode("");
                    setValue("pincode", "");
                  }}
                >
                  CHANGE
                </button> */}
              </div>
              {errors.pincode && (
                <div className="text-[#5c2e20] text-xs mt-2">
                  {errors.pincode.message}
                </div>
              )}
              {!pinCode && (
                <span className="body-2 !text-[8px] pt-2">
                  Enter your pincode to view delivery details.
                </span>
              )}
            </div>

            <div className="pt-3" style={{ minHeight: "24px" }}>
              {pincodeError && !errors.pincode ? (
                <p
                  className="body-1 text-[#5c2e20]"
                  style={{ minHeight: "1.2em" }}
                >
                  {pincodeError.toUpperCase()}
                </p>
              ) : (
                <p
                  className="body-1"
                  style={{
                    visibility:
                      isFetchingDelivery || estimatedDeliveryDate
                        ? "visible"
                        : "hidden",
                    minHeight: "1.2em",
                  }}
                >
                  {isFetchingDelivery ? (
                    "CALCULATING DELIVERY DATE..."
                  ) : estimatedDeliveryDate && !errors.pincode ? (
                    <>
                      GET IT BY{" "}
                      <span className="font-medium">
                        {estimatedDeliveryDate.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    "\u00A0"
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-3 bg-ekke-bg fixed bottom-0 w-full z-10">
          <button
            className="flex-1 bg-[#000] cursor-pointer pl-1 py-2 text-left"
            onClick={(e) => {
              // Check if selected size is out of stock
              const isSelectedSizeOutOfStock = selectedSize
                ? isCustomOrder
                  ? productData?.sizes?.sellable === false
                  : productData?.sizes?.sellable === false ||
                    !selectedSize.is_available ||
                    selectedSize.quantity === 0
                : false;

              if (isSelectedSizeOutOfStock) {
                // Open notify me modal for out of stock size
                setShowNotifyModal(true);
                return;
              }
              handleAddToCartWithValidation(e);
            }}
            disabled={isLoading || (isOutOfStock && !selectedSize)}
            style={{
              cursor:
                isLoading || (isOutOfStock && !selectedSize)
                  ? "not-allowed"
                  : "pointer",
              opacity: isLoading || (isOutOfStock && !selectedSize) ? 0.5 : 1,
            }}
          >
            <span className="body-1" style={{ color: "#fff" }}>
              {(() => {
                // Determine button text based on selected size
                if (!selectedSize && isOutOfStock) {
                  return "NOTIFY ME";
                }
                if (selectedSize) {
                  const isSelectedSizeOutOfStock = isCustomOrder
                    ? productData?.sizes?.sellable === false
                    : productData?.sizes?.sellable === false ||
                      !selectedSize.is_available ||
                      selectedSize.quantity === 0;
                  return isSelectedSizeOutOfStock ? "NOTIFY ME" : "ADD TO BAG";
                }
                return "ADD TO BAG";
              })()}
            </span>
          </button>

          <button
            className="w-[72px] cursor-pointer"
            onClick={handleAddToWishlist}
          >
            <SvgWrapper
              svgSrc={isInWishlist ? "wishlist-pdp" : "wishlist-plp"}
            />
          </button>
        </div>
      </div>
      {/* Zoom Modal */}
      <ProductDetailsZoom
        productData={productData}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        onAddToCart={handleAddToCartWithValidation}
        onAddToWishlist={handleAddToWishlist}
      />
      {/* Size Guide Drawer */}
      <SizeGuide
        isOpen={showSizeGuide}
        onCloseDialog={() => setShowSizeGuide(false)}
        productMeta={productMeta}
        productData={productData}
      />

      {/* Notify Me Modal */}
      <NotifyMeModal
        showNotifyModal={showNotifyModal}
        setShowNotifyModal={setShowNotifyModal}
        productData={productData}
      />
    </>
  );
};
