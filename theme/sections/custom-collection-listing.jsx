import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../components/product-card/product-card";
import { useFPI } from "fdk-core/utils";
import useCollectionListing from "../page-layouts/collection-listing/useCollectionListing";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import { PLP_ADD_TO_CART } from "../queries/plpQuery";
import { PRODUCT_SIZE_PRICE } from "../queries/pdpQuery";
import { useToast } from "../components/custom-toaster";
import { sortSizes } from "../helper/utils";
import { useWishlist } from "../helper/hooks/useWishlist";
import { useAccounts } from "../helper/hooks/useAccounts";

const externalStyles = {
  productDescriptionContainer: "!block",
};

export function Component({ props, blocks }) {
  const { heading } = props;
  const [currentSlide, setCurrentSlide] = useState(1);
  const sliderRef = useRef(null);

  // Get number of products to show from props, default to 6 if not specified
  const numberOfProducts = props?.number_of_products?.value || 6;

  // Slider settings for responsive design
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: numberOfProducts, // Desktop: dynamically show products based on prop
    slidesToScroll: 1,
    autoplay: false,
    arrows: false, // hide built-in; we use custom controls near heading
    afterChange: (idx) => setCurrentSlide(idx + 1),
    responsive: [
      {
        breakpoint: 1024, // Tablet
        settings: {
          slidesToShow: Math.min(4, numberOfProducts),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Mobile
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          variableWidth: false,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1.5,
          centerMode: true,
          variableWidth: false,
        },
      },
    ],
  };

  const fpi = useFPI();
  const toast = useToast();
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  const { fetchProducts, productList } = useCollectionListing({
    fpi,
    slug: props?.collection_name?.value,
    props: {},
  });

  const finalProducts = useMemo(() => {
    return productList
      ?.map((p) => ({
        uid: p.uid,
        slug: p.slug,
        name: p.name,
        media: Array.isArray(p.media)
          ? p.media.map((m) => ({
              alt: m?.alt ?? "",
              meta: m?.meta ?? null,
              type: m?.type ?? "image",
              url: m?.url || m?.preview || m?.src || "",
            }))
          : [],
        price: p.price ?? null,
        discount: p.discount ?? null,
        brand: p.brand ? { name: p.brand.name, uid: p.brand.uid } : null,
        sizes: p.size_options,
        size_options: p.size_options, // Also include directly for add to cart
        variants: Array.isArray(p.variants) ? p.variants : [],
        action: {
          page: { params: { slug: p.slug }, type: "product" },
          type: "page",
        },
        sellable: p.sellable,
      }))
      .filter(Boolean);
  }, [productList]);

  useEffect(() => {
    fetchProducts({
      slug: props?.collection_name?.value,
      ...(!props?.with_slider?.value && {
        first: props?.number_of_products?.value,
      }),
    });
  }, []);

  const handlePrev = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();

  // Wishlist handler
  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

  // Helper function to get the smallest size from a product
  const getSmallestSize = (product) => {
    // Priority 1: Use selectedSize if available (from ProductCard)
    if (product?.selectedSize) {
      return product.selectedSize;
    }

    // Priority 2: Use size_options if available
    if (Array.isArray(product?.size_options) && product.size_options.length) {
      const normalized = product.size_options.map((s) => 
        typeof s === "string" ? { value: s } : s
      );
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    // Priority 3: Use sizes array if available
    if (Array.isArray(product?.sizes) && product.sizes.length) {
      const normalized = product.sizes.map((s) => 
        typeof s === "string" ? { value: s } : s
      );
      const sorted = sortSizes(normalized);
      return sorted[0]?.value || sorted[0]?.display;
    }

    // Priority 4: Use sizes.sizes (PDP-style structure)
    if (product?.sizes?.sizes?.length) {
      const sorted = sortSizes([...product.sizes.sizes]);
      return sorted[0]?.value || sorted[0]?.display;
    }

    return null;
  };

  // Add to cart handler
  const handleAddToCart = async (product) => {
    // Get the smallest size from the product
    const smallestSize = getSmallestSize(product);

    if (!smallestSize) {
      toast.error("Product size information is not available");
      console.log("product does not have sizes", product);
      return;
    }

    let sellerId, storeId;

    // Fetch seller and store info if not available
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
          console.error("Collection listing exception. " + product?.uid);
          toast.error("Unable to add product to cart. Please try again later.");
          return;
        }

        sellerId = freshProductPriceData.seller.uid;
        storeId = freshProductPriceData.store.uid;
      } catch (error) {
        console.error("Error fetching product price:", error);
        toast.error("Unable to fetch product price. Please try again later.");
        return;
      }
    } else {
      sellerId = product.seller.uid;
      storeId = product.store.uid;
    }

    // Prepare add to cart payload
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
          data?.addItemsToCart?.message || "Product added successfully"
        );

        // Open cart drawer after a short delay
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
      toast.error(
        error?.message || "Failed to add product to cart. Please try again."
      );
    }
  };

  return (
    <div className="w-full bg-ekke-bg">
      <div>
        {/* Section Title */}
        <div className="flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px]">
          <p className="subheading-3">{heading?.value}</p>

          {props?.with_slider?.value ? (
            <div className="flex items-center gap-7">
              <p className="body-2 text-neutral-light tabular-nums">
                {String(currentSlide).padStart(2, "0")}/
                {String(productList?.length || 0).padStart(2, "0")}
              </p>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous products"
                  className="ekke-nav-btn"
                >
                  <span className="ekke-label">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next products"
                  className="ekke-nav-btn"
                >
                  <span className="ekke-label">Next</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="body-2 text-neutral-light tabular-nums">
              {String(productList?.length || 0).padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Product slider / grid */}
        {props?.with_slider?.value ? (
          <div className="products-slider">
            <Slider ref={sliderRef} {...sliderSettings}>
              {finalProducts?.map((product) => (
                <div key={product.uid}>
                  <FDKLink to={`/product/${product.slug}`}>
                    <ProductCard
                      product={product}
                      externalStyles={{ ...externalStyles }}
                      imageContainerStyle={{
                        height: "100%",
                        aspectRatio: "360/616",
                      }}
                      mobileImageContainerStyle={{
                        height: "100%",
                        aspectRatio: "295.00/ 492.44",
                      }}
                      showAddToCart={true}
                      handleAddToCart={handleAddToCart}
                      followedIdList={followedIdList}
                      onWishlistClick={handleWishlistToggle}
                    />
                  </FDKLink>
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-[32px] md:gap-y-0">
            {finalProducts?.map((product) => (
              <FDKLink to={`/product/${product.slug}`} key={product.uid}>
                <ProductCard
                  product={product}
                  externalStyles={externalStyles}
                  showAddToCart={true}
                  handleAddToCart={handleAddToCart}
                  followedIdList={followedIdList}
                  onWishlistClick={handleWishlistToggle}
                />
              </FDKLink>
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .products-slider .slick-prev,
        .products-slider .slick-next {
          z-index: 1;
          width: 40px;
          height: 40px;
        }

        .products-slider .slick-prev {
          left: -20px;
        }

        .products-slider .slick-next {
          right: -20px;
        }

        .products-slider .slick-prev:before,
        .products-slider .slick-next:before {
          font-size: 20px;
          color: #333;
        }

        @media (max-width: 768px) {
          .products-slider .slick-prev,
          .products-slider .slick-next {
            display: none !important;
          }
        }

        .products-slider .slick-track {
          display: flex;
          align-items: stretch;
        }
        .products-slider .slick-slide > div {
          height: 100%;
        }

        .ekke-nav-btn {
          position: relative;
          color: #000;
          leading-trim: both;
          text-edge: cap;

          /* Text/BODYCOPY 01 */
          font-family: Archivo;
          font-size: var(--Text-Sizes-BODYCOPY-01, 11px);
          font-style: normal;
          font-weight: 400;
          line-height: 120%; /* 13.2px */
          text-transform: uppercase;
        }
        .ekke-nav-btn::before {
          content: "";
          position: absolute;
          left: -8px;
          top: 50%;
          width: 4px;
          height: 4px;
          background-color: #000;
          border-radius: 1px;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ekke-nav-btn:hover::before {
          opacity: 1;
        }
        .ekke-label {
          position: relative;
        }

        /* Hide default slick arrows across viewports (we use custom) */
        .products-slider .slick-prev,
        .products-slider .slick-next {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

// Section Settings Configuration stays the same...
export const settings = {
  label: "Custom Collection Listing",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "Title",
    },
    {
      type: "collection",
      id: "collection_name",
      label: "Select Collection",
      info: "Choose a collection to display in the carousel",
    },
    {
      id: "number_of_products",
      label: "Number of Products",
      type: "range",
      default: 4,
      info: "Select a value from the range slider.",
      min: 0,
      max: 8,
      step: 1,
      unit: "",
    },
    {
      id: "with_slider",
      label: "Include Slider",
      type: "checkbox",
      default: false,
      info: "Enable or disable the slider.",
    },
  ],
};

export default Component;
