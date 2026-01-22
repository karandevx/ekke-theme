import React, { useState, useMemo, useEffect, useRef } from "react";
import Slider from "react-slick";
import { useLocation } from "react-router-dom";
import { convertUTCDateToLocalDate, formatLocale } from "../../helper/utils";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import { SingleOrder } from "./single-order";
import OrderDetailModal from "./order-detail-modal";
import MediaDisplay from "../../components/media-display";

const getStatusStyling = (status) => {
  const statusLower = status?.toLowerCase();

  // Check if status contains "cancelled" (covers all cancelled variations)
  if (statusLower?.includes("cancelled")) {
    return { bg: "bg-[#5c2e20]", text: "text-[#dddace]" };
  }

  // Add more status cases as needed
  // case "delivered":
  //   return { bg: "bg-[#4ade80]", text: "text-white" };
  // case "shipped":
  //   return { bg: "bg-[#3b82f6]", text: "text-white" };

  // Default styling for all other statuses
  return { bg: "bg-[#dddace]", text: "text-[#9b907d]" };
};

// const orderPurchaseOptions = [
//   { value: "online", label: "ONLINE" },
//   { value: "in-store", label: "IN-STORE" },
// ];

// Date filter options with integer values (days)
const DATE_FILTERS = [
  { display: "ALL", value: null, is_selected: false },
  { display: "1 WEEK", value: 7, is_selected: false },
  { display: "LAST MONTH", value: 30, is_selected: false },
  { display: "LAST 3 MONTHS", value: 90, is_selected: false },
  { display: "LAST 6 MONTHS", value: 180, is_selected: false },
];

