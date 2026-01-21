/**
 * OrderShipment component is responsible for displaying and managing the shipment details of an order.
 * It provides functionalities to navigate to shipment details, toggle shipment visibility, and display product names and quantities.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.orderInfo - Contains information about the order, including shipments.
 * @param {Function} [props.onBuyAgainClick=() => {}] - Callback function to handle the "Buy Again" button click.
 * @param {boolean} props.isBuyAgainEligible - Indicates if the order is eligible for the "Buy Again" feature.
 *
 * @returns {JSX.Element} A React component that renders the shipment details of an order.
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./order-shipment.less";
import { convertUTCDateToLocalDate, formatLocale } from "../../helper/utils";
import {
  useNavigate,
  useGlobalStore,
  useFPI,
  useGlobalTranslation,
} from "fdk-core/utils";

import Accordion from "../accordion/accordion";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";

/**
 * Helper: Get all bags with customization (_custom_json._display)
 */
const getBagsWithCustomization = (bags = []) => {
  return bags.filter(
    (bag) =>
      bag.meta?._custom_json?._display &&
      bag.meta._custom_json._display.length > 0
  );
};

function getProductsName(bags) {
  let items = bags.map((it) => it.item).filter(Boolean);
  if (items && items.length) {
    const productNames = items.map((it) => it.name);
    return [...new Set(productNames)];
  }
  return [];
}

function getTotalItems(items, t) {
  return items === 1
    ? `${items} ${t("resource.common.item_simple_text")}`
    : `${items} ${t("resource.common.item_simple_text_plural")}`;
}

function getTotalPieces(pieces, t) {
  const total = pieces.reduce((pre, curr) => pre + curr.quantity, 0);
  return total === 1
    ? `${total} ${t("resource.common.single_piece")}`
    : `${total} ${t("resource.common.multiple_piece")}`;
}

const getCustomizationOptions = (orderInfo) => {
  if (!orderInfo?.shipments) return [];
  return orderInfo.shipments
    .flatMap((shipment) =>
      shipment.bags?.map((bag) => bag.meta?._custom_json?._display || []).flat()
    )
    .filter(Boolean);
};

