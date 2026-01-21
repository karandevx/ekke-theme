import React from "react";
import {
  numberWithCommas,
  currencyFormat,
  formatLocale,
} from "../../../../../helper/utils";

import styles from "./sticky-footer.less";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import { useNavigate } from "react-router-dom";

function StickyFooter({
  isLoggedIn = false,
  isValid = true,
  isOutOfStock = false,
  isNotServicable = false,
  isAnonymous = true,
  totalPrice = 0,
  currencySymbol = "₹",
  onLoginClick = () => {},
  onCheckoutClick = () => {},
  onPriceDetailsClick = () => {},
  handleClose = () => {},
  cartItemsArray = [],
  isOnCheckoutPage = false,
  showWishlist,
}) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const isRewardPoints = false;
  const rewardPoints = 0;
  const isRewardPointsApplied = false;
  const updateRewardPoints = () => {};
  const navigate = useNavigate();
  return (
    <>
      {!isOnCheckoutPage && (
        <div
          className={`${styles.stickyFooter} fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200`}
        >
          {/* {isRewardPoints && rewardPoints > 0 && isLoggedIn ? (
          <div
            className={`${styles.billContainer} ${styles.rewardPointCheckbox}`}
          >
            {isRewardPointsApplied ? (
              <input type="checkbox" checked onClick={updateRewardPoints()} />
            ) : (
              <input type="checkbox" onClick={updateRewardPoints()} />
            )}
  
            <div className={styles.rewardDiv}>
              <span className={styles.rewardPoi}>
                {`${t("resource.cart.redeem_rewards_points_worth")} ${numberWithCommas(rewardPoints)}`}
              </span>
              <SvgWrapper svgSrc="reward-icon-mobile" />
            </div>
          </div>
        ) : (
          !isLoggedIn && (
            <div className={`${styles.billContainer} ${styles.billContainer2}`}>
              {totalPrice > 0 && (
                <div className={styles.getTotalPrice}>
                  <span className={styles.nccPrice}>{t("resource.cart.total_price")}:</span>
                  <span className={styles.nccTotalPrice}>
                    {currencyFormat(
                      numberWithCommas(totalPrice),
                      currencySymbol,
                      formatLocale(locale, countryCode, true))}
                  </span>
                </div>
              )}
              <div
                className={`${styles.viewPriceBtn} ${styles.nccViewBtn}`}
                onClick={onPriceDetailsClick}
              >
                {t("resource.cart.view_bill")}
              </div>
            </div>
          )
        )} */}

          {!isLoggedIn && (
            <div
              className={`${styles.stickyBtnContainer} ${styles.nccStickyBtn}`}
            >
              {/* <button
                className={`${styles.continueShoppingBtn}
              rounded-[1px] flex gap-[10px] w-[50%] opacity-100 py-2 px-2 font-archivo text-[11px] text-center leading-[120%] font-[400]  align-middle items-center max-h-8 uppercase bg-[#EEEEEE] text-ekke-black`}
                onClick={() => {
                  navigate("/products");
                  handleClose();
                }}
              >
                Back To Store
              </button> */}

              <button
                className="rounded-[1px] flex gap-[10px] opacity-100  w-[100%] py-2 px-2 text-center pl-2 bg-ekke-black font-archivo text-[11px] leading-[120%] font-[400] text-[#ffffff]  disabled:opacity-50 disabled:cursor-not-allowed align-middle items-center max-h-8 uppercase"
                onClick={() => {
                  onLoginClick();
                  handleClose();
                }}
              >
                CHECKOUT
              </button>
            </div>
          )}
          {isLoggedIn && (
            <div
              className={`${styles.stickyBtnContainer} ${styles.stickyBtnContainer1}`}
            >
              {totalPrice > 0 && !showWishlist && (
                <div className={styles.priceContainerMobile}>
                  {/* <div
                className={`${styles.viewPriceBtn} ${styles.viewPBtn}`}
                onClick={onPriceDetailsClick}
              >
                {t("resource.cart.view_price_details")}
              </div> */}
                  <div className="text-[12px] font-[400] leading-[120%] text-ekke-black font-archivo">
                    {currencyFormat(
                      numberWithCommas(totalPrice),
                      currencySymbol,
                      formatLocale(locale, countryCode, true)
                    )}
                  </div>
                  {/* <div className="text-[11px] font-[400] leading-[120%] text-neutral-light uppercase font-archivo">
                    INCL.VAT
                  </div> */}
                </div>
              )}

              <div className="flex gap-[10px] w-full">
                <button
                  className={`${styles.continueShoppingBtn}
               ${cartItemsArray?.length > 0 ? "w-[50%]" : "w-full"} 
              ${cartItemsArray?.length > 0 ? "bg-[#EEEEEE] text-ekke-black" : "bg-ekke-black text-white"} 
              rounded-[1px] flex gap-[10px]  opacity-100 py-2 px-2 font-archivo text-[11px] text-center leading-[120%] font-[400]  align-middle items-center max-h-8 uppercase`}
                  onClick={() => {
                    navigate("/products");
                    handleClose();
                  }}
                >
                  Back To Store
                </button>
                {cartItemsArray?.length > 0 && (
                  <button
                    className="rounded-[1px] flex gap-[10px] opacity-100 py-2 px-2 text-center pl-2 bg-ekke-black font-archivo text-[11px] leading-[120%] font-[400] text-[#ffffff] w-[50%] disabled:opacity-50 disabled:cursor-not-allowed align-middle items-center max-h-8"
                    disabled={!isValid || isOutOfStock || isNotServicable}
                    onClick={() => {
                      onCheckoutClick();
                      handleClose();
                    }}
                  >
                    CHECKOUT
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default StickyFooter;
