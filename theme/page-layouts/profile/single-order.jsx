import React from "react";
import { convertUTCDateToLocalDate, formatLocale } from "../../helper/utils";
import { useGlobalStore, useFPI } from "fdk-core/utils";

// Helper function to get status styling based on shipment status
const getStatusStyling = (status) => {
  const statusLower = status?.toLowerCase();

  switch (statusLower) {
    case "cancelled":
      return { bg: "bg-[#5c2e20]", text: "text-[#dddace]" };
    case "delivered":
      return { bg: "bg-[#4ade80]", text: "text-white" };
    case "shipped":
      return { bg: "bg-[#3b82f6]", text: "text-white" };
    case "pending":
    case "processing":
    default:
      return { bg: "bg-[#dddace]", text: "text-[#9b907d]" };
  }
};

// Helper function to transform API order data to display format
const transformOrderData = (apiOrders, locale, countryCode) => {
  if (!apiOrders?.items) return [];

  return apiOrders.items.map((order) => ({
    orderId: order.order_id,
    orderCreatedTime: order.order_created_time,
    totalShipments: order.total_shipments_in_order,
    shipments:
      order.shipments?.map((shipment, index) => {
        const styling = getStatusStyling(shipment.shipment_status?.title);
        const totalBags =
          shipment.bags?.reduce((sum, bag) => sum + (bag.quantity || 0), 0) ||
          0;

        return {
          shipmentId: shipment.shipment_id,
          status: [shipment.shipment_status?.title || "UNKNOWN"],
          statusBg: styling.bg,
          statusText: styling.text,
          shipmentInfo: `Shipment ${index + 1} of ${order.total_shipments_in_order}`,
          deliveryDate: shipment.delivery_date
            ? convertUTCDateToLocalDate(
                shipment.delivery_date,
                "",
                formatLocale(locale, countryCode),
              )
            : "TBD",
          productQuantity: totalBags.toString().padStart(2, "0"),
          bags: shipment.bags || [],
          firstProductImage:
            shipment.bags?.[0]?.item?.image?.[0] || "/product.svg",
          firstProductName: shipment.bags?.[0]?.item?.name || "Product",
          totalPrice: shipment.bags?.[0]?.prices?.price_effective || 0,
          currencySymbol: shipment.bags?.[0]?.prices?.currency_symbol || "€",
        };
      }) || [],
  }));
};

const orderPurchaseOptions = [
  { value: "online", label: "ONLINE" },
  { value: "in-store", label: "IN-STORE" },
];

const orderStatusOptions = [
  { value: "all", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "processing", label: "PROCESSING" },
  { value: "shipped", label: "SHIPPED" },
  { value: "delivered", label: "DELIVERED" },
  { value: "cancelled", label: "CANCELLED" },
];

