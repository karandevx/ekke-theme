import dayjs from "dayjs";

/**
 * Order Status Filters - Maps display names to Platform API bag status values
 * Used for filtering orders by status in the order list page
 */
export const ORDER_STATUS_FILTERS = [
  {
    display: "ALL",
    value: null,
    bagStatuses: null, // null means fetch all orders without status filter
  },
  {
    display: "Processing",
    value: "processing",
    bagStatuses: [
      "pending",
      "placed",
      "upcoming",
      "payment_initiated",
      "payment_failed",
      "bag_not_confirmed",
      "bag_not_handed_over_to_dg",
      "bag_not_picked",
      "ready_for_dp_assignment",
      "assigning_dp",
      "dp_not_assigned",
      "store_reassigned",
    ],
  },
  {
    display: "Shipped",
    value: "shipped",
    bagStatuses: [
      "bag_confirmed",
      "bag_invoiced",
      "bag_packed",
      "bag_picked",
      "handed_over_to_dg",
      "in_transit",
      "out_for_delivery",
      "delivery_attempt_failed",
      "bag_reached_drop_point",
    ],
  },
  {
    display: "Delivered",
    value: "delivered",
    bagStatuses: ["delivery_done", "handed_over_to_customer"],
  },
  {
    display: "Cancelled",
    value: "cancelled",
    bagStatuses: [
      "cancelled_customer",
      "cancelled_fynd",
      "cancelled_at_dp",
      "cancelled_failed_at_dp",
    ],
  },
  {
    display: "Others",
    value: "others",
    bagStatuses: ["return_initiated", "return_pre_qc"],
  },
  // {
  //   display: "Replacement Requested",
  //   value: "replacement_requested",
  //   bagStatuses: ["return_initiated"],
  // },
];

/**
 * Platform API Configuration
 * ⚠️ WARNING: These credentials should be moved to server-side in production
 */
export const PLATFORM_API_CONFIG = {
  companyId: 10549,
  apiKey: "69638b44a56c51c1cbcf1f95",
  apiSecret: "GX6j_1XfjALJ~74",
  domain: "https://api.fynd.com",
  tokenEndpoint:
    "https://api.fynd.com/service/panel/authentication/v1.0/company/10549/oauth/token",
};

/**
 * Convert number of days to date range for Platform API
 * @param {number} days - Number of days to go back
 * @returns {Object|null} - { startDate, endDate } or null if no days provided
 */
export const getDateRange = (days) => {
  if (!days || days === null) {
    return null;
  }
  const startDate = dayjs().subtract(days, "days").format("YYYY-MM-DD");
  const endDate = dayjs().format("YYYY-MM-DD");
  return { startDate, endDate };
};

/**
 * Transform a single shipment from Platform API format to app format
 * @param {Object} shipment - Shipment from Platform API
 * @param {Object} order - Parent order object
 * @returns {Object} - Transformed shipment
 */
const transformShipment = (shipment, order) => {
  const firstBag = shipment.bags?.[0];
  const canCancel = firstBag?.item?.can_cancel ?? false;
  const canReturn = firstBag?.item?.can_return ?? false;

  return {
    shipment_id: shipment.shipment_id,
    shipment_status: {
      title:
        firstBag?.current_status?.bag_state_mapper?.app_display_name ||
        shipment.shipment_status ||
        "Processing",
      value: firstBag?.current_status?.status || shipment.operational_status,
    },
    bags:
      shipment.bags?.map((bag) => ({
        id: bag.bag_id,
        bag_id: bag.bag_id,
        item: {
          id: bag.item?.id,
          name: bag.item?.name,
          brand: { name: bag.item?.brand },
          image: bag.item?.image,
          slug_key: bag.item?.slug_key,
          can_cancel: bag.item?.can_cancel ?? false,
          can_return: bag.item?.can_return ?? false,
        },
        quantity: 1,
        prices: {
          currency_symbol: order.currency?.currency_symbol || "₹",
          price_effective: bag.prices?.price_effective,
          price_marked: bag.prices?.price_marked,
        },
        current_status: bag.current_status,
        delivery_address: bag.delivery_address,
      })) || [],
    promise: {
      timestamp: {
        max: shipment.meta?.promised_delivery_date,
      },
    },
    delivery_date: firstBag?.meta?.promised_delivery_date,
    can_cancel: canCancel,
    can_return: canReturn,
    operational_status: shipment.operational_status,
    total_bags: shipment.total_bags,
    total_items: shipment.total_items,
    prices: shipment.prices,
  };
};

/**
 * Transform Platform API orders response to the format expected by ProfileOrderPage
 * @param {Object} platformOrders - Response from Platform API getOrders
 * @param {Object} selectedStatus - Currently selected status filter
 * @returns {Object|null} - Transformed orders data or null
 */
export const transformPlatformOrdersToAppFormat = (
  platformOrders,
  selectedStatus,
) => {
  if (!platformOrders?.items) return null;

  return {
    items: platformOrders.items.map((order) => ({
      order_id: order.order_id,
      order_created_time: order.order_created_time,
      order_created_ts: order.order_created_ts,
      total_shipments_in_order: order.shipments?.length || 1,
      bags_for_reorder:
        order.shipments?.flatMap((shipment) =>
          shipment.bags?.map((bag) => ({
            item_id: bag.item?.id ? Number(bag.item.id) : 0,
            item_size: bag.item?.size || bag.meta?.size || "",
            article_id: bag.bag_id ? String(bag.bag_id) : "",
            quantity: 1,
            seller_id: bag.current_status?.store_id
              ? Number(bag.current_status.store_id)
              : 0,
            store_id: bag.current_status?.store_id
              ? Number(bag.current_status.store_id)
              : 0,
          })),
        ) || [],
      shipments:
        order.shipments?.map((shipment) =>
          transformShipment(shipment, order),
        ) || [],
      payment_mode: order.payment_mode,
      prices: order.prices,
      currency: order.currency,
      user_info: order.user_info,
      breakup_values: order.breakup_values,
    })),
    page: {
      item_total: platformOrders.items?.length || 0,
    },
    filters: {
      statuses: ORDER_STATUS_FILTERS.map((status) => ({
        display: status.display,
        value: status.value,
        is_selected: status.value === selectedStatus?.value,
      })),
    },
  };
};

/**
 * Get Platform API access token
 * @returns {Promise<Object>} - Token data with access_token
 */
export const getPlatformAccessToken = async () => {
  const tokenResponse = await fetch(PLATFORM_API_CONFIG.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json, text/plain, */*",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: PLATFORM_API_CONFIG.apiKey,
      client_secret: PLATFORM_API_CONFIG.apiSecret,
    }).toString(),
  });

  return tokenResponse.json();
};

/**
 * Find a status filter by its value
 * @param {string} value - Status filter value to find
 * @returns {Object|undefined} - Matching status filter or undefined
 */
export const findStatusFilterByValue = (value) => {
  return ORDER_STATUS_FILTERS.find((f) => f.value === value);
};

/**
 * Get the default (ALL) status filter
 * @returns {Object} - Default status filter
 */
export const getDefaultStatusFilter = () => {
  return ORDER_STATUS_FILTERS[0];
};
