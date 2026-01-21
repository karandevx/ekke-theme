import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { BlockRenderer } from "fdk-core/components";
// import PriceBreakup from "@gofynd/theme-template/components/price-breakup/price-breakup";
// import DeliveryLocation from "@gofynd/theme-template/page-layouts/cart/Components/delivery-location/delivery-location";
// import Coupon from "@gofynd/theme-template/page-layouts/cart/Components/coupon/coupon";
import ChipItem from "../page-layouts/cart/Components/chip-item/chip-item";
// import ShareCart from "@gofynd/theme-template/page-layouts/cart/Components/share-cart/share-cart";
import StickyFooter from "../page-layouts/cart/Components/share-cart/sticky-footer/sticky-footer";
// import RemoveCartItem from "@gofynd/theme-template/page-layouts/cart/Components/remove-cart-item/remove-cart-item";
import "@gofynd/theme-template/pages/cart/cart.css";
import styles from "../styles/sections/cart-landing.less";
// import EmptyState from "../components/empty-state/empty-state";
import useCart, { fetchCartDetails } from "../page-layouts/cart/useCart";
// import useCartDeliveryLocation from "../page-layouts/cart/useCartDeliveryLocation";
// import useCartShare from "../page-layouts/cart/useCartShare";
// import useCartComment from "../page-layouts/cart/useCartComment";
// import useCartGst from "../page-layouts/cart/useCartGst";
import useCartCoupon from "../page-layouts/cart/useCartCoupon";
import { useThemeConfig, useThemeFeature } from "../helper/hooks";
// import EmptyCartIcon from "../assets/images/empty-cart.svg";
// import EkkeGreyIcon from "../assets/images/ekke-grey.svg";
// import RadioIcon from "../assets/images/radio";
import Shimmer from "../components/shimmer/shimmer";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";

import { useViewport } from "../helper/hooks";
import FyAccordion from "../components/core/fy-accordion/fy-accordion";
import SvgWrapper from "../components/core/svgWrapper/SvgWrapper";
import useWishlistPage from "../page-layouts/wishlist/useWishlist";
import { useWishlist } from "../helper/hooks/useWishlist";
import EkkeLogo from "../assets/images/logo/ekke-logo";
import {
  ADD_TO_CART,
  PRODUCT_SIZE_PRICE,
  GET_PRODUCT_DETAILS,
} from "../queries/pdpQuery";
import { useToast } from "../components/custom-toaster";
import { YouMayAlsoLike } from "../components/recommendation/youMayAlsoLike";
import Loader from "../components/loader/loader";

