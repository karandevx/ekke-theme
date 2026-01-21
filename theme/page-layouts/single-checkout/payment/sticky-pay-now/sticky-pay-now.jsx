import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalTranslation } from "fdk-core/utils";
import styles from "./sticky-pay-now.less";

const StickyPayNow = ({
  disabled = false,
  value = "",
  onPriceDetailsClick = () => {},
  proceedToPay = () => {},
  btnTitle,
  customClassName,
  enableLinkPaymentOption = false,
  isJuspay = false,
}) => {
  const { t } = useGlobalTranslation("translation");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white"
        key="pay-now-container"
        // initial={{ opacity: 0, y: "100%" }}
        // animate={{ opacity: 1, y: "0%" }}
        // exit={{ opacity: 0, y: "100%" }}
        // transition={{ duration: 0.5 }}
      >
        {!enableLinkPaymentOption && (
          <div className="flex items-center justify-between mb-2">
            <div className="body-1">{value}</div>
            {/* <div
              className="body-2 underline cursor-pointer"
              onClick={onPriceDetailsClick}
            >
              {t("resource.cart.view_price_details")}
            </div> */}
          </div>
        )}
        {!isJuspay ? (
          <button
            className={`w-full py-3 uppercase text-left pl-2 transition-colors ${
              disabled
                ? "bg-[#AAAAAA] !text-white cursor-not-allowed"
                : "bg-[#171717] !text-white hover:bg-[#2a2a2a] cursor-pointer"
            }`}
            onClick={proceedToPay}
            disabled={disabled}
            style={{
              fontFamily: "Archivo",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "120%",
            }}
          >
            {btnTitle || t("resource.cart.pay_now")}
          </button>
        ) : (
          <button
            type="submit"
            id="common_pay_btn"
            className={`w-full py-3 uppercase text-left pl-2 transition-colors ${
              disabled
                ? "bg-[#AAAAAA] !text-white cursor-not-allowed"
                : "bg-[#171717] !text-white hover:bg-[#2a2a2a] cursor-pointer"
            }`}
            disabled={disabled}
            style={{
              fontFamily: "Archivo",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "120%",
            }}
          >
            {t("resource.common.pay_caps")}{" "}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
export default StickyPayNow;
