/**
 * Custom Hook for Exchange Operations
 * Manages exchange state and API calls
 */

import { useState } from "react";
import { useSnackbar } from "../../helper/hooks";
import {
  getExchangeStatus,
  getExchangeReasons,
  getShipmentDetails,
  getAddresses,
  getCourierPartners,
  getExchangeableProducts,
  getProductSizePrice,
  createExchangeCart,
  checkoutExchange,
} from "../../queries/exchangeApi";

const useExchangeDetails = () => {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeStatus, setExchangeStatus] = useState(null);
  const [exchangeReasons, setExchangeReasons] = useState([]);

  /**
   * Check if exchange is available for a shipment
   * @param {string} shipmentId - The shipment ID
   * @returns {Object|null} Exchange status data or null if failed
   */
  const checkExchangeStatus = async (shipmentId) => {
    setIsLoading(true);
    try {
      const response = await getExchangeStatus(shipmentId);

      // Check if response is successful
      if (response.ok && response.statusCode === 200 && response.data) {
        setExchangeStatus(response.data);
        return response.data;
      } else {
        // API returned an error or shipment not eligible for exchange
        // Don't show error to user, just log it
        console.warn(
          `Exchange not available for shipment ${shipmentId}:`,
          response.message
        );
        // Return safe default - no exchange available
        return { can_exchange: false, can_cancel_exchange: false };
      }
    } catch (error) {
      console.log("errrrrr", error);
      // Network error or unexpected issue
      // Don't show snackbar for exchange check failures
      // Return safe default
      return { can_exchange: false, can_cancel_exchange: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch exchange reasons for a shipment
   * @param {string} shipmentId - The shipment ID
   * @param {string} bagId - The bag ID
   * @param {number} lineNumber - The line number
   * @returns {Array|null} Array of reasons or null if failed
   */
  const fetchExchangeReasons = async (shipmentId, bagId, lineNumber = 1) => {
    setIsLoading(true);
    try {
      const response = await getExchangeReasons(shipmentId, bagId, lineNumber);

      if (response.ok && response.statusCode === 200 && response.data) {
        setExchangeReasons(response.data.reasons || []);
        return response.data.reasons || [];
      } else {
        console.error(
          "Failed to fetch exchange reasons:",
          response.message || "Unknown error"
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching exchange reasons:", error);
      showSnackbar(
        error.message || "Failed to fetch exchange reasons",
        "error"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save exchange reason and images (Step 1 completion)
   * Note: There's no direct "initiate" API. The exchange is completed via checkout.
   * This function just validates and returns the data to proceed to next step.
   * @param {Object} params - Exchange parameters
   * @returns {Object} Success response with data
   */
  const saveExchangeReason = async (params) => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!params.shipment_id || !params.bag_id || !params.reason_id) {
        showSnackbar("Missing required exchange information", "error");
        return null;
      }

      // No API call needed here - just return success
      // The actual exchange will be completed in checkout step
      setIsLoading(false);
      return {
        success: true,
        reason_id: params.reason_id,
        reason_text: params.reason_text || "",
        images: params.images || [],
        shipment_id: params.shipment_id,
        bag_id: params.bag_id,
      };
    } catch (error) {
      console.error("Error saving exchange reason:", error);
      showSnackbar(error.message || "Failed to save exchange reason", "error");
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    exchangeStatus,
    exchangeReasons,
    checkExchangeStatus,
    fetchExchangeReasons,
    saveExchangeReason,
    // New API functions
    getShipmentDetails,
    getAddresses,
    getCourierPartners,
    getExchangeableProducts,
    getProductSizePrice,
    createExchangeCart,
    checkoutExchange,
  };
};

export default useExchangeDetails;
