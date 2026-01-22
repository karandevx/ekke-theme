import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CART_DETAILS,
  CART_UPDATE,
  CART_META_UPDATE,
  APPLY_REWARD_POINTS,
} from "../../queries/cartQuery";
import { useAccounts, useWishlist /* useSnackbar */ } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import useHeader from "../../components/header/useHeader";
import {
  FULFILLMENT_OPTIONS,
  PRODUCT_SIZE_PRICE,
} from "../../queries/pdpQuery";
import { PAYMENT_OPTIONS } from "../../queries/checkoutQuery";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";
import { translateDynamicLabel } from "../../helper/utils";
import { useToast } from "../../components/custom-toaster";

export function fetchCartDetails(fpi, payload = {}) {
  const defaultPayload = {
    buyNow: false,
    includeAllItems: true,
    includeBreakup: true,
    ...payload,
  };
  return fpi?.executeGQL?.(CART_DETAILS, defaultPayload);
}

const useCart = (fpi, isActive = true) => {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const CART = useGlobalStore(fpi.getters.CART);
  const appFeatures = useGlobalStore(fpi.getters.APP_FEATURES);
  const buybox = appFeatures?.buybox;
  const { i18nDetails, countryDetails, deliveryLocationStr } = useInternational(
    { fpi }
  );
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { cartItemCount } = useHeader(fpi);
  const navigate = useNavigate();
  // const { showSnackbar } = useSnackbar();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [modeLoading, setIsModeLoading] = useState(false);
  const [applyRewardResponse, setApplyRewardResponse] = useState(null);
  const [currentCartId, setCurrentCartId] = useState(null);
  const [isRewardApplied, setIsRewardApplied] = useState(false); // ← NEW

  const { buy_now_cart_items, cart_items, cart_items_count } = CART || {};
  const {
    breakup_values,
    loading: cartItemsLoading,
    items,
    id: cartId,
  } = cart_items || {};
  const { loading: buyNowCartItemsLoading } = buy_now_cart_items || {};
  const { loading: cartItemsCountLoading } = cart_items_count || {};
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [customerCheckoutMode, setCustomerCheckoutMode] = useState("");

  const { openLogin } = useAccounts({ fpi });
  const { addToWishList } = useWishlist({ fpi });

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  
  // Use ref to track if a fetch is in progress to prevent race conditions
  // This prevents multiple simultaneous fetches that can cause cart data to disappear
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!isActive || !fpi) {
      return;
    }
    
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    fetchCartDetails(fpi, { buyNow })
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [fpi, i18nDetails?.currency?.code, deliveryLocationStr, buyNow, isActive]);

  const isAnonymous = appFeatures?.landing_page?.continue_as_guest;
  const isGstInput =
    appFeatures?.cart?.gst_input && countryDetails?.iso2 === "IN";
  // disabling isPlacingForCustomer feature now as flow is not decided yet, please remove && false once need to be enabled.
  const isPlacingForCustomer = appFeatures?.cart?.placing_for_customer;
  const checkoutMode = cart_items?.checkout_mode ?? "";

  useEffect(() => {
    setCustomerCheckoutMode(checkoutMode);
  }, [cart_items]);

  useEffect(() => {
    if (cartId && cartId !== currentCartId) {
      setCurrentCartId(cartId);
      setIsRewardApplied(false);
      localStorage.removeItem(`loyaltyToastShown_${cartId}`);
    }
  }, [cartId]);

  const cartItemsByItemId = useMemo(() => {
    if (items?.length > 0) {
      const cartItemsObj = {};

      items.forEach((singleItem) => {
        if (singleItem?.key) {
          cartItemsObj[
            `${singleItem?.key}_${singleItem?.article?.store?.uid}_${singleItem?.article?.item_index}`
          ] = singleItem;
        }
      });

      return cartItemsObj;
    }
    return {};
  }, [items]);

  const isOutOfStock = useMemo(() => {
    const outofstock = items?.find(
      (item) => item?.availability?.out_of_stock === true
    );
    return !!outofstock;
  }, [items]);

  const isNotServicable = useMemo(() => {
    const notservicable = items?.find(
      (item) => item?.availability?.deliverable === false
    );
    return !!notservicable;
  }, [items]);

  const currencySymbol = useMemo(
    () => cart_items?.currency?.symbol || "₹",
    [cart_items]
  );

  const onApplyLoyaltyPoints = async (isChecked, showToast = true) => {
    setIsLoyaltyLoading(true);
    setIsCartUpdating(true);

    const payload = {
      includeItems: true,
      includeBreakup: true,
      cartId: cartId,
      redeemPoints: { redeem_points: isChecked },
    };

    try {
      const res = await fpi.executeGQL(APPLY_REWARD_POINTS, payload, {
        skipStoreUpdate: false,
      });

      const data = res?.data?.applyLoyaltyPoints;
      setApplyRewardResponse(data);

      if (data?.success) {
        setIsRewardApplied(isChecked);

        const toastKey = `loyaltyToastShown_${cartId}`;

        if (isChecked) {
          if (showToast && !localStorage.getItem(toastKey)) {
            // showSnackbar(
            //   data.message || "Reward points applied successfully",
            //   "success"
            // );
            toast.success(data.message || "Reward points applied successfully");
            localStorage.setItem(toastKey, "true");
          }
        } else {
          if (showToast) {
            // showSnackbar("Reward points removed", "success");
            toast.success("Reward points removed");
          }
          localStorage.removeItem(toastKey);
        }

        await fetchCartDetails(fpi);
      } else {
        let errorMsg = "Could not update reward points";
        if (Array.isArray(res?.errors) && res.errors.length > 0) {
          errorMsg = res.errors[0]?.message || errorMsg;
        } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
          errorMsg = data.errors[0]?.message || errorMsg;
        }
        // showSnackbar(errorMsg, "error");
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("ApplyRewardPoints error", err);
      // showSnackbar("Something went wrong", "error");
      toast.error("Something went wrong");
    } finally {
      setIsCartUpdating(false);
      setIsLoyaltyLoading(false);
    }
  };

  function updateCartItems(
    event,
    itemDetails,
    itemSize,
    totalQuantity,
    itemIndex,
    operation,
    moveToWishList = false,
    isSizeUpdate = false,
    foSlug = ""
  ) {
    if (event) {
      event.stopPropagation();
    }
    setIsCartUpdating(true);

    try {
      const payload = {
        b: true,
        i: true,
        buyNow,
        updateCartRequestInput: {
          items: [
            {
              article_id: `${itemDetails?.product?.uid}_${itemSize}`,
              item_id: itemDetails?.product?.uid,
              item_size: itemSize,
              item_index: itemIndex,
              quantity: totalQuantity,
              identifiers: {
                identifier: itemDetails?.identifiers?.identifier,
              },
              fulfillment_option_slug:
                foSlug || itemDetails?.article?.fulfillment_option?.slug,
            },
          ],
          operation,
        },
      };

      return fpi
        .executeGQL(CART_UPDATE, payload, { skipStoreUpdate: false })
        .then(async (res) => {
          if (res?.data?.updateCart?.success) {
            if (!moveToWishList) {
              // showSnackbar(
              //   translateDynamicLabel(res?.data?.updateCart?.message, t) ||
              //     t("resource.cart.cart_update_success"),
              //   "success"
              // );
              toast.success(
                translateDynamicLabel(res?.data?.updateCart?.message, t) ||
                  "Cart updated successfully"
              );
            }

            await fetchCartDetails(fpi, { buyNow });

            if (isRewardApplied) {
              await onApplyLoyaltyPoints(true, false);
            }

            // Check if we're on checkout page and quantity was increased
            const isOnCheckoutPage =
              typeof window !== "undefined" &&
              window.location.pathname.includes("/cart/checkout");
            const previousQuantity = itemDetails?.quantity || 0;
            const hasQuantityChanged = totalQuantity !== previousQuantity;

            // If on checkout page and quantity changed (increase or decrease), call payment gateway API
            if (isOnCheckoutPage && hasQuantityChanged && operation !== "remove_item") {
              try {
                const updatedCartData = res?.data?.updateCart?.cart;
                const totalAmount =
                  updatedCartData?.breakup_values?.raw?.total ||
                  updatedCartData?.breakup_values?.display?.find(
                    (item) => item.key === "total"
                  )?.value ||
                  0.1;

                const paymentPayload = {
                  pincode: localStorage?.getItem("pincode") || "",
                  cartId: updatedCartData?.id || cartId,
                  checkoutMode: checkoutMode || "self",
                  amount: totalAmount * 100,
                };

                await fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
              } catch (error) {
                console.error("Error calling payment gateway API:", error);
                // Don't show error to user as cart update was successful
              }
            }
          } else if (!isSizeUpdate) {
            // showSnackbar(
            //   translateDynamicLabel(res?.data?.updateCart?.message, t) ||
            //     t("resource.cart.cart_update_success"),
            //   "error"
            // );
            toast.error(
              translateDynamicLabel(res?.data?.updateCart?.message, t) ||
                "Failed to update cart"
            );
          }
        })

        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsCartUpdating(false);
        });
    } catch (error) {
      console.log(error);
      setIsCartUpdating(false);
    }
  }

  function gotoCheckout() {
    if (cart_items?.id) {
      navigate(
        "/cart/checkout" + (cart_items?.id ? `?id=${cart_items.id}` : "")
      );
    } else {
      navigate("/cart/bag");
    }
  }

  function openRemoveModal() {
    setIsRemoveModalOpen(true);
  }

  function closeRemoveModal() {
    setIsRemoveModalOpen(false);
  }

  function handleRemoveItem(data, moveToWishList) {
    if (!data) {
      return;
    }
    const { item, size, index } = data;
    updateCartItems(
      null,
      item,
      size,
      0,
      index,
      "remove_item",
      moveToWishList
    ).then(() => {
      closeRemoveModal();
    });
  }
  const handleMoveToWishlist = (data) => {
    if (!data) {
      return;
    }

    if (isLoggedIn) {
      addToWishList(data.item.product).then(() => {
        handleRemoveItem(data, true);
      });
    } else {
      closeRemoveModal();
      openLogin({ wishlistProduct: data.item.product });
    }
  };

  /**
   * Removes all items from cart - Optimized version
   * Removes items sequentially in background without updating UI until complete
   * This prevents the jarring one-by-one visual removal effect
   */
  const removeAllItems = async () => {
    if (!items || items.length === 0) {
      toast.error("Cart is already empty");
      return;
    }

    setIsCartUpdating(true);

    try {
      const totalItems = items.length;
      let successCount = 0;
      let failCount = 0;

      // Create a copy of items to work with
      let currentItems = [...items];

      // Remove all items in background without updating the store
      while (currentItems && currentItems.length > 0) {
        try {
          // Always remove the first item (index 0) to avoid index shifting issues
          const itemToRemove = currentItems[0];

          const payload = {
            b: true,
            i: true,
            buyNow,
            updateCartRequestInput: {
              items: [
                {
                  article_id: `${itemToRemove?.product?.uid}_${itemToRemove?.article?.size}`,
                  item_id: itemToRemove?.product?.uid,
                  item_size: itemToRemove?.article?.size,
                  item_index: itemToRemove?.article?.item_index,
                  quantity: 0,
                  identifiers: {
                    identifier: itemToRemove?.identifiers?.identifier,
                  },
                  fulfillment_option_slug:
                    itemToRemove?.article?.fulfillment_option?.slug,
                },
              ],
              operation: "remove_item",
            },
          };

          // Skip store update to prevent UI from updating after each removal
          const result = await fpi.executeGQL(CART_UPDATE, payload, {
            skipStoreUpdate: true,
          });

          if (result?.data?.updateCart?.success) {
            successCount++;
            // Update currentItems from the response
            currentItems = result?.data?.updateCart?.cart?.items || [];
          } else {
            failCount++;
            console.error("Failed to remove item:", result);
            // Remove from local array to continue
            currentItems.shift();
          }
        } catch (error) {
          console.error("Error removing item:", error);
          failCount++;
          // Remove from local array to continue
          currentItems.shift();
        }
      }

      // Final refresh to update UI all at once
      await fetchCartDetails(fpi, { buyNow });

      // Show appropriate message
      if (successCount === totalItems) {
        toast.success("All items removed from cart");
      } else if (successCount > 0) {
        toast.success(
          `${successCount} of ${totalItems} items removed from cart`
        );
      } else {
        toast.error("Failed to remove items from cart");
      }
    } catch (error) {
      console.error("Error removing all items:", error);
      toast.error("Failed to remove items from cart");
      // Still refresh cart to show current state
      await fetchCartDetails(fpi, { buyNow });
    } finally {
      setIsCartUpdating(false);
    }
  };

  const [isLoyaltyLoading, setIsLoyaltyLoading] = useState(false);

  function onOpenPromoModal() {
    setIsPromoModalOpen(true);
  }
  function onClosePromoModal(e) {
    setIsPromoModalOpen(false);
  }

  function onPriceDetailsClick() {
    const element = document.getElementById("price-breakup-container-id");
    if (element) {
      element.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  const updateCartCheckoutMode = async (mode) => {
    const checkout_mode =
      mode || (customerCheckoutMode === "other" ? "self" : "other");
    const payload = {
      cartMetaRequestInput: {
        checkout_mode,
      },
      buyNow,
    };
    setCustomerCheckoutMode(checkout_mode);
    await fpi.executeGQL(CART_META_UPDATE, payload);
    fetchCartDetails(fpi, { buyNow });
  };

  const getFulfillmentOptions = async (slug, selectedSize, pincode) => {
    const values = {
      slug,
      size: selectedSize,
      pincode: pincode?.toString() || "",
    };

    const res = await fpi.executeGQL(FULFILLMENT_OPTIONS, values);

    return res?.data?.productsPriceWithFulfillmentOption?.items || [];
  };

  const fetchProductPrice = async (slug, selectedSize, pincode, foSlug) => {
    const payload = {
      slug,
      size: selectedSize,
      pincode: pincode.toString() || "",
      fulfillmentOptionSlug: foSlug || "",
    };

    const res = await fpi.executeGQL(PRODUCT_SIZE_PRICE, payload, {
      skipStoreUpdate: true,
    });

    return res?.data?.productPrice || {};
  };

  return {
    onApplyLoyaltyPoints,
    isLoyaltyLoading,
    isLoading,
    isCartUpdating,
    isLoggedIn,
    cartData: cart_items,
    checkoutMode,
    cartItems: cartItemsByItemId,
    cartItemsWithActualIndex: items,
    breakUpValues: breakup_values,
    cartItemCount,
    currencySymbol,
    isAnonymous,
    isValid: cart_items?.is_valid,
    isNotServicable,
    isOutOfStock,
    isGstInput,
    isPlacingForCustomer,
    isRemoveModalOpen,
    isPromoModalOpen,
    buybox,
    applyRewardResponse,
    availableFOCount: appFeatures?.fulfillment_option?.count || 1,
    onUpdateCartItems: updateCartItems,
    onGotoCheckout: gotoCheckout,
    onRemoveIconClick: openRemoveModal,
    onRemoveButtonClick: handleRemoveItem,
    onWishlistButtonClick: handleMoveToWishlist,
    onCloseRemoveModalClick: closeRemoveModal,
    onPriceDetailsClick,
    updateCartCheckoutMode,
    onOpenPromoModal,
    onClosePromoModal,
    customerCheckoutMode,
    getFulfillmentOptions,
    fetchProductPrice,
    onRemoveAllItems: removeAllItems,
  };
};

export default useCart;
