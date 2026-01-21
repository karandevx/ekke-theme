/**
 * ShipmentItem component renders a shipment item with various details and allows for interaction.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.bag - The bag object containing details of the shipment item.
 * @param {Object} props.initial - The initial state or configuration for the shipment item.
 * @param {Object} props.shipment - The shipment details associated with the item.
 * @param {Object} props.deliveryAddress - The delivery address for the shipment.
 * @param {string} props.selectId - The identifier for selecting the shipment item.
 * @param {Function} props.onChangeValue - Callback function to handle changes in the shipment item.
 * @param {string} props.type - The type of the shipment item.
 *
 * @returns {JSX.Element} A JSX element representing the shipment item.
 *
 */

import React, { useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./shipment-item.less";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import {
  numberWithCommas,
  priceFormatCurrencySymbol,
} from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { BagImage, BundleBagImage } from "../bag/bag";
import { getProductImgAspectRatio } from "../../helper/utils";

function ShipmentItem({
  bag,
  bundleGroups,
  bundleGroupArticles,
  initial,
  selectId,
  onChangeValue,
  type,
  globalConfig,
}) {
  const { t } = useGlobalTranslation("translation");
  const getPriceValue = (item) => {
    return numberWithCommas(item);
  };
  const getPriceCurrencyFormat = (symbol, price) => {
    return priceFormatCurrencySymbol(symbol, price);
  };
  const onChange = (id) => {
    onChangeValue(id);
  };

  const bundleGroupId = bag?.bundle_details?.bundle_group_id;
  const isBundleItem =
    bundleGroupId && bundleGroups && bundleGroups[bundleGroupId]?.length > 0;

  const { name, size, quantity, price } = useMemo(() => {
    if (isBundleItem) {
      // For bundles, sum all individual bag prices from the bundleGroups
      // This avoids the mutation issue where getGroupedShipmentBags modifies bundle_details
      const bundleBags = bundleGroups[bundleGroupId] || [];

      // Sum the ORIGINAL individual bag prices (not the modified base bag price)
      const totalEffectivePrice = bundleBags.reduce((sum, bundleBag) => {
        // If base bag has been aggregated by getGroupedShipmentBags, use financial_breakup instead
        const isAggregated =
          bundleBag?.bundle_details?.is_base &&
          bundleBag?.prices?.price_effective >
            (bundleBag?.financial_breakup?.[0]?.price_effective ||
              bundleBag?.prices?.price_effective);

        if (isAggregated) {
          // Use financial_breakup which contains the original individual bag price
          return (
            sum + (bundleBag?.financial_breakup?.[0]?.price_effective || 0)
          );
        }

        return sum + (bundleBag?.prices?.price_effective || 0);
      }, 0);

      return {
        name: bag?.bundle_details?.name,
        size: bag?.bundle_details?.size,
        quantity: bag?.bundle_details?.bundle_count,
        price: totalEffectivePrice,
      };
    }
    return {
      name: bag?.item?.name,
      size: bag?.item?.size,
      quantity: bag?.quantity,
      price: bag?.prices?.price_effective,
    };
  }, [bag, bundleGroups, bundleGroupId, isBundleItem]);

  return (
    <div className="">
      <div className="flex gap-4">
        {!initial &&
          type === "my-orders" &&
          (bag.can_cancel || bag.can_return) && (
            <div className="flex items-start pt-1">
              <input
                type="radio"
                value={bag.id}
                onChange={() => {
                  // Toggle: if already selected, unselect it
                  if (selectId === bag.id) {
                    onChange("");
                  } else {
                    onChange(bag.id);
                  }
                }}
                name="reasoncheckbox"
                id={bag.id}
                checked={selectId === bag.id}
                className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
                style={{
                  border: "1px solid #5C2E20",
                  borderRadius: 0,
                }}
              />
            </div>
          )}
        <ShipmentImage
          bag={bag}
          type={type}
          isBundleItem={isBundleItem}
          bundleGroupId={bag?.bundle_details?.bundle_group_id}
          bundleGroups={bundleGroups}
          bundleGroupArticles={bundleGroupArticles}
          globalConfig={globalConfig}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <p className="body-1">
            {bag?.item?.brand?.name || "BRAND/DESIGNER NAME"}
          </p>
          <p className="body-3 text-neutral-light">{name || "Product name"}</p>
          <div className="inline-flex items-center gap-2 relative">
            {bag?.prices?.currency_symbol !== null && price !== null && (
              <span className="body-3 text-[#171717]">
                {getPriceCurrencyFormat(
                  bag?.prices?.currency_symbol,
                  getPriceValue(price)
                )}
              </span>
            )}
            {bag?.prices?.price_marked &&
              bag?.prices?.price_marked !== price && (
                <span className="body-3 !text-neutral-light line-through">
                  {getPriceCurrencyFormat(
                    bag?.prices?.currency_symbol,
                    getPriceValue(bag?.prices?.price_marked)
                  )}
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ShipmentImage = ({
  bag,
  type,
  bundleGroupId,
  isBundleItem,
  bundleGroupArticles,
  globalConfig,
}) => {
  const aspectRatio = getProductImgAspectRatio(globalConfig);
  const getItemImage = () => {
    return (
      <BagImage bag={bag} isBundle={isBundleItem} aspectRatio={aspectRatio} />
    );
  };

  return (
    <div className="flex-shrink-0">
      <FDKLink
        to={`/product/${isBundleItem ? bag?.bundle_details?.slug : bag?.item?.slug_key}`}
        className="block"
      >
        {getItemImage()}
      </FDKLink>
    </div>
  );
};

export default ShipmentItem;
