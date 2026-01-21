import React, { useMemo } from "react";
import { getAddressStr, translateDynamicLabel } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import ForcedLtr from "../forced-ltr/forced-ltr";

const AddressType = {
  area: "",
  landmark: "",
  city: "",
  area_code: "",
  country_phone_code: "91",
  phone: "",
  name: "",
  address_type: "",
  sector: "",
};

function AddressItem({
  showAddressSelectionCheckbox = false,
  showAddressType = true,
  selectedAddressId = "",
  addressItem = AddressType,
  onAddressSelect = () => {},
  headerRightSlot = <></>,
  belowNameSlot = <></>,
  belowAddressSlot = <></>,
  containerClassName = "",
  isDefaultAddress = false,
  ...restProps
}) {
  const { t } = useGlobalTranslation("translation");
  const getAddress = useMemo(
    () => getAddressStr(addressItem, false),
    [addressItem]
  );

  const isSelected = selectedAddressId === addressItem.id;

  return (
    <div
      className={`w-full max-md:max-w-full ${containerClassName}`}
      {...restProps}
    >
      {/* Header Section */}
      <div className="flex w-full gap-2.5 uppercase leading-[1.2] py-2 max-md:max-w-full">
        <div className="flex min-w-60 w-full items-center gap-2.5 flex-wrap flex-1 shrink basis-[0%] max-md:max-w-full">
          <div className="text-[#AAA] text-[11px]">
            {showAddressType && addressItem.address_type
              ? translateDynamicLabel(addressItem.address_type, t).toUpperCase()
              : "ADDRESS"}
          </div>
          {isDefaultAddress && (
            <div className="items-center self-stretch flex flex-col overflow-hidden text-[10px] text-[#DDDACE] whitespace-nowrap text-center tracking-[0.4px] justify-center bg-[#5C2E20] my-auto p-1">
              <div className="text-[#DDDACE]">SELECTED</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Card Section */}
      <div
        className={`border w-full text-neutral-900 bg-[#F7F7F5] p-3 border-solid cursor-pointer max-md:max-w-full mt-4`}
        style={{
          border: isDefaultAddress ? "1px solid #aaaaaa" : "1px solid #eee",
        }}
        onClick={() => onAddressSelect(addressItem?.id)}
      >
        {/* Name and Actions Row */}
        <div className="flex w-full items-center gap-2 leading-[1.2] flex-wrap max-md:max-w-full justify-between">
          <div className="text-neutral-900 text-[11px] uppercase self-stretch my-auto line-clamp-2">
            {addressItem.name}
          </div>
          <div className="self-stretch flex text-xs whitespace-nowrap text-right underline">
            <div className="flex items-center gap-2.5">{headerRightSlot}</div>
          </div>
        </div>

        {/* Below Name Slot */}
        {belowNameSlot}

        {/* Address Section */}
        <div className="flex w-full gap-[11px] text-[11px] leading-[13px] mt-3 max-md:max-w-full">
          <div className="max-w-[227px]">
            <div className="body-2 line-clamp-3">{getAddress}</div>
            {/* {addressItem.phone && (
              <div className="body-2">
                <ForcedLtr
                  text={`${addressItem.country_phone_code}-${addressItem.phone}`}
                />
              </div>
            )} */}
          </div>
        </div>

        {/* Below Address Slot */}
        {belowAddressSlot}
      </div>
    </div>
  );
}

export default AddressItem;
