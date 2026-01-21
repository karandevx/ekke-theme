/**
 *
 * This React functional component is responsible for rendering a shipment address.
 * It formats the address details using optional fields such as sector, city, and pincode.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.address - The address object containing details of the shipment address.
 *
 * @returns {JSX.Element} A JSX element that displays the formatted shipment address.
 *
 */

import React from "react";
import styles from "./shipment-address.less";
import { useGlobalTranslation } from "fdk-core/utils";

function ShipmentAddress({ address }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className="pt-3">
      <div className="subheading-3 mb-2">
        {t("resource.common.address.address_caps")}
      </div>
      <div className="body-3 text-ekke-black mb-1">
        {`${address?.name || ""} - ${address?.country_phone_code || ""} ${address?.phone || ""}`}
      </div>
      <div className="body-3 text-[#aaaaaa]">
        {address?.display_address || ""}
      </div>
    </div>
  );
}

export default ShipmentAddress;
