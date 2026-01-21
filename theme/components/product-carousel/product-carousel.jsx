import React, { useState, useRef } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
import Slider from "react-slick";
import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import "@gofynd/theme-template/components/product-card/product-card.css";
import styles from "./product-carousel.less";
import ArrowLeftIcon from "../../assets/images/glide-arrow-left.svg";
import ArrowRightIcon from "../../assets/images/glide-arrow-right.svg";
import { getProductImgAspectRatio } from "../../helper/utils";

const ProductCarousel = ({
  products = [],
  title = "",
  showTitle = true,
  showViewAll = false,
  viewAllLink = "",
  viewAllText = "View All",
  slidesToShow = 4,
  slidesToShowTablet = 3,
  slidesToShowMobile = 2,
  autoplay = false,
  autoplaySpeed = 3000,
  showDots = false,
  showArrows = true,
  infinite = true,
  listingPrice = {},
  globalConfig = {},
  showAddToCart = false,
  showWishlist = true,
  onWishlistClick = () => {},
  onAddToCart = () => {},
  followedIdList = [],
  className = "",
  ...props
}) => {
  const { t } = useGlobalTranslation("translation");
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Custom arrow components
  const CustomPrevArrow = ({ onClick }) => (
    <button
      className={`${styles.sliderArrow} ${styles.prevArrow} ${
        currentSlide === 0 ? styles.disabled : ""
      }`}
      onClick={onClick}
      disabled={currentSlide === 0}
      aria-label="Previous products"
    >
      <img src={ArrowLeftIcon} alt="Previous" />
    </button>
  );

  const CustomNextArrow = ({ onClick }) => {
    const isLastSlide = currentSlide >= products.length - slidesToShow;
    return (
      <button
        className={`${styles.sliderArrow} ${styles.nextArrow} ${
          isLastSlide ? styles.disabled : ""
        }`}
        onClick={onClick}
        disabled={isLastSlide}
        aria-label="Next products"
      >
        <img src={ArrowRightIcon} alt="Next" />
      </button>
    );
  };

  const sliderSettings = {
    dots: showDots,
    infinite: infinite && products.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
    arrows: showArrows,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    beforeChange: (current, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: slidesToShowTablet,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: slidesToShowMobile,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  const columnCount = {
    desktop: slidesToShow > 3 ? 4 : 2,
    tablet: slidesToShowTablet > 2 ? 3 : 2,
    mobile: slidesToShowMobile,
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.productCarousel} ${className}`}>
      {showTitle && (title || showViewAll) && (
        <div className={styles.carouselHeader}>
          {title && <h2 className={styles.carouselTitle}>{title}</h2>}
          {showViewAll && viewAllLink && (
            <FDKLink to={viewAllLink} className={styles.viewAllLink}>
              {viewAllText}
              <img src={ArrowRightIcon} alt="" className={styles.viewAllIcon} />
            </FDKLink>
          )}
        </div>
      )}

      <div className={styles.carouselContainer}>
        <Slider ref={sliderRef} {...sliderSettings} className={styles.productSlider}>
          {products.map((product, index) => (
            <div key={`${product.uid || product.id}_${index}`} className={styles.slideItem}>
              <div className={styles.productCardWrapper}>
                <FDKLink to={`/product/${product.slug}`}>
                  <ProductCard
                    product={product}
                    listingPrice={listingPrice}
                    isSaleBadge={false}
                    isWishlistDisplayed={showWishlist}
                    isWishlistIcon={showWishlist}
                    columnCount={columnCount}
                    isPrice={globalConfig?.show_price}
                    isImageFill={true}
                    onWishlistClick={onWishlistClick}
                    followedIdList={followedIdList}
                    showAddToCart={showAddToCart}
                    actionButtonText={t("resource.common.add_to_cart")}
                    handleAddToCart={onAddToCart}
                    aspectRatio={getProductImgAspectRatio(globalConfig)}
                    isSlider={true}
                  />
                </FDKLink>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ProductCarousel;
