import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ORDER_LISTING, ORDER_BY_ID } from "../../queries/ordersQuery";
import { ADD_TO_CART } from "../../queries/pdpQuery";
import { CART_ITEMS_COUNT } from "../../queries/wishlistQuery";
import { fetchCartDetails } from "../cart/useCart";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import dayjs from "dayjs";
import { useSnackbar, useThemeConfig } from "../../helper/hooks";
import { useToast } from "../../components/custom-toaster";

const useOrdersListing = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const { globalConfig, pageConfig } = useThemeConfig({ fpi, page: "orders" });
  const ORDERLIST = useGlobalStore(fpi.getters.SHIPMENTS);
  const [orders, setOrders] = useState({});
  const [orderShipments, setOrderShipments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [linkOrderDetails, setLinkOrderDetails] = useState("");
  const toast = useToast();
  // Convert number of days to fromDate and toDate
  const getDateRange = function (days) {
    if (!days || days === null) {
      // No date filter applied
      return null;
    }

    const fromDate = dayjs().subtract(days, "days").format("MM-DD-YYYY");
    const toDate = dayjs().format("MM-DD-YYYY");
    return {
      fromDate,
      toDate,
    };
  };

  useEffect(() => {
    setIsLoading(true);
    try {
      if (params?.orderId) {
        const values = {
          orderId: params?.orderId,
        };
        fpi
          .executeGQL(ORDER_BY_ID, values)
          .then((res) => {
            setOrderShipments(res?.data?.order || {});
            setLinkOrderDetails({
              amount:
                res?.data?.order?.breakup_values?.[
                  res?.data?.order?.breakup_values?.length - 1
                ],
              orderId: params?.orderId,
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  }, [params?.orderId]);

  useEffect(() => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      let values = {
        pageNo: 1,
        pageSize: 50,
      };
      const selected_date_filter = queryParams.get("selected_date_filter");
      if (selected_date_filter) {
        const days = Number(selected_date_filter);
        const dateObj = getDateRange(days);
        if (dateObj) {
          values = { ...values, ...dateObj };
        }
      }
      const status = queryParams.get("status") || "";
      if (status) values.status = Number(status);

      fpi
        .executeGQL(ORDER_LISTING, values)
        .then((res) => {
          if (res?.data?.orders) {
            const data = res?.data?.orders;
            setOrders(data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  }, [location.search]);

  const handelBuyAgain = (orderInfo) => {
    console.log("orderInfo", orderInfo);
    // Ensure correct types: item_id, seller_id, store_id are Int; article_id and item_size are String
    const itemsPayload = orderInfo?.bags_for_reorder?.map(
      ({
        __typename,
        item_id,
        article_id,
        seller_id,
        store_id,
        item_size,
        quantity,
        ...rest
      }) => ({
        ...rest,
        item_id: item_id ? Number(item_id) : 0,
        item_size: item_size || "",
        seller_id: seller_id ? Number(seller_id) : 0,
        store_id: store_id ? Number(store_id) : 0,
        quantity: quantity || 1,
      }),
    );

    // Extract area_code from the first shipment's delivery address
    const areaCode =
      orderInfo?.shipments?.[0]?.bags?.[0]?.delivery_address?.area_code ||
      orderInfo?.shipments?.[0]?.bags?.[0]?.delivery_address?.pincode ||
      "";

    const payload = {
      buyNow: false,
      areaCode: areaCode,
      addCartRequestInput: {
        items: itemsPayload,
      },
    };
    return fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
      if (outRes?.data?.addItemsToCart?.success) {
        fpi.executeGQL(CART_ITEMS_COUNT, null).then((res) => {
          toast.success(
            outRes?.data?.addItemsToCart?.message ||
              t("resource.common.add_to_cart_success"),
          );
        });

        // Open cart drawer after 2 seconds (matching PLP behavior)
        setTimeout(() => {
          fpi.custom.setValue("isCartDrawerOpen", true);
        }, 1000);

        fetchCartDetails(fpi);
        return { success: true };
      } else {
        toast.error(
          outRes?.data?.addItemsToCart?.message ||
            t("resource.common.add_cart_failure"),
        );
        return { success: false };
      }
    });
  };
  return {
    isLoading,
    orders,
    orderShipments,
    pageConfig,
    globalConfig,
    handelBuyAgain,
    linkOrderDetails,
  };
};

export default useOrdersListing;
