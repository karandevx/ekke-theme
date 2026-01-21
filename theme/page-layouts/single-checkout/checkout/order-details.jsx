import React, { useMemo } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import styles from "./order-details.less";
import PriceBreakup from "../../../components/price-breakup/price-breakup";
import CartLanding from "../../../sections/cart-landing";
import useCartCoupon from "../../cart/useCartCoupon";
import Coupon from "../../cart/Components/coupon/coupon";

const OrderDetails = ({
  restCouponProps,
  cancelQrPayment,
  showPayment = false,
  totalItems,
}) => {
  const fpi = useFPI();
  const cartData = useGlobalStore(fpi.getters.CART);
  const { breakup_values, items } = cartData?.cart_items || {};

  // Use the cart coupon hook with proper object parameter
  const {
    onApplyCouponClick,
    onRemoveCouponClick,
    successCoupon,
    availableCouponList,
  } = useCartCoupon({
    fpi,
    cartData: cartData?.cart_items,
  });

  // Get currency symbol from breakup values
  const currencySymbol = breakup_values?.display?.[0]?.currency_symbol || "₹";

  // Process breakup values for display
  const processedBreakupValues = useMemo(() => {
    if (!breakup_values?.display) return [];

    const values = breakup_values.display;
    const totalValue = values.find((item) => item.key === "total");
    const otherValues = values.filter((item) => item.key !== "total");

    return [...otherValues, totalValue].filter(Boolean);
  }, [breakup_values]);

  // Check if items exist and have at least one item
  const hasItems = items && Array.isArray(items) && items.length > 0;

  return (
    <div className={styles.orderDetailsContainer}>
      {/* ORDER SUMMARY */}
      {hasItems && (
        <div>
          <h2 className={styles.orderSummaryTitle}>ORDER SUMMARY</h2>

          <PriceBreakup
            breakUpValues={processedBreakupValues}
            cartItemCount={totalItems}
            currencySymbol={currencySymbol}
            isFlag={false}
          />
        </div>
      )}
      <Coupon
        successCoupon={successCoupon}
        availableCouponList={availableCouponList}
        {...restCouponProps}
        currencySymbol={currencySymbol}
        handleRemoveQr={cancelQrPayment}
        onApplyCouponClick={onApplyCouponClick}
        onRemoveCouponClick={onRemoveCouponClick}
      />
      <CartLanding
        fpi={fpi}
        isOnCheckoutPage={true}
        // handleClose={handleClose}
      />
    </div>
  );
};

export default OrderDetails;
