import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BlockRenderer } from "fdk-core/components";
// import ShipmentItem from "@gofynd/theme-template/components/shipment-item/shipment-item";
// import "@gofynd/theme-template/components/shipment-item/shipment-item.css";
import ShipmentItem from "../components/shipment-item/shipment-item";
// import ShipmentTracking from "@gofynd/theme-template/components/shipment-tracking/shipment-tracking";
// import "@gofynd/theme-template/components/shipment-tracking/shipment-tracking.css";
import ShipmentTracking from "../components/shipment-tracking/shipment-tracking";
import ShipmentBreakup from "../components/shipment-breakup/shipment-breakup";
// import ShipmentBreakup from "@gofynd/theme-template/components/shipment-breakup/shipment-breakup";
// import "@gofynd/theme-template/components/shipment-breakup/shipment-breakup.css";
// import ShipmentAddress from "@gofynd/theme-template/components/shipment-address/shipment-address";
// import "@gofynd/theme-template/components/shipment-address/shipment-address.css";
import ShipmentAddress from "../components/shipment-address/shipment-address";
// import PaymentDetailCard from "@gofynd/theme-template/components/payment-detail-card/payment-detail-card";
// import "@gofynd/theme-template/components/payment-detail-card/payment-detail-card.css";
import PaymentDetailCard from "../components/payment-detail-card/payment-detail-card";
import styles from "../page-layouts/profile/styles/profile-my-order-shipment-page.less";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import EmptyState from "../components/empty-state/empty-state";
import Loader from "../components/loader/loader";
import { useGlobalTranslation, useNavigate } from "fdk-core/utils";
import OrderDeliveryIcon from "../assets/images/order-delivery.svg";

const getStatusStyling = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case "cancelled":
      return { bg: "bg-[#5c2e20]", text: "text-[#dddace]" };
    case "cancelled by fynd":
      return { bg: "bg-[#5c2e20]", text: "text-[#dddace]" };
    default:
      return { bg: "bg-[#dddace]", text: "text-[#9b907d]" };
  }
};

