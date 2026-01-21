/**
 * Exchange API Service
 * Handles all product exchange related API calls
 *
 * This service manages the complete exchange flow including:
 * - Checking exchange eligibility
 * - Getting exchange reasons
 * - Initiating exchange requests
 * - Managing exchange payments
 * - Handling price differences
 */

const BASE_URL = "/ext/product-exchange/application/api/v1";

/**
 * Helper function to handle API responses
 * @param {Response} response - Fetch API response
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} If response is not ok
 */
const handleResponse = async (response) => {
  // Always try to parse the response body
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Log detailed error information
    if (process.env.NODE_ENV === "development") {
      console.error("Exchange API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data,
      });
    }

    // Return a safe error response instead of throwing
    return {
      ok: false,
      statusCode: response.status,
      message: data?.message || response.statusText || "API request failed",
      data: null,
    };
  }

  return data;
};

/**
 * 1. Get Exchange Button Status for Shipment
 *
 * Checks if a shipment is eligible for exchange and if an existing exchange can be cancelled
 *
 * @param {string} shipmentId - The shipment ID to check exchange status for
 * @returns {Promise<Object>} Exchange status object
 * @returns {boolean} returns.data.can_exchange - Whether exchange is allowed
 * @returns {boolean} returns.data.can_cancel_exchange - Whether existing exchange can be cancelled
 *
 * @example
 * const status = await getExchangeStatus('17651745773271498205');
 * if (status.data.can_exchange) {
 *   // Show exchange button
 * }
 */
export const getExchangeStatus = async (shipmentId) => {
  try {
    if (!shipmentId) {
      console.warn("getExchangeStatus called without shipmentId");
      return {
        ok: false,
        statusCode: 400,
        message: "Shipment ID is required",
        data: { can_exchange: false, can_cancel_exchange: false },
      };
    }

    const url = `${BASE_URL}/exchanges/status?shipment_id=${shipmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include", // Important for cookie-based auth
    });

    const result = await handleResponse(response);

    // If API returned an error, return safe default
    if (!result.ok) {
      return {
        ok: false,
        statusCode: result.statusCode,
        message: result.message,
        data: { can_exchange: false, can_cancel_exchange: false },
      };
    }

    return result;
  } catch (error) {
    console.error(
      "Error fetching exchange status for shipment:",
      shipmentId,
      error
    );
    // Return safe default instead of throwing
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: { can_exchange: false, can_cancel_exchange: false },
    };
  }
};

/**
 * 2. Get Exchange Reasons
 *
 * Fetches the list of available reasons for exchange for a specific shipment
 *
 * @param {string} shipmentId - The shipment ID to get reasons for
 * @param {string} bagId - The bag ID
 * @param {number} lineNumber - The line number
 * @returns {Promise<Object>} Exchange reasons object
 * @returns {Array} returns.data.reasons - Array of reason objects
 *
 * @example
 * const reasons = await getExchangeReasons('17651745773271498205', '3666968', 1);
 * console.log(reasons.data.reasons);
 */
export const getExchangeReasons = async (shipmentId, bagId, lineNumber) => {
  try {
    if (!shipmentId || !bagId || !lineNumber) {
      console.warn("getExchangeReasons called without required parameters");
      return {
        ok: false,
        statusCode: 400,
        message: "Shipment ID, Bag ID, and Line Number are required",
        data: { reasons: [] },
      };
    }

    const url = `${BASE_URL}/reasons?shipment_id=${shipmentId}&bag_id=${bagId}&line_number=${lineNumber}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include",
    });

    const result = await handleResponse(response);

    if (!result.ok) {
      return {
        ok: false,
        statusCode: result.statusCode,
        message: result.message,
        data: { reasons: [] },
      };
    }

    return result;
  } catch (error) {
    console.error(
      "Error fetching exchange reasons for shipment:",
      shipmentId,
      error
    );
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: { reasons: [] },
    };
  }
};

/**
 * 3. Get Shipment Details for Exchange
 *
 * Fetches detailed shipment information for exchange including bags, prices, and exchange window
 *
 * @param {string} shipmentId - The shipment ID
 * @returns {Promise<Object>} Shipment details response
 *
 * @example
 * const details = await getShipmentDetails('17651745773271498205');
 */