export function Component({ blocks, handleClose, isOnCheckoutPage = false }) {
  const fpi = useFPI();
  const {
    isLoading,
    cartData,
    currencySymbol,
    isCartUpdating,
    isLoggedIn = false,
    cartItems,
    cartItemsWithActualIndex,
    breakUpValues,
    isAnonymous,
    isValid,
    isNotServicable,
    isOutOfStock,
    onUpdateCartItems,
    isGstInput = true,
    isPlacingForCustomer,
    cartShareProps,
    isRemoveModalOpen = false,
    isPromoModalOpen = false,
    customerCheckoutMode,
    cartItemCount,
    checkoutMode,
    buybox = {},
    onGotoCheckout = () => {},
    onRemoveIconClick = () => {},
    onRemoveButtonClick = () => {},
    onWishlistButtonClick = () => {},
    onCloseRemoveModalClick = () => {},
    onPriceDetailsClick = () => {},
    updateCartCheckoutMode = () => {},
    onOpenPromoModal = () => {},
    onClosePromoModal = () => {},
    onRemoveAllItems = () => {},
  } = useCart(fpi);
  const { globalConfig } = useThemeConfig({ fpi });
  // const { isInternational } = useThemeFeature({ fpi });
  // const cartDeliveryLocation = useCartDeliveryLocation({ fpi });
  // const cartShare = useCartShare({ fpi, cartData });
  // const cartComment = useCartComment({ fpi, cartData });
  // const cartGst = useCartGst({ fpi, cartData });
  const { availableCouponList, ...restCouponProps } = useCartCoupon({
    fpi,
    cartData,
  });
  const isMobile = useViewport(0, 768);
  const navigate = useNavigate();

  // Wishlist functionality
  const [showWishlist, setShowWishlist] = useState(false);
  const {
    loading: wishlistLoading,
    productList: wishlistProducts,
    onRemoveClick,
    fetchProducts,
    onRemoveAllClick,
  } = useWishlistPage({ fpi });

  // Wishlist hook for removing items
  const { removeFromWishlist, isLoading: isRemoving } = useWishlist({ fpi });

  const toast = useToast();

  useEffect(() => {
    if (showWishlist) {
      // User switched to Wishlist - fetch latest wishlist products
      if (fetchProducts) {
        fetchProducts();
      }
    } else {
      // User switched to Cart - fetch latest cart details
      fetchCartDetails(fpi); // ← Using stable function
    }
  }, [showWishlist]); // ← Complete dependency array

  // Handle move to cart - fetch product details to get sizes, then add to cart
  const handleMoveToCart = async (product) => {
    if (!product?.slug || !product?.uid) {
      toast.error("Invalid product");
      return;
    }

    try {
      // Step 1: Fetch full product details to get available sizes
      const productDetailsResponse = await fpi.executeGQL(GET_PRODUCT_DETAILS, {
        slug: product.slug,
      });

      const productDetails = productDetailsResponse?.data?.product;

      // Get first available size
      const firstAvailableSize = productDetails?.sizes?.sizes?.find(
        (s) => s.is_available
      );

      if (!firstAvailableSize?.value) {
        toast.error("No size available for this product");
        return;
      }

      // Step 2: Fetch product price details with the size
      const priceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
        slug: product.slug,
        size: firstAvailableSize.value,
        pincode: "",
      });

      const priceData = priceResponse?.data?.productPrice;

      if (!priceData?.article_id) {
        toast.error("Product not available");
        return;
      }

      // Step 3: Add to cart
      const addToCartResponse = await fpi.executeGQL(ADD_TO_CART, {
        buyNow: false,
        areaCode: "",
        addCartRequestInput: {
          items: [
            {
              article_assignment: {
                level: priceData.article_assignment?.level || "",
                strategy: priceData.article_assignment?.strategy || "",
              },
              article_id: priceData.article_id.toString(),
              item_id: product.uid,
              item_size: firstAvailableSize.value, // Use the size from product details
              quantity: 1,
              seller_id: priceData.seller?.uid,
              store_id: priceData.store?.uid,
            },
          ],
        },
      });

      // Check for GraphQL errors first
      if (addToCartResponse?.errors && addToCartResponse.errors.length > 0) {
        const errorMsg =
          addToCartResponse.errors[0].message || "Failed to add to cart";
        toast.error(errorMsg);
        return;
      }

      if (addToCartResponse?.data?.addItemsToCart?.success) {
        toast.success("Added to cart successfully");

        // Remove from wishlist after successfully adding to cart
        try {
          await removeFromWishlist(product, false, true); // silent = true to avoid duplicate toast

          // Refresh wishlist UI to reflect the removal without page refresh
          if (fetchProducts) {
            await fetchProducts();
          }
          setShowWishlist((prev) => !prev);
        } catch (err) {
          console.error("Error removing from wishlist:", err);
          // Don't block the flow if wishlist removal fails
        }

        // Refresh cart details to update cart UI
        try {
          fetchCartDetails(fpi);
        } catch (err) {
          console.error("Error fetching cart details:", err);
        }
        return; // Exit after success
      } else {
        const errorMsg =
          addToCartResponse?.data?.addItemsToCart?.message ||
          "Failed to add to cart";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const newBlocks = [
    {
      type: "coupon",
      name: "Coupon",
      props: {},
    },
    {
      type: "price_breakup",
      name: "Price Breakup",
      props: {},
    },
    {
      type: "checkout_buttons",
      name: "Log-In/Checkout Buttons",
      props: {},
    },
    {
      type: "share_cart",
      name: "Share Cart",
      props: {},
    },
  ];

  const [sizeModal, setSizeModal] = useState(null);
  const [currentSizeModalSize, setCurrentSizeModalSize] = useState(null);
  const [removeItemData, setRemoveItemData] = useState(null);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);

  const redirectToLogin = () => {
    navigate("/auth/login?redirectUrl=/");
  };

  const cartItemsArray = Object.keys(cartItems || {});
  const sizeModalItemValue = cartItems && sizeModal && cartItems[sizeModal];

  useEffect(() => {
    const isOtherCustomer = newBlocks?.some(
      (block) => block?.type === "order_for_customer"
    );
    if (!isOtherCustomer && checkoutMode === "other") {
      updateCartCheckoutMode("self");
    }
  }, [checkoutMode, newBlocks]);

  const totalPrice = useMemo(
    () => breakUpValues?.display?.find((val) => val.key === "subtotal")?.value,

    [breakUpValues]
  );

  console.log("breakUpValues", breakUpValues);

  const handleRemoveIconClick = (data) => {
    setRemoveItemData(data);
    onRemoveIconClick();
  };

  // Wrap wishlist button click to close modal when user is not logged in
  const handleWishlistButtonClick = (data) => {
    if (!isLoggedIn) {
      handleClose();
    }
    onWishlistButtonClick(data);
  };

  const getCartItemsLength = () => {
    if (cartItemsArray?.length == 0) {
      return 0;
    } else if (cartItemsArray?.length < 10) {
      return `0${cartItemsArray.length}`;
    } else {
      return `${cartItemsArray.length}`;
    }
  };

  // if (isLoading) {
  //   return <Shimmer />;
  // }

  const handleClearAllClick = () => {
    if (showWishlist) {
      onRemoveAllClick();
    } else {
      onRemoveAllItems();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Fixed Header */}
      <div className="ekke-bg w-full flex flex-col justify-center gap-[32px] px-2 pt-2 pb-10 md:p-2 md:pb-10 bg-[#f7f7f7] flex-shrink-0">
        {/* Top row with CLOSE button */}
        {!isOnCheckoutPage && (
          <div className="flex justify-end">
            <h3
              className="cursor-pointer text-[#171717] hover:text-black font-normal text-[11px] leading-[120%] font-archivo"
              onClick={handleClose}
            >
              CLOSE
            </h3>
          </div>
        )}

        {/* Loading Overlay for Cart Updates */}
        {isCartUpdating}

        {/* Main content row */}
        <div className="flex justify-between items-start ">
          {/* Left side - Cart info */}
          <div className="flex flex-col justify-between gap-3 w-full">
            <div className="flex justify-between w-full">
              <h3 className="body-1 font-normal leading-[120%] tracking-[0] uppercase text-[#AAAAAA] flex justify-center items-center gap-[8px] font-archivo">
                <span className="bg-[#171717] w-[4px] h-[4px] rounded-[1px] block"></span>
                <span className="body-2 text-[#AAAAAA] uppercase">
                  {!showWishlist ? "Cart" : "Wishlist"}&nbsp;
                  <span className="font-[400] text-[#171717] font-archivo">
                    {!showWishlist
                      ? ` ${String(cartItemCount || 0).padStart(2, "0")} `
                      : `${String(wishlistProducts?.length || 0).padStart(2, "0")} `}
                  </span>
                </span>
              </h3>
              {/* Right side - Wishlist */}
              <div
                onClick={() => {
                  setShowWishlist(!showWishlist);
                }}
                className="body-1 cursor-pointer text-ekke-black font-archivo hover:text-ekke-gray"
              >
                {!showWishlist ? "Wishlist" : "Cart"}
              </div>
            </div>
            {(cartItemsArray?.length > 0 || wishlistProducts?.length > 0) && (
              <div className="flex items-center gap-[12px] w-full">
                <span
                  className="text-[12px] leading-[120%] font-[400] cursor-pointer text-ekke-black underline font-archivo hover:text-ekke-gray"
                  onClick={handleClearAllClick}
                >
                  Clear all
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f5]">
        {showWishlist ? (
          <div className="flex flex-col bg-[#f5f5f5] px-2 py-4">
            {!wishlistLoading &&
            (!wishlistProducts || wishlistProducts.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="mb-20 mt-10">
                  <p className="body-1 text-[#171717] text-center uppercase">
                    Nothing saved yet. Choose what resonates.
                  </p>
                </div>
                <div className="flex items-center justify-center opacity-40 mb-20">
                  <EkkeLogo width="215" height="328" color="#CCCCCC" />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-5 grid-cols-3 gap-0 w-full">
                {wishlistProducts?.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FDKLink
                      to={`/product/${item.slug}`}
                      onClick={() => handleClose()}
                      style={{ width: "100%" }}
                    >
                      <div
                        className="relative w-full lg:h-[218.31px] h-[180.741px] aspect-[0.6621076568] md:aspect-[0.6449544226] bg-[#F7F7F7] flex items-center justify-center"
                        // style={{ aspectRatio: "0.6449544226" }}
                      >
                        <img
                          src={item?.media?.[0]?.url}
                          alt={item?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </FDKLink>
                    <button
                      className="w-full body-1 h-8 text-center text-ekke-black font-archivo hover:text-ekke-gray cursor-pointer"
                      onClick={() => handleMoveToCart(item)}
                      disabled={isRemoving}
                    >
                      MOVE TO CART
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${styles.cartMainContainer} flex flex-col min-h-full justify-between bg-ekke-bg`}
          >
            <div className={styles.cartWrapper}>
              {cartItemsArray?.length > 0 ? (
                <div className={styles.cartItemDetailsContainer}>
                  {/* <DeliveryLocation
              {...cartDeliveryLocation}
              isGuestUser={!isLoggedIn}
            />
            <div className={styles.cartTitleContainer}>
              <div className={styles.bagDetailsContainer}>
                <span className={styles.bagCountHeading}>Your Bag</span>
                <span className={styles.bagCount}>
                  ({cartItemsArray?.length || 0}
                  {cartItemsArray?.length > 1 ? " items" : " item"})
              </span>
            </div>
            {isShareCart && (
              <div className={styles.shareCartTablet}>
                <ShareCart {...cartShare} />
              </div>
            )}
          </div> */}
                  {cartItemsArray?.length > 0 &&
                    cartItemsArray?.map((singleItem, itemIndex) => {
                      const singleItemDetails = cartItems[singleItem];
                      console.log(
                        "singleItemDetails in cart-landing",
                        cartData
                      );
                      const productImage =
                        singleItemDetails?.product?.images?.length > 0 &&
                        singleItemDetails?.product?.images[0]?.url?.replace(
                          "original",
                          "resize-w:250"
                        );

                      const currentSize = singleItem?.split("_")[1];
                      return (
                        <ChipItem
                          key={singleItem}
                          isCartUpdating={isCartUpdating}
                          isDeliveryPromise={!globalConfig?.is_hyperlocal}
                          isSoldBy={false}
                          singleItemDetails={singleItemDetails}
                          productImage={productImage}
                          onUpdateCartItems={onUpdateCartItems}
                          currentSize={currentSize}
                          itemIndex={itemIndex}
                          sizeModalItemValue={sizeModalItemValue}
                          currentSizeModalSize={currentSizeModalSize}
                          setCurrentSizeModalSize={setCurrentSizeModalSize}
                          setSizeModal={setSizeModal}
                          sizeModal={sizeModal}
                          singleItem={singleItem}
                          cartItems={cartItems}
                          buybox={buybox}
                          cartItemsWithActualIndex={cartItemsWithActualIndex}
                          onRemoveIconClick={handleRemoveIconClick}
                          isPromoModalOpen={isPromoModalOpen}
                          onOpenPromoModal={onOpenPromoModal}
                          onClosePromoModal={onClosePromoModal}
                          onWishlistButtonClick={handleWishlistButtonClick}
                          handleClose={handleClose}
                        />
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full">
                  <h3 className="uppercase text-ekke-black text-[11px] leading-[120%] font-[400] mb-20 font-archivo body-1">
                    Your cart is quiet. Begin your journey.
                  </h3>
                  {isMobile ? (
                    <SvgWrapper svgSrc="ekke-grey-mobile" />
                  ) : (
                    <SvgWrapper svgSrc="ekke-grey" />
                  )}
                </div>
              )}

              {/* {breakUpValues?.display.length > 0 && (
            <div className={styles.cartItemPriceSummaryDetails}>
              {newBlocks?.map((block, index) => {
                const key = `${block.type}_${index}`;
                switch (block.type) {
                  case "coupon":
                    return (
                      !!availableCouponList?.length && (
                        
                          key={key}
                          availableCouponList={availableCouponList}
                          {...restCouponProps}
                          currencySymbol={currencySymbol}
                        />
                      )
                    );
                  case "comment":
                    return <Comment key={key} {...cartComment} />;

                  case "gst_card":
                    return (
                      <React.Fragment key={key}>
                        {isGstInput && (
                          <GstCard
                            {...cartGst}
                            currencySymbol={currencySymbol}
                            key={cartData}
                          />
                        )}
                      </React.Fragment>
                    );

                  case "price_breakup":
                    return (
                      <PriceBreakup
                        key={key}
                        breakUpValues={breakUpValues?.display || []}
                        cartItemCount={cartItemsArray?.length || 0}
                        currencySymbol={currencySymbol}
                        isInternationalTaxLabel={isInternational}
                      />
                    );
                  case "order_for_customer":
                    return (
                      <React.Fragment key={key}>
                        {isPlacingForCustomer && (
                          <div
                            className={styles.checkoutContainer}
                            onClick={() => updateCartCheckoutMode()}
                          >
                            <RadioIcon
                              checked={customerCheckoutMode === "other"}
                            />
                            <span> Placing order on behalf of Customer</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  case "checkout_buttons":
                    return (
                      <React.Fragment key={key}>
                        {!isLoggedIn ? (
                          <>
                            <button
                              className={styles.priceSummaryLoginButton}
                              onClick={redirectToLogin}
                            >
                              checkout
                            </button>
                            {isAnonymous && (
                              <button
                                className={styles.priceSummaryGuestButton}
                                disabled={
                                  !isValid || isOutOfStock || isNotServicable
                                }
                                onClick={onGotoCheckout}
                              >
                                checkout
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            className={styles.priceSummaryLoginButton}
                            disabled={
                              !isValid || isOutOfStock || isNotServicable
                            }
                            onClick={onGotoCheckout}
                          >
                            checkout
                          </button>
                        )}
                      </React.Fragment>
                    );

                  case "share_cart":
                    return (
                      <div key={key} className={styles.shareCartDesktop}>
                        <ShareCart showCard={true} {...cartShare} />
                      </div>
                    );

                  case "extension-binding":
                    return <BlockRenderer key={key} block={block} />;

                  default:
                    return <div key={key}>Invalid block</div>;
                }
              })}
            </div>
          )} */}
            </div>

            {cartItemsArray?.length > 0 && !isOnCheckoutPage && (
              <div className="text-center">
                <YouMayAlsoLike
                  wrappers="recently-launched"
                  onCartUpdate={fetchCartDetails}
                  fpi={fpi}
                />
              </div>
            )}

            <div className="w-full">
              <div className="w-full border-[#EEEEEE] border-b-[1px] border-t-[1px] flex flex-col">
                {/* Exchange/Return Policy Accordion */}
                <div className="w-full border-y border-solid border-[#EEEEEE] p-[8px]">
                  <FyAccordion
                    isOpen={showReturnPolicy}
                    onToggle={() => setShowReturnPolicy(!showReturnPolicy)}
                    containerClassName=""
                    buttonClassName="w-full text-left flex justify-between items-center focus:outline-none font-archivo"
                    iconClassName="transform transition-transform duration-200"
                  >
                    <span className="font-archivo text-[11px] font-[400] text-ekke-black flex justify-between opacity-100  ">
                      CURATED WITH INTENTION, CRAFTED WITH CARE.
                    </span>
                    <div className="px-4 py-4 text-[11px] text-neutral-light leading-relaxed font-archivo">
                      <div className="space-y-3 text-[11px]">
                        <p className="font-archivo text-[11px]">
                          Each piece is quality-checked, autheticated and
                          securely packed, before it reaches you.
                        </p>
                      </div>
                    </div>
                  </FyAccordion>
                </div>
              </div>

              <div className="w-full border-y border-solid border-[#EEEEEE] p-[8px] ">
                <FyAccordion
                  isOpen={showContactUs}
                  onToggle={() => setShowContactUs(!showContactUs)}
                  containerClassName=""
                  buttonClassName="w-full text-left flex justify-between items-center focus:outline-none font-archivo"
                  iconClassName="transform transition-transform duration-200"
                >
                  <span className="font-archivo text-[11px]  font-[400] text-ekke-black flex justify-between opacity-100  ">
                    PRIORITY DELIVERY
                  </span>
                  <div className="px-4 py-4 text-sm text-neutral-light leading-relaxed font-archivo">
                    <div className="space-y-3">
                      <p className="font-archivo text-[11px] ">
                        In some cases, you may be able to receive your order
                        sooner. Please contact customer care, and we will
                        arrange the best we can.
                      </p>
                      <ul className="list-disc list-inside space-y-[2px] ml-4 font-archivo text-[11px] ">
                        <li>+91 8490823230</li>
                        <li>hello@ekke.co</li>
                      </ul>
                    </div>
                  </div>
                </FyAccordion>
              </div>
              <div className="w-full border-y border-solid border-[#EEEEEE] p-[8px] ">
                <FyAccordion
                  isOpen={showAssistance}
                  onToggle={() => setShowAssistance(!showAssistance)}
                  containerClassName=""
                  buttonClassName="w-full text-left flex justify-between items-center focus:outline-none font-archivo"
                  iconClassName="transform transition-transform duration-200"
                >
                  <span className="font-archivo text-[11px]  font-[400] text-ekke-black flex justify-between opacity-100  ">
                    ASSISTANCE
                  </span>
                  <div className="px-4 py-4 text-sm text-neutral-light leading-relaxed font-archivo">
                    <div className="space-y-3">
                      <p className="font-archivo text-[11px] ">
                        If you need help along the way, we’re here to assist.
                        <FDKLink
                          to="/contact-us"
                          onClick={() => handleClose()}
                          className="font-archivo text-[11px] underline "
                        >
                          Get in touch
                        </FDKLink>
                      </p>
                    </div>
                  </div>
                </FyAccordion>
              </div>
            </div>

            {/* <RemoveCartItem
              isOpen={isRemoveModalOpen}
              cartItem={removeItemData?.item}
              onRemoveButtonClick={() => onRemoveButtonClick(removeItemData)}
              onWishlistButtonClick={() => onWishlistButtonClick(removeItemData)}
              onCloseDialogClick={onCloseRemoveModalClick}
            /> */}
          </div>
        )}
      </div>

      {/* Fixed Sticky Footer */}
      <StickyFooter
        isLoggedIn={isLoggedIn}
        isValid={isValid}
        isOutOfStock={isOutOfStock}
        isNotServicable={isNotServicable}
        isAnonymous={isAnonymous}
        totalPrice={totalPrice}
        currencySymbol={currencySymbol}
        onLoginClick={redirectToLogin}
        onCheckoutClick={onGotoCheckout}
        onPriceDetailsClick={onPriceDetailsClick}
        handleClose={handleClose}
        cartItemsArray={cartItemsArray}
        isOnCheckoutPage={isOnCheckoutPage}
        showWishlist={showWishlist}
      />
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.cart_landing.cart_landing",
  props: [],
  blocks: [
    {
      type: "coupon",
      name: "t:resource.sections.cart_landing.coupon",
      props: [],
    },
    {
      type: "comment",
      name: "t:resource.sections.cart_landing.comment",
      props: [],
    },
    {
      type: "gst_card",
      name: "t:resource.sections.cart_landing.gst_card",
      props: [
        {
          type: "header",
          value: "t:resource.sections.cart_landing.orders_india_only",
        },
      ],
    },
    {
      type: "price_breakup",
      name: "t:resource.sections.cart_landing.price_breakup",
      props: [],
    },
    // {
    //   type: "order_for_customer",
    //   name: "Behalf of customer",
    //   props: [],
    // },
    {
      type: "checkout_buttons",
      name: "t:resource.sections.cart_landing.login_checkout_buttons",
      props: [],
    },
    {
      type: "share_cart",
      name: "t:resource.sections.cart_landing.share_cart",
      props: [],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.cart_landing.coupon",
      },
      {
        name: "t:resource.sections.cart_landing.comment",
      },
      {
        name: "t:resource.sections.cart_landing.gst_card",
      },
      // {
      //   name: "Behalf of customer",
      // },
      {
        name: "t:resource.sections.cart_landing.price_breakup",
      },
      {
        name: "t:resource.sections.cart_landing.login_checkout_buttons",
      },
      {
        name: "t:resource.sections.cart_landing.share_cart",
      },
    ],
  },
};
export default Component;
