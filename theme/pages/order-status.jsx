import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrderStatusPage from "../page-layouts/orders/order-status/order-status";
import { useLoggedInUser } from "../helper/hooks";
// import empty from "../assets/images/empty_state.png";
import { ORDER_BY_ID } from "../queries/checkoutQuery";
import "../page-layouts/orders/order-status/order-status.less";
import Loader from "../components/loader/loader";
// import cartClock from "../assets/images/cart-clock.png";
// import FyImage from "../components/core/fy-image/fy-image";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
// import { FDKLink } from "fdk-core/components";
import EmptyState from "../components/empty-state/empty-state";
import OrderPendingIcon from "../assets/images/order-pending.svg";

function OrderPolling({ isLoggedIn }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <EmptyState
      description={t("resource.order.polling.description")}
      Icon={<OrderPendingIcon />}
      title={t("resource.order.polling.pending")}
      btnLink="/"
      btnTitle={t("resource.common.continue_shopping")}
    />
  );
}

function OrderStatus({ fpi }) {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("order_id");
  const [orderData, setOrderData] = useState(null);
  const { loggedIn: isloggedIn } = useLoggedInUser(fpi);
  const [attempts, setAttempts] = useState(0);
  const [showPolling, setShowPolling] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = useCallback(() => {
    setTimeout(() => {
      fpi.executeGQL(ORDER_BY_ID, { orderId }).then((res) => {
        if (res?.data?.order && orderData === null) {
          setOrderData(res?.data?.order);
          setShowPolling(false);
        } else {
          setAttempts((prev) => prev + 1);
        }
      });
    }, 2000);
  }, [orderId, orderData]);

  useEffect(() => {
    if (success === "true") {
      if (attempts < 5 && orderData === null) {
        fetchOrder();
      } else if (attempts >= 5) {
        setShowPolling(true);
        // navigate("/cart/order-status?success=false");
      }
    }
  }, [success, attempts, fetchOrder, orderData]);

  // Prevent user from going back to payment page after successful order
  useEffect(() => {
    if (success === "true" && orderData) {
      // Set a flag in session storage to indicate order is completed
      sessionStorage.setItem("order_completed", "true");
      sessionStorage.setItem("completed_order_id", orderId);

      // Handle browser back button
      const handlePopState = (event) => {
        // Prevent default back navigation
        event.preventDefault();
        
        // Redirect to information page (checkout without step parameter)
        const cartId = searchParams.get("id");
        if (cartId) {
          navigate(`/cart/checkout?id=${cartId}`);
        } else {
          navigate("/cart/bag");
        }
      };

      // Add popstate event listener
      window.addEventListener("popstate", handlePopState);

      // Replace current history state to prevent going back
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [success, orderData, orderId, navigate, searchParams]);

  console.log({ orderData });

  return (
    <div className="basePageContainer margin0auto">
      <OrderStatusPage
        success={success}
        orderData={orderData}
        isLoggedIn={isloggedIn}
        // orderFailImg={empty}
        showPolling={showPolling}
        pollingComp={<OrderPolling isLoggedIn={isloggedIn} />}
        onOrderFailure={() => navigate("/cart/bag")}
        loader={<Loader />}
      />
    </div>
  );
}

export const sections = JSON.stringify([]);

export default OrderStatus;