export const getShipmentDetails = async (shipmentId) => {
  try {
    if (!shipmentId) {
      return {
        ok: false,
        statusCode: 400,
        message: "Shipment ID is required",
        data: null,
      };
    }

    const url = `${BASE_URL}/exchanges?shipment_id=${shipmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching shipment details:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 4. Get User Addresses
 *
 * Fetches all saved addresses for the user
 * Note: This uses the platform API, not the exchange API
 *
 * @returns {Promise<Object>} Addresses response
 *
 * @example
 * const addresses = await getAddresses();
 */
export const getAddresses = async () => {
  try {
    // Use platform API for addresses, not exchange API
    const url = `/service/platform/cart/v1.0/address`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 5. Get Courier Partners
 *
 * Fetches available courier partners for return shipment
 *
 * @param {Object} params - Courier partner parameters
 * @param {Object} params.from_location - From location details
 * @param {string} params.from_location.pincode - From pincode
 * @param {string} params.from_location.country_code - Country code
 * @param {Object} params.to_location - To location details
 * @param {number} params.to_location.store_code - Store code
 * @returns {Promise<Object>} Courier partners response
 *
 * @example
 * const partners = await getCourierPartners({
 *   from_location: { pincode: "411027", country_code: "IN" },
 *   to_location: { store_code: 11613 }
 * });
 */
export const getCourierPartners = async ({ from_location, to_location }) => {
  try {
    const url = `${BASE_URL}/logistics/shipment/courier-partners`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include",
      body: JSON.stringify({ from_location, to_location }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching courier partners:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 6. Get Exchangeable Products/Variants
 *
 * Fetches available product variants and sizes for exchange
 *
 * @param {Object} params - Product query parameters
 * @param {string} params.item_slug - Product slug
 * @param {string} params.item_size - Current item size
 * @param {number} params.price - Current item price
 * @returns {Promise<Object>} Exchangeable products response
 *
 * @example
 * const products = await getExchangeableProducts({
 *   item_slug: "men-s-stripes-summer-arcadia-holiday-shirts-7868786",
 *   item_size: "XS",
 *   price: 2099
 * });
 */
export const getExchangeableProducts = async ({
  item_slug,
  item_size,
  price,
}) => {
  try {
    const url = `${BASE_URL}/products?item_slug=${item_slug}&item_size=${item_size}&price=${price}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching exchangeable products:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 7. Get Product Size Price
 *
 * Fetches price and availability for a specific product size
 *
 * @param {Object} params - Size price parameters
 * @param {string} params.slug - Product slug
 * @param {string} params.size - Size value
 * @param {string} params.pincode - Delivery pincode
 * @returns {Promise<Object>} Size price response
 *
 * @example
 * const sizePrice = await getProductSizePrice({
 *   slug: "men-s-stripes-summer-arcadia-holiday-shirts-7868786",
 *   size: "3XL",
 *   pincode: "400101"
 * });
 */
export const getProductSizePrice = async ({ slug, size, pincode }) => {
  try {
    const url = `${BASE_URL}/products/${slug}/sizes/${size}/price`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "x-pincode": pincode,
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching product size price:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 8. Create Exchange Cart
 *
 * Creates a cart for the exchange with new and original product details
 *
 * @param {Object} params - Cart creation parameters
 * @param {Object} params.new_product - New product details
 * @param {string} params.new_product.id - Product ID
 * @param {string} params.new_product.size - Size
 * @param {number} params.new_product.store_id - Store ID
 * @param {Object} params.original_product - Original product details
 * @param {string} params.original_product.shipment_id - Shipment ID
 * @param {number} params.original_product.bag_id - Bag ID
 * @param {number} params.original_product.line_number - Line number
 * @returns {Promise<Object>} Cart creation response
 *
 * @example
 * const cart = await createExchangeCart({
 *   new_product: { id: "7868786", size: "3XL", store_id: 11613 },
 *   original_product: { shipment_id: "17651745773271498205", bag_id: 3666968, line_number: 1 }
 * });
 */
export const createExchangeCart = async ({
  new_product,
  original_product,
  user_id,
}) => {
  try {
    const url = `${BASE_URL}/cart`;

    console.log("Creat exchange cart:", {
      url: url,
      timestamp: new Date().toISOString(),
      cookies: document.cookie,
      user_id: user_id,
    });

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    };

    // Try adding user ID in header if provided
    if (user_id) {
      headers["x-user-id"] = user_id;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({ new_product, original_product }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating exchange cart:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

/**
 * 9. Checkout Exchange
 *
 * Completes the exchange process with reason, addresses, and cart details
 *
 * @param {Object} params - Checkout parameters
 * @param {Object} params.exchange_reason - Exchange reason details
 * @param {Object} params.exchange_reason.reason - Reason object
 * @param {Array} params.exchange_reason.medias - Media URLs
 * @param {Object} params.return_order - Return order details
 * @param {Object} params.return_order.product - Product details
 * @param {string} params.return_order.address_id - Return address ID
 * @param {string} params.return_order.original_delivery_address_id - Original delivery address ID
 * @param {string} params.return_order.shipment - Shipment ID
 * @param {Object} params.forward_order - Forward order details
 * @param {string} params.forward_order.address_id - Delivery address ID
 * @param {string} params.forward_order.cart_id - Cart ID
 * @returns {Promise<Object>} Checkout response with payment link
 *
 * @example
 * const result = await checkoutExchange({
 *   exchange_reason: { reason: {...}, medias: [] },
 *   return_order: {...},
 *   forward_order: {...}
 * });
 */
export const checkoutExchange = async ({
  exchange_reason,
  return_order,
  forward_order,
  user_id,
}) => {
  try {
    const url = `${BASE_URL}/cart/checkout`;

    // const allCookies = document.cookie.split(";").reduce((acc, cookie) => {
    //   const [key, value] = cookie.trim().split("=");
    //   acc[key] = value;
    //   return acc;
    // }, {});

    // console.log("=== CHECKOUT EXCHANGE DEBUG ===");
    // console.log("URL:", url);
    // console.log("Timestamp:", new Date().toISOString());
    // console.log("All Cookies:", allCookies);
    console.log("User ID:", user_id);
    // console.log(
    //   "Payload:",
    //   JSON.stringify({ exchange_reason, return_order, forward_order }, null, 2)
    // );
    // console.log("================================");

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    };

    // Try adding user ID in header if provided
    if (user_id) {
      headers["x-user-id"] = user_id;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      // credentials: "include",
      body: JSON.stringify({ exchange_reason, return_order, forward_order }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error checking out exchange:", error);
    return {
      ok: false,
      statusCode: 500,
      message: error.message || "Network error",
      data: null,
    };
  }
};

// Export all functions
export default {
  getExchangeStatus,
  getExchangeReasons,
  getShipmentDetails,
  getAddresses,
  getCourierPartners,
  getExchangeableProducts,
  getProductSizePrice,
  createExchangeCart,
  checkoutExchange,
};
