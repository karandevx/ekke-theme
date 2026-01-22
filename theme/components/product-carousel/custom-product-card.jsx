import React, { useState } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./custom-product-card.less";

const CustomProductCard = ({ 
  product, 
  showWishlist = true, 
  showAddToCart = false,
  onWishlistClick = () => {},
  onAddToCart = () => {},
  followedIdList = [],
  className = ""
}) => {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(
    followedIdList.includes(product?.uid || product?.id)
  );

  // Safe product data extraction
  const productData = {
    uid: product?.uid || product?.id || '',
    slug: product?.slug || '',
    name: product?.name || product?.title || 'Product Name',
    brand: product?.brand?.name || 'BRAND/DESIGNER',
    images: product?.medias || product?.images || [],
    price: product?.price || {},
    sizes: product?.sizes || product?.variants || []
  };

  // Get the main product image
  const getProductImage = () => {
    if (!productData.images || productData.images.length === 0) {
      return '/placeholder-product.jpg'; // Add a placeholder image
    }
    
    const mainImage = productData.images[0];
    return mainImage?.url || mainImage?.src || mainImage || '/placeholder-product.jpg';
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '$ 888';
    
    const currentPrice = price.effective?.min || price.min || price.marked?.min || 888;
    const originalPrice = price.marked?.min || price.max;
    
    return {
      current: `$ ${currentPrice}`,
      original: originalPrice && originalPrice > currentPrice ? `$ ${originalPrice}` : null
    };
  };

  // Get available sizes
  const getAvailableSizes = () => {
    if (!productData.sizes || productData.sizes.length === 0) {
      return ['S', 'M', 'L', 'XL']; // Default sizes
    }
    
    return productData.sizes.slice(0, 4).map(size => 
      size.display || size.value || size.name || size
    );
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistClick({ product, isFollowed: isWishlisted });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const priceData = formatPrice(productData.price);
  const availableSizes = getAvailableSizes();

  return (
    <div className={`${styles.customProductCard} ${className}`}>
      <FDKLink to={`/product/${productData.slug}`} className={styles.productLink}>
        <div className={styles.productImageContainer}>
          <img
            src={getProductImage()}
            alt={productData.name}
            className={styles.productImage}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          
          {showWishlist && (
            <button
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
              onClick={handleWishlistToggle}
              aria-label="Add to wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={isWishlisted ? "#ff4757" : "none"}
                  stroke={isWishlisted ? "#ff4757" : "#666"}
                  strokeWidth="2"
                />
              </svg>
            </button>
          )}

          {showAddToCart && (
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              ADD TO CART
            </button>
          )}
        </div>

        <div className={styles.productInfo}>
          <div className={styles.brandName}>{productData.brand}</div>
          <div className={styles.productName}>{productData.name}</div>
          
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>{priceData.current}</span>
            {priceData.original && (
              <span className={styles.originalPrice}>{priceData.original}</span>
            )}
          </div>

          <div className={styles.sizesContainer}>
            {availableSizes.map((size, index) => (
              <span key={index} className={styles.sizeOption}>
                {size}
              </span>
            ))}
          </div>
        </div>
      </FDKLink>
    </div>
  );
};

export default CustomProductCard;