export const SingleOrder = ({
  orderData,
  isLoading = false,
  fpi,
  onBackToList,
}) => {
  const [selectedOrderType, setSelectedOrderType] = React.useState("online");
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;

  // Transform API data to display format
  const transformedOrders = React.useMemo(() => {
    return transformOrderData(orderData, locale, countryCode);
  }, [orderData, locale, countryCode]);

  // Get latest order for "Last Order" section
  const latestOrder = React.useMemo(() => {
    if (!transformedOrders || transformedOrders.length === 0) return null;
    const sortedOrders = [...transformedOrders].sort(
      (a, b) => new Date(b.orderCreatedTime) - new Date(a.orderCreatedTime),
    );
    return sortedOrders[0];
  }, [transformedOrders]);

  // const lastOrderImgMap = React.useMemo(() => {
  //   if (!latestOrder) return [];
  //   return latestOrder.shipments.map((shipment) => shipment.firstProductImage);
  // }, [latestOrder]);

  const totalOrdersCount =
    orderData?.page?.item_total || transformedOrders.length;
  const latestOrderItemsCount = latestOrder
    ? latestOrder.shipments.reduce(
        (total, shipment) =>
          total +
          (shipment.bags?.reduce((sum, bag) => sum + (bag.quantity || 0), 0) ||
            0),
        0,
      )
    : 0;

  if (isLoading) {
    return (
      <div className="inline-flex flex-col items-center justify-center relative">
        <div className="flex items-center justify-center p-8">
          <div className="body-1">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center justify-center relative">
      <div className="relative bg-white" />

      <div className="flex items-start pb-0 px-0 relative bg-white">
        <div className="flex flex-col items-start relative">
          <p className="subheading-3">ORDERS</p>

          <div className="gap-6 pt-2 pb-6 px-2 rounded-[1px] flex flex-col items-start relative self-stretch w-full">
            {/* Last Order Section */}
            {latestOrder && (
              <section className="gap-3 flex flex-col items-start relative self-stretch w-full">
                <header className="flex items-center justify-between relative w-full">
                  <div className="flex items-start gap-2 relative">
                    <p className="body-1">LAST ORDER</p>
                  </div>

                  <div className="flex items-start justify-end gap-2.5 px-0 py-2 relative">
                    <div className="inline-flex items-center gap-2.5 relative">
                      <button
                        onClick={onBackToList}
                        className="body-3 underline hover:text-neutral-700"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </header>

                <div className="flex flex-col items-end gap-2 p-2 relative w-full bg-white border border-solid border-[#eeeeee]">
                  <div className="p-0 w-full">
                    <div className="flex items-center justify-between gap-2 w-full relative">
                      <div className="flex items-start gap-1 relative body-1">
                        <span>BUY AGAIN,</span>
                        <span className="text-[#aaaaaa]">
                          {latestOrderItemsCount} ITEMS
                        </span>
                      </div>

                      <div className="flex items-start justify-end gap-2.5 px-0 py-2 relative">
                        <div className="inline-flex items-center gap-2.5 relative">
                          <a className="body-3 !text-[#171717] underline hover:text-neutral-700 hover:no-underline">
                            See more
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="w-[65px]">
                      <img
                        className="relative w-full max-h-[74px]"
                        alt="Product"
                        src={
                          latestOrder.shipments?.[0]?.firstProductImage ||
                          "/product.svg"
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Order History Section */}
            <section className="gap-3 flex flex-col items-start relative w-full">
              <header className="flex items-center justify-between relative w-full">
                <div className="flex items-start gap-1 relative body-1">
                  <span>HISTORY,</span>
                  <span className="text-[#aaaaaa]">
                    {totalOrdersCount} ORDERS
                  </span>
                </div>

                <div className="flex items-start justify-end gap-2.5 px-0 py-2 relative">
                  <div className="inline-flex items-center gap-2.5 relative">
                    <button
                      onClick={onBackToList}
                      className="body-3 underline hover:text-neutral-700"
                    >
                      View all
                    </button>
                  </div>
                </div>
              </header>

              <div className="flex items-center justify-between relative w-full">
                <div className="flex md:items-center items-start gap-[18px] relative">
                  {orderPurchaseOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-1 relative"
                    >
                      <input
                        type="radio"
                        name="purchaseType"
                        value={option.value}
                        id={option.value}
                        checked={selectedOrderType === option.value}
                        onChange={(e) => setSelectedOrderType(e.target.value)}
                        className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                        style={{
                          border: "1px solid #5C2E20",
                          borderRadius: "1px",
                        }}
                      />
                      <label
                        htmlFor={option.value}
                        className="flex items-start gap-1 p-1 cursor-pointer"
                      >
                        <div className="body-1">{option.label}</div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2.5 relative">
                  <div className="flex items-center gap-2 relative">
                    <span className="body-1 !text-neutral-light">
                      ORDER DATE:
                    </span>
                    <select
                      defaultValue="recent"
                      className="body-1 py-[0.5px] leading-[normal]"
                    >
                      <option value="recent">RECENT</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <span className="body-1 !text-neutral-light">
                      ORDER STATUS:
                    </span>

                    <select
                      defaultValue="all"
                      className="body-1 py-[0.5px] leading-[normal]"
                    >
                      <option value="all">ALL STATUS</option>
                      {orderStatusOptions.slice(1).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 px-0 py-3 relative w-full">
                {transformedOrders.length === 0 ? (
                  <div className="flex items-center justify-center p-8 w-full">
                    <div className="body-1 text-neutral-light">
                      You have no past orders. Explore Now.
                    </div>
                  </div>
                ) : (
                  transformedOrders.map((order, orderIndex) => (
                    <div
                      key={order.orderId}
                      className="flex flex-col items-end gap-6 pt-2 pb-4 px-2 relative w-full bg-white border border-solid border-[#eeeeee]"
                    >
                      <div className="p-0 w-full flex flex-col gap-6">
                        <div className="flex items-center justify-between relative w-full">
                          <span className="body-1">
                            ORDER ID - {order.orderId}
                          </span>

                          <div className="flex items-start justify-end gap-2.5 px-0 py-2 relative">
                            <div className="inline-flex items-center gap-2.5 relative">
                              <a className="body-3 !text-[#171717] underline hover:text-neutral-700 hover:no-underline">
                                See more
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-6 relative self-stretch w-full">
                          <div className="flex flex-col items-start gap-[11px] relative">
                            {order.shipments.map((shipment, shipmentIndex) => (
                              <React.Fragment key={shipment.shipmentId}>
                                <div className="inline-flex items-start gap-1 relative">
                                  {shipment.status.map(
                                    (status, statusIndex) => (
                                      <div
                                        key={statusIndex}
                                        className={`inline-flex flex-col items-center p-1 relative ${shipment.statusBg} hover:${shipment.statusBg}`}
                                      >
                                        <span
                                          className={`relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal ${shipment.statusText} text-[10px] text-center tracking-[0.40px] leading-[12.0px] whitespace-nowrap`}
                                        >
                                          {status}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>

                                <div className="flex w-[332px] items-start gap-3 relative">
                                  <p className="body-3 !text-neutral-light">
                                    {shipment.shipmentInfo}
                                    <br />
                                    Delivery by : {shipment.deliveryDate}
                                  </p>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="inline-flex items-start gap-[11px] relative">
                            <div className="inline-flex gap-3 items-start relative">
                              <div className="flex flex-col items-start gap-2 relative">
                                <div className="w-[65px]">
                                  <img
                                    className="relative w-full max-h-[74px]"
                                    alt="Product"
                                    src={
                                      latestOrder.shipments?.[0]
                                        ?.firstProductImage || "/product.svg"
                                    }
                                  />
                                  <span className="body-2 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white">
                                    {order.shipments[0]?.productQuantity ||
                                      "01"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col w-[227px] gap-6 pl-0 pr-3 py-0 items-start relative">
                              <div className="inline-flex flex-col gap-2 items-start relative">
                                <span className="body-1">
                                  {order.shipments[0]?.firstProductName ||
                                    "BRAND/DESIGNER NAME"}
                                </span>

                                <span className="body-2 !text-neutral-light">
                                  Product detail info
                                </span>

                                <div className="inline-flex items-center justify-center gap-2 relative">
                                  <span className="body-2">
                                    {order.shipments[0]?.currencySymbol}{" "}
                                    {order.shipments[0]?.totalPrice}
                                  </span>

                                  {orderIndex === 0 && (
                                    <span className="body-2 !text-neutral-light line-through">
                                      {order.shipments[0]?.currencySymbol}{" "}
                                      {order.shipments[0]?.totalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
