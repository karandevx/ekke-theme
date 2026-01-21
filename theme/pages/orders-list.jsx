import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Loader from "../components/loader/loader";
import ProfileRoot from "../components/profile/profile-root";
import { isLoggedIn } from "../helper/auth-guard";
import { useGlobalTranslation, useGlobalStore } from "fdk-core/utils";
import { ProfileOrderPage } from "../page-layouts/profile/profile-order-page";
import { PlatformClient } from "@gofynd/fdk-client-javascript";
// import { ADD_TO_CART } from "../queries/pdpQuery";
// import { CART_ITEMS_COUNT } from "../queries/wishlistQuery";
// import { fetchCartDetails } from "../page-layouts/cart/useCart";
import { useToast } from "../components/custom-toaster";
import {
  ORDER_STATUS_FILTERS,
  PLATFORM_API_CONFIG,
  getDateRange,
  getPlatformAccessToken,
  transformPlatformOrdersToAppFormat,
  findStatusFilterByValue,
  getDefaultStatusFilter,
} from "../helper/order-utils";

// Import styles
import "../components/order-header/order-header.less";
import "../components/order-shipment/order-shipment.less";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";

function OrdersList({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const toast = useToast();

  // Get user and theme data
  const { user_id } = useGlobalStore(fpi.getters.USER_DATA) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const companyId = THEME?.company_id;

  // State management
  const [platformOrders, setPlatformOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(
    getDefaultStatusFilter(),
  );

  const { handelBuyAgain } = useOrdersListing(fpi);

  /**
   * Fetch orders using Platform API
   */
  const fetchPlatformOrders = useCallback(
    async (bagStatuses = null, dateFilter = null) => {
      if (!user_id) return null;

      try {
        setIsLoading(true);

        // Initialize Platform Client
        const platformClient = new PlatformClient(
          {
            companyId: PLATFORM_API_CONFIG.companyId,
            apiKey: PLATFORM_API_CONFIG.apiKey,
            apiSecret: PLATFORM_API_CONFIG.apiSecret,
            domain: PLATFORM_API_CONFIG.domain,
          },
          {},
        );

        // Get and set access token
        const tokenData = await getPlatformAccessToken();
        platformClient.setToken(tokenData);
        platformClient?.setExtraHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        });

        // Build API parameters
        const apiParams = {
          pageNo: 1,
          pageSize: 50,
          customerId: user_id,
        };

        // Add status filter
        if (bagStatuses?.length > 0) {
          apiParams.bagStatus = bagStatuses.join(",");
        }

        // Add date filter
        if (dateFilter) {
          apiParams.startDate = dateFilter.startDate;
          apiParams.endDate = dateFilter.endDate;
        }

        // Make API call
        const response = await platformClient.order.getOrders(apiParams);
        return response;
      } catch (error) {
        console.error("Error fetching platform orders:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user_id],
  );

  /**
   * Handle status filter change from ProfileOrderPage dropdown
   */
  const handleStatusChange = useCallback(
    async (statusFilter) => {
      setSelectedStatus(statusFilter);

      // Get date filter from URL
      const queryParams = new URLSearchParams(location.search);
      const dateFilterDays = queryParams.get("selected_date_filter");
      const dateFilter = dateFilterDays
        ? getDateRange(Number(dateFilterDays))
        : null;

      // Fetch orders with new status filter
      if (user_id && companyId) {
        const result = await fetchPlatformOrders(
          statusFilter.bagStatuses,
          dateFilter,
        );
        setPlatformOrders(result);
      }
    },
    [user_id, companyId, location.search, fetchPlatformOrders],
  );

  /**
   * Handle date filter change from ProfileOrderPage dropdown
   */
  const handleDateChange = useCallback(
    async (dateValue) => {
      const dateFilter = dateValue ? getDateRange(Number(dateValue)) : null;

      // Fetch orders with current status and new date filter
      if (user_id && companyId) {
        const result = await fetchPlatformOrders(
          selectedStatus.bagStatuses,
          dateFilter,
        );
        setPlatformOrders(result);
      }
    },
    [user_id, companyId, selectedStatus.bagStatuses, fetchPlatformOrders],
  );

  /**
   * Handle Buy Again functionality
   */
  // const handleBuyAgain = useCallback(
  //   (orderInfo) => {
  //     // Ensure all IDs are strings as required by GraphQL schema
  //     const itemsPayload = orderInfo?.bags_for_reorder?.map(
  //       ({
  //         __typename,
  //         item_id,
  //         article_id,
  //         seller_id,
  //         quantity,
  //         ...rest
  //       }) => ({
  //         ...rest,
  //         item_id: item_id ? String(item_id) : "",
  //         article_id: article_id ? String(article_id) : "",
  //         seller_id: seller_id ? String(seller_id) : "",
  //         quantity: quantity || 1,
  //       }),
  //     );

  //     const payload = {
  //       buyNow: false,
  //       areaCode: "",
  //       addCartRequestInput: {
  //         items: itemsPayload,
  //       },
  //     };

  //     return fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
  //       if (outRes?.data?.addItemsToCart?.success) {
  //         fpi.executeGQL(CART_ITEMS_COUNT, null);
  //         toast.success(
  //           outRes?.data?.addItemsToCart?.message ||
  //             t("resource.common.add_to_cart_success"),
  //         );

  //         // Open cart drawer after delay
  //         setTimeout(() => {
  //           fpi.custom.setValue("isCartDrawerOpen", true);
  //         }, 1000);

  //         fetchCartDetails(fpi);
  //         return { success: true };
  //       } else {
  //         toast.error(
  //           outRes?.data?.addItemsToCart?.message ||
  //             t("resource.common.add_cart_failure"),
  //         );
  //         return { success: false };
  //       }
  //     });
  //   },
  //   [fpi, toast, t],
  // );

  // Fetch orders on mount and when dependencies change
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user_id || !companyId) return;

      // Get filters from URL
      const queryParams = new URLSearchParams(location.search);
      const dateFilterDays = queryParams.get("selected_date_filter");
      const dateFilter = dateFilterDays
        ? getDateRange(Number(dateFilterDays))
        : null;

      // Check for status filter in URL
      const statusFromUrl = queryParams.get("status");
      let currentBagStatuses = selectedStatus.bagStatuses;

      if (statusFromUrl) {
        const matchingFilter = findStatusFilterByValue(statusFromUrl);
        if (matchingFilter) {
          setSelectedStatus(matchingFilter);
          currentBagStatuses = matchingFilter.bagStatuses;
        }
      }

      const result = await fetchPlatformOrders(currentBagStatuses, dateFilter);
      setPlatformOrders(result);
    };

    fetchOrders();
  }, [user_id, companyId, location.search, fetchPlatformOrders]);

  // Transform platform orders to app format
  const transformedOrders = useMemo(
    () => transformPlatformOrdersToAppFormat(platformOrders, selectedStatus),
    [platformOrders, selectedStatus],
  );

  return (
    <ProfileRoot fpi={fpi}>
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          className="basePageContainer w-full md:px-0 px-[10px] md:pt-0 pt-3"
        >
          <ProfileOrderPage
            orderData={transformedOrders}
            isLoading={isLoading}
            fpi={fpi}
            onBuyAgainClick={handelBuyAgain}
            platformOrders={platformOrders}
            statusFilterOptions={ORDER_STATUS_FILTERS}
            selectedStatusFilter={selectedStatus}
            onStatusFilterChange={handleStatusChange}
            onDateFilterChange={handleDateChange}
          />
        </motion.div>
      )}
    </ProfileRoot>
  );
}

OrdersList.authGuard = isLoggedIn;
export const sections = JSON.stringify([]);

export default OrdersList;