// Order card component
const OrderCard = ({
  order,
  shipment,
  shipmentIndex,
  locale,
  countryCode,
  onOrderClick,
}) => {
  const getTime = (time) => {
    return convertUTCDateToLocalDate(
      time,
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
      formatLocale(locale, countryCode),
    );
  };

  const firstBag = shipment?.bags?.[0];
  const styling = getStatusStyling(shipment?.shipment_status?.title);
  const totalItems =
    shipment?.bags?.reduce((sum, bag) => sum + (bag.quantity || 0), 0) || 0;

  console.log("Order log", order);
  console.log("Shipment log", shipment);

  return (
    <div className="flex flex-col items-end gap-6 pt-2 md:pb-4 pb-2 px-2 relative w-full bg-white border border-solid border-[#eeeeee]">
      <div className="p-0 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between relative w-full py-2">
          <span className="body-1">ORDER ID - {order.order_id}</span>
          <div className="flex items-start justify-end gap-2.5 px-0 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderClick(order);
              }}
              className="body-3 !text-[#171717] underline hover:text-neutral-700 cursor-pointer hover:no-underline"
            >
              See more
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 relative self-stretch w-full">
          <div className="flex flex-col items-start gap-[11px] relative">
            <div className="inline-flex items-start gap-1 relative">
              <div
                className={`inline-flex flex-col items-center p-1 relative ${styling.bg}`}
              >
                <span
                  className={`relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal ${styling.text} text-[10px] text-center tracking-[0.40px] leading-[12.0px] whitespace-nowrap uppercase`}
                >
                  {shipment?.shipment_status?.title || "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="flex w-[332px] items-start gap-3 relative">
              <p className="body-3 !text-neutral-light">
                Shipment {shipmentIndex + 1} of{" "}
                {order.total_shipments_in_order || 1}
                <br />
                Delivery by :{" "}
                {shipment?.promise?.timestamp?.max
                  ? getTime(shipment.promise.timestamp.max)
                  : shipment?.delivery_date
                    ? getTime(shipment.delivery_date)
                    : "-"}
              </p>
            </div>
          </div>

          <div className="inline-flex items-start gap-[11px] relative">
            <div className="inline-flex gap-3 items-start relative">
              <div className="flex flex-col items-start gap-2 relative">
                <div className="w-[65px] relative">
                  <img
                    className="relative w-full max-h-[74px] object-cover"
                    alt="Product"
                    src={firstBag?.item?.image?.[0] || "/product.svg"}
                  />
                  <span className="body-2 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                    {totalItems.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-[227px] gap-6 pl-0 pr-3 py-0 items-start relative">
              <div className="inline-flex flex-col gap-2 items-start relative">
                <span className="body-1 whitespace-nowrap">
                  {firstBag?.item?.brand?.name || "BRAND/DESIGNER NAME"}
                </span>
                <span className="body-3 !text-neutral-light">
                  {firstBag?.item?.name || "Product name"}
                </span>
                <div className="inline-flex items-center justify-center gap-2 relative">
                  <span className="body-3 text-[#171717]">
                    {firstBag?.prices?.currency_symbol || "€"}
                    {firstBag?.prices?.price_effective || 888}
                  </span>
                  <span className="body-3 !text-neutral-light line-through">
                    {firstBag?.prices?.currency_symbol || "€"}
                    {firstBag?.prices?.price_marked || 888}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export const ProfileOrderPage = ({
  orderData,
  isLoading = false,
  fpi,
  onBuyAgainClick,
  // Props for Platform API status filter (controlled by parent)
  statusFilterOptions = [],
  selectedStatusFilter = null,
  onStatusFilterChange = null,
  // Props for Platform API date filter (controlled by parent)
  selectedDateFilter = null,
  onDateFilterChange = null,
}) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const [selectedOrderType, setSelectedOrderType] = useState("online");
  const [currentPage, setCurrentPage] = useState(1);
  // State for single order view
  // const [showSingleOrder, setShowSingleOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOrderData, setModalOrderData] = useState(null);

  // Custom dropdown states
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedOrderDate, setSelectedOrderDate] = useState(null);

  // Refs for click-outside handling
  const dateDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const location = useLocation();

  // Sync date filter with URL params on mount and when URL changes
  // Only sync from URL when NOT in Platform API mode (when onDateFilterChange is not provided)
  useEffect(() => {
    // Skip URL sync when parent controls filtering via callback
    if (onDateFilterChange) {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const dateFilter = searchParams.get("selected_date_filter");

    // Set date filter from URL
    if (dateFilter) {
      setSelectedOrderDate(Number(dateFilter));
    } else {
      setSelectedOrderDate(null);
    }
  }, [location.search, onDateFilterChange]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setShowDateDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get the current date filter value - use prop if available, otherwise local state
  const getCurrentDateFilterValue = () => {
    // If parent controls date filter via callback (Platform API mode), use the prop
    if (onDateFilterChange) {
      return selectedDateFilter;
    }
    // Otherwise use local state
    return selectedOrderDate;
  };

  // Get date filter options with is_selected based on current selection
  const getDateFilterOptions = () => {
    const currentValue = getCurrentDateFilterValue();
    return DATE_FILTERS.map((dateObj) => ({
      ...dateObj,
      is_selected: dateObj.value === currentValue,
    }));
  };

  // Get selected date filter display label
  const getSelectedDateFilterLabel = () => {
    const selected = getDateFilterOptions().find((obj) => obj.is_selected);

    console.log("selected", selected);
    return selected?.display || "ALL";
  };

  // Get status filter options - use props from parent (Platform API) or fallback to orderData
  const getStatusFilterOptions = () => {
    // Use props from parent if available (Platform API filtering)
    if (statusFilterOptions && statusFilterOptions.length > 0) {
      return statusFilterOptions.map((statusObj) => ({
        ...statusObj,
        is_selected: selectedStatusFilter?.value === statusObj.value,
      }));
    }

    // Fallback to orderData filters if no props provided
    if (!orderData?.filters?.statuses) {
      return [];
    }

    // Map status options and convert "All Status" value to null
    const statusOptions = orderData.filters.statuses.map((statusObj) => {
      const isAllStatus = statusObj.display
        ?.toLowerCase()
        .includes("all status");

      return {
        ...statusObj,
        value: isAllStatus ? null : statusObj.value,
        is_selected: isAllStatus
          ? selectedStatusFilter?.value === null
          : statusObj.value === selectedStatusFilter?.value,
      };
    });

    return statusOptions;
  };

  // Get selected status filter display label
  const getSelectedStatusFilterLabel = () => {
    // Use selectedStatusFilter prop if available
    if (selectedStatusFilter) {
      return selectedStatusFilter.display || "ALL";
    }
    return "ALL";
  };

  // Handle date filter change - call parent callback to trigger Platform API
  const handleDateFilterChange = (dateValue) => {
    setSelectedOrderDate(dateValue);
    setShowDateDropdown(false);

    // If parent callback provided (Platform API mode), use it
    if (onDateFilterChange) {
      onDateFilterChange(dateValue);
      return;
    }

    // Fallback: Update URL params (legacy GraphQL mode)
    const searchParams = new URLSearchParams(window.location.search);
    if (dateValue === null) {
      searchParams.delete("selected_date_filter");
    } else {
      searchParams.set("selected_date_filter", dateValue);
    }
    navigate(`${window.location.pathname}?${searchParams.toString()}`);
  };

  // Handle status filter change - call parent callback to trigger Platform API
  const handleStatusFilterChange = (statusOption) => {
    setShowStatusDropdown(false);

    // If parent callback provided (Platform API mode), use it
    if (onStatusFilterChange) {
      onStatusFilterChange(statusOption);
      return;
    }

    // Fallback: Update URL params (legacy GraphQL mode)
    const searchParams = new URLSearchParams(window.location.search);
    if (statusOption?.value === null) {
      searchParams.delete("status");
    } else {
      searchParams.set("status", statusOption?.value);
    }
    navigate(`${window.location.pathname}?${searchParams.toString()}`);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const transformOrderForModal = (order) => {
    if (!order) return null;

    return {
      orderId: order.order_id,
      shipments:
        order.shipments?.map((shipment, index) => ({
          id: shipment.shipment_id || `shipment-${index}`,
          status: [shipment.shipment_status?.title || "Unknown"],
          shipmentNumber: index + 1,
          totalShipments:
            order.total_shipments_in_order || order.shipments.length,
          deliveryDate: shipment.promise?.timestamp?.max
            ? convertUTCDateToLocalDate(
                shipment.promise.timestamp.max,
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                },
                formatLocale(locale, countryCode),
              )
            : shipment.delivery_date
              ? convertUTCDateToLocalDate(
                  shipment.delivery_date,
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                  formatLocale(locale, countryCode),
                )
              : "-",
          // Pass cancellation/return flags and shipment ID for action buttons
          can_cancel: shipment.can_cancel || false,
          can_return: shipment.can_return || false,
          // can_exchange: shipment.can_exchange || false,
          shipment_id: shipment.shipment_id,
          products:
            shipment.bags?.map((bag, bagIndex) => ({
              id: bag.bag_id || bag.id || bag.item?.id || `product-${bagIndex}`,
              bag_id: bag.bag_id || bag.id, // Include bag_id for cancel/return flow
              item_id: bag.item?.id, // Item ID for reference
              quantity: bag.quantity || 1,
              image: bag.item?.image?.[0] || "/product.svg",
              brandName: bag.item?.brand?.name || "BRAND/DESIGNER NAME",
              productDetail: bag.item?.name || "Product name",
              price: `${bag.prices?.currency_symbol || "€"}${bag.prices?.price_effective || 888}`,
              originalPrice:
                bag.prices?.price_marked &&
                bag.prices.price_marked !== bag.prices.price_effective
                  ? `${bag.prices?.currency_symbol || "€"}${bag.prices.price_marked}`
                  : null,
            })) || [],
        })) || [],
    };
  };

  const filteredOrders = useMemo(() => {
    if (!orderData?.items) return [];

    // When using Platform API (onStatusFilterChange is provided),
    // filtering is done at API level, so return all items
    if (onStatusFilterChange) {
      return orderData.items;
    }

    // Legacy mode: Client-side filtering for GraphQL API
    // If no status filter is selected, return all orders
    if (!selectedStatusFilter || selectedStatusFilter.value === null) {
      return orderData.items;
    }

    const filterKeyword = selectedStatusFilter.display?.toLowerCase();

    // Filter orders that have at least one shipment matching the selected status
    const filtered = orderData.items.filter((order) =>
      order.shipments?.some((shipment) => {
        const shipmentStatus = shipment.shipment_status?.title?.toLowerCase();
        return shipmentStatus?.includes(filterKeyword);
      }),
    );

    return filtered;
  }, [orderData, selectedStatusFilter, onStatusFilterChange]);

  // Handle order card click
  const handleOrderClick = (order) => {
    setModalOrderData(order);
    setShowModal(true);
  };
  // Handle back to list view
  const handleBackToList = () => {
    setShowModal(false);
    setModalOrderData(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalOrderData(null);
  };

  const totalOrdersCount = orderData?.page?.item_total || 0;

  // Flatten orders into shipments for display
  const flattenedShipments = useMemo(() => {
    const shipments = [];
    filteredOrders.forEach((order) => {
      if (order.shipments && order.shipments.length > 0) {
        order.shipments.forEach((shipment, index) => {
          shipments.push({
            order: order,
            shipment: shipment,
            shipmentIndex: index,
            uniqueKey: `${order.order_id}-${shipment.shipment_id || index}`,
          });
        });
      }
    });
    return shipments;
  }, [filteredOrders]);

  const totalPages = Math.ceil(flattenedShipments.length / 4);

  // Paginate the flattened shipments
  const paginatedShipments = useMemo(() => {
    const startIndex = (currentPage - 1) * 4;
    const endIndex = startIndex + 4;
    return flattenedShipments.slice(startIndex, endIndex);
  }, [flattenedShipments, currentPage]);

  // Group shipments into slides of 4
  const groupedShipments = useMemo(() => {
    const groups = [];
    for (let i = 0; i < paginatedShipments.length; i += 4) {
      groups.push(paginatedShipments.slice(i, i + 4));
    }
    return groups;
  }, [paginatedShipments]);

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
    <div className="flex flex-col w-full h-full">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="flex items-start pb-0 px-0 relative bg-white w-full">
        <div className="flex flex-col items-start relative w-full">
          <p className="subheading-3 py-2">ORDERS</p>
        </div>
      </div>

      <div className="flex-1 lg:overflow-auto overflow-hidden min-h-0">
        <div className="md:gap-6 gap-[64px] md:pt-2 pt-[16px] pb-6 px-2 rounded-[1px] flex flex-col items-start relative self-stretch w-full">
          {/* Order Detail Modal */}
          {showModal && modalOrderData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-[340px] w-full h-[85vh] flex flex-col">
                <OrderDetailModal
                  {...transformOrderForModal(modalOrderData)}
                  onClose={handleCloseModal}
                  onBuyAgainClick={onBuyAgainClick}
                  originalOrderData={modalOrderData}
                />
              </div>
            </div>
          )}

          {/* LAST ORDER Section */}
          {orderData?.items && orderData.items.length > 0 && (
            <div className="md:gap-3 gap-[16px] flex flex-col items-start relative self-stretch w-full">
              <header className="flex items-center justify-between relative w-full">
                <div className="flex items-start gap-2 relative">
                  <p className="body-1">LAST ORDER</p>
                </div>

                <div className="flex items-start justify-end gap-2.5 px-0 relative">
                  <div className="inline-flex items-center gap-2.5 relative">
                    <button
                      onClick={() => {
                        // Scroll to history section or just focus on it
                        const historySection = document.querySelector(
                          '[data-section="history"]',
                        );
                        if (historySection) {
                          historySection.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="body-3 !text-[#171717] underline hover:text-neutral-700 hover:no-underline"
                    >
                      View all
                    </button>
                  </div>
                </div>
              </header>

              <div className="flex flex-col items-end md:gap-2 gap-0 md:p-2 p-0 relative w-full bg-white border border-solid border-[#eeeeee]">
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 w-full relative md:py-0 py-2 md:px-0 px-2">
                    <div className="flex items-start gap-1 relative body-1">
                      <span>
                        {orderData.items[0]?.order_created_time
                          ? convertUTCDateToLocalDate(
                              orderData.items[0].order_created_time,
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                              formatLocale(locale, countryCode),
                            )
                          : ""}
                        ,
                      </span>
                      <span className="text-[#aaaaaa]">
                        {orderData.items[0]?.shipments?.reduce(
                          (total, shipment) =>
                            total +
                            (shipment.bags?.reduce(
                              (sum, bag) => sum + (bag.quantity || 0),
                              0,
                            ) || 0),
                          0,
                        )}{" "}
                        ITEMS
                      </span>
                    </div>

                    <div className="flex items-start justify-end gap-2.5 px-0 relative">
                      <div className="inline-flex items-center gap-2.5 relative">
                        <button
                          onClick={() => handleOrderClick(orderData.items[0])}
                          className="body-3 !text-[#171717] underline hover:text-neutral-700 hover:no-underline"
                        >
                          See more
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal scrollable product images */}
                  <div className="flex items-start gap-2 md:mt-4 mt-2 relative w-full overflow-x-auto scrollbar-hide md:px-0 px-2 md:pb-0 pb-2 ">
                    {orderData.items[0]?.shipments?.map((shipment, index) =>
                      shipment.bags?.slice(0, 6).map((bag, bagIndex) => (
                        <div
                          key={`${index}-${bagIndex}`}
                          className="relative flex-shrink-0  md:h-[123px] h-[54px]"
                        >
                          <MediaDisplay
                            className="relative w-full md:h-[123px] h-[54px] object-contain aspect-[4/5]"
                            alt="Product"
                            src={bag?.item?.image?.[0]}
                            aspectRatio={4 / 5}
                            mobileAspectRatio={4 / 5}
                          />
                        </div>
                      )),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <section
            className="md:gap-3 gap-[32px] flex flex-col items-start relative w-full"
            data-section="history"
          >
            <div className="flex items-center justify-between relative w-full">
              <div className="flex items-start gap-1 relative body-1">
                <span>HISTORY,</span>
                <span className="text-[#aaaaaa]">
                  {totalOrdersCount} ORDERS
                </span>
              </div>

              <div className="flex flex-row items-center gap-2 md:gap-4">
                <span className="body-2 text-[#aaaaaa] text-center md:text-left">
                  {groupedShipments?.length
                    ? String(currentPage).padStart(2, "00")
                    : "00"}{" "}
                  / {String(totalPages).padStart(2, "00")}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    className={`body-1 px-3 py-1 !text-black transition-opacity ${
                      currentPage === 1 || !groupedShipments?.length
                        ? "opacity-30 cursor-not-allowed"
                        : "opacity-100"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || !groupedShipments?.length}
                  >
                    PREVIOUS
                  </button>
                  <button
                    className={`body-1 px-3 py-1 !text-black transition-opacity ${
                      currentPage === totalPages || !groupedShipments?.length
                        ? "opacity-30 cursor-not-allowed"
                        : "opacity-100"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={
                      currentPage === totalPages || !groupedShipments?.length
                    }
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:justify-between relative w-full md:gap-0 gap-8">
              {/* Dropdowns row - stack on mobile */}
              <div className="flex flex-row gap-2 relative md:w-auto w-full">
                {/* ORDER DATE Dropdown */}
                <div className="flex md:flex-row flex-col md:items-center gap-2 relative md:w-auto w-1/2">
                  <span className="body-1 !text-neutral-light whitespace-nowrap">
                    ORDER DATE:
                  </span>
                  <div
                    ref={dateDropdownRef}
                    className="relative flex-1 md:flex-initial md:w-[120px] w-full"
                  >
                    <button
                      onClick={() => {
                        setShowDateDropdown(!showDateDropdown);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full body-1 md:py-[0.5px] py-[4.5px] px-2 text-left bg-white flex items-center justify-between"
                      style={{
                        border: showDateDropdown
                          ? "1px solid #171717"
                          : "1px solid #AAAAAA",
                      }}
                    >
                      <span className="text-[#171717]">
                        {getSelectedDateFilterLabel()}
                      </span>
                      <span
                        className={`text-[10px] ${showDateDropdown ? "text-[#171717]" : "text-[#aaaaaa]"}`}
                      >
                        {showDateDropdown ? "-" : "+"}
                      </span>
                    </button>
                    {showDateDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 bg-white z-10 mt-0 max-h-[200px] overflow-y-auto"
                        style={{ border: "1px solid #eeeeee" }}
                      >
                        {getDateFilterOptions().map((option, index) => (
                          <button
                            key={index}
                            className={`w-full px-2 py-1 text-left body-1 ${
                              option.is_selected
                                ? "bg-gray-100 font-medium"
                                : "text-black hover:bg-gray-100"
                            } cursor-pointer`}
                            style={{
                              borderBottom:
                                index < getDateFilterOptions().length - 1
                                  ? "1px solid #eeeeee"
                                  : "none",
                            }}
                            onClick={() => handleDateFilterChange(option.value)}
                          >
                            {option.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ORDER STATUS Dropdown */}
                <div className="flex md:flex-row flex-col md:items-center gap-2 relative md:w-auto w-1/2">
                  <span className="body-1 !text-neutral-light whitespace-nowrap">
                    ORDER STATUS:
                  </span>
                  <div
                    ref={statusDropdownRef}
                    className="relative flex-1 md:flex-initial md:w-[120px] w-full"
                  >
                    <button
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowDateDropdown(false);
                      }}
                      className="w-full body-1 md:py-[0.5px] py-[4.5px] px-2 text-left bg-white flex items-center justify-between"
                      style={{
                        border: showStatusDropdown
                          ? "1px solid #171717"
                          : "1px solid #AAAAAA",
                      }}
                    >
                      <span>{getSelectedStatusFilterLabel()}</span>
                      <span
                        className={`text-[10px] ${showStatusDropdown ? "text-[#171717]" : "text-[#aaaaaa]"}`}
                      >
                        {showStatusDropdown ? "-" : "+"}
                      </span>
                    </button>
                    {showStatusDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 bg-white z-10 mt-0 max-h-[200px] overflow-y-auto"
                        style={{ border: "1px solid #eeeeee" }}
                      >
                        {getStatusFilterOptions().map((option, index) => (
                          <button
                            key={index}
                            className={`w-full px-2 py-1 text-left body-1 ${
                              option.is_selected
                                ? "bg-gray-100 font-medium"
                                : "text-black hover:bg-gray-100"
                            } cursor-pointer`}
                            style={{
                              borderBottom:
                                index < getStatusFilterOptions().length - 1
                                  ? "1px solid #eeeeee"
                                  : "none",
                            }}
                            onClick={() => handleStatusFilterChange(option)}
                          >
                            {option.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 px-0 py-3 relative w-full">
              {paginatedShipments.length === 0 ? (
                <div className="flex items-center justify-center p-8 w-full">
                  <div className="body-1 text-neutral-light">
                    You have no past orders. Explore Now.
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Slider */}
                  <div className="w-full">
                    {/* <Slider {...sliderSettings}> */}
                    {groupedShipments.map((shipmentGroup, slideIndex) => (
                      <div key={slideIndex}>
                        <div className="flex flex-col gap-4">
                          {shipmentGroup.map((item) => (
                            <OrderCard
                              key={item.uniqueKey}
                              order={item.order}
                              shipment={item.shipment}
                              shipmentIndex={item.shipmentIndex}
                              locale={locale}
                              countryCode={countryCode}
                              onOrderClick={handleOrderClick}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* </Slider> */}
                  </div>

                  {/* Mobile Slider */}
                  {/* <div className="block md:hidden w-full">
                      <Slider {...sliderSettings}>
                        {groupedOrders.map((orderGroup, slideIndex) => (
                          <div key={slideIndex} className="px-2">
                            <div className="flex flex-col gap-4">
                              {orderGroup.map((order) => (
                                <OrderCard
                                  key={order.order_id}
                                  order={order}
                                  locale={locale}
                                  countryCode={countryCode}
                                  onOrderClick={handleOrderClick}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div> */}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
