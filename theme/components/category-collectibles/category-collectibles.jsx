import React, { useEffect, useState } from "react";
import { FDKLink } from "fdk-core/components";
import SortModal from "../sort-modal/sort-modal";
import FilterModal from "../filter-modal/filter-modal";
import styles from "./category-collectibles.less";
import StickyColumn from "../../page-layouts/plp/Components/sticky-column/sticky-column";
import FilterItem from "../../page-layouts/plp/Components/filter-item/filter-item";
import Pagination from "../../page-layouts/plp/Components/pagination/pagination";
import Sort from "../../page-layouts/plp/Components/sort/sort";
import { useGlobalTranslation } from "fdk-core/utils";
import ProductCard from "../product-card/product-card";
import { cn } from "../../helper/utils";
import FyImage from "../core/fy-image/fy-image";
import { useMobile } from "../../helper/hooks";
import MediaDisplay from "../media-display";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import PageNotFound from "../page-not-found/page-not-found";
import { isRunningOnClient } from "../../helper/utils";

const getMobileImageContainerStyle = (rowIndex, productIndex, columnCount) => {
  const styles = {
    // Row 1: 4 equal products
    0: {
      0: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
      1: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
      2: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
      3: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
    },
    // Row 3: 3 equal products
    2: {
      0: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
      1: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
      2: {
        width: "100%",
        aspectRatio: "355.00/599.11",
        maxHeight: "599.11px",
      },
    },
    // Row 4 Right: 6 products (2 rows of 3)
    3: {
      0: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
      1: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
      2: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
      3: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
      4: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
      5: {
        width: "100%",
        aspectRatio: "177.50/283.56",
        maxHeight: "283.56px",
      },
    },
    // Row 5: 2 equal products
    4: {
      0: {
        width: "100%",
        aspectRatio: "355/599.11",
        maxHeight: "599.11px",
      },
      1: {
        width: "100%",
        aspectRatio: "355/599.11",
        maxHeight: "599.11px",
      },
    },
    // Row 6: 3 equal products
    5: {
      0: {
        width: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      1: {
        width: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      2: {
        width: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
    },
  };

  return (
    styles[rowIndex]?.[productIndex] || {
      width: "100%",
      aspectRatio: "293/496.89",
      maxHeight: "496.89px",
    }
  );
};

// Dynamic image styles per row and position
const getImageStyleByRowPosition = (rowIndex, productIndex, columnCount) => {
  const styles = {
    // Row 1: 4 equal products
    0: {
      0: {
        width: "100%",
        height: "100%",
        aspectRatio: "293/496.89",
        maxHeight: "496.89px",
      },
      1: {
        width: "100%",
        height: "100%",
        aspectRatio: "293/496.89",
        maxHeight: "496.89px",
      },
      2: {
        width: "100%",
        height: "100%",
        aspectRatio: "293/496.89",
        maxHeight: "496.89px",
      },
      3: {
        width: "100%",
        height: "100%",
        aspectRatio: "293/496.89",
        maxHeight: "496.89px",
      },
    },
    // Row 3: 3 equal products
    2: {
      0: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      1: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      2: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
    },
    // Row 4 Right: 6 products (2 rows of 3)
    3: {
      0: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
      1: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
      2: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
      3: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
      4: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
      5: {
        width: "100%",
        height: "100%",
        aspectRatio: "195.33/323.26",
        maxHeight: "323.26px",
      },
    },
    // Row 5: 2 equal products
    4: {
      0: {
        width: "100%",
        height: "100%",
        aspectRatio: "586/1017.78",
        maxHeight: "1017.78px",
      },
      1: {
        width: "100%",
        height: "100%",
        aspectRatio: "586/1017.78",
        maxHeight: "1017.78px",
      },
    },
    // Row 6: 3 equal products
    5: {
      0: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      1: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
      2: {
        width: "100%",
        height: "100%",
        aspectRatio: "390.67/670.52",
        maxHeight: "670.52px",
      },
    },
  };

  return (
    styles[rowIndex]?.[productIndex] || {
      width: "100%",
      height: "100%",
      aspectRatio: "293/496.89",
      maxHeight: "496.89px",
    }
  );
};

const CategoryCollectibles = ({
  heroBanner,
  mobileBanner,
  desktopMiddleBanner,
  mobileMiddleBanner,
  sideDesktopBanner,
  sideMobileBanner,
  filterList = [],
  sortList = [],
  sortModalProps = {},
  filterModalProps = {},
  loadingOption = "pagination",
  paginationProps = {},
  isProductLoading = false,
  isPageLoading = false,
  productList = [],
  isProductOpenInNewTab = false,
  isBrand = true,
  isSaleBadge = true,
  isPrice = true,
  imgSrcSet,
  isImageFill = false,
  showImageOnHover = false,
  isResetFilterDisable = false,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  aspectRatio,
  isWishlistIcon,
  WishlistIconComponent,
  followedIdList = [],
  listingPrice = "range",
  showAddToCart = false,
  actionButtonText,
  stickyFilterTopOffset = 0,
  onColumnCountUpdate = () => {},
  onFilterUpdate = () => {},
  onSortUpdate = () => {},
  onWishlistClick = () => {},
  onViewMoreClick = () => {},
  onLoadMoreProducts = () => {},
  onProductNavigation = () => {},
  handleAddToCart = () => {},
  columnCount,
  isInitialCustomLayout = true,

  // banner,
}) => {
  const { t } = useGlobalTranslation("translation");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCustomLayout, setIsCustomLayout] = useState(isInitialCustomLayout);

  const isMobile = useMobile();

  const handleFilterModalClose = () => setIsFilterModalOpen(false);
  // WRAPPERS: turn off custom layout on sort & filter updates
  const handleSortUpdate = (...args) => {
    setIsCustomLayout(false);
    onSortUpdate?.(...args);
  };

  useEffect(() => {
    // whenever URL-based state says we’re no longer in "pure" first-page mode,
    // reset the layout
    if (!isInitialCustomLayout) {
      setIsCustomLayout(false);
    }
  }, [isInitialCustomLayout]);

  // Uncomment and update the useEffect for body scroll lock
  useEffect(() => {
    if (isFilterModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `0`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden"; // prevent scroll
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup only when component unmounts
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isFilterModalOpen]);

  const handleFilterButtonClick = () => {
    if (isFilterModalOpen) {
      // Close the modal
      setIsFilterModalOpen(false);
    } else {
      // Open the modal
      setIsFilterModalOpen(true);
      onFilterModalBtnClick();
    }
  };
  const handleFilterUpdate = (...args) => {
    setIsCustomLayout(false);
    onFilterUpdate?.(...args);
  };

  const productLinkTarget = isProductOpenInNewTab ? "_blank" : undefined;
  const productLinkRel = isProductOpenInNewTab
    ? "noopener noreferrer"
    : undefined;

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "80px" : "56px";
  
  return (
    <div className={styles.plpWrapper}>
      {isRunningOnClient() && isPageLoading ? (
        <div className={styles.loader}></div>
      ) : productList?.length === 0 && !isPageLoading && !isProductLoading ? (
        <div>
          <PageNotFound
            title={t("resource.common.sorry_we_couldnt_find_any_results")}
            showResultsNotFoundBanner
          />
        </div>
      ) : (
        <>
      {(!isMobile && heroBanner?.value) || (isMobile && mobileBanner?.value) ? (
        <div className={styles.heroBanner}>
          {isMobile ? (
            <MediaDisplay src={mobileBanner?.value} alt="herobanner" />
          ) : (
            <MediaDisplay src={heroBanner?.value} alt="herobanner" />
          )}
        </div>
      ) : null}

      <div className={styles.contentWrapper}>
        {filterList?.length !== 0 && (
          <StickyColumn
            className={styles.left}
            topOffset={stickyFilterTopOffset}
          >
            {filterList?.slice(0, 6).map((filter, idx) => (
              <FilterItem
                isMobileView={false}
                key={`${idx}-desktop-${filter?.key?.display || filter?.key?.name || idx}`}
                filter={filter}
                allFilters={filterList}
                onFilterUpdate={handleFilterUpdate}
              />
            ))}
          </StickyColumn>
        )}

        <div className={styles.right}>
          <div className={styles.rightHeader} style={{ top: topPosition }}>
            <div className={styles.headerRight}>
              <div className={styles.sortAndPaginationContainer}>
                {loadingOption === "pagination" && (
                  <div className={styles.inlinePaginationWrapper}>
                    <Pagination
                      {...paginationProps}
                      columnCount={columnCount}
                      onColumnCountUpdate={onColumnCountUpdate}
                      sortList={sortList}
                      onSortUpdate={handleSortUpdate}
                      onFilterUpdate={handleFilterUpdate}
                      filterList={filterList}
                      isFilterModalOpen={isFilterModalOpen}
                      isCollectibles={true}
                      handleFilterButtonClick={handleFilterButtonClick}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cn(styles["plp-container"])}>
            {isCustomLayout && productList?.length > 0 ? (
              <>
                {/* Row 1: 4 Products */}
                <div className={styles.row1}>
                  {productList.slice(0, 4).map((product, idx) => (
                    <FDKLink
                      key={product?.uid || product?.slug}
                      className="cursor-pointer"
                      to={`/product/${product?.slug}`}
                      target={productLinkTarget}
                      rel={productLinkRel}
                    >
                      <ProductCard
                        product={product}
                        imageContainerStyle={getImageStyleByRowPosition(
                          0,
                          idx,
                          columnCount
                        )}
                        mobileImageContainerStyle={getMobileImageContainerStyle(
                          0,
                          idx,
                          columnCount
                        )}
                        isPlp={true}
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
                        actionButtonText={
                          actionButtonText ?? t("resource.common.add_to_cart")
                        }
                        onWishlistClick={onWishlistClick}
                        isImageFill={isImageFill}
                        showImageOnHover={showImageOnHover}
                        imageBackgroundColor={imageBackgroundColor}
                        imagePlaceholder={imagePlaceholder}
                        handleAddToCart={handleAddToCart}
                        onClick={onProductNavigation}
                      />
                    </FDKLink>
                  ))}
                </div>

                {/* Row 2: Full Banner */}
                {isCustomLayout && (
                  <>
                    {(!isMobile && desktopMiddleBanner?.value) ||
                    (isMobile && mobileMiddleBanner?.value) ? (
                      <div className={styles.row2}>
                        {isMobile ? (
                          <MediaDisplay src={mobileMiddleBanner?.value} />
                        ) : (
                          <MediaDisplay src={desktopMiddleBanner?.value} />
                        )}
                      </div>
                    ) : null}
                  </>
                )}

                {/* Row 3: 3 Products */}
                <div className={styles.row3}>
                  {productList.slice(4, 7).map((product, idx) => (
                    <FDKLink
                      key={product?.uid || product?.slug}
                      className="cursor-pointer"
                      to={`/product/${product?.slug}`}
                      target={productLinkTarget}
                      rel={productLinkRel}
                    >
                      <ProductCard
                        product={product}
                        imageContainerStyle={getImageStyleByRowPosition(
                          2,
                          idx,
                          columnCount
                        )}
                        mobileImageContainerStyle={getMobileImageContainerStyle(
                          2,
                          idx,
                          columnCount
                        )}
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
                        actionButtonText={
                          actionButtonText ?? t("resource.common.add_to_cart")
                        }
                        onWishlistClick={onWishlistClick}
                        isImageFill={isImageFill}
                        showImageOnHover={showImageOnHover}
                        imageBackgroundColor={imageBackgroundColor}
                        imagePlaceholder={imagePlaceholder}
                        handleAddToCart={handleAddToCart}
                        onClick={onProductNavigation}
                        isPlp={true}
                      />
                    </FDKLink>
                  ))}
                </div>

                {/* Row 4: Left Banner + Right 6 Products (2x3 grid) */}
                <div className={styles.row4}>
                  {/* Left Banner */}

                  <div className={styles.sideBanner}>
                    {isCustomLayout && (
                      <>
                        {isMobile && sideMobileBanner?.value && (
                          <MediaDisplay src={sideMobileBanner.value} />
                        )}

                        {!isMobile && sideDesktopBanner?.value && (
                          <MediaDisplay src={sideDesktopBanner.value} />
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Products: 6 products in 2 rows of 3 */}

                  {/* Right Products: 6 products total */}
                  <div className={styles.rightProducts}>
                    <div className={styles.rightProductsCard}>
                      {productList.slice(7, 13).map((product, idx) => (
                        <FDKLink
                          key={product?.uid || product?.slug}
                          className="cursor-pointer"
                          to={`/product/${product?.slug}`}
                          target={productLinkTarget}
                          rel={productLinkRel}
                        >
                          <ProductCard
                            product={product}
                            imageContainerStyle={getImageStyleByRowPosition(
                              3,
                              idx,
                              columnCount
                            )}
                            mobileImageContainerStyle={getMobileImageContainerStyle(
                              3,
                              idx,
                              columnCount
                            )}
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
                            actionButtonText={
                              actionButtonText ??
                              t("resource.common.add_to_cart")
                            }
                            onWishlistClick={onWishlistClick}
                            isImageFill={isImageFill}
                            showImageOnHover={showImageOnHover}
                            imageBackgroundColor={imageBackgroundColor}
                            imagePlaceholder={imagePlaceholder}
                            handleAddToCart={handleAddToCart}
                            onClick={onProductNavigation}
                            isPlp={true}
                          />
                        </FDKLink>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 5: 2 Products */}
                <div className={styles.row5}>
                  {productList.slice(13, 15).map((product, idx) => (
                    <FDKLink
                      key={product?.uid || product?.slug}
                      className="cursor-pointer"
                      to={`/product/${product?.slug}`}
                      target={productLinkTarget}
                      rel={productLinkRel}
                    >
                      <ProductCard
                        product={product}
                        imageContainerStyle={getImageStyleByRowPosition(
                          4,
                          idx,
                          columnCount
                        )}
                        mobileImageContainerStyle={getMobileImageContainerStyle(
                          4,
                          idx,
                          columnCount
                        )}
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
                        actionButtonText={
                          actionButtonText ?? t("resource.common.add_to_cart")
                        }
                        onWishlistClick={onWishlistClick}
                        isImageFill={isImageFill}
                        showImageOnHover={showImageOnHover}
                        imageBackgroundColor={imageBackgroundColor}
                        imagePlaceholder={imagePlaceholder}
                        handleAddToCart={handleAddToCart}
                        onClick={onProductNavigation}
                        isPlp={true}
                      />
                    </FDKLink>
                  ))}
                </div>

                {/* Row 6: 3 Products */}
                <div className={styles.row6}>
                  {productList.slice(15, 18).map((product, idx) => (
                    <FDKLink
                      key={product?.uid || product?.slug}
                      className="cursor-pointer"
                      to={`/product/${product?.slug}`}
                      target={productLinkTarget}
                      rel={productLinkRel}
                    >
                      <ProductCard
                        product={product}
                        imageContainerStyle={getImageStyleByRowPosition(
                          5,
                          idx,
                          columnCount
                        )}
                        mobileImageContainerStyle={getMobileImageContainerStyle(
                          5,
                          idx,
                          columnCount
                        )}
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
                        actionButtonText={
                          actionButtonText ?? t("resource.common.add_to_cart")
                        }
                        onWishlistClick={onWishlistClick}
                        isImageFill={isImageFill}
                        showImageOnHover={showImageOnHover}
                        imageBackgroundColor={imageBackgroundColor}
                        imagePlaceholder={imagePlaceholder}
                        handleAddToCart={handleAddToCart}
                        onClick={onProductNavigation}
                        isPlp={true}
                      />
                    </FDKLink>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4">
                {productList?.length > 0 &&
                  productList.map((product) => (
                    <FDKLink
                      key={product?.uid || product?.slug}
                      className={"cursor-pointer"}
                      to={`/product/${product?.slug}`}
                      target={productLinkTarget}
                      rel={productLinkRel}
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
                        actionButtonText={
                          actionButtonText ?? t("resource.common.add_to_cart")
                        }
                        onWishlistClick={onWishlistClick}
                        isImageFill={isImageFill}
                        showImageOnHover={showImageOnHover}
                        imageBackgroundColor={imageBackgroundColor}
                        imagePlaceholder={imagePlaceholder}
                        handleAddToCart={handleAddToCart}
                        onClick={onProductNavigation}
                        isPlp={true}
                        imageContainerStyle={{
                          height: "100%",
                          aspectRatio: "293.00/496.89",
                        }}
                        mobileImageContainerStyle={{
                          height: "100%",
                          aspectRatio: "187.50/301.333",
                        }}
                      />
                    </FDKLink>
                  ))}
              </div>
            )}

            {loadingOption === "view_more" && paginationProps?.hasNext && (
              <div className={styles.viewMoreWrapper}>
                <button
                  className={styles.viewMoreBtn}
                  onClick={onViewMoreClick}
                  tabIndex={0}
                  disabled={isProductLoading}
                >
                  {t("resource.facets.view_more")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

          <SortModal {...sortModalProps} />
          <FilterModal
            {...{
              isResetFilterDisable,
              ...filterModalProps,
              isOpen: isFilterModalOpen,
              onCloseModalClick: handleFilterModalClose,
            }}
          />
        </>
      )}
    </div>
  );
};

export default CategoryCollectibles;
