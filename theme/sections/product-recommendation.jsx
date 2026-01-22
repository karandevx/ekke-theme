import React, { useState, useEffect, useRef } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/product-card/product-card";
import useProductListing from "../page-layouts/plp/useProductListing";
import { useWishlist, useAccounts } from "../helper/hooks";
import Spinner from "../components/spinner/spinner";

// Helper function to check if running on client
const isRunningOnClient = () => {
  return typeof window !== "undefined";
};

// Get API wrapper from display name
const getExtWrapper = (template) => {
  switch (template) {
    case "brand":
      return "brand";
    case "recently-launched":
      return "recently-launched";
    case "wishlisted-products":
      return "wishlisted-products";
    case "category":
      return "category";
    case "most-compared":
      return "most-compared";
    case "similar-products":
      return "similar-products";
    case "bought-together":
      return "bought-together";
    case "trending-products":
      return "trending";
    case "price":
      return "price";
    case "vendor":
      return "vendor";
    case "wishlisted":
      return "wishlisted";
    case "specification":
      return "specification";
    case "cross-sell":
      return "cross-sell";
    case "up-sell":
      return "up-sell";
    default:
      return null;
  }
};

export function Component({ props = {}, globalConfig = {} }) {
  const fpi = useFPI();
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);

  // Page context: "pdp" or "plp"
  const pageContext = props?.page_context?.value || "plp";
  const wrapperName = props?.wrapper_name?.value || "similar-products";
  const wrapper = getExtWrapper(wrapperName);

  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef(null);

  // Use the same hook as PLP for ATC functionality
  const { handleAddToCart, showAddToCart } = useProductListing({
    fpi,
    props,
  });

  // Use wishlist and accounts hooks directly for wishlist functionality
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  // Wishlist click handler
  const handleWishlistClick = (data) => {
    if (!isLoggedIn) {
      openLogin({ wishlistProduct: data?.product });
      return;
    }
    toggleWishlist(data);
  };

  // Drag detection handlers
  // const handleMouseDown = (e) => {
  //   setDragStartPos({ x: e.clientX, y: e.clientY });
  //   setIsDragging(false);
  // };

  // const handleMouseMove = (e) => {
  //   if (dragStartPos.x !== 0 || dragStartPos.y !== 0) {
  //     const deltaX = Math.abs(e.clientX - dragStartPos.x);
  //     const deltaY = Math.abs(e.clientY - dragStartPos.y);
  //     if (deltaX > 5 || deltaY > 5) {
  //       setIsDragging(true);
  //     }
  //   }
  // };

  // const handleClick = (e, slug) => {
  //   if (isDragging) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     return false;
  //   }
  // };

  // Get props with defaults
  const heading = props?.heading?.value || "YOU MAY ALSO LIKE";
  const withSlider = props?.with_slider?.value ?? true;
  console.log("wrappperrrrrrrr", wrapperName);
  const productsToShow = props?.products_to_show?.value || 4;

  // Transform recommendation data to match ProductCard expected format
  const transformedProducts =
    (recommendationData?.items || []).map((item) => ({
      ...item,
      media: item.medias || [],
      variants: item.variants ? [item.variants] : [],
      price: item.price || {},
      brand: item.brand || {},
      discount: item.discount || null,
    })) || [];

  // Fetch recommendation data (PDP vs PLP behavior)
  useEffect(() => {
    if (!isRunningOnClient()) return;

    const RecommendationSlug = PRODUCT?.product_details?.slug;

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = "";

        if (pageContext === "plp") {
          url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}`;
        } else {
          url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}?item_slug=${RecommendationSlug}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok.");
        const data = await res.json();
        setRecommendationData(data);
      } catch (error) {
        console.error("Recommendation fetch error:", error);
        setRecommendationData(null);
      } finally {
        setLoading(false);
      }
    };

    if (pageContext === "pdp" || wrapper) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [PRODUCT?.product_details?.slug, wrapperName, pageContext, wrapper]);

  // Track scroll position to update current slide counter
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !withSlider) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.offsetWidth;
      const scrollWidth = container.scrollWidth;

      // Calculate how many products are visible at once
      const itemWidth = scrollWidth / transformedProducts.length;
      const visibleCount = Math.floor(containerWidth / itemWidth);

      // Calculate the index of the last visible product
      const scrollProgress = scrollLeft / (scrollWidth - containerWidth);
      const lastVisibleIndex = Math.min(
        Math.ceil(
          scrollProgress * (transformedProducts.length - visibleCount),
        ) + visibleCount,
        transformedProducts.length,
      );

      setCurrentSlide(lastVisibleIndex);
    };

    // Call once on mount to set initial state
    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [transformedProducts.length, withSlider]);

  // Check if we have only one product
  const isSingleProduct = transformedProducts?.length === 1;

  // Calculate grid columns based on viewport (matching slider settings)
  const getGridColumns = () => {
    // Desktop (>1440px): productsToShow
    // Large (1024-1440px): min(productsToShow, 6)
    // Tablet (768-1024px): min(productsToShow, 4)
    // Mobile tablet (480-768px): 2.2
    // Mobile (<480px): 2 for recently-launched, 1.25 for others
    const mobileColumns = wrapperName === "recently-launched" ? 2 : 1.25;

    return {
      desktop: productsToShow,
      large: Math.min(productsToShow, 6),
      tablet: Math.min(productsToShow, 4),
      mobileLarge: 2.2,
      mobile: mobileColumns,
    };
  };

  const gridColumns = getGridColumns();
  const location = useLocation();

  // Check if we're on PDP page
  const isPDP = /^\/product\/[^/]+\/?$/.test(location.pathname);

  // Show loader while loading
  if (loading) {
    return (
      <div className={`w-full bg-white ${isPDP ? "lg:relative lg:z-10" : ""}`}>
        <div
          className={`flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px] bg-white ${isPDP ? "lg:sticky lg:top-0 lg:z-20" : ""}`}
        >
          <p className="subheading-3">{heading}</p>
        </div>
        <div className="flex items-center justify-center py-16 md:py-24 min-h-[400px]">
          <Spinner />
        </div>
      </div>
    );
  }

  // Don't render if no products or no recommendation data (only after loading completes)
  if (!recommendationData || !transformedProducts?.length) {
    return null;
  }

  return (
    <div className={`w-full bg-white ${isPDP ? "lg:relative lg:z-10" : ""}`}>
      <div>
        {/* Section Title */}
        <div
          className={`flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px] bg-white ${isPDP ? "lg:sticky lg:top-0 lg:z-20" : ""}`}
        >
          <p className="subheading-3">{heading}</p>
          {withSlider && transformedProducts?.length > 0 && (
            <p className="body-2 text-neutral-light">
              {String(currentSlide).padStart(2, "0")}/
              {String(transformedProducts?.length).padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Product slider or grid */}
        {withSlider ? (
          isSingleProduct ? (
            // Single product - no slider, full width on mobile
            <div className="md:px-4 px-[10px]">
              <div className="w-full md:max-w-[360px]">
                <FDKLink to={`/product/${transformedProducts[0].slug}`}>
                  <ProductCard
                    product={transformedProducts[0]}
                    isBrand={true}
                    isPrice={true}
                    isSaleBadge={true}
                    isWishlistIcon={true}
                    showImageOnHover={true}
                    showAddToCart={showAddToCart}
                    handleAddToCart={handleAddToCart}
                    onWishlistClick={handleWishlistClick}
                    followedIdList={followedIdList}
                    actionButtonText="ADD TO CART"
                    imageContainerStyle={{
                      width: "100%",
                      height:
                        wrapperName === "recently-launched" ? "auto" : "402px",
                      aspectRatio:
                        wrapperName === "recently-launched"
                          ? "360/616"
                          : "240/402",
                    }}
                    mobileImageContainerStyle={{
                      width: "100%",
                      height:
                        wrapperName === "recently-launched" ? "auto" : "500px",
                      aspectRatio: "295/500",
                    }}
                  />
                </FDKLink>
              </div>
            </div>
          ) : (
            // Multiple products - use native horizontal scroll
            <div
              ref={scrollContainerRef}
              className="recommendation-scroll-container overflow-x-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
            >
              <div
                className={`recommendation-grid-pdp ${
                  wrapperName === "recently-launched"
                    ? "recently-launched-grid"
                    : ""
                }`}
              >
                <style>{`
                  .recommendation-scroll-container::-webkit-scrollbar {
                    display: none;
                  }

                  .recommendation-grid-pdp {
                    display: grid;
                    grid-auto-flow: column;
                    gap: 0;
                    grid-auto-columns: calc(100% / ${gridColumns.desktop});
                  }

                  @media (max-width: 1440px) {
                    .recommendation-grid-pdp {
                      grid-auto-columns: calc(100% / ${gridColumns.large});
                    }
                  }

                  @media (max-width: 1024px) {
                    .recommendation-grid-pdp {
                      grid-auto-columns: calc(100% / ${gridColumns.tablet});
                    }
                  }

                  @media (max-width: 768px) {
                    .recommendation-grid-pdp {
                      grid-auto-columns: calc(
                        100% / ${gridColumns.mobileLarge}
                      );
                    }
                  }

                  @media (max-width: 480px) {
                    .recommendation-grid-pdp {
                      grid-auto-columns: calc(100% / ${gridColumns.mobile});
                    }

                    /* Force 2 products for recently-launched */
                    .recently-launched-grid {
                      grid-auto-columns: 50% !important;
                    }
                  }
                `}</style>
                {transformedProducts?.map((product) => (
                  <div key={product.uid}>
                    <FDKLink
                      to={`/product/${product.slug}`}
                      // onMouseDown={handleMouseDown}
                      // onMouseMove={handleMouseMove}
                      // onClick={(e) => handleClick(e, product.slug)}
                    >
                      <ProductCard
                        product={product}
                        isBrand={true}
                        isPrice={true}
                        isSaleBadge={true}
                        isWishlistIcon={true}
                        showImageOnHover={true}
                        showAddToCart={showAddToCart}
                        handleAddToCart={handleAddToCart}
                        onWishlistClick={handleWishlistClick}
                        followedIdList={followedIdList}
                        actionButtonText="ADD TO CART"
                        imageContainerStyle={
                          productsToShow !== 4
                            ? {
                                width: "100%",
                                height: "auto",
                                aspectRatio: "240/402",
                              }
                            : {
                                width: "100%",
                                height: "auto",
                                aspectRatio:
                                  wrapperName === "recently-launched"
                                    ? "360/616"
                                    : "295/500",
                              }
                        }
                        mobileImageContainerStyle={
                          productsToShow !== 4
                            ? {
                                width: "100%",
                                height: "500px",
                                aspectRatio: "295/500",
                              }
                            : {
                                width: "100%",
                                height: "309px",
                                aspectRatio: "auto",
                              }
                        }
                      />
                    </FDKLink>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-[32px] md:gap-y-0">
            {transformedProducts?.map((product) => (
              <FDKLink to={`/product/${product.slug}`} key={product.uid}>
                <ProductCard
                  product={product}
                  isBrand={true}
                  isPrice={true}
                  isSaleBadge={true}
                  isWishlistIcon={true}
                  showImageOnHover={true}
                  showAddToCart={showAddToCart}
                  handleAddToCart={handleAddToCart}
                  onWishlistClick={handleWishlistClick}
                  followedIdList={followedIdList}
                  actionButtonText="ADD TO CART"
                  imageContainerStyle={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "360/616",
                  }}
                  mobileImageContainerStyle={{
                    width: "100%",
                    height: "309px",
                    aspectRatio: "auto",
                  }}
                />
              </FDKLink>
            ))}
          </div>
        )}
      </div>

      {/* Slider styles */}
      <style>{`
        .products-slider {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .products-slider :global(.slick-slider) {
          position: relative;
          display: block;
          box-sizing: border-box;
          user-select: none;
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }

        .products-slider :global(.slick-list) {
          position: relative;
          display: block;
          overflow: visible;
          margin: 0;
          padding: 0;
        }

        .products-slider :global(.slick-track) {
          position: relative;
          top: 0;
          left: 0;
          display: flex !important;
          align-items: stretch;
          gap: 0;
        }

        .products-slider :global(.slick-slide) {
          display: block;
          height: auto;
          min-height: 1px;
          float: none;
        }

        .products-slider :global(.slick-slide > div) {
          height: 100%;
        }

        .products-slider :global(.slider-item) {
          padding: 0 5px;
        }

        /* Desktop: Ensure proper spacing */
        @media (min-width: 769px) {
          .products-slider :global(.slick-list) {
            padding: 0 10px;
          }
        }

        /* Tablet: Proper spacing */
        @media (min-width: 481px) and (max-width: 768px) {
          .products-slider :global(.slick-list) {
            padding: 0 10px;
          }
        }

        /* Mobile: Full width card with peek effect */
        @media (max-width: 480px) {
          .products-slider :global(.slick-list) {
            overflow: visible;
            padding: 0 10px;
          }

          .products-slider :global(.slick-slide) {
            padding-right: 10px;
          }

          .products-slider :global(.slider-item) {
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .products-slider :global(.slick-prev),
          .products-slider :global(.slick-next) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Product Recommendation",
  props: [
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
        {
          value: "price",
          text: "Price",
        },
        {
          value: "vendor",
          text: "Vendor",
        },
        {
          value: "bought-together",
          text: "Frequently brought together",
        },
        {
          value: "wishlisted-products",
          text: "WishListed Products",
        },
        {
          value: "specification",
          text: "Specification",
        },
        {
          value: "cross-sell",
          text: "Cross Sell",
        },
        {
          value: "up-sell",
          text: "Up Sell",
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
  ],
};

export default Component;
