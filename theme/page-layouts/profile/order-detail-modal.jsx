import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useExchangeDetails from "../orders/useExchangeDetails";

const OrderDetailModal = ({
  orderId,
  shipments,
  onClose,
  onBuyAgainClick,
  originalOrderData,
}) => {
  const navigate = useNavigate();
  const { checkExchangeStatus } = useExchangeDetails();
  const [exchangeStatuses, setExchangeStatuses] = useState({});

  // Helper function to check if order is within 18 hours of creation
  const isWithin18Hours = (orderCreatedTime) => {
    if (!orderCreatedTime) return false;

    const orderDate = new Date(orderCreatedTime);
    const currentDate = new Date();
    const hoursDifference = (currentDate - orderDate) / (1000 * 60 * 60); // Convert milliseconds to hours

    return hoursDifference <= 18;
  };

  // Check exchange status for all shipments on mount
  useEffect(() => {
    const fetchExchangeStatuses = async () => {
      if (!shipments || shipments.length === 0) return;

      const statuses = {};
      for (const shipment of shipments) {
        if (shipment.shipment_id) {
          const status = await checkExchangeStatus(shipment.shipment_id);
          statuses[shipment.shipment_id] = status;
        }
      }
      setExchangeStatuses(statuses);
    };

    fetchExchangeStatuses();
  }, [shipments]);

  // Helper function to check if cancel button should be shown
  const shouldShowCancel = (shipment) => {
    // Check if can_cancel is true
    if (!shipment.can_cancel || shipment.shipment_status?.value === "cancelled") return false;

    // Check if order is within 18 hours
    const orderCreatedTime =
      originalOrderData?.order_created_time ||
      originalOrderData?.order_created_ts;
    return isWithin18Hours(orderCreatedTime);
  };

  // Helper function to check if exchange button should be shown
  const shouldShowExchange = (shipment) => {
    if (!shipment.shipment_id) return false;
    const status = exchangeStatuses[shipment.shipment_id];
    return status?.can_exchange === true;
  };

  // Helper function to group products by unique identifier and sum quantities
  const groupProductsByIdentifier = (products) => {
    if (!products || products.length === 0) return [];

    const productMap = new Map();

    products.forEach((product) => {
      // Create a unique key based on product ID, size, and other identifying attributes
      const key = `${product.id || product.productId || ""}_${product.size || ""}_${product.brandName || ""}_${product.productDetail || ""}_${product.price || ""}`;

      if (productMap.has(key)) {
        // Product already exists, sum the quantity
        const existing = productMap.get(key);
        existing.quantity += product.quantity || 1;
      } else {
        // New product, add to map
        productMap.set(key, { ...product });
      }
    });

    return Array.from(productMap.values());
  };

  const getStatusBadgeClass = (status) => {
    const baseClass =
      "px-2 py-1 text-[10px] font-normal uppercase tracking-[0.40px] leading-[12px] [font-family:'Archivo',Helvetica]";
    switch (status.toLowerCase()) {
      case "cancelled by fynd":
        return `${baseClass} bg-[#5c2e20] text-[#dddace]`;
      case "cancelled":
        return `${baseClass} bg-[#5c2e20] text-[#dddace]`;
      default:
        return `${baseClass} bg-[#dddace] text-[#9B907D]`;
    }
  };

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-6 border-b border-gray-200 flex-shrink-0">
        <div>
          <p className="body-1">ORDER DETAIL</p>
          <p className="body-2 !text-neutral-light mt-1">ID - {orderId}</p>
        </div>
        <button onClick={onClose} className="body-3 !text-[#171717] underline">
          Close
        </button>
      </div>

      {/* Scrollable Shipments Content */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4 scrollbar-custom"
        style={{ minHeight: 0 }}
      >
        <style>{`
          .scrollbar-custom::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #171717;
            border-radius: 3px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: #000000;
          }
          .scrollbar-custom {
            scrollbar-width: thin;
            scrollbar-color: #171717 transparent;
          }
        `}</style>
        <div className="space-y-6">
          {shipments?.map((shipment, shipmentIndex) => (
            <div key={shipment.id || shipmentIndex}>
              {/* Status Badges */}
              <div className="flex gap-2">
                {shipment.status?.map((status, index) => (
                  <span key={index} className={getStatusBadgeClass(status)}>
                    {status}
                  </span>
                ))}
              </div>

              {/* Shipment Info with Cancel/Return/Exchange Links */}
              <div className="flex items-start justify-between pt-[11px]">
                <div className="body-3 !text-neutral-light space-y-1">
                  <p>
                    Shipment {shipment.shipmentNumber} of{" "}
                    {shipment.totalShipments}
                  </p>
                  <p>Delivery by : {shipment.deliveryDate}</p>
                </div>

                {/* Action Links - Cancel/Exchange */}
                <div className="flex gap-3">
                  {/* Cancel Link */}
                  {shouldShowCancel(shipment) && (
                    <button
                      onClick={() => {
                        if (shipment.shipment_id) {
                          // Get the first product's bag_id for the cancel flow
                          const firstBagId =
                            shipment.products?.[0]?.id ||
                            shipment.products?.[0]?.bag_id ||
                            originalOrderData?.shipments?.find(
                              (s) => s.shipment_id === shipment.shipment_id,
                            )?.bags?.[0]?.bag_id ||
                            originalOrderData?.shipments?.find(
                              (s) => s.shipment_id === shipment.shipment_id,
                            )?.bags?.[0]?.id;
                          const url = firstBagId
                            ? `/profile/orders/shipment/${shipment.shipment_id}?selectedBagId=${firstBagId}`
                            : `/profile/orders/shipment/${shipment.shipment_id}`;
                          navigate(url);
                          onClose();
                        }
                      }}
                      className="body-3 !text-[#171717] underline whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Return Link - Commented out as return functionality not implemented */}
                  {/* {shipment.can_return && (
                    <button
                      onClick={() => {
                        if (shipment.shipment_id) {
                          navigate(
                            `/profile/orders/shipment/${shipment.shipment_id}`
                          );
                          onClose();
                        }
                      }}
                      className="body-3 !text-[#171717] underline whitespace-nowrap"
                    >
                      Return
                    </button>
                  )} */}

                  {/* Exchange Link */}
                  {shouldShowExchange(shipment) && (
                    <button
                      onClick={() => {
                        if (shipment.shipment_id) {
                          // Get the first product's bag_id for the exchange flow
                          const firstBagId = shipment.products?.[0]?.id;
                          navigate(
                            `/c/profile/orders/exchange/${shipment.shipment_id}?selectedBagId=${firstBagId}`,
                          );
                          onClose();
                        }
                      }}
                      className="body-3 !text-[#171717] underline whitespace-nowrap"
                    >
                      Exchange
                    </button>
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                {groupProductsByIdentifier(shipment.products)?.map(
                  (product, productIndex) => (
                    <div
                      key={product.id || productIndex}
                      className="flex gap-[11px] items-start pt-6"
                    >
                      <div className="flex flex-col items-start gap-2 relative">
                        <div className="w-[65px] relative">
                          <img
                            className="relative w-full max-h-[74px] object-cover"
                            alt="Product"
                            src={product.image || "/product.svg"}
                          />
                          <span className="body-3 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                            {product.quantity.toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <p className="body-1">
                          {product.brandName || "BRAND/DESIGNER NAME"}
                        </p>
                        <p className="body-3 text-neutral-light">
                          {product.productDetail || "Product name"}
                        </p>
                        <div className="inline-flex items-center gap-2 relative">
                          <span className="body-3 text-[#171717]">
                            {product.price || "€888"}
                          </span>
                          {/* {product.originalPrice &&
                            product.originalPrice !== product.price && (
                              <span className="body-3 !text-neutral-light line-through">
                                {product.originalPrice}
                              </span>
                            )} */}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <div className="flex flex-col gap-2">
          {/* Buy Again Button - Always visible */}
          <button
            className="w-full h-8 body-1 text-left pl-3"
            style={{
              backgroundColor: "#CCCCCC",
              cursor: "pointer",
            }}
            onClick={() => {
              const buyAgainPromise = onBuyAgainClick(originalOrderData);

              if (
                buyAgainPromise &&
                typeof buyAgainPromise.then === "function"
              ) {
                buyAgainPromise
                  .then((result) => {
                    if (result?.success !== false) {
                      onClose();
                    }
                  })
                  .catch((error) => {
                    console.error("Buy again failed:", error);
                  });
              } else {
                onClose();
              }
            }}
          >
            Buy again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
