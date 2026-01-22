/**
 * Selected Products Carousel Component
 *
 * This component displays user-selected products in a carousel format.
 * Products are selected individually by the user through product picker dropdowns.
 */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import {
  useAccounts,
  useViewport,
  useWishlist,
  useThemeFeature,
} from "../helper/hooks";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../queries/plpQuery";
import styles from "../styles/sections/multi-collection-product-list.less";
// import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import "@gofynd/theme-template/components/product-card/product-card.css";
// Removed FyImage as not used
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import AddToCart from "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart";
import "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart.css";
import SizeGuide from "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide";
import "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide.css";
import { isRunningOnClient, getProductImgAspectRatio } from "../helper/utils";
import { FDKLink } from "fdk-core/components";
import ProductCard from "../components/product-card/product-card";
import useProductListing from "../page-layouts/plp/useProductListing";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { isInternational } = useThemeFeature({ fpi });
  const {
    heading,
    position,
    per_row,
    per_row_mobile,
    show_wishlist_icon,
    show_add_to_cart,
    card_cta_text,
    enable_sales_badge,
    mandatory_pincode,
    hide_single_size,
    preselect_size,
    img_resize,
    img_resize_mobile,
  } = props;
  const showAddToCart =
    !isInternational && show_add_to_cart?.value && !globalConfig?.disable_cart;
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const listingPrice =
    CONFIGURATION?.app_features?.common?.listing_price?.value || "range";
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);
  const isTablet = useViewport(0, 768);

  const addToCartConfigs = {
    mandatory_pincode,
    hide_single_size,
    preselect_size,
  };

  const { handleAddToCart } = useProductListing({ fpi, props });

  const columnCount = {
    desktop: per_row?.value > 3 ? 4 : 4,
    tablet: per_row?.value > 2 ? 3 : 4,
    mobile: per_row_mobile?.value || 2,
  };

  // Wrapper to transform product structure for useProductListing
  const handleCart = async (product) => {
    // Create a new array that also has a 'sizes' property
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

  const [groupedCollections, setGroupedCollections] = useState([]);

  const fetchGroupedCollections = async () => {
    const collections = {};

    blocks?.forEach((block) => {
      if (block?.name === "Collection") {
        const collectionValue = block?.props?.collection?.value;
        const collectionTitle =
          block?.props?.collection_title?.value || collectionValue;
        const product1Slug = block?.props?.product?.value;
        const product2Slug = block?.props?.product2?.value;

        if (collectionValue) {
          if (!collections[collectionValue]) {
            collections[collectionValue] = {
              collection_name: collectionTitle,
              productSlugs: [],
            };
          }

          // Add products to the collection (avoid duplicates)
          if (
            product1Slug &&
            !collections[collectionValue].productSlugs.includes(product1Slug)
          ) {
            collections[collectionValue].productSlugs.push(product1Slug);
          }
          if (
            product2Slug &&
            !collections[collectionValue].productSlugs.includes(product2Slug)
          ) {
            collections[collectionValue].productSlugs.push(product2Slug);
          }
        }
      }
    });

    // Fetch full product data for each collection
    const collectionsWithProducts = [];

    for (const [collectionKey, collectionData] of Object.entries(collections)) {
      if (collectionData.productSlugs.length > 0) {
        try {
          const productPromises = collectionData.productSlugs.map((slug) =>
            fpi.executeGQL(GET_QUICK_VIEW_PRODUCT_DETAILS, { slug })
          );

          const results = await Promise.all(productPromises);
          const products = results
            .map((res) => res?.data?.product)
            .filter(Boolean)
            .map((product) => ({
              uid: product.uid,
              slug: product.slug,
              name: product.name,
              media: product.media,
              // Use price from sizes object since product.price is null
              price: product.sizes?.price || product.price,
              discount: product.discount || product.sizes?.discount,
              sellable: product.sizes?.sellable ?? product.sellable,
              teaser_tag: product.teaser_tag,
              brand: product.brand,
              sizes: product.sizes?.sizes || [],
              variants: product.variants,
              action: {
                page: {
                  params: { slug: product.slug },
                  type: "product",
                },
                type: "page",
              },
            }));

          collectionsWithProducts.push({
            collection_name: collectionData.collection_name,
            products: products,
          });
        } catch (error) {
          console.error(
            `Error fetching products for collection ${collectionKey}:`,
            error
          );
        }
      }
    }

    setGroupedCollections(collectionsWithProducts);
  };

  useEffect(() => {
    fetchGroupedCollections();
  }, [blocks]);

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 481 }, width: img_resize?.value ?? 300 },
      { breakpoint: { max: 480 }, width: img_resize_mobile?.value ?? 500 },
    ];
  }, [globalConfig?.img_hd, img_resize?.value, img_resize_mobile?.value]);

  // const dynamicStyles = {
  //   paddingTop: `${padding_top?.value ?? 16}px`,
  //   paddingBottom: `${padding_bottom?.value ?? 16}px`,
  // };

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
          {/* ✅ NEW: Render groupedCollections for desktop */}
          {groupedCollections?.length > 0 && (
            <div className={styles.collectionsWrapper}>
              <div className={styles.collectionsGrid}>
                {groupedCollections.map((collection, collectionIndex) => (
                  <div key={collectionIndex} className={styles.collectionGroup}>
                    <h3 className={styles.collectionTitle}>
                      {collection.collection_name
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                    <div className={styles.collectionProducts}>
                      {collection.products.map((product, productIndex) => (
                        <div
                          data-cardtype="'Products'"
                          key={productIndex}
                          className={styles.sliderView}
                        >
                          <FDKLink to={`/product/${product.slug}`}>
                            <ProductCard
                              product={product}
                              listingPrice={listingPrice}
                              isSaleBadge={enable_sales_badge?.value}
                              isWishlistDisplayed={false}
                              isWishlistIcon={show_wishlist_icon?.value}
                              columnCount={columnCount}
                              isPrice={globalConfig?.show_price}
                              isImageFill={true}
                              onWishlistClick={handleWishlistToggle}
                              followedIdList={followedIdList}
                              showAddToCart={showAddToCart}
                              actionButtonText={
                                card_cta_text?.value ??
                                t("resource.common.add_to_cart")
                              }
                              handleAddToCart={handleCart}
                              aspectRatio={getProductImgAspectRatio(
                                globalConfig
                              )}
                              imgSrcSet={imgSrcSet}
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export const settings = {
  label: "Selected Products Carousel",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "t:resource.common.heading",
    },
    {
      type: "range",
      id: "per_row",
      min: 2,
      max: 6,
      step: 1,
      unit: "",
      label:
        "t:resource.sections.multi_collection_product_list.products_per_row",
      default: 4,
      info: "t:resource.sections.multi_collection_product_list.max_products_per_row",
    },
    {
      type: "range",
      id: "per_row_mobile",
      min: 1,
      max: 3,
      step: 1,
      unit: "",
      label: "Products per row (Mobile)",
      default: 2,
      info: "Number of products to display per row on mobile devices",
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
      id: "img_resize",
      label:
        "t:resource.sections.products_listing.image_size_for_tablet_desktop",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
        {
          value: "1100",
          text: "1100px",
        },
        {
          value: "1300",
          text: "1300px",
        },
      ],
      default: "300",
    },
    {
      id: "img_resize_mobile",
      label: "t:resource.sections.products_listing.image_size_for_mobile",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
      ],
      default: "500",
    },
    {
      type: "checkbox",
      id: "viewAll",
      default: false,
      label: "t:resource.sections.multi_collection_product_list.show_view_all",
      info: "t:resource.sections.multi_collection_product_list.view_all_requires_heading",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "Image Container",
      default: true,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "t:resource.common.show_wish_list_icon",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "t:resource.common.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: true,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default:
        "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "enable_sales_badge",
      label: "t:resource.sections.products_listing.enable_sales_badge",
      default: true,
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.mandatory_delivery_check",
      info: "t:resource.pages.wishlist.mandatory_delivery_check_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
      info: "t:resource.pages.wishlist.hide_single_size_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.pages.wishlist.preselect_size_info",
      default: false,
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 16,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
  blocks: [
    {
      label: "Collection",
      name: "Collection",
      props: [
        {
          type: "collection",
          id: "collection",
          label: "Select Collection",
          info: "Choose a collection to display in the carousel",
        },
        {
          type: "text",
          id: "collection_title",
          label: "Collection Title",
          info: "Enter a title for the collection",
        },
        {
          type: "product",
          id: "product",
          label: "Select Product 1",
          info: "Choose first product to display in the carousel",
        },
        {
          type: "product",
          id: "product2",
          label: "Select Product 2",
          info: "Choose second product to display in the carousel",
        },
      ],
    },
    // {
    //   type: "product-item",
    //   name: "Product",
    //   props: [
    //     {
    //       type: "product",
    //       id: "product",
    //       label: "Select Product",
    //       info: "Choose a product to display in the carousel",
    //     },
    //   ],
    // },
  ],
  // preset: {
  //   blocks: [
  //     {
  //       name: "Collection",
  //     },
  //     {
  //       name: "Collection",
  //     },
  //   ],
  // },
};

Component.serverFetch = async ({ fpi, props, blocks }) => {
  const selectedProductSlugs = (blocks ?? [])
    .map(
      (block) => block?.props?.product?.value || block?.props?.product2?.value
    )
    .filter(Boolean);

  if (selectedProductSlugs.length > 0) {
    try {
      const productPromises = selectedProductSlugs.map((slug) =>
        fpi.executeGQL(GET_QUICK_VIEW_PRODUCT_DETAILS, { slug })
      );

      const results = await Promise.all(productPromises);
      const products = results
        .map((res) => res?.data?.product)
        .filter(Boolean)
        .map((product) => ({
          uid: product.uid,
          slug: product.slug,
          name: product.name,
          media: product.media,
          // Use price from sizes object since product.price is null
          price: product.sizes?.price || product.price,
          discount: product.discount || product.sizes?.discount,
          sellable: product.sizes?.sellable ?? product.sellable,
          teaser_tag: product.teaser_tag,
          brand: product.brand,
          sizes: product.sizes?.sizes || [],
          variants: product.variants, // Include variant information
          action: {
            page: {
              params: { slug: product.slug },
              type: "product",
            },
            type: "page",
          },
        }));

      return fpi.custom.setValue(`selected-products-carousel`, products);
    } catch (error) {
      console.error("Error fetching selected products on server:", error);
      return Promise.resolve();
    }
  }
};
export default Component;
