import React, { useState, useEffect, useRef } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";

import useProductListing from "../../page-layouts/plp/useProductListing";
import ProductCard from "../product-card/product-card";
import { useAccounts, useWishlist } from "../../helper/hooks";

const isRunningOnClient = () => {
  return typeof window !== "undefined";
};

// // Get API wrapper from display name
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
      return "trending-products";
    default:
      return null;
  }
};

export function YouMayAlsoLike({
  wrappers = "recently-launched",
  props = {},
  onCartUpdate,
  fpi: fpiProp,
}) {
  const fpi = fpiProp || useFPI();
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const [recommendationData, setRecommendationData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef(null);

  // Page context: "pdp" or "plp"

  // Use the same hook as PLP for ATC functionality
  const { handleAddToCart: originalHandleAddToCart, showAddToCart } =
    useProductListing({
      fpi,
      props,
    });

  // Wrap handleAddToCart to refresh cart after successful add
  const handleAddToCart = async (product) => {
    try {
      // Call the original function (it handles errors internally)
      await originalHandleAddToCart(product);
      
      // Refresh cart after a delay to ensure cart is updated on server
      // The original function shows success toast and opens cart drawer after 900ms
      // So we refresh slightly after that to sync the cart
      if (onCartUpdate && typeof onCartUpdate === "function") {
        setTimeout(() => {
          onCartUpdate(fpi);
        }, 1000);
      }
    } catch (error) {
      // Error handling is done in originalHandleAddToCart
      // Only log if there's an unexpected error
      console.error("Error in handleAddToCart wrapper:", error);
    }
  };

  // Use wishlist and accounts hooks directly for wishlist functionality
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  // Wishlist click handler
  const handleWishlistClick = (data) => {
    if (!isLoggedIn) {
      openLogin();
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
  const heading = "YOU MAY ALSO LIKE";
  const withSlider = true;
  const wrapperName = wrappers || "recently-launched";
  const productsToShow = 3.2;

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
    const wrapper = getExtWrapper(wrapperName);

    const fetchData = async () => {
      try {
        let url = "";

        url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok.");
        const data = await res.json();
        setRecommendationData(data);
      } catch (error) {
        console.error("Recommendation fetch error:", error);
      }
    };

    if (wrapper) {
      fetchData();
    }
  }, [PRODUCT?.product_details?.slug, wrapperName]);

  // Track scroll position to update current slide counter
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !withSlider) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.scrollWidth / transformedProducts.length;
      const currentIndex = Math.round(scrollLeft / itemWidth);
      setCurrentSlide(currentIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [transformedProducts.length, withSlider]);

  // Check if we have only one product
  const isSingleProduct = transformedProducts?.length === 1;

  // Calculate grid columns based on viewport (matching slider settings)
  const getGridColumns = () => {
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

  // Don't render if no products or no recommendation data
  if (!recommendationData || !transformedProducts?.length) {
    return null;
  }

  return (
    <div className="w-full">
      <div>
        {/* Section Title */}
        <div className="flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px]">
          <p className="subheading-3">{heading}</p>
          {withSlider && transformedProducts?.length > 0 && (
            <p className="body-2 text-neutral-light">
              {String(currentSlide + 1).padStart(2, "0")}/
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
                      height: "367.11px",
                      aspectRatio: "220.0/367.11",
                    }}
                    mobileImageContainerStyle={{
                      width: "100%",
                      height: "252.444px",
                      aspectRatio: "160.00/225.44;",
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
                className={`recommendation-grid ${
                  wrapperName === "recently-launched"
                    ? "recently-launched-grid"
                    : ""
                }`}
              >
                <style>{`
                  .recommendation-scroll-container::-webkit-scrollbar {
                    display: none;
                  }

                  .recommendation-grid {
                    display: grid;
                    grid-auto-flow: column;
                    gap: 0;
                    grid-auto-columns: calc(100% / ${gridColumns.desktop});
                  }

                  @media (max-width: 1440px) {
                    .recommendation-grid {
                      grid-auto-columns: calc(100% / ${gridColumns.large});
                    }
                  }

                  @media (max-width: 1024px) {
                    .recommendation-grid {
                      grid-auto-columns: calc(100% / ${gridColumns.tablet});
                    }
                  }

                  @media (max-width: 768px) {
                    .recommendation-grid {
                      grid-auto-columns: calc(
                        100% / ${gridColumns.mobileLarge}
                      );
                    }
                  }

                  @media (max-width: 480px) {
                    .recommendation-grid {
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
                        imageContainerStyle={{
                          width: "100%",
                          height: "367.11px",
                          aspectRatio: "220.0/367.11",
                        }}
                        mobileImageContainerStyle={{
                          width: "100%",
                          height: "252.444px",
                          aspectRatio: "160.00/225.44;",
                        }}
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
                    height: "367.11px",
                    aspectRatio: "220.0/367.11",
                  }}
                  mobileImageContainerStyle={{
                    width: "100%",
                    height: "252.444px",
                    aspectRatio: "160.00/225.44;",
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
