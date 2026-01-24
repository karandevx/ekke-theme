import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import SinglePageShipment from "../shipment/single-page-shipment";
// import SingleAddress from "@gofynd/theme-template/page-layouts/single-checkout/address/single-address";
import SingleAddress from "../address/single-address";
import styles from "./checkout.less";
// import CheckoutPayment from "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment";
// import "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment.css";
// import PriceBreakup from "../../../components/price-breakup/price-breakup";
import Stepper from "../../../components/stepper/stepper";
// import Coupon from "../../cart/Components/coupon/coupon";
// import Comment from "../../cart/Components/comment/comment";
// import FyButton from "../../../components/core/fy-button/fy-button";
// import { priceFormatCurrencySymbol } from "../../../helper/utils";
// import ZeroPayButton from "../payment/zero-pay-btn/zero-pay-btn";
import DeliveryDetailsForm from "./delivery-details-form";
// import DeliveryMethodsForm from "./delivery-methods-form";
import { useGlobalStore } from "fdk-core/utils";
import OrderDetails from "./order-details";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import ConsentForm from "../payment/consent-form";
import CheckoutPayment from "../payment/checkout-payment";
import useHeader from "../../../components/header/useHeader";
import useCheckAnnouncementBar from "../../../helper/hooks/useCheckAnnouncementBar";

