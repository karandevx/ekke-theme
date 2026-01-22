import React, { useMemo, useState } from "react";
import {
  convertDate,
  formatLocale,
  getAddressStr,
  numberWithCommas,
  translateDynamicLabel,
  priceFormatCurrencySymbol,
  currencyFormat,
} from "../../../helper/utils";
import styles from "./order-status.less";
import PriceBreakup from "../../../components/price-breakup/price-breakup";
import CartGiftItem from "./cart-gift-item";
import FyButton from "../../../components/core/fy-button/fy-button";

import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import Stepper from "../../../components/stepper/stepper";
import useCheckAnnouncementBar from "../../../helper/hooks/useCheckAnnouncementBar";
import Modal from "../../../components/core/modal/modal";
// import TrueCheckIcon from "../../assets/images/true-check.svg";

const orderFailurePageInfo = {
  link: "",
  linktext: "resource.common.retry_caps",
  text: "resource.common.oops_payment_failed",
  subText: "resource.common.retry_checkout_or_other_payment_option",
  icon: "",
};

function OrderStatus({
  isLoggedIn,
  success,
  orderData,
  orderFailImg = "",
  onOrderFailure,
  showPolling = false,
  pollingComp = null,
  loader,
}) {
  const { t } = useGlobalTranslation("translation");
  const { hasAnnouncementBar } = useCheckAnnouncementBar();
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  function getOrderLink() {
    const basePath = isLoggedIn
      ? "/profile/orders/"
      : `/order-tracking/${orderData?.order_id}`;
    return locale && locale !== "en" ? `/${locale}${basePath}` : basePath;
  }

  function getItemCount() {
    return orderData?.shipments?.reduce((total, ship) => {
      total += ship.bags.length;
      return total;
    }, 0);
  }

  function getFullAddress(addr) {
    if (addr) {
      return getAddressStr(addr, false);
    }
  }

  const getAddressData = orderData?.shipments?.[0]?.delivery_address || {
    name: t("resource.order.john_doe"),
    address_type: "Home",
    phone: "1234567890",
  };

  const dynamicHeight = hasAnnouncementBar
    ? "h-[calc(100vh-182px)]"
    : "h-[calc(100vh-152px)]";

  // Checkout steps for stepper
  // Note: Both steps are completed, PAYMENT is current (active)
  // INFORMATION is not clickable since the order is already completed
  const checkoutSteps = [{ label: "INFORMATION" }, { label: "PAYMENT" }];

  console.log("OrderDate", orderData);

  // Order Summary Content Component (reusable for desktop and mobile)
  const OrderSummaryContent = () => {
    // Calculate price breakdown from all bags
    const priceBreakdown = useMemo(() => {
      let totalPrice = 0;
      let totalCoupon = 0;
      let totalDeliveryCharge = 0;
      let totalAmountPaid = 0;
      let currencySymbol = "₹";

      orderData?.shipments?.forEach((shipment) => {
        shipment?.bags?.forEach((bag) => {
          const prices = bag?.prices;
          if (prices) {
            totalPrice += prices?.price_effective || 0;
            totalCoupon += prices?.coupon_value || 0;
            totalDeliveryCharge += prices?.delivery_charge || 0;
            totalAmountPaid += prices?.amount_paid || 0;
            if (prices?.currency_symbol) {
              currencySymbol = prices.currency_symbol;
            }
          }
        });
      });

      return {
        totalPrice,
        totalCoupon,
        totalDeliveryCharge,
        totalAmountPaid,
        currencySymbol,
      };
    }, [orderData]);

    const {
      totalPrice,
      totalCoupon,
      totalDeliveryCharge,
      totalAmountPaid,
      currencySymbol,
    } = priceBreakdown;

    return (
      <>
        <p className="subheading-3 mb-6">ORDER SUMMARY</p>

        {/* Price Breakdown */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: "1px solid #eeeeee" }}
          >
            <span className="body-1">SUB TOTAL</span>
            <span className="body-1">
              {currencySymbol}
              {numberWithCommas(totalPrice.toFixed(2))}
            </span>
          </div>
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: "1px solid #eeeeee" }}
          >
            <span className="body-1" style={{ color: "#AAAAAA" }}>
              COUPON 
            </span>
            <span className="body-1" style={{ color: totalCoupon > 0 ? "#2E7D32" : "#AAAAAA" }}>
              {totalCoupon > 0
                ? `-${currencySymbol}${numberWithCommas(totalCoupon.toFixed(2))}`
                : `${currencySymbol}0`}
            </span>
          </div>
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: "1px solid #eeeeee" }}
          >
            <span className="body-1" style={{ color: "#AAAAAA" }}>
              DELIVERY CHARGES
            </span>
            <span className="body-1" style={{ color: "#AAAAAA" }}>
              {totalDeliveryCharge === 0
                ? "FREE"
                : `${currencySymbol}${numberWithCommas(totalDeliveryCharge.toFixed(2))}`}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="body-1">
              TOTAL{" "}
              {/* <span className="body-1 !text-neutral-light pl-2">INCL VAT</span> */}
            </span>
            <span className="body-1">
              {currencySymbol}
              {numberWithCommas(totalAmountPaid.toFixed(2))}
            </span>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {orderData?.shipments?.map((shipment, shipmentIdx) =>
            shipment?.bags
              ?.filter(
                (bag) => Object.keys(bag?.parent_promo_bags)?.length === 0,
              )
              ?.map((product, index) => (
                <div
                  key={`${shipmentIdx}-${index}`}
                  className="flex items-start gap-4 relative bg-white p-2"
                >
                  <div className="relative w-[90px] flex-shrink-0">
                    <img
                      src={product.item.image[0]}
                      alt={product?.item?.name}
                      className="w-full h-[105px] object-cover"
                    />
                    <p
                      className="body-3 !text-neutral-light absolute top-0 left-0 w-[29px] h-[24px] flex items-center justify-center bg-white text-[11px] px-1"
                      style={{ width: "29px", height: "24px" }}
                    >
                      {product.quantity?.toString().padStart(2, "0") || "01"}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col justify-start">
                    <p className="body-1 mb-1 uppercase">
                      {product?.item?.brand?.name || "BRAND/DESIGNER NAME"}
                    </p>
                    <p className="body-3 !text-neutral-light mb-2">
                      {product?.item?.name || "Product detail info"}
                    </p>
                    <p className="body-1 mb-2">
                      {product?.prices?.currency_symbol}

                      {currencyFormat(
                        numberWithCommas(
                          product?.prices?.price_effective || "0",
                        ),
                      )}
                    </p>
                    <div className="flex gap-4">
                      <div>
                        <p className="body-3 !text-neutral-light mb-1">Size</p>
                        <p className="body-1">{product?.item?.size || "L"}</p>
                      </div>
                      <div>
                        <p className="body-3 !text-neutral-light mb-1">Color</p>
                        <p className="body-1">
                          {product?.item?.attributes?.primary_color || "Black"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )),
          )}
        </div>
      </>
    );
  };

  return success === "true" ? (
    <>
      {orderData?.order_id ? (
        <>
          {/* Header - Same as checkout */}
          <div className="bg-[#ffffff] border-b border-[#eeeeee] p-4 flex items-center justify-between md:block">
            <p className="font-bold text-subtitle leading-[120%] tracking-[0] text-ekke-black font-road-radio">
              CHECK OUT
            </p>
          </div>

          {/* Stepper - Payment tab active (index 1 means PAYMENT is current) */}
          {/* INFORMATION is completed but not clickable (order already placed) */}
          <Stepper steps={checkoutSteps} currentStepIdx={1} />

          {/* Main Container - Same structure as checkout */}
          <div className={`${dynamicHeight} flex-row w-full relative`}>
            {/* Left Container - Thank you content */}
            <div className="w-full md:w-1/2">
              {/* Mobile Order Summary Button - Same as checkout */}
              <button
                className={styles.orderSummaryBtn}
                onClick={() => setIsOrderSummaryOpen(true)}
              >
                ORDER SUMMARY
              </button>

              {/* Thank You Content */}
              <div className={`py-2 px-[10px]`}>
                {/* <p className="subheading-3 mb-6">
                  Thank you. Your order is confirmed.
                </p> */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-archivo font-[200] text-[32px] mb-4">
                      Thank You. Your Order is confirmed.
                    </p>
                    <p className="body-2 text-[#171717] max-w-[348px] mb-6">
                      An order confirmation message has been sent to your email
                      address.
                    </p>
                  </div>

                  {/* Back to Shop Button */}
                  <FDKLink
                    to="/products"
                    className="block absolute bottom-[20px] md:w-1/2 w-full left-0 px-[10px]"
                  >
                    <button className="w-full bg-[#eeeeee] hover:bg-[#e0e0e0] px-2 py-3 body-1 uppercase text-left">
                      Continue Shopping
                    </button>
                  </FDKLink>
                </div>
              </div>
            </div>

            {/* Right Container - Order Summary (Desktop Only) - Same as checkout */}
            <div className={`bg-ekke-bg w-1/2 md:block hidden overflow-y-auto`}>
              <style>{`
                .bg-ekke-bg::-webkit-scrollbar {
                  width: 6px;
                }
                .bg-ekke-bg::-webkit-scrollbar-track {
                  background: transparent;
                }
                .bg-ekke-bg::-webkit-scrollbar-thumb {
                  background: #171717;
                  border-radius: 3px;
                }
                .bg-ekke-bg::-webkit-scrollbar-thumb:hover {
                  background: #000000;
                }
                .bg-ekke-bg {
                  scrollbar-width: thin;
                  scrollbar-color: #171717 transparent;
                }
              `}</style>
              <div className="py-1 px-[10px]">
                <OrderSummaryContent />
              </div>
            </div>
          </div>

          {/* Mobile Order Summary Modal - Same as checkout */}
          <Modal
            isOpen={isOrderSummaryOpen}
            closeDialog={() => setIsOrderSummaryOpen(false)}
            modalType="right-modal"
            isCancelable={true}
            containerStyle={styles.orderSummaryModal}
            bodyClassName={styles.orderSummaryModalBody}
            hideHeader={true}
            containerClassName={styles.orderSummaryModalContainer}
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
              <div className="pt-4">
                <OrderSummaryContent />
              </div>
            </div>
          </Modal>
        </>
      ) : showPolling ? (
        pollingComp
      ) : (
        loader
      )}
    </>
  ) : (
    <div>
      <div className={styles.orderFail}>
        <img src={orderFailImg} alt={orderFailImg} />
        <div className={styles.cartErrorText}>
          <span>{t(orderFailurePageInfo.text)}</span>
          <span className={styles.subtext}>
            {t(orderFailurePageInfo.subText)}
          </span>
          <button
            className={`${styles.commonBtn} ${styles.linkBtn} ${styles.boldSm}`}
            onClick={onOrderFailure}
          >
            {t(orderFailurePageInfo.linktext)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;

function ShipmentItem({ shipment, index, shipmentLength, orderLink = "" }) {
  const { t } = useGlobalTranslation("translation");
  const getBags = (bags) => {
    return bags.filter(
      (bag) => Object.keys(bag?.parent_promo_bags)?.length === 0,
    );
  };

  const isShipmentCancelled = shipment?.shipment_status?.value === "cancelled";

  return (
    <div className={styles.shipmentItem} key={index}>
      <div className={styles.shipmentItemHead}>
        <div>
          <p
            className={styles.shipmentNumber}
          >{`${t("resource.common.shipment")} ${
            index + 1
          } / ${shipmentLength}`}</p>
          <h5 style={{ marginTop: "8px" }}>{shipment?.shipment_id}</h5>
        </div>
        <div
          className={styles.statusWrapper}
          style={{
            ...(isShipmentCancelled && {
              background: shipment?.shipment_status?.hex_code,
              color: "#fff",
            }),
          }}
        >
          {t("resource.order.status")}:{" "}
          <span>{shipment?.shipment_status?.title}</span>
        </div>
        <div
          className={styles.statusWrapperMobile}
          style={{
            ...(isShipmentCancelled && {
              background: shipment?.shipment_status?.hex_code,
              color: "#fff",
            }),
          }}
        >
          {shipment?.shipment_status?.title}
        </div>
      </div>
      <div className={styles.shipmentItemItemsData}>
        {getBags(shipment?.bags)?.map((item, index) => (
          <div className={styles.shipmentProdItemWrapper}>
            <ProductItem product={item} key={index} orderLink={orderLink} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductItem({ product, orderLink = "" }) {
  const { t } = useGlobalTranslation("translation");
  const markedPriceCheck = product?.prices?.price_marked;
  const effectivePriceCheck = product?.prices?.price_effective;

  const getMarkedPrice = (item) => numberWithCommas(item?.prices?.price_marked);
  const getEffectivePrice = (item) =>
    numberWithCommas(item?.prices?.price_effective);

  function getItem(bag) {
    let bagItem = { ...bag };
    if (bagItem.applied_promos) {
      bagItem.promotions_applied = bagItem.applied_promos;
      delete bagItem.applied_promos;
    }
    return bagItem;
  }

  return (
    <FDKLink to={orderLink}>
      <div className={styles.shipmentProdItem}>
        <div className={styles.prodImg}>
          <img src={product.item.image[0]} alt={product?.item?.name} />
        </div>
        <div className={styles.prodItemData}>
          <div className={styles.productDetails}>
            <div className={styles.brandName}>{product?.item?.brand?.name}</div>
            <div className={styles.productName}>{product?.item?.name}</div>
            <div className={styles.sizeInfo}>
              <div className={styles.sizeQuantity}>
                <div className={styles.size}>
                  {t("resource.common.size")}: &nbsp;
                  {product?.item?.size}
                </div>
                <div className={styles.sizeQuantity}>
                  {t("resource.common.qty")}:&nbsp;
                  {product?.quantity}
                </div>
              </div>
            </div>
            <div className={styles.paymentInfo}>
              {effectivePriceCheck > 0 && (
                <div className={styles.effectivePrice}>
                  {`${product?.prices?.currency_symbol}${getEffectivePrice(
                    product,
                  )}`}
                </div>
              )}
              {markedPriceCheck > 0 &&
                effectivePriceCheck !== markedPriceCheck && (
                  <div className={styles.markedPrice}>
                    {`${product?.prices?.currency_symbol}${getMarkedPrice(product)}`}
                  </div>
                )}
            </div>

            {/* Gift Wrap Display UI */}
            {product?.meta?.gift_card?.is_gift_applied && (
              <div className={styles["gift-wrap"]}>
                <input
                  type="checkbox"
                  id={product.id}
                  disabled={product}
                  checked={product?.meta?.gift_card?.is_gift_applied}
                />
                <label htmlFor={product?.id}>
                  {t("resource.order.gift_wrap_added")}
                </label>
              </div>
            )}
            {/* Show Free Gifts  Desktop */}
            {getItem(product)?.promotions_applied?.length > 0 && (
              <div className={styles["desktop-free-gift"]}>
                <CartGiftItem bagItem={getItem(product)}></CartGiftItem>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Show Free Gifts  Mobile */}
      {getItem(product)?.promotions_applied?.length > 0 && (
        <div className={styles["mobile-free-gift"]}>
          <CartGiftItem bagItem={getItem(product)}></CartGiftItem>
        </div>
      )}
    </FDKLink>
  );
}