const ShipmentDetails = ({
  item,
  isOpen,
  naivgateToShipment,
  isAdmin,
  t,
  availableFOCount,
  getTotalItems,
  getTotalPieces,
}) => {
  const [openAccordions, setOpenAccordions] = useState({});
  const customizationOptions = getCustomizationOptions({
    shipments: [item],
  });
  const shipmentItems = [
    {
      title: "Customization",
      content: customizationOptions,
      open: openAccordions[item.shipment_id] || false,
    },
  ];

  const handleShipmentAccordionClick = (shipmentId) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [shipmentId]: !prev[shipmentId],
    }));
  };
  return (
    <>
      <div
        className="border-t-0 my-4 p-0 cursor-pointer flex gap-4"
        key={item.shipment_id}
        onClick={() => naivgateToShipment(item)}
      >
        <div className="flex-shrink-0 w-20">
          <img
            className="w-full h-auto object-cover"
            src={item?.bags?.[0]?.item?.image?.[0]}
            alt={item?.shipment_images?.[0]}
          />
          {item?.bags?.length > 1 && (
            <div className="text-center relative bg-[#4242ad] text-white rounded-full w-[35px] h-[35px] flex items-center justify-center text-[13px] leading-[13px] p-2.5 -mt-10 ml-auto mr-[-10px]">
              +{item?.bags?.length - 1 + " "}
              {t("resource.facets.more")}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="body-1">
            {item?.bags?.length > 1 && customizationOptions.length < 1 ? (
              <div>
                {getProductsName(item?.bags)?.[0]} +{item.bags.length - 1 + " "}
                {t("resource.facets.more")}
              </div>
            ) : (
              <div>{getProductsName(item?.bags)?.[0]}</div>
            )}
          </div>
          <div className="my-1 body-2 text-[#aaaaaa]">
            {t("resource.common.shipment")}: {item?.shipment_id}
          </div>
          {availableFOCount > 1 && item?.fulfillment_option?.name && (
            <div className="my-1 body-2">{item?.fulfillment_option?.name}</div>
          )}
          <div className="text-[#7d7676] text-xs font-medium leading-[140%]">
            <span>{getTotalItems(item?.bags?.length, t)}</span>
            <span>{` | `}</span>
            <span>{getTotalPieces(item?.bags, t)}</span>
          </div>
          <div className="px-2 py-1 text-[10px] font-normal uppercase tracking-[0.40px] leading-[12px] bg-[#dddace] text-[#9B907D] w-fit mt-2">
            {item?.shipment_status?.title}
          </div>
          {isAdmin && (
            <div className="text-[#26201a] text-xs font-medium leading-[140%] no-underline mt-1">
              <span className="font-bold">{t("resource.common.brand")}</span>:
              {item?.brand_name}
            </div>
          )}
        </div>
      </div>
      {customizationOptions.length > 0 && (
        <div className="mt-2">
          <Accordion
            key={`${item.shipment_id}`}
            items={shipmentItems}
            onItemClick={() => handleShipmentAccordionClick(item.shipment_id)}
          />
        </div>
      )}
    </>
  );
};

function OrderShipment({
  orderInfo,
  onBuyAgainClick = () => {},
  isBuyAgainEligible,
  availableFOCount,
}) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const [isOpen, setIsOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params?.orderId) {
      setSelectedShipment(orderInfo?.shipments[0]?.shipment_id);
    }
  }, [params?.orderId, orderInfo?.shipments]);

  const getTime = (time) => {
    return convertUTCDateToLocalDate(
      time,
      "",
      formatLocale(locale, countryCode)
    );
  };
  const clickopen = () => {
    setIsOpen(!isOpen);
  };
  const naivgateToShipment = (item) => {
    let link = "";
    setSelectedShipment(item?.shipment_id);
    if (isBuyAgainEligible) {
      link = `/profile/orders/shipment/${item?.shipment_id}`;
    } else {
      link = `/order-tracking/${item?.order_id}/${item?.shipment_id}`;
    }
    navigate(link);
  };

  return (
    <div className="p-4 rounded mb-4" key={orderInfo?.order_id}>
      <div className="cursor-pointer relative" onClick={clickopen}>
        <div>
          <div className="subheading-4">{orderInfo?.order_id}</div>
          <div className="text-[#7d7676] text-xs font-normal leading-[140%] mt-1">
            {getTime(orderInfo?.order_created_ts)}
          </div>
        </div>
        <div className="absolute right-0 top-0">
          <SvgWrapper
            className={isOpen ? "transform rotate-180" : ""}
            svgSrc="dropdown"
          />
        </div>
      </div>

      <div className={isOpen ? "block" : "hidden"}>
        {Object.keys(orderInfo)?.length !== 0 &&
          orderInfo?.shipments?.length !== 0 &&
          orderInfo?.shipments?.map((item) => {
            // Main: if bagsWithCustomization exist, render them individually. Else, render the shipment
            const bagsWithCustomization = getBagsWithCustomization(item.bags);

            return (
              <React.Fragment key={item.shipment_id}>
                {bagsWithCustomization.length > 0 ? (
                  bagsWithCustomization.map((el, idx) => (
                    <ShipmentDetails
                      key={item.shipment_id + "-custom-" + idx}
                      item={{
                        ...item,
                        bags: [el], // Only show this bag
                      }}
                      isOpen={isOpen}
                      naivgateToShipment={naivgateToShipment}
                      isAdmin={isAdmin}
                      t={t}
                      availableFOCount={availableFOCount}
                      getTotalItems={getTotalItems}
                      getTotalPieces={getTotalPieces}
                    />
                  ))
                ) : (
                  <ShipmentDetails
                    key={item.shipment_id}
                    item={item}
                    isOpen={isOpen}
                    naivgateToShipment={naivgateToShipment}
                    isAdmin={isAdmin}
                    t={t}
                    availableFOCount={availableFOCount}
                    getTotalItems={getTotalItems}
                    getTotalPieces={getTotalPieces}
                  />
                )}
              </React.Fragment>
            );
          })}
        {isBuyAgainEligible && (
          <div className="flex mt-4">
            <button
              type="button"
              className="w-full h-10 rounded-none font-bold bg-[#26201a] border-none flex items-center justify-center text-base text-center text-white cursor-pointer"
              onClick={() => onBuyAgainClick(orderInfo)}
            >
              <SvgWrapper
                className="mr-2.5 relative -top-0.5"
                svgSrc="reorder"
              />
              {t("resource.common.buy_again")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderShipment;
