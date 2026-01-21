import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./order-tracking-details.less";
import EmptyState from "../../components/empty-state/empty-state";
import OrderShipment from "../../components/order-shipment/order-shipment";
import ShipmentItem from "../../components/shipment-item/shipment-item";
import ShipmentTracking from "../../components/shipment-tracking/shipment-tracking";
import ShipmentBreakup from "../../components/shipment-breakup/shipment-breakup";
import { useGlobalTranslation, useNavigate } from "fdk-core/utils";
// import FyButton from "../../components/core/fy-button/fy-button";
// import FyInput from "../../components/core/fy-input/fy-input";
import Loader from "../../components/loader/loader";
// import PaymentLinkSuccess from "../../assets/images/payment-link-success.svg";
import { priceFormatCurrencySymbol } from "../../helper/utils";

function OrderTrackingDetails({
  invoiceDetails,
  isLoading,
  orderShipments,
  getShipmentDetails,
  selectedShipment,
  isShipmentLoading,
  linkOrderDetails,
  availableFOCount,
}) {
  const { t } = useGlobalTranslation("translation");
  const params = useParams();
  const [orderId, setOrderId] = useState(params.orderId);
  const [showError, setShowError] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedShipmentBag, setSelectedShipmentBag] =
    useState(orderShipments);
  const navigate = useNavigate();
  const [isFocussed, setIsFocussed] = useState(false);

  const trackOrder = () => {
    setShowError(false);
    if (orderId.length <= 10) {
      setShowError(true);
      return;
    }
    navigate(`/order-tracking/${orderId}`);
  };

  const toggelInit = (item) => {
    navigate(`/profile/orders/shipment/${selectedShipmentBag?.shipment_id}`);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPaymentLinkPage = queryParams.get("is_payment_link_page") === "True";

  useEffect(() => {
    getShipmentDetails();
    return () => {};
  }, [params?.shipmentId]);
  useEffect(() => {
    setSelectedShipmentBag(selectedShipment);
    return () => {};
  }, [selectedShipment]);
  useEffect(() => {
    if (params?.shipmentId) {
      setSelectedShipmentBag(selectedShipment);
    } else {
      setSelectedShipmentBag(orderShipments?.shipments?.[0]);
    }
    return () => {};
  }, [orderShipments?.shipments]);

  const getBag = () => {
    return selectedShipmentBag?.bags;
  };
  const getSlicedGroupedShipmentBags = () => {
    return selectedShipmentBag?.bags?.slice(
      0,
      show ? selectedShipmentBag?.bags?.length : 1 * 2
    );
  };
  const showMore = () => {
    setShow(true);
  };
  const showLess = () => {
    setShow(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-10">
      {!isPaymentLinkPage ? (
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 py-6 md:py-6">
            <div className="flex flex-col gap-2 w-full md:w-[350px]">
              <input
                type="text"
                value={orderId}
                placeholder="ENTER ORDER ID"
                maxLength="20"
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                onFocus={() => setIsFocussed(true)}
                onBlur={() => setIsFocussed(false)}
                className={`w-full bg-[#F7F7F5] text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8 border border-solid outline-none focus:outline-none focus-visible:outline-none px-2 uppercase ${
                  showError
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
                style={{
                  border: showError ? "1px solid #5C2E20" : "1px solid #EEEEEE",
                }}
              />
              {showError && (
                <p className="text-[#5c2e20] text-[11px] font-normal leading-[13.2px]">
                  {t("resource.order.invalid_order_id")}
                </p>
              )}
            </div>
            <button
              onClick={trackOrder}
              className="w-full md:w-auto h-6 text-[11px] font-normal leading-[13.2px] uppercase px-6 text-left"
              style={{
                backgroundColor: "#000",
                color: "#f7f7f5",
                cursor: "pointer",
              }}
            >
              {t("resource.order.track_order_caps")}
            </button>
          </div>
          {(Object.keys(orderShipments)?.length === 0 ||
            orderShipments?.shipments?.length === 0) &&
            !isShipmentLoading &&
            !isLoading && (
              <div className="bg-[#f8f8f8] flex flex-col items-center justify-center p-5 min-h-[75vh]">
                <EmptyState></EmptyState>
              </div>
            )}
          {Object.keys(orderShipments)?.length !== 0 &&
            orderShipments?.shipments?.length !== 0 && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full px-0 md:px-0">
                  <OrderShipment
                    orderInfo={orderShipments}
                    isBuyAgainEligible={false}
                    availableFOCount={availableFOCount}
                  ></OrderShipment>
                </div>
                {isShipmentLoading ? (
                  <Loader />
                ) : (
                  <div className="px-0 md:px-6 border-l-0 md:border-l border-[#d4d1d1] min-w-full md:min-w-[352px] md:max-w-[352px]">
                    <div className="w-full flex flex-col relative my-4 gap-4 px-4 md:px-0">
                      {getSlicedGroupedShipmentBags()?.map((item, index) => (
                        <ShipmentItem
                          key={item.item.brand.name + index}
                          bag={item}
                          shipment={{
                            traking_no: selectedShipmentBag?.traking_no,
                            track_url: selectedShipmentBag?.track_url,
                          }}
                          type="tracking"
                        />
                      ))}
                    </div>
                    {getBag() && getBag().length > 2 && (
                      <div className="px-4 md:px-0">
                        {!show && (
                          <div
                            className="text-center pr-[30px] pt-[5px] cursor-pointer text-sm font-medium text-[#26201a] hover:text-[#71653a]"
                            onClick={showMore}
                          >
                            {`+${getBag().length - 2} ${t("resource.facets.view_more_lower")}`}
                          </div>
                        )}
                        {show && (
                          <div
                            className="text-center pr-[30px] pt-[5px] cursor-pointer text-sm font-medium text-[#26201a] hover:text-[#71653a]"
                            onClick={showLess}
                          >
                            {t("resource.facets.view_less_lower")}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="rounded border border-[#d4d1d1] my-4">
                      <ShipmentTracking
                        tracking={selectedShipmentBag?.tracking_details}
                        shipmentInfo={selectedShipmentBag || {}}
                        changeinit={toggelInit}
                        invoiceDetails={invoiceDetails}
                      ></ShipmentTracking>
                    </div>
                    <div className="rounded border-t border-b md:border border-[#d4d1d1] my-4 md:my-4 mx-0 md:mx-0">
                      <ShipmentBreakup
                        fpi={fpi}
                        type="tracking"
                        breakup={selectedShipmentBag?.breakup_values}
                        shipmentInfo={selectedShipmentBag}
                      ></ShipmentBreakup>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      ) : (
        <div className="mx-auto w-full md:w-[381px]">
          <div className="flex h-[274px] p-4 flex-col justify-center items-center gap-3 mb-2">
            {/* <PaymentLinkSuccess /> */}
            <h2 className="text-[#26201a] text-center text-base font-bold leading-[140%] w-full">
              {t("resource.payment_link.success_text")}
            </h2>
          </div>
          <div className="flex p-4 flex-col justify-center items-start gap-3">
            <div className="flex items-center gap-3 w-full">
              <p className="text-[#26201a] text-sm font-normal leading-[140%] flex-1">
                {" "}
                {t("resource.payment_link.order_id")}
              </p>
              <h2 className="text-[#26201a] text-sm font-semibold leading-[140%]">
                {linkOrderDetails?.orderId}
              </h2>
            </div>
            <div className="flex items-center gap-3 w-full">
              <p className="text-[#26201a] text-sm font-normal leading-[140%] flex-1">
                {t("resource.common.amount")}
              </p>
              <h2 className="text-[#26201a] text-sm font-semibold leading-[140%]">
                {priceFormatCurrencySymbol(
                  linkOrderDetails?.amount?.currency_symbol,
                  linkOrderDetails?.amount?.value
                )}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTrackingDetails;
