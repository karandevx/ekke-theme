import React from "react";
import ProductCard from "../../product-card/product-card";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import styles from "../../../styles/product-listing.less";

function ProductGrid({ columnCount, productList = [], ...restProps }) {
  return (
    <div
      className={styles.productContainer}
      style={{
        "--desktop-col": columnCount.desktop,
        "--tablet-col": columnCount.tablet,
        "--mobile-col": columnCount.mobile,
      }}
    >
      {productList?.length > 0 &&
        productList.map((product) => (
          <ProductGridItem
            key={product?.uid}
            product={product}
            columnCount={columnCount}
            {...restProps}
          />
        ))}
    </div>
  );
}

function savePlpRestore(product) {
  if (typeof window === "undefined") return;

  const payload = {
    url: window.location.pathname + window.location.search,
    y: window.scrollY || 0,
    uid: product?.uid || null,
    slug: product?.slug || null,
    ts: Date.now(),
  };

  sessionStorage.setItem("plp:restore", JSON.stringify(payload));
  
  // Mark that we're navigating to PDP from PLP
  sessionStorage.setItem("plp:fromPDP", "true");
}

export function ProductGridItem(props) {
  const {
    product,
    isBrand = true,
    isSaleBadge = true,
    isPrice = true,
    isWishlistIcon = true,
    imgSrcSet,
    aspectRatio,
    WishlistIconComponent,
    isProductOpenInNewTab = false,
    columnCount,
    followedIdList = [],
    listingPrice = "range",
    isImageFill = true,
    showImageOnHover = false,
    showAddToCart = false,
    actionButtonText,
    imageBackgroundColor = "",
    imagePlaceholder = "",
    onWishlistClick = () => {},
    handleAddToCart = () => {},
    onProductNavigation = () => {},
  } = props;

  const { t } = useGlobalTranslation("translation");

  const getImageContainerStyle = (columnCount) => {
    let defaultAspect = "1/1"; // square fallback

    if (columnCount?.desktop === 2) defaultAspect = "586/1017.78";
    else if (columnCount?.desktop === 4) defaultAspect = "293/496.89";
    else if (columnCount?.desktop === 8) defaultAspect = "146.5/260.44";
    const [width, heightVal] = defaultAspect.split("/");

    const isLargeViewport =
      typeof window !== "undefined" && window.innerWidth > 1700;
    return {
      width: "100%",
      aspectRatio: "4/5",
      // height: isLargeViewport ? "100%" : `${heightVal}px`,
      height: "100%",
    };
  };
  const getMobileImageContainerStyle = (columnCount) => {
    let defaultAspect = "1/1"; // square fallback

    if (columnCount?.mobile === 1) defaultAspect = "375/634.67";
    else if (columnCount?.mobile === 2) defaultAspect = "187.5/301.33";
    else if (columnCount?.mobile === 4) defaultAspect = "93.75/166.67";

    const [width, heightVal] = defaultAspect.split("/");

    return {
      width: "100%",
      aspectRatio: "4/5",
      // height: `${heightVal}px`,
      height: "100%",
    };
  };
  const savePlpScroll = () => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.pathname + window.location.search;
    const scrollY = window.scrollY || 0;
    
    sessionStorage.setItem("plp:scroll", String(scrollY));
    sessionStorage.setItem("plp:url", currentUrl);
    
    // Mark that we're navigating to PDP from PLP
    sessionStorage.setItem("plp:fromPDP", "true");
  };

  return (
    <FDKLink
      className={"cursor-pointer"}
      to={`/product/${product?.slug}`}
      onClick={(e) => {
        // If it's opening in a new tab, you usually *don't* want to change current scroll state.
        // If you DO want it, remove this check.
        // if (e?.metaKey || e?.ctrlKey) return;
        savePlpRestore(product);
        savePlpScroll();
        onProductNavigation();
      }}
    >
      <ProductCard
        product={product}
        listingPrice={listingPrice}
        columnCount={columnCount}
        aspectRatio={aspectRatio}
        isBrand={isBrand}
        isPrice={isPrice}
        isSaleBadge={isSaleBadge}
        imgSrcSet={imgSrcSet}
        isWishlistIcon={isWishlistIcon}
        WishlistIconComponent={WishlistIconComponent}
        followedIdList={followedIdList}
        showAddToCart={showAddToCart}
        actionButtonText={actionButtonText ?? t("resource.common.add_to_cart")}
        onWishlistClick={onWishlistClick}
        isImageFill={isImageFill}
        showImageOnHover={showImageOnHover}
        imageBackgroundColor={imageBackgroundColor}
        imagePlaceholder={imagePlaceholder}
        handleAddToCart={handleAddToCart}
        onClick={onProductNavigation}
        isPlp={true}
        imageContainerStyle={getImageContainerStyle(columnCount)}
        mobileImageContainerStyle={getMobileImageContainerStyle(columnCount)}
      />
    </FDKLink>
  );
}

export default ProductGrid;