function Checkout({
  fpi,
  breakupValues,
  cartItemsCount,
  currencySymbol,
  address,
  showShipment,
  showPayment,
  showConsent,
  setShowConsent,
  shipments,
  isShipmentLoading,
  payment,
  showPaymentOptions,
  setShowShipment,
  setShowPayment,
  mapApiKey,
  showGoogleMap,
  getDeliveryPromise = () => {},
  loader,
  stepperProps,
  onPriceDetailsClick,
  cartCouponProps,
  cartCommentProps,
  buybox = {},
  availableFOCount,
  isGuestUser = false,
  isCartValid = true,
  redirectPaymentOptions,
  setMopPayload,
  isCouponValid,
  setIsCouponValid,
  inValidCouponData,
  onStepClick, // Add this new prop
}) {
  const [cancelQrPayment, setCancelQrPayment] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const address_id = searchParams.get("address_id");
  const paymentStep = searchParams.get("step"); // Check for payment step query param
  const { isLoading } = payment;
  const { cartItemCount } = useHeader(fpi);
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Helper function to update URL query parameters
  const updateUrlStep = (step) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (step === "payment") {
      newSearchParams.set("step", "payment");
    } else {
      newSearchParams.delete("step");
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handlePlaceOrder = async () => {
    if (payment?.storeCreditApplied?.isFullyApplied) {
      const { merchant_code, code, aggregator_name } =
        payment?.partialPaymentOption?.list[0];

      const paymentModePayload = {
        id: cart_id,
        address_id,
        payment_mode: code,
        aggregator_name,
        payment_identifier: code,
        merchant_code,
      };
      await payment?.selectPaymentMode(paymentModePayload);
      await payment?.proceedToPay("CREDITNOTE");
    }
  };

  const { onFailedGetCartShipmentDetails } = address;
  const { availableCouponList, successCoupon, ...restCouponProps } =
    cartCouponProps;

  const [consentCompleted, setConsentCompleted] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  // const [deliveryMethodsCompleted, setDeliveryMethodsCompleted] =
  //   useState(false);

  // Restore payment state on mount if payment step query param exists
  useEffect(() => {
    // Check if user has completed an order
    const orderCompleted = sessionStorage.getItem("order_completed");
    
    // If order is completed, prevent accessing payment step and redirect to information
    if (orderCompleted === "true") {
      setShowPayment(false);
      setShowConsent(false);
      setConsentCompleted(false);
      if (onStepClick) {
        onStepClick(0);
      }
      // Remove payment step query parameter
      updateUrlStep(null);
      return;
    }

    if (
      paymentStep === "payment" &&
      address_id &&
      !showPayment &&
      !showConsent
    ) {
      // Call handleStepClick case 1 to update stepper state
      if (onStepClick) {
        onStepClick(1);
      }
      // Set payment state directly (skip consent, same as handleDeliveryDetailsSubmit)
      setShowPayment(true);
      setShowConsent(false);
      setConsentCompleted(true);
      // Load payment options data
      if (showPaymentOptions) {
        showPaymentOptions();
      }
    }
  }, [paymentStep, address_id]); // Only run on mount or when these change

  // Sync URL query parameter when showPayment state changes
  useEffect(() => {
    if (showPayment && paymentStep !== "payment") {
      // Add payment step query parameter when moving to payment
      updateUrlStep("payment");
    } else if (!showPayment && !showConsent && paymentStep === "payment") {
      // Remove payment step query parameter when going back to step 0
      updateUrlStep(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPayment, showConsent, paymentStep]);

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event) => {
      // Check if user has completed an order
      const orderCompleted = sessionStorage.getItem("order_completed");
      
      if (orderCompleted === "true") {
        // Prevent going back to payment page
        event.preventDefault();
        
        // Reset to information page
        setShowPayment(false);
        setShowConsent(false);
        setConsentCompleted(false);
        if (onStepClick) {
          onStepClick(0);
        }
        updateUrlStep(null);
      } else if (showPayment || showConsent) {
        // If on payment or consent page, go back to information
        setShowPayment(false);
        setShowConsent(false);
        setConsentCompleted(false);
        if (onStepClick) {
          onStepClick(0);
        }
        updateUrlStep(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showPayment, showConsent, onStepClick]);

  // Prevent body scroll when order summary drawer is open (mobile only - drawer needs to scroll)
  useEffect(() => {
    if (isOrderSummaryOpen) {
      // Check if mobile/tablet view (drawer is only shown on mobile)
      const isMobileView = window.innerWidth <= 768;

      if (!isMobileView) {
        // Desktop: No drawer shown, no scroll lock needed
        return;
      }

      // Mobile: Only prevent background scroll, allow drawer to scroll
      const scrollY = window.scrollY;
      const bodyElement = document.body;
      const htmlElement = document.documentElement;

      // Simple overflow hidden approach for mobile
      // This prevents body scroll while allowing the modal content to scroll
      htmlElement.style.overflow = "hidden";
      bodyElement.style.overflow = "hidden";

      // Store scroll position
      bodyElement.dataset.scrollY = scrollY;

      return () => {
        // Restore body scroll
        htmlElement.style.overflow = "";
        bodyElement.style.overflow = "";

        // Restore scroll position
        const savedScrollY = bodyElement.dataset.scrollY || "0";
        window.scrollTo(0, parseInt(savedScrollY));

        // Clean up
        delete bodyElement.dataset.scrollY;
      };
    }
  }, [isOrderSummaryOpen]);

  const handleDeliveryDetailsSubmit = (data) => {
    // Skip consent form and go directly to payment
    setShowPayment(true);
    setShowConsent(false);
    setConsentCompleted(true); // Mark as completed to maintain flow

    // Load payment options data
    showPaymentOptions();
  };

  const handleConsentSubmit = (consentData) => {
    setConsentCompleted(true);

    // First, show payment component, then hide consent
    // This ensures a smooth transition without a blank state
    setShowPayment(true);
    setShowConsent(false);

    // Load payment options data
    showPaymentOptions();
  };

  // Handle back from consent form - go back to delivery details
  const handleBackFromConsent = () => {
    // Use the stepper click handler to go back to Information step
    if (onStepClick) {
      setShowConsent(false);
      setShowPayment(false);
      onStepClick(0); // This will reset everything to Information step
    }
    // Remove payment step query parameter from URL
    updateUrlStep(null);
  };

  // Handle back from payment methods - go back to delivery details (skip consent)
  const handleBackToPayment = () => {
    // Since consent form is skipped, always go back to Information step
    setShowPayment(false);
    setShowConsent(false);
    setConsentCompleted(false);

    // Go back to Information step
    if (onStepClick) {
      onStepClick(0);
    }
    // Remove payment step query parameter from URL
    updateUrlStep(null);
  };

  // const handleDeliveryMethodsSubmit = (data) => {
  //   setDeliveryMethodsCompleted(true);
  //   showPaymentOptions();
  // };

  // const handleBackToDeliveryMethods = () => {
  //   setShowPayment(false);
  //   setDeliveryMethodsCompleted(false);
  // };

  return (
    <>
      <div className="bg-[#ffffff] border-b border-[#eeeeee] p-4 flex items-center justify-between md:block">
        <p className="font-bold text-subtitle leading-[120%] tracking-[0] text-ekke-black font-road-radio">
          CHECK OUT
        </p>
      </div>

      <Stepper {...stepperProps} onStepClick={onStepClick} />

      <div className={`${styles.mainContainer}`}>
        <div className={`${styles.leftContainer}`}>
          {!showPayment && (
            <button
              className={styles.orderSummaryBtn}
              onClick={() => setIsOrderSummaryOpen(true)}
            >
              ORDER SUMMARY
            </button>
          )}

          {!showConsent && !showPayment && (
            <>
              <SingleAddress
                address={address}
                showShipment={showShipment}
                showPayment={showPayment}
                setShowShipment={setShowShipment}
                setShowPayment={setShowPayment}
                mapApiKey={mapApiKey}
                showGoogleMap={showGoogleMap}
                isGuestUser={isGuestUser}
                getTotalValue={payment?.getTotalValue}
                showPaymentOptions={showPaymentOptions}
              />

              <div>
                <DeliveryDetailsForm
                  address={address}
                  onFormSubmit={handleDeliveryDetailsSubmit}
                  getTotalValue={payment?.getTotalValue}
                  showPaymentOptions={showPaymentOptions}
                  isGuestUser={isGuestUser}
                  payment={payment}
                  redirectPaymentOptions={redirectPaymentOptions}
                />
              </div>
            </>
          )}

          {/* Consent Form - shown after delivery details */}
          {showConsent && !showPayment && (
            <div>
              <ConsentForm
                onConsentSubmit={handleConsentSubmit}
                onBack={handleBackFromConsent}
                getTotalValue={payment?.getTotalValue}
                currencySymbol={currencySymbol}
                payment={payment}
                redirectPaymentOptions={redirectPaymentOptions}
                showPaymentOptions={showPaymentOptions}
              />
            </div>
          )}

          {/* {showShipment && !showPayment && (
            <div>
              <DeliveryMethodsForm
                onFormSubmit={handleDeliveryMethodsSubmit}
                onBack={handleBackToDeliveryDetails}
              />
            </div>
          )} */}

          {showPayment && (
            <div>
              <CheckoutPayment
                payment={payment}
                showPayment={showPayment}
                loader={loader}
                onPriceDetailsClick={onPriceDetailsClick}
                breakUpValues={breakupValues}
                showPaymentOptions={showPaymentOptions}
                setCancelQrPayment={setCancelQrPayment}
                onFailedGetCartShipmentDetails={onFailedGetCartShipmentDetails}
                isCouponApplied={successCoupon?.is_applied}
                redirectPaymentOptions={redirectPaymentOptions}
                setMopPayload={setMopPayload}
                isCouponValid={isCouponValid}
                setIsCouponValid={setIsCouponValid}
                inValidCouponData={inValidCouponData}
                onBack={handleBackToPayment}
              />
            </div>
          )}

          {/* Mobile Order Summary Modal */}
          <Modal
            isOpen={isOrderSummaryOpen}
            closeDialog={() => setIsOrderSummaryOpen(false)}
            // position="right"
            modalType="right-modal"
            isCancelable={true}
            containerStyle={styles.orderSummaryModal}
            bodyClassName={styles.orderSummaryModalBody}
            hideHeader={true}
            containerClassName={`${styles.orderSummaryModalContainer} ${hasAnnouncementBar ? styles.orderSummaryModalContainerWithAnnouncement : styles.orderSummaryModalContainerWithoutAnnouncement}`}
            customClassName={styles.orderSummaryModalCustom}
          >
            <div className={styles.modalHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOrderSummaryOpen(false)}
              >
                CLOSE
              </button>
            </div>
            <div className="bg-ekke-bg px-[10px] pb-[10px] min-h-full">
              <OrderDetails
                successCoupon={successCoupon}
                availableCouponList={availableCouponList}
                {...restCouponProps}
                currencySymbol={currencySymbol}
                handleRemoveQr={cancelQrPayment}
              />
            </div>
          </Modal>
        </div>
        {
          <div className={`${styles.rightContainer} bg-ekke-bg`}>
            <OrderDetails
              successCoupon={successCoupon}
              availableCouponList={availableCouponList}
              {...restCouponProps}
              currencySymbol={currencySymbol}
              handleRemoveQr={cancelQrPayment}
              showPayment={showPayment}
              totalItems={cartItemCount}
            />
          </div>
        }

        {/* <div className={styles.rightContainer}>
          <Coupon
            successCoupon={successCoupon}
            availableCouponList={availableCouponList}
          />
        </div> */}
      </div>
    </>
  );
}

export default Checkout;
