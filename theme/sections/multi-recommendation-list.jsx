/**
 * Multi Recommendation List Component
 *
 * This component displays product recommendations in a two-column grid format.
 * Each recommendation type (wrapper) shows as a separate section with heading and 2 products.
 * Styling matches multi-collection-product-list, functionality from product-recommendation.
 */
import React, { useState, useMemo, useEffect } from "react";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import {
  useAccounts,
  useViewport,
  useWishlist,
  useThemeFeature,
} from "../helper/hooks";
import styles from "../styles/sections/multi-collection-product-list.less";
import "@gofynd/theme-template/components/product-card/product-card.css";
import { isRunningOnClient, getProductImgAspectRatio } from "../helper/utils";
import { FDKLink } from "fdk-core/components";
import ProductCard from "../components/product-card/product-card";
import useProductListing from "../page-layouts/plp/useProductListing";

// Helper function to get API wrapper from display name
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
    default:
      return null;
  }
};

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { isInternational } = useThemeFeature({ fpi });
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);

  const { heading, position, show_wishlist_icon } = props;

  const showAddToCart = !isInternational && !globalConfig?.disable_cart;
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const listingPrice =
    CONFIGURATION?.app_features?.common?.listing_price?.value || "range";
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);
  const isTablet = useViewport(0, 768);

  const { handleAddToCart } = useProductListing({ fpi, props });

  const columnCount = {
    desktop: 4,
    tablet: 4,
    mobile: 2,
  };

  // Wrapper to transform product structure for useProductListing
  const handleCart = async (product) => {
    const sizesArray = [...(product.sizes || [])];
    sizesArray.sizes = product.sizes || [];

    const transformedProduct = {
      ...product,
      sizes: sizesArray,
    };

    await handleAddToCart(transformedProduct);
  };

  const pincode = useMemo(() => {
    if (!isRunningOnClient()) {
      return "";
    }
    return pincodeDetails?.localityValue || locationDetails?.pincode || "";
  }, [pincodeDetails, locationDetails]);

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin({ wishlistProduct: data?.product });
      return;
    }
    toggleWishlist(data);
  };

  const [groupedRecommendations, setGroupedRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recommendations for each block
  const fetchGroupedRecommendations = async () => {
    setIsLoading(true);
    const recommendations = [];

    for (const block of blocks) {
      if (block?.name === "Recommendation") {
        const wrapperName =
          block?.props?.wrapper_name?.value || "similar-products";
        const recommendationTitle =
          block?.props?.recommendation_title?.value || wrapperName;
        const wrapper = getExtWrapper(wrapperName);

        if (wrapper) {
          try {
            const RecommendationSlug = PRODUCT?.product_details?.slug;
            // Always use PLP-style endpoint with slug
            const url = `/ext/recalpha/api/application/v1.0/recommend/${wrapper}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Network response was not ok.");
            const data = await res.json();

            // Transform recommendation data to match ProductCard format
            const transformedProducts = (data?.items || [])
              .slice(0, 2)
              .map((item) => ({
                uid: item.uid,
                slug: item.slug,
                name: item.name,
                media: item.medias || [],
                price: item.price || {},
                discount: item.discount || null,
                sellable: item.sellable,
                teaser_tag: item.teaser_tag,
                brand: item.brand || {},
                sizes: item.sizes || [],
                variants: item.variants ? [item.variants] : [],
                action: {
                  page: {
                    params: { slug: item.slug },
                    type: "product",
                  },
                  type: "page",
                },
              }));

            if (transformedProducts.length > 0) {
              recommendations.push({
                recommendation_name: recommendationTitle,
                products: transformedProducts,
              });
            }
          } catch (error) {
            console.error(
              `Error fetching recommendations for ${wrapperName}:`,
              error
            );
          }
        }
      }
    }

    setGroupedRecommendations(recommendations);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isRunningOnClient()) {
      fetchGroupedRecommendations();
    }
  }, [blocks, PRODUCT?.product_details?.slug]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.collectionsWrapper}>
      <div className={styles.collectionsGrid}>
        {[1, 2].map((index) => (
          <div key={index} className={styles.collectionGroup}>
            <div
              className={styles.collectionTitle}
              style={{
                height: "24px",
                width: "150px",
                background: "#f0f0f0",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            />
            <div className={styles.collectionProducts}>
              {[1, 2].map((productIndex) => (
                <div key={productIndex} className={styles.sliderView}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "340/580",
                      background: "#f0f0f0",
                      borderRadius: "8px",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Don't render if loading is complete and no recommendations
  if (
    !isLoading &&
    (!groupedRecommendations || groupedRecommendations.length === 0)
  ) {
    return null;
  }

  return (
    <>
      <section className={styles.sectionWrapper}>
        {heading?.value && (
          <div
            className={`${styles.titleBlock} ${
              position?.value === "center" ? styles.moveCenter : ""
            }`}
          >
            <h2 className="fx-title fontHeader">{heading.value}</h2>
          </div>
        )}
        <div className={styles.productContainer}>
          {/* Show loading skeleton while fetching */}
          {isLoading && <LoadingSkeleton />}

          {/* Render groupedRecommendations */}
          {!isLoading && groupedRecommendations?.length > 0 && (
            <div className={styles.collectionsWrapper}>
              <div className={styles.collectionsGrid}>
                {groupedRecommendations.map(
                  (recommendation, recommendationIndex) => (
                    <div
                      key={recommendationIndex}
                      className={styles.collectionGroup}
                    >
                      <h3 className={styles.collectionTitle}>
                        {recommendation.recommendation_name
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      <div className={styles.collectionProducts}>
                        {recommendation.products.map(
                          (product, productIndex) => (
                            <div
                              data-cardtype="'Products'"
                              key={productIndex}
                              className={styles.sliderView}
                            >
                              <FDKLink to={`/product/${product.slug}`}>
                                <ProductCard
                                  product={product}
                                  listingPrice={listingPrice}
                                  isSaleBadge={true}
                                  isWishlistDisplayed={false}
                                  isWishlistIcon={show_wishlist_icon?.value}
                                  columnCount={columnCount}
                                  isPrice={globalConfig?.show_price}
                                  isImageFill={true}
                                  onWishlistClick={handleWishlistToggle}
                                  followedIdList={followedIdList}
                                  showAddToCart={showAddToCart}
                                  handleAddToCart={handleCart}
                                  aspectRatio={getProductImgAspectRatio(
                                    globalConfig
                                  )}
                                  isSlider
                                  imageContainerStyle={{
                                    width: "100%",
                                    height: "100%",
                                    aspectRatio: "340/580",
                                  }}
                                  mobileImageContainerStyle={{
                                    width: "100%",
                                    height: "100%",
                                    aspectRatio: "177/283.56",
                                  }}
                                />
                              </FDKLink>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

export const settings = {
  label: "Multi Recommendation List",
  props: [
    {
      type: "text",
      id: "heading",
      default: "Recommended For You",
      label: "t:resource.common.heading",
    },
    {
      id: "position",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.left",
        },
        {
          value: "center",
          text: "t:resource.common.center",
        },
      ],
      default: "left",
      label:
        "t:resource.sections.multi_collection_product_list.header_position",
    },
    {
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "t:resource.common.show_wish_list_icon",
      default: true,
    },
  ],
  blocks: [
    {
      label: "Recommendation",
      name: "Recommendation",
      props: [
        {
          type: "select",
          id: "wrapper_name",
          label: "Recommendation Type",
          info: "Select the type of recommendations to display",
          default: "recently-launched",
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
          ],
        },
        {
          type: "text",
          id: "recommendation_title",
          label: "Recommendation Title",
          info: "Enter a custom title for this recommendation section",
          default: "Recently Launched",
        },
      ],
    },
  ],
};

export default Component;