export function Component({ blocks, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, shipmentDetails, invoiceDetails, getInvoice } =
    useShipmentDetails(fpi);
  const [initial, setInitial] = useState(true);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState("");
  const [goToLink, setGoToLink] = useState("");

  useEffect(() => {
    if (
      shipmentDetails?.shipment_id &&
      shipmentDetails?.show_download_invoice === true
    ) {
      getInvoice({
        shipmentId: shipmentDetails.shipment_id,
      });
    }
  }, [shipmentDetails?.shipment_id, shipmentDetails?.show_download_invoice]);

  const getBag = () => {
    return shipmentDetails?.bags;
  };

  const getSlicedGroupedShipmentBags = () => {
    return shipmentDetails?.bags?.slice(
      0,
      show ? shipmentDetails?.bags?.length : 1 * 2
    );
  };

  const toggelInit = (item) => {
    setInitial(!initial);
    setGoToLink(item.link);
  };

  const goToReasons = () => {
    if (shipmentDetails?.can_cancel || shipmentDetails?.can_return) {
      const querParams = new URLSearchParams(location.search);
      querParams.set("selectedBagId", selectId);
      navigate(
        goToLink + (querParams?.toString() ? `?${querParams.toString()}` : "")
      );
    }
  };

  const onselectreason = (id) => {
    setSelectId(id);
  };

  const btndisable = useMemo(() => {
    return !!selectId;
  }, [selectId]);

  const showMore = () => {
    setShow(true);
  };

  const showLess = () => {
    setShow(false);
  };

  const isVideo = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);

  return (
    <div className="w-full">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="basePageContainer">
          {!shipmentDetails && (
            <div className={`${styles.error}`}>
              <EmptyState
                title={t("resource.section.order.empty_state_title")}
                description={t("resource.section.order.empty_state_desc")}
                btnLink="/profile/orders"
                btnTitle={t("resource.section.order.emptybtn_title")}
              ></EmptyState>
            </div>
          )}
          <div className="w-full">
            {shipmentDetails && (
              <div className={`w-full ${styles.shipmentWrapper}`}>
                {blocks?.map((block, index) => {
                  const key = `${block.type}_${index}`;
                  switch (block.type) {
                    case "order_header":
                      return (
                        <div
                          className="w-full flex flex-row items-center gap-4 py-2 md:gap-2 justify-between"
                          key={key}
                        >
                          {/* <div className="flex items-center justify-center">
                            <OrderDeliveryIcon />
                          </div>
                          <div className="body-1 flex-1">
                            {shipmentDetails?.shipment_id}
                          </div> */}
                          <div className="subheading-3">
                            {t("resource.common.shipment")}:{" "}
                            {shipmentDetails?.shipment_id}
                          </div>
                          {shipmentDetails?.shipment_status &&
                            (() => {
                              const styling = getStatusStyling(
                                shipmentDetails?.shipment_status?.title
                              );
                              return (
                                <div
                                  className={`inline-flex flex-col items-center p-1 relative ${styling.bg}`}
                                >
                                  <span
                                    className={`relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal ${styling.text} text-[10px] text-center tracking-[0.40px] leading-[12.0px] whitespace-nowrap uppercase`}
                                  >
                                    {shipmentDetails?.shipment_status.title}
                                  </span>
                                </div>
                              );
                            })()}
                        </div>
                      );

                    case "shipment_items":
                      return (
                        <React.Fragment key={key}>
                          <div className={`${styles.shipmentBagItem}`}>
                            {getSlicedGroupedShipmentBags()?.map(
                              (item, index) => (
                                <div
                                  key={item.item.brand.name + index}
                                  className={
                                    !(item.can_cancel || item.can_return)
                                      ? `${styles.updateDisable}`
                                      : ""
                                  }
                                >
                                  <ShipmentItem
                                    key={item.item.brand.name + index}
                                    bag={item}
                                    initial={initial}
                                    onChangeValue={onselectreason}
                                    shipment={{
                                      traking_no: shipmentDetails?.traking_no,
                                      track_url: shipmentDetails?.track_url,
                                    }}
                                    deliveryAddress={
                                      shipmentDetails?.delivery_address
                                    }
                                    selectId={selectId}
                                    type="my-orders"
                                  ></ShipmentItem>
                                </div>
                              )
                            )}
                          </div>
                          {getBag()?.length > 2 && (
                            <div>
                              {!show && (
                                <div
                                  className="text-center pr-8 pt-1 cursor-pointer body-3 text-ekke-black underline"
                                  onClick={showMore}
                                >
                                  {`+ ${getBag().length - 2} ${t("resource.facets.view_more_lower")}`}
                                </div>
                              )}
                              {show && (
                                <div
                                  className="text-center pr-8 pt-1 cursor-pointer body-3 text-ekke-black underline"
                                  onClick={showLess}
                                >
                                  {t("resource.facets.view_less")}
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      );

                    case "shipment_medias":
                      return (
                        !!shipmentDetails?.return_meta?.images?.length && (
                          <div
                            className="rounded border border-neutral-lighter my-4 md:my-2 md:border-t md:border-b md:border-x-0 md:rounded-none"
                            key={key}
                          >
                            <div className="p-4">
                              <div className="subheading-4 mb-4">
                                {t("resource.order.uploaded_media")}
                              </div>
                              <ul className="flex gap-6 flex-wrap">
                                {shipmentDetails.return_meta.images.map(
                                  (file, index) => (
                                    <li
                                      key={index}
                                      className="relative w-fit flex"
                                    >
                                      {isVideo(file.url) ? (
                                        <video
                                          className="w-[120px] h-[120px] rounded object-cover object-center"
                                          src={file.url}
                                        />
                                      ) : (
                                        <img
                                          className="w-[120px] h-[120px] rounded object-cover object-center"
                                          src={file.url}
                                          alt={file.desc}
                                        />
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )
                      );
                    case "shipment_tracking":
                      return (
                        initial && (
                          <div
                            className="rounded border border-neutral-lighter my-4 md:my-2 md:border-t md:border-b md:border-x-0 md:rounded-none"
                            key={key}
                          >
                            <ShipmentTracking
                              tracking={shipmentDetails?.tracking_details}
                              shipmentInfo={shipmentDetails}
                              changeinit={toggelInit}
                              invoiceDetails={invoiceDetails}
                            ></ShipmentTracking>
                          </div>
                        )
                      );

                    case "shipment_address":
                      return (
                        initial && (
                          <div
                            className="rounded border border-neutral-lighter my-4 md:my-2 md:border-t md:border-b md:border-x-0 md:rounded-none"
                            key={key}
                          >
                            <ShipmentAddress
                              address={shipmentDetails?.delivery_address}
                            ></ShipmentAddress>
                          </div>
                        )
                      );

                    case "payment_details_card":
                      return (
                        initial &&
                        shipmentDetails?.payment_info?.length > 0 && (
                          <div
                            className="rounded border border-neutral-lighter my-4 md:my-2 md:border-t md:border-b md:border-x-0 md:rounded-none"
                            key={key}
                          >
                            <PaymentDetailCard
                              breakup={shipmentDetails?.breakup_values}
                              paymentDetails={shipmentDetails?.payment_info}
                            />
                          </div>
                        )
                      );

                    case "shipment_breakup":
                      return (
                        initial && (
                          <div
                            className="rounded border border-neutral-lighter my-4 md:my-2 md:border-t md:border-b md:border-x-0 md:rounded-none"
                            key={key}
                          >
                            <ShipmentBreakup
                              fpi={fpi}
                              breakup={shipmentDetails?.breakup_values}
                              shipmentInfo={shipmentDetails}
                            ></ShipmentBreakup>
                          </div>
                        )
                      );

                    case "extension-binding":
                      return <BlockRenderer block={block} key={key} />;

                    default:
                      return (
                        <h1 key={key}>{t("resource.common.invalid_block")}</h1>
                      );
                  }
                })}
              </div>
            )}
          </div>

          {!initial && (
            <div className="flex justify-center pt-3 px-2">
              <div className="w-full flex justify-center mt-4 gap-2.5 md:mt-0 md:gap-3 md:px-4">
                <button
                  type="button"
                  className="body-1 text-center py-4 px-4 w-full transition-colors md:m-0"
                  onClick={() => setInitial(!initial)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    border: "1px solid #000000",
                    cursor: "pointer",
                    borderRadius: "1px",
                  }}
                >
                  {t("resource.facets.cancel")}
                </button>
                <button
                  type="button"
                  className="body-1 text-center py-4 px-4 w-full transition-colors md:m-0"
                  disabled={!btndisable}
                  onClick={goToReasons}
                  style={{
                    backgroundColor: btndisable ? "#000000" : "#EEEEEE",
                    color: btndisable ? "#F7F7F5" : "#AAAAAA",
                    cursor: btndisable ? "pointer" : "not-allowed",
                    border: "1px solid #000000",
                    borderRadius: "1px",
                  }}
                >
                  {t("resource.common.continue")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.order_details.order_details",
  props: [],
  blocks: [
    {
      type: "order_header",
      name: "t:resource.sections.order_details.order_header",
      props: [],
    },
    {
      type: "shipment_items",
      name: "t:resource.sections.order_details.shipment_items",
      props: [],
    },
    {
      type: "shipment_medias",
      name: "t:resource.sections.order_details.shipment_medias",
      props: [],
    },
    {
      type: "shipment_tracking",
      name: "t:resource.sections.order_details.shipment_tracking",
      props: [],
    },
    {
      type: "shipment_address",
      name: "t:resource.sections.order_details.shipment_address",
      props: [],
    },
    {
      type: "payment_details_card",
      name: "t:resource.sections.order_details.payment_details_card",
      props: [],
    },
    {
      type: "shipment_breakup",
      name: "t:resource.sections.order_details.shipment_breakup",
      props: [],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.order_details.order_header",
      },
      {
        name: "t:resource.sections.order_details.shipment_items",
      },
      {
        name: "t:resource.sections.order_details.shipment_medias",
      },
      {
        name: "t:resource.sections.order_details.shipment_tracking",
      },
      {
        name: "t:resource.sections.order_details.shipment_address",
      },
      {
        name: "t:resource.sections.order_details.payment_details_card",
      },
      {
        name: "t:resource.sections.order_details.shipment_breakup",
      },
    ],
  },
};
export default Component;
