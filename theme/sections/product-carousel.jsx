import React, { useState, useEffect } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import ProductCarousel from "../components/product-carousel/product-carousel";
import { useSnackbar } from "../helper/hooks";
import { isRunningOnClient } from "../helper/utils";

function ProductCarouselSection({ props: sectionProps, blocks, globalConfig, fpi }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();
  const THEME = useGlobalStore(fpi.getters.THEME) || {};

  // Section configuration from props
  const {
    title = sectionProps?.title?.value || "Featured Products",
    show_title = sectionProps?.show_title?.value !== false,
    product_count = parseInt(sectionProps?.product_count?.value) || 8,
    slides_to_show = parseInt(sectionProps?.slides_to_show?.value) || 4,
    show_arrows = sectionProps?.show_arrows?.value !== false,
    show_wishlist = sectionProps?.show_wishlist?.value !== false,
  } = sectionProps || {};

  // Fixed responsive settings
  const slides_to_show_tablet = slides_to_show > 2 ? 3 : 2;
  const slides_to_show_mobile = 2;

  // Fetch products based on collection or featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        
        // Fetch featured products or all products
        response = await fpi.catalog.getProducts({
          pageSize: product_count,
          pageNo: 1,
          sortOn: "popular", // Default to popular products
        });

        if (response?.items && Array.isArray(response.items)) {
          // Filter out any invalid products
          const validProducts = response.items.filter(product => 
            product && 
            typeof product === 'object' && 
            (product.uid || product.id)
          );
          setProducts(validProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products for carousel:", err);
        setError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (isRunningOnClient()) {
      fetchProducts();
    }
  }, [product_count, fpi]);

  // Handle wishlist toggle
  const handleWishlistClick = async (product) => {
    try {
      // Add wishlist functionality here
      showSnackbar("Wishlist feature coming soon!", "info");
    } catch (err) {
      showSnackbar("Failed to update wishlist", "error");
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      // Add to cart functionality here
      showSnackbar("Add to cart feature coming soon!", "info");
    } catch (err) {
      showSnackbar("Failed to add to cart", "error");
    }
  };

  // Don't render if no products and not loading
  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <section style={{ padding: "40px 0", textAlign: "center" }}>
        <div>Loading products...</div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section style={{ padding: "40px 0", textAlign: "center" }}>
        <div>Error loading products: {error}</div>
      </section>
    );
  }

  return (
    <ProductCarousel
      products={products}
      title={show_title ? title : ""}
      showTitle={show_title}
      slidesToShow={slides_to_show}
      slidesToShowTablet={slides_to_show_tablet}
      slidesToShowMobile={slides_to_show_mobile}
      showArrows={show_arrows}
      showWishlist={show_wishlist}
      onWishlistClick={handleWishlistClick}
      onAddToCart={handleAddToCart}
      followedIdList={[]} // Add wishlist state management here
    />
  );
}

ProductCarouselSection.serverFetch = async ({ fpi, props }) => {
  try {
    const {
      product_count = parseInt(props?.product_count?.value) || 8,
    } = props || {};

    const response = await fpi.catalog.getProducts({
      pageSize: product_count,
      pageNo: 1,
      sortOn: "popular",
    });

    return response;
  } catch (error) {
    console.error("Error in ProductCarouselSection.serverFetch:", error);
    return { items: [] };
  }
};

export const settings = {
  label: "Product Carousel",
  props: [
    {
      type: "text",
      id: "title",
      default: "Featured Products",
      label: "Section Title",
    },
    {
      type: "checkbox",
      id: "show_title",
      label: "Show Title",
      default: true,
    },
    {
      type: "range",
      id: "product_count",
      min: 4,
      max: 12,
      step: 1,
      unit: "",
      label: "Number of Products",
      default: 8,
    },
    {
      type: "range",
      id: "slides_to_show",
      min: 2,
      max: 4,
      step: 1,
      unit: "",
      label: "Products per Row",
      default: 4,
    },
    {
      type: "checkbox",
      id: "show_arrows",
      label: "Show Navigation Arrows",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_wishlist",
      label: "Show Wishlist Icon",
      default: true,
    },
  ],
};

export { ProductCarouselSection as Component };
