/**
 * ShipmentBreakup is a React functional component that displays the breakup of a shipment.
 *
 * @param {Object} props - The properties object.
 * @param {Array} props.breakup - An array of objects representing the breakup details of the shipment.
 * @param {Object} props.shipmentInfo - An object containing additional information about the shipment.
 *
 * @returns {JSX.Element} A JSX element that renders the shipment breakup details.
 */

import React, { useMemo } from "react";
import styles from "./shipment-breakup.less";
import {
  priceFormatCurrencySymbol,
  translateDynamicLabel,
} from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";

function ShipmentBreakup({ breakup }) {
  const { t } = useGlobalTranslation("translation");
  const getPriceFormat = (symbol, price) => {
    return priceFormatCurrencySymbol(symbol, price);
  };

  const breakupValues = useMemo(() => {
    const totalVal = breakup?.filter((item) => item.name === "total") || [];
    const restVal =
      breakup?.filter((item) => item.name !== "total" && item.value !== 0) ||
      [];
    return restVal.concat(totalVal);
  }, [breakup]);

  return (
    <div className="pt-3 relative">
      <div className="subheading-3 mb-2">
        {t("resource.common.billing_caps")}
      </div>
      <>
        {breakupValues?.map((item, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {((index !== breakup.length - 1 && item.value !== "0") ||
              (index === breakup.length - 1 && item.value !== "0")) && (
              <>
                {index !== breakup.length - 1 && (
                  <div className="flex justify-between">
                    <span className="body-3 text-[#aaaaaa]">
                      {translateDynamicLabel(item.display, t)}
                    </span>
                    <span className="body-3 text-[#aaaaaa]">
                      {getPriceFormat(
                        item.currency_symbol,
                        Number(item.value.toString().replace(/,/g, ""))
                      )}
                    </span>
                  </div>
                )}
                {index === breakup.length - 1 && (
                  <div className="flex justify-between pt-2.5 border-t border-neutral-lightest">
                    <span className="body-3 !font-semibold text-ekke-black">
                      {translateDynamicLabel(item.display, t)}
                    </span>
                    <span className="body-3 !font-semibold text-ekke-black">
                      {getPriceFormat(
                        item.currency_symbol,
                        Number(item.value.toString().replace(/,/g, ""))
                      )}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </>
    </div>
  );
}

export default ShipmentBreakup;
