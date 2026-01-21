/**
 * PaymentDetailCard is a React functional component that displays payment details.
 *
 * @param {Object} props - The properties object.
 * @param {Array} props.breakup - An array of objects representing the payment breakup details.
 * @param {Object} props.paymentInfo - An object containing additional payment information.
 *
 * @returns {JSX.Element} A JSX element representing the payment detail card.
 *
 */

import React from "react";
import styles from "./payment-detail-card.less";
import {
  priceFormatCurrencySymbol,
  translateDynamicLabel,
} from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";

function PaymentDetailCard({ breakup, paymentDetails }) {
  const { t } = useGlobalTranslation("translation");
  const totalVal = breakup?.find((item) => item.name === "total") || 0;

  return (
    <div className="pt-3">
      <div className="subheading-3 mb-2">
        {t("resource.common.payment_mode")}
      </div>
      <div>
        {paymentDetails?.map((paymentInfo) => (
          <div
            key={paymentInfo?.display_name}
            className="flex mt-2.5 w-full justify-between"
          >
            <div className="flex items-center">
              <span className="inline-block max-w-[32px]">
                {/* <img
                  src={paymentInfo?.logo}
                  alt={paymentInfo?.display_name}
                  className="max-w-[32px]"
                /> */}
              </span>
              <span className="pl-5">
                <span className="body-3 text-ekke-black block my-1">
                  {translateDynamicLabel(paymentInfo?.display_name, t)}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="body-3 text-ekke-black">
                {!!paymentInfo?.amount &&
                  priceFormatCurrencySymbol(
                    totalVal?.currency_symbol,
                    paymentInfo?.amount
                  )}
                {!paymentInfo?.amount &&
                  totalVal &&
                  priceFormatCurrencySymbol(
                    totalVal?.currency_symbol,
                    totalVal?.value
                  )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentDetailCard;
