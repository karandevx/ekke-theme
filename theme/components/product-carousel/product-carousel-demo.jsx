import React from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import ProductCarousel from "../components/product-carousel/product-carousel";
import { getHelmet } from "../providers/global-provider";

// Sample product data for demonstration
const sampleProducts = [
  {
    uid: "1",
    id: "1",
    slug: "sample-product-1",
    name: "Stylish Black Dress",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
  {
    uid: "2",
    id: "2",
    slug: "sample-product-2",
    name: "Elegant White Outfit",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
  {
    uid: "3",
    id: "3",
    slug: "sample-product-3",
    name: "Casual Beige Set",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
  {
    uid: "4",
    id: "4",
    slug: "sample-product-4",
    name: "Modern Minimalist Look",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
  {
    uid: "5",
    id: "5",
    slug: "sample-product-5",
    name: "Chic Urban Style",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
  {
    uid: "6",
    id: "6",
    slug: "sample-product-6",
    name: "Professional Attire",
    brand: { name: "BRAND/DESIGNER" },
    images: [
      {
        url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop",
      },
    ],
    price: {
      effective: { currency_code: "USD", currency_symbol: "$", value: 888 },
      marked: { currency_code: "USD", currency_symbol: "$", value: 888 },
    },
    sizes: ["S", "M", "L", "XL"],
  },
];

function ProductCarouselDemo({ fpi }) {
  const { t } = useGlobalTranslation("translation");

  const seoData = {
    title: "Product Carousel Demo",
    description: "Demonstration of the product carousel component",
  };

  const globalConfig = {
    show_price: true,
  };

  const handleWishlistClick = (product) => {
    // console.log("Wishlist clicked for:", product.name);
  };

  const handleAddToCart = (product, size) => {
    // console.log("Add to cart clicked for:", product.name, "Size:", size);
  };

  return (
    <>
      {getHelmet({ seo: seoData })}
      
      <div style={{ padding: "40px 0", background: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ textAlign: "center", marginBottom: "40px", color: "#333" }}>
            Product Carousel Demo
          </h1>
          
          {/* Main Product Carousel */}
          <ProductCarousel
            products={sampleProducts}
            title="Featured Products"
            showTitle={true}
            showViewAll={true}
            viewAllLink="/products"
            viewAllText="View All Products"
            slidesToShow={4}
            slidesToShowTablet={3}
            slidesToShowMobile={2}
            autoplay={false}
            autoplaySpeed={3000}
            showDots={false}
            showArrows={true}
            infinite={true}
            globalConfig={globalConfig}
            showAddToCart={true}
            showWishlist={true}
            onWishlistClick={handleWishlistClick}
            onAddToCart={handleAddToCart}
            followedIdList={[]}
            listingPrice={{}}
          />

          {/* Second Carousel with Different Settings */}
          <div style={{ marginTop: "60px" }}>
            <ProductCarousel
              products={sampleProducts.slice(0, 4)}
              title="Trending Now"
              showTitle={true}
              showViewAll={false}
              slidesToShow={3}
              slidesToShowTablet={2}
              slidesToShowMobile={1}
              autoplay={true}
              autoplaySpeed={4000}
              showDots={true}
              showArrows={false}
              infinite={true}
              globalConfig={globalConfig}
              showAddToCart={false}
              showWishlist={true}
              onWishlistClick={handleWishlistClick}
              onAddToCart={handleAddToCart}
              followedIdList={[]}
              listingPrice={{}}
            />
          </div>

          {/* Third Carousel - Mobile Optimized */}
          <div style={{ marginTop: "60px" }}>
            <ProductCarousel
              products={sampleProducts.slice(2)}
              title="New Arrivals"
              showTitle={true}
              showViewAll={true}
              viewAllLink="/products?sort=newest"
              viewAllText="See All New"
              slidesToShow={2}
              slidesToShowTablet={2}
              slidesToShowMobile={1}
              autoplay={false}
              showDots={false}
              showArrows={true}
              infinite={false}
              globalConfig={globalConfig}
              showAddToCart={true}
              showWishlist={false}
              onWishlistClick={handleWishlistClick}
              onAddToCart={handleAddToCart}
              followedIdList={[]}
              listingPrice={{}}
            />
          </div>

          {/* Usage Instructions */}
          <div style={{ 
            marginTop: "80px", 
            padding: "30px", 
            background: "white", 
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>How to Use the Product Carousel</h2>
            <div style={{ color: "#666", lineHeight: "1.6" }}>
              <p><strong>1. Import the component:</strong></p>
              <code style={{ background: "#f5f5f5", padding: "10px", display: "block", marginBottom: "15px" }}>
                import ProductCarousel from "../components/product-carousel/product-carousel";
              </code>
              
              <p><strong>2. Use in your JSX:</strong></p>
              <code style={{ background: "#f5f5f5", padding: "10px", display: "block", marginBottom: "15px" }}>
                {`<ProductCarousel
  products={yourProductsArray}
  title="Your Section Title"
  slidesToShow={4}
  showAddToCart={true}
  // ... other props
/>`}
              </code>

              <p><strong>3. Available Props:</strong></p>
              <ul style={{ marginLeft: "20px" }}>
                <li><code>products</code> - Array of product objects</li>
                <li><code>title</code> - Section title</li>
                <li><code>slidesToShow</code> - Number of products to show on desktop</li>
                <li><code>slidesToShowTablet</code> - Number of products to show on tablet</li>
                <li><code>slidesToShowMobile</code> - Number of products to show on mobile</li>
                <li><code>showAddToCart</code> - Show add to cart buttons</li>
                <li><code>showWishlist</code> - Show wishlist icons</li>
                <li><code>autoplay</code> - Enable automatic sliding</li>
                <li><code>showArrows</code> - Show navigation arrows</li>
                <li><code>showDots</code> - Show dot indicators</li>
                <li>And many more customization options...</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCarouselDemo;
