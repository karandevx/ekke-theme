import React, { useEffect, useState, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import CheckoutPage from "../page-layouts/single-checkout/checkout/checkout";
// import CheckoutPage from "@gofynd/theme-template/pages/checkout/index.js";
// import "@gofynd/theme-template/pages/checkout/checkout.css";
import {
  CHECKOUT_LANDING,
  FETCH_SHIPMENTS,
  PAYMENT_OPTIONS,
} from "../queries/checkoutQuery";
import { useHyperlocalTat, useGoogleMapConfig } from "../helper/hooks";
import useAddress from "../page-layouts/single-checkout/address/useAddress";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import useCart from "../page-layouts/cart/useCart";
import Loader from "../components/loader/loader";
import useCartCoupon from "../page-layouts/cart/useCartCoupon";
import useCartComment from "../page-layouts/cart/useCartComment";

function SingleCheckoutPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const { shipments } = useGlobalStore(fpi.getters.SHIPMENTS) || {};
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { buybox } = useGlobalStore(fpi.getters.APP_FEATURES);
  const breakupValues = bagData?.breakup_values?.display || [];
  const [showShipment, setShowShipment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [inValidCouponData, setInValidCouponData] = useState(null);
  const [mopPayload, setMopPayload] = useState(null);
  const { onPriceDetailsClick } = useCart(fpi);
  const steps = [
    { label: t("INFORMATION") },
    // { label: t("DELIVERY") },
    { label: t("PAYMENT") },
  ];

  const { isHyperlocal, convertUTCToHyperlocalTat } = useHyperlocalTat({ fpi });
  const { isGoogleMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const buy_now = searchParams.get("buy_now") || false;
  const address_id = searchParams.get("address_id");
  const cartCoupon = useCartCoupon({ fpi, cartData: bagData });
  const cartComment = useCartComment({ fpi, cartData: bagData });
  const { setIsLoading, ...payment } = usePayment(fpi);

  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData],
  );

  console.log("Single checkout payment ", shipments);

  useEffect(() => {
    setIsLoading(true);
    setIsApiLoading(true);
    const payload = {
      buyNow: buy_now === "true",
      includeAllItems: true,
      includeBreakup: true,
    };

    // ✅ Get the total from the response data directly
    fpi
      .executeGQL(CHECKOUT_LANDING, payload)
      .then((response) => {
        setIsApiLoading(false);

        // Access the cart data from the response, not the store
        const cartData = response?.data?.cart;
        const totalAmount = cartData?.breakup_values?.raw?.total || 0.1;

        console.log("checkout mode in single checkou amount", totalAmount);

        const paymentPayload = {
          pincode: localStorage?.getItem("pincode") || "",
          cartId: cart_id,
          checkoutMode: "self",
          amount: totalAmount * 100,
        };

        return fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fpi, buy_now]); // ✅ Only fpi and buy_now as dependencies

  console.log("Single checkout shipment ", shipments);

  function showPaymentOptions() {
    console.log("showPaymentOptions called", {
      showPayment,
      showConsent,
      showShipment,
    });
    setIsLoading(true);

    // ✅ Use bagData which is already available from the store
    const totalAmount =
      bagData?.breakup_values?.raw?.total ||
      shipments?.breakup_values?.raw?.total ||
      0.1;

    console.log("single checkout amount show ", totalAmount);
    console.log("bagData ssssss", bagData?.breakup_values?.raw?.total);

    const payload = {
      pincode: "",
      cartId: cart_id,
      checkoutMode: "self",
      amount: totalAmount * 100,
    };

    fpi.executeGQL(PAYMENT_OPTIONS, payload).finally(() => {
      setIsLoading(false);
    });

    setShowShipment(false);
    showPaymentHandler(true);
    console.log("showPaymentHandler called with true");
  }

  function showPaymentHandler(flag) {
    console.log("flag", flag);
    setShowPayment(flag);
    if (flag) {
      setCurrentStepIdx(1); // Changed from 2 to 1 since we have only 2 steps now
    }
  }

  function showShipmentHandler(flag) {
    setShowShipment(flag);
    if (flag) {
      setCurrentStepIdx(1);
    }
  }

  useEffect(() => {
    // Check if user is returning from a failed payment
    const urlParams = new URLSearchParams(window.location.search);
    const hasFailed = urlParams.get("failed") === "true";

    // If payment failed, keep user on payment step to show error
    if (hasFailed) {
      setShowPayment(true);
      setCurrentStepIdx(1);
      return;
    }

    // Handle navigation based on current view
    if (!showPayment && !showShipment && !showConsent) {
      setCurrentStepIdx(0); // Information step
    } else if (showConsent || showPayment) {
      setCurrentStepIdx(1); // Payment step (consent is part of payment flow)
    }
  }, [showShipment, showPayment, showConsent]);

  // Add this new function to handle stepper clicks
  const handleStepClick = (stepIndex) => {
    switch (stepIndex) {
      case 0: // INFORMATION - Reset everything to go back to delivery details
        setShowShipment(false);
        setShowPayment(false);
        setShowConsent(false);
        setCurrentStepIdx(0);
        break;
      case 1: // PAYMENT - Go to payment methods directly
        setShowShipment(false);
        setShowPayment(false);
        setShowConsent(true);
        setCurrentStepIdx(1);
        break;
      default:
        break;
    }
  };

  const { isShipmentLoading, ...address } = useAddress(
    showShipmentHandler,
    showPaymentHandler,
    fpi,
  );

  useEffect(() => {
    if (address_id?.length && address?.allAddresses?.length) {
      address?.selectAddress();
    }
  }, []);

  // Refetch payment options when cart value changes (e.g., coupon applied, items changed)
  useEffect(() => {
    // Only refetch if we're on the payment step
    if (showPayment && bagData?.breakup_values?.raw?.total !== undefined) {
      const totalAmount = bagData?.breakup_values?.raw?.total || 0.1;

      console.log(
        "Cart value changed, refetching payment options. New total:",
        totalAmount,
      );

      setIsLoading(true);
      const payload = {
        pincode: localStorage?.getItem("pincode") || "",
        cartId: cart_id,
        checkoutMode: "self",
        amount: totalAmount * 100,
      };

      fpi.executeGQL(PAYMENT_OPTIONS, payload).finally(() => {
        setIsLoading(false);
      });
    }
  }, [bagData?.breakup_values?.raw?.total, showPayment]);

  return (
    <>
      <CheckoutPage
        fpi={fpi}
        breakupValues={breakupValues}
        cartItemsCount={bagData?.items?.length}
        currencySymbol={currencySymbol}
        address={{ ...address, isAddressLoading: isApiLoading }}
        payment={payment}
        showShipment={showShipment}
        showPayment={showPayment}
        showConsent={showConsent}
        setShowConsent={setShowConsent}
        cartCouponProps={{
          ...cartCoupon,
        }}
        isGuestUser={!isLoggedIn}
        cartCommentProps={cartComment}
        setShowPayment={setShowPayment}
        setShowShipment={showShipmentHandler}
        onPriceDetailsClick={onPriceDetailsClick}
        shipments={shipments}
        isShipmentLoading={isShipmentLoading}
        showPaymentOptions={showPaymentOptions}
        redirectPaymentOptions={() => {
          showPaymentOptions(); // Same as shipment component - reload payment options
        }}
        stepperProps={{ steps, currentStepIdx }}
        showGoogleMap={isGoogleMap}
        mapApiKey={mapApiKey}
        isHyperlocal={isHyperlocal}
        convertHyperlocalTat={convertUTCToHyperlocalTat}
        loader={<Loader />}
        buybox={buybox}
        onStepClick={handleStepClick} // Add this new prop
        isCouponValid={isCouponValid}
        setIsCouponValid={setIsCouponValid}
        inValidCouponData={inValidCouponData}
        setMopPayload={setMopPayload}
      />
    </>
  );
}

export const sections = JSON.stringify([]);

export default SingleCheckoutPage;
