import React, { useState, useMemo, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./chip-item.less";
import {
  convertUTCDateToLocalDate,
  currencyFormat,
  formatLocale,
  numberWithCommas,
  sortSizes,
} from "../../../../helper/utils";

import QuantityControl from "../../../../components/quantity-control/quantity-control";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import { useMobile /* useSnackbar */ } from "../../../../helper/hooks";
import FreeGiftItem from "../free-gift-item/free-gift-item";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import { useViewport } from "../../../../helper/hooks";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import { useToast } from "../../../../components/custom-toaster";

export default function ChipItem({
  isCartUpdating,
  singleItemDetails,
  onUpdateCartItems,
  currentSize,
  isDeliveryPromise = true,
  productImage,
  itemIndex,
  sizeModalItemValue,
  currentSizeModalSize,
  setCurrentSizeModalSize,
  setSizeModal,
  sizeModal,
  cartItems,
  cartItemsWithActualIndex,
  singleItem,
  buybox,
  isPromoModalOpen,
  isSoldBy = false,
  onRemoveIconClick = () => {},
  onOpenPromoModal,
  onClosePromoModal,
  onWishlistButtonClick,
  handleClose,
}) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  // const isMobile = useMobile();
  const isMobile = useViewport(0, 767);
  // const { showSnackbar } = useSnackbar();
  const toast = useToast();
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [sizeModalErr, setSizeModalErr] = useState(null);
  const [activePromoIndex, setActivePromoIndex] = useState(null);
  const [clickedPromoIndex, setClickedPromoIndex] = useState(null);
  const [selectedSizeLocal, setSelectedSizeLocal] = useState(currentSize);

  // Keep local size in sync with prop when cart updates
  useEffect(() => {
    setSelectedSizeLocal(currentSize);
  }, [
    currentSize,
    singleItemDetails?.product?.uid,
    singleItemDetails?.article?.store?.uid,
  ]);

  // Maintain consistent size order to prevent reordering when size is selected
  const sortedAvailableSizes = useMemo(() => {
    const sizes = singleItemDetails?.availability?.available_sizes || [];
    // Use shared helper to keep ordering consistent (numeric then alpha)
    return sortSizes([...sizes]);
  }, [singleItemDetails?.availability?.available_sizes]);

  const isOutOfStock = singleItemDetails?.availability?.out_of_stock;

  console.log("chip item", sortedAvailableSizes);

  const isServiceable = singleItemDetails?.availability?.deliverable;
  const isCustomOrder =
    singleItemDetails?.custom_order?.is_custom_order || false;
  const couponText = singleItemDetails?.coupon_message || "";
  const moq = singleItemDetails?.moq;
  const incrementDecrementUnit = moq?.increment_unit ?? 1;

  const isSellerBuyBoxListing = useMemo(() => {
    return (
      buybox?.show_name &&
      buybox?.enable_selection &&
      buybox?.is_seller_buybox_enabled
    );
  }, [buybox]);

  const isStoreBuyboxListing = useMemo(() => {
    return (
      buybox?.show_name &&
      buybox?.enable_selection &&
      !buybox?.is_seller_buybox_enabled
    );
  }, [buybox]);

  const getMaxQuantity = (item) => {
    let maxQuantity = item?.max_quantity?.item || 0;
    if (isSellerBuyBoxListing) {
      maxQuantity = item?.max_quantity?.item_seller || 0;
    } else if (isStoreBuyboxListing) {
      maxQuantity = item?.max_quantity?.item_store || 0;
    }
    return maxQuantity;
  };

  const maxCartQuantity = Math.min(
    moq?.maximum || Number.POSITIVE_INFINITY,
    getMaxQuantity(singleItemDetails) || 0
  );

  const minCartQuantity = moq?.minimum || 1;

  const cartUpdateHandler = async (
    event,
    itemDetails,
    itemSize,
    quantity,
    itemIndex,
    operation,
    isSizeUpdate = false
  ) => {
    let totalQuantity = (itemDetails?.quantity || 0) + quantity;

    if (operation === "edit_item") {
      totalQuantity = quantity;
    }

    if (!itemDetails?.custom_order?.is_custom_order && !isSizeUpdate) {
      if (totalQuantity > maxCartQuantity) {
        totalQuantity = maxCartQuantity;
      }

      setShowQuantityError(totalQuantity >= maxCartQuantity);

      if (totalQuantity < minCartQuantity) {
        if (operation === "edit_item") {
          totalQuantity = minCartQuantity;
        } else if (itemDetails?.quantity > minCartQuantity) {
          totalQuantity = minCartQuantity;
        } else {
          totalQuantity = 0;
        }
      }
    }

    if (
      itemDetails?.quantity !== totalQuantity ||
      operation === "remove_item"
    ) {
      const cartUpdateResponse = await onUpdateCartItems(
        event,
        itemDetails,
        itemSize,
        totalQuantity,
        itemIndex,
        operation === "edit_item" ? "update_item" : operation,
        false,
        true
      );

      if (isSizeUpdate) {
        if (cartUpdateResponse?.success) {
          setCurrentSizeModalSize(null);
          setSizeModal(null);
          setSizeModalErr(null);
        } else {
          setSizeModal(currentSizeModalSize);
          setSizeModalErr(t("resource.cart.size_is_out_of_stock"));
        }
      }
    } else if (itemDetails?.quantity === totalQuantity) {
      // showSnackbar("max quantity reached");
      toast.error("Max quantity reached");
    }
  };

  const promoTitle = useMemo(() => {
    const totalPromo = singleItemDetails?.promotions_applied?.length || 0;
    if (totalPromo === 1) return t("resource.cart.one_offer");
    else if (totalPromo > 1)
      return `${totalPromo} ${t("resource.common.offers")}`;
    else return "";
  }, [singleItemDetails]);

  const sellerStoreName = useMemo(() => {
    const sellerName = singleItemDetails?.article?.seller?.name;
    const storeName = singleItemDetails?.article?.store?.name;

    return [sellerName, storeName].filter(Boolean).join(", ") || "";
  }, [singleItemDetails]);

  const toggleActivePromo = (e, index) => {
    e.stopPropagation();
    if (activePromoIndex === index) setActivePromoIndex(null);
    else setActivePromoIndex(index);
  };

  return (
    <>
      <div className={styles.cartItemsListContainer} key={itemIndex}>
        {isOutOfStock && (
          <div
            className={`${styles["out-of-stock-chip"]} ${styles["new-cart-red-color"]}`}
          >
            <span>
              {singleItemDetails?.message || t("resource.common.out_of_stock")}
            </span>
            <span
              className={styles.removeAction}
              onClick={(e) =>
                cartUpdateHandler(
                  e,
                  singleItemDetails,
                  currentSize,
                  0,
                  itemIndex,
                  "remove_item"
                )
              }
            >
              {" "}
              {t("resource.facets.remove_caps")}
            </span>
          </div>
        )}
        {/* {couponText.length > 0 && (
          <div className={styles.appliedCouponRibbon}>
            <SvgWrapper svgSrc="applied-coupon-small" />
            <span className={styles.couponText}>{couponText}</span>
          </div>
        )} */}
        <div className={styles.eachItemContainer}>
          <div
            className={`${styles.itemImageContainer} ${
              isOutOfStock ? styles.outOfStock : ""
            }`}
          >
            <FDKLink
              to={`/product/${singleItemDetails?.product?.slug}`}
              onClick={() => {
                handleClose();
              }}
            >
              {/* <img src={productImage} alt={singleItemDetails?.product?.name} /> */}
              <FyImage
                src={productImage}
                alt={singleItemDetails?.product?.name}
                customClass={styles.itemImage}
                sources={[{ width: 250 }]}
                isFixedAspectRatio={true}
                aspectRatio={0.86}
                mobileAspectRatio={0.8706}
              />
            </FDKLink>

            {!isOutOfStock && isServiceable && (
              <QuantityControl
                isCartUpdating={isCartUpdating}
                count={singleItemDetails?.quantity || 0}
                onDecrementClick={(e) =>
                  cartUpdateHandler(
                    e,
                    singleItemDetails,
                    currentSize,
                    -incrementDecrementUnit,
                    itemIndex,
                    "update_item"
                  )
                }
                onIncrementClick={(e) =>
                  cartUpdateHandler(
                    e,
                    singleItemDetails,
                    currentSize,
                    incrementDecrementUnit,
                    itemIndex,
                    "update_item"
                  )
                }
                onQtyChange={(evt, currentNum) =>
                  cartUpdateHandler(
                    evt,
                    singleItemDetails,
                    currentSize,
                    currentNum,
                    itemIndex,
                    "edit_item"
                  )
                }
                maxCartQuantity={maxCartQuantity}
                minCartQuantity={minCartQuantity}
              />
            )}
          </div>

          <div
            className={`${styles.eachItemDetailsContainer} flex flex-col justify-between items-start gap-[8px]`}
          >
            {/* <button
              className={styles.removeItemSvgContainer}
              onClick={() =>
                onRemoveIconClick({
                  item: singleItemDetails,
                  size: currentSize,
                  index: itemIndex,
                })
              }
            >
              <SvgWrapper
                svgSrc="item-close"
                className={styles.itemRemoveIcon}
              />
            </button> */}

            {/* size */}
            {/* <div className={styles.itemSizeQuantityContainer}>
              <div className={styles.itemSizeQuantitySubContainer}>
                <button
                  className={styles.sizeContainer}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSizeModal(singleItem);
                  }}
                >
                  <div className={styles.sizeName}>
                    {`${t("resource.common.size")}: ${currentSize}`}
                  </div>
                  <span className={styles.itemSvg}>
                    <SvgWrapper
                      svgSrc="arrow-down"
                      style={{ width: "20px", height: "24px" }}
                    />
                  </span>
                </button>

                {isOutOfStock && (
                  <div className={styles.outOfStockChip}>{t("resource.common.out_of_stock")}</div>
                )}
                {!isServiceable && (
                  <div className={styles.outOfStockChip}>
                    {t("resource.cart.item_not_deliverable")}
                  </div>
                )}
              </div>

            </div > */}

            {/* {
              singleItemDetails?.promotions_applied?.length > 0 &&
              !isOutOfStock &&
              isServiceable && (
                <div
                  className={styles.appliedOfferRibbon}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPromoModal();
                    setClickedPromoIndex(itemIndex);
                  }}
                >
                  <span>{`${promoTitle} ${t("resource.common.applied")}`}</span>
                  <SvgWrapper svgSrc="applied-promo" className={styles.ml6} />
                </div>
              )
            } */}

            <div className="flex justify-start items-start w-full flex-1 ">
              <div className="flex flex-col gap-[11px] h-full justify-between md:w-[50%] w-full md:pt-[0px] pt-[8px] pr-[8px]">
                <div className="flex flex-col gap-[8px]">
                  <div
                    className={`${styles.itemBrand} font-archivo  text-[11px] leading-[120%] tracking-[0%] uppercase text-[#1F1F1F]`}
                 style={{ fontWeight: 400 }}
                 >
                    {singleItemDetails?.product?.brand?.name}
                  </div>
                  <div
                    className={`${styles.itemName} ${
                      isOutOfStock ? styles.outOfStock : ""
                    } `}
                  >
                    {singleItemDetails?.product?.name}
                  </div>
                  {isSoldBy && !isOutOfStock && (
                    <div className={styles.itemSellerName}>
                      {`${t("resource.common.sold_by")}: ${sellerStoreName}`}
                    </div>
                  )}
                  <div className={styles.itemTotalContainer}>
                    <div className={styles.itemPrice}>
                      <span
                        className={`${styles.effectivePrice} ${
                          isOutOfStock ? styles.outOfStock : ""
                        }`}
                      >
                        {currencyFormat(
                          numberWithCommas(
                            singleItemDetails?.price?.converted?.effective ??
                              singleItemDetails?.price?.base?.effective
                          ),
                          singleItemDetails?.price?.converted
                            ?.currency_symbol ??
                            singleItemDetails?.price?.base?.currency_symbol,
                          formatLocale(locale, countryCode, true)
                        )}
                      </span>
                      {singleItemDetails?.price?.converted?.effective <
                        singleItemDetails?.price?.converted?.marked && (
                        <span className={styles.markedPrice}>
                          {currencyFormat(
                            numberWithCommas(
                              singleItemDetails?.price?.converted?.marked ??
                                singleItemDetails?.price?.base?.marked
                            ),
                            singleItemDetails?.price?.converted
                              ?.currency_symbol ??
                              singleItemDetails?.price?.base?.currency_symbol,
                            formatLocale(locale, countryCode, true)
                          )}
                        </span>
                      )}
                      {singleItemDetails?.discount && (
                        <span className={styles.discount}>
                          {singleItemDetails?.discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* {
                  getMaxQuantity(singleItemDetails) > 0 &&
                  getMaxQuantity(singleItemDetails) < 11 &&
                  !isOutOfStock &&
                  isServiceable &&
                  !isCustomOrder &&
                  !buybox?.is_seller_buybox_enabled && (
                    <div className={`font-archivo font-[400px] text-[11px] leading-[120%] tracking-[0%] uppercase text-[#5C2E20]`}>
                      {`${getMaxQuantity(singleItemDetails)} left`}
                    </div >
                  )
                } */}
              </div>

              {/* size */}
              <div className="hidden md:block">
                <div className="flex flex-wrap gap-3">
                  {sortedAvailableSizes?.length > 0 &&
                    sortedAvailableSizes?.map((singleSize) => {
                      const isSelected =
                        selectedSizeLocal === singleSize?.value;

                      return (
                        <div
                          key={`${singleItemDetails?.product?.uid}_${singleSize?.value}`}
                          className="inline-block text-[12px] font-archivo leading-[1.2] tracking-normal cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className={`${isSelected ? "text-ekke-black" : "text-neutral-light"} cursor-pointer ${!singleSize?.is_available ? "text-neutral-light" : ""} text-[12px] leading-[1.2] tracking-normal text-center`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!singleSize?.is_available) return;
                              if (singleSize?.value && !isSelected) {
                                setSizeModalErr(null);
                                setSelectedSizeLocal(singleSize?.value);
                              }
                              onUpdateCartItems(
                                e,
                                singleItemDetails,
                                singleSize?.value,
                                singleItemDetails?.quantity || 0,
                                itemIndex,
                                "update_item"
                              );
                            }}
                          >
                            <span className="py-[4px] px-[2.5px]">
                              {singleSize?.display}
                            </span>
                            {isSelected && (
                              <span className="block w-[4px] h-[4px] bg-[#1F1F1F] rounded-[1px] mt-1 mx-auto" />
                            )}
                            {!singleSize?.is_available && (
                              <svg className="absolute w-full h-full top-0 left-0">
                                <line
                                  x1="0"
                                  y1="100%"
                                  x2="100%"
                                  y2="0"
                                  stroke="#aaaaaa"
                                  strokeWidth="1"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* color */}
              {/* <div className="flex items-center gap-2 relative flex-[0_0_auto]"> */}
              {/* {singleItemDetails?.product?.attributes?.map((color) => (
                  <div
                    key={color.id}
                    className={`w-6 h-6 cursor-pointer border-2 relative ${selectedColor?.id === color.id
                      ? "border-black"
                      : "border-transparent"
                      }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor?.id === color.id && (
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-[1px]"
                        style={{ marginTop: "2px" }}
                      />
                    )}
                  </div>
                ))} */}
              {/* </div> */}
            </div>

            {/* {
              isDeliveryPromise &&
              !isOutOfStock &&
              isServiceable &&
              singleItemDetails?.delivery_promise?.formatted?.max && (
                <div className="flex items-center justify-center">
                  <div className="text-ekke-black">
                    <SvgWrapper svgSrc="truck" />
                  </div>
                  <div className="!text-ekke-neutral-darker body-1 leading-[120%] tracking-[0%]">
                    {`${t("resource.common.delivery_by", {
                      date: convertUTCDateToLocalDate(
                        singleItemDetails?.delivery_promise?.formatted?.max,
                        { weekday: 'short', day: '2-digit', month: 'short' },
                        formatLocale(locale, countryCode, true),
                      )
                    })}`}
                  </div>
                </div>
              )
            } */}

            <div className="flex gap-[10px] p-[8px] w-[100%] justify-end items-center ">
              <span
                class="text-[12px] font-archivo font-[400] leading-[120%] text-ekke-black tracking-normal text-right underline decoration-solid cursor-pointer hover:text-ekke-gray"
                onClick={() => {
                  onWishlistButtonClick({
                    item: singleItemDetails,
                    size: currentSize,
                    index: itemIndex,
                  });
                }}
              >
                Move to Wishlist
              </span>
              <span
                class="text-[12px] font-archivo font-[400] leading-[120%] text-ekke-black tracking-normal text-right underline decoration-solid cursor-pointer hover:text-ekke-gray"
                onClick={(e) => {
                  cartUpdateHandler(
                    e,
                    singleItemDetails,
                    currentSize,
                    0,
                    itemIndex,
                    "remove_item"
                  );
                }}
              >
                Delete
              </span>
            </div>
          </div>

          <FreeGiftItem
            item={singleItemDetails}
            currencySymbol={
              singleItemDetails?.price?.converted?.currency_symbol ??
              singleItemDetails?.price?.base?.currency_symbol
            }
          />
        </div>

        {/* for mobile */}

        <div className="md:hidden flex justify-between items-center">
          <div className="flex flex-wrap gap-3 font-archivo py-[8px] bg-white">
            {sortedAvailableSizes?.length > 0 &&
              sortedAvailableSizes?.map((singleSize) => {
                const isSelected = selectedSizeLocal === singleSize?.value;

                return (
                  <div
                    key={`${singleItemDetails?.product?.uid}_${singleSize?.value}`}
                    className="inline-block text-[12px] font-archivo leading-[1.2] tracking-normal cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div
                      className={`${isSelected ? "text-ekke-black" : "text-neutral-light"} cursor-pointer ${!singleSize?.is_available ? "text-neutral-light" : ""} text-[12px] leading-[1.2] tracking-normal text-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!singleSize?.is_available) return;
                        if (singleSize?.value && !isSelected) {
                          setSizeModalErr(null);
                          setSelectedSizeLocal(singleSize?.value);
                        }
                        onUpdateCartItems(
                          e,
                          singleItemDetails,
                          singleSize?.value,
                          singleItemDetails?.quantity || 0,
                          itemIndex,
                          "update_item"
                        );
                      }}
                    >
                      <span className="py-[4px] px-[2.5px]">
                        {singleSize?.display}
                      </span>
                      {isSelected && (
                        <span className="block w-[6px] h-[6px] bg-[#1F1F1F] rounded-[1px] mt-1 mx-auto" />
                      )}
                      {!singleSize?.is_available && (
                        <svg className="absolute w-full h-full top-0 left-0">
                          <line
                            x1="0"
                            y1="100%"
                            x2="100%"
                            y2="0"
                            stroke="#aaaaaa"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          <div></div>
        </div>

        {isPromoModalOpen && clickedPromoIndex === itemIndex && (
          <Modal
            isOpen={isPromoModalOpen}
            closeDialog={() => {
              onClosePromoModal();
              setClickedPromoIndex(null);
            }}
            modalType={isMobile ? "right-modal" : "center-modal"}
            title={`${promoTitle} ${t("resource.common.applied")}`}
            isCancellable={false}
            containerClassName={styles.chipModal}
          >
            <div className={`${styles.promoBody}`}>
              {singleItemDetails?.promotions_applied?.map(
                (promoItem, index) => (
                  <div
                    className={styles.promotionWrapper}
                    key={promoItem.promo_id + index}
                  >
                    <div className={styles.promoOffer}>
                      <SvgWrapper svgSrc="applied-promo" />
                      <div className={styles.labelTextWrapper}>
                        {promoItem?.offer_label && (
                          <div className={styles.promoLabel}>
                            {promoItem.offer_label}
                          </div>
                        )}
                        <div className={styles.textToggleWrapper}>
                          <div className={styles.promoText}>
                            {promoItem.offer_text}
                          </div>
                          {promoItem?.offer_description?.length > 0 && (
                            <div
                              className={styles.termCondition}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleActivePromo(e, index);
                              }}
                            >
                              {t("resource.cart.t&c")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {activePromoIndex === index &&
                      promoItem.offer_description &&
                      promoItem.offer_description.length > 0 && (
                        <div
                          className={styles.htmlContent}
                          suppressHydrationWarning
                          dangerouslySetInnerHTML={{
                            __html: promoItem.offer_description,
                          }}
                        />
                      )}
                  </div>
                )
              )}
            </div>
          </Modal>
        )}
      </div>

      {/* <Modal
        isOpen={
          sizeModal && cartItems[sizeModal] !== null && sizeModal === singleItem
        }
        closeDialog={(e) => {
          e.stopPropagation();
          setSizeModal(null);
          setCurrentSizeModalSize(null);
          setSizeModalErr(null);
        }}
        isCancellable={false}
        headerClassName={styles.sizeModalHeader}
        containerClassName={styles.sModalContainer}
        title={
          <div className={styles.sizeModalTitle}>
            <div className={styles.sizeModalDiv}>
              <div className={styles.sizeModalImage}>
                <img
                  src={
                    sizeModalItemValue?.product?.images?.length > 0
                      ? sizeModalItemValue?.product?.images[0]?.url?.replace(
                        "original",
                        "resize-w:250"
                      )
                      : undefined
                  }
                />
              </div>
              <div className={styles.sizeModalContent}>
                <div>
                  <div className={styles.sizeModalBrand}>
                    {sizeModalItemValue?.product?.brand?.name}
                  </div>
                  <div className={styles.sizeModalName}>
                    {sizeModalItemValue?.product?.name}
                  </div>
                </div>
                <div className={styles.sizeDiscount}>
                  {currencyFormat(
                    numberWithCommas(
                      sizeModalItemValue?.article?.price?.converted
                        ?.effective ??
                      sizeModalItemValue?.article?.price?.base?.effective
                    ),
                    sizeModalItemValue?.article?.price?.converted
                      ?.currency_symbol ??
                    sizeModalItemValue?.article?.price?.base?.effective,
                    formatLocale(locale, countryCode, true)
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className={styles.sizeModalBody}>
          <div className={styles.sizeSelectHeading}>
            {sizeModalItemValue?.availability?.available_sizes?.length > 0
              ? t("resource.common.select_size")
              : t("resource.cart.product_not_available")}
          </div>
          <div className="flex flex-wrap gap-3">
            {sizeModalItemValue?.availability?.available_sizes?.length > 0 &&
              sizeModalItemValue?.availability?.available_sizes?.map(
                (singleSize) => {
                  const isEarlierSelectedSize =
                    !currentSizeModalSize &&
                    sizeModal?.split("_")[1] === singleSize?.value;
                  const isCurrentSelectedSize =
                    currentSizeModalSize?.split("_")[1] === singleSize?.value;
                  return (
                    <div
                      key={singleSize?.display}
                      className={`${styles.singleSize}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div
                        className={`${styles.singleSizeDetails} ${(isEarlierSelectedSize || isCurrentSelectedSize) &&
                          styles.singleSizeSelected
                          }
                          ${!singleSize?.is_available &&
                          styles.sigleSizeDisabled
                          }
                          `}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!singleSize?.is_available) return;
                          if (singleSize?.value && !isEarlierSelectedSize) {
                            setSizeModalErr(null);
                            const newSizeModalValue = `${sizeModal?.split("_")[0]
                              }_${singleSize?.value}_${sizeModal?.split("_")[2]}`;
                            setCurrentSizeModalSize(newSizeModalValue);
                          }
                        }}
                      >
                        {singleSize?.display}
                        {!singleSize?.is_available && (
                          <svg className="absolute w-full h-full top-0 left-0">
                            <line x1="0" y1="100%" x2="100%" y2="0" stroke="#aaaaaa" strokeWidth="1" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </div>
        <div className={styles.sizeModalErrCls}>{sizeModalErr}</div>
        <button
          className={`${styles.sizeModalFooter} ${(!currentSizeModalSize || currentSizeModalSize === sizeModal || sizeModalErr) && styles.disableBtn}`}
          disabled={
            !currentSizeModalSize ||
            currentSizeModalSize === sizeModal ||
            sizeModalErr
          }
          onClick={(e) => {
            let itemIndex;
            for (let j = 0; j < cartItemsWithActualIndex.length; j += 1) {
              if (
                `${cartItemsWithActualIndex[j]?.key}_${cartItemsWithActualIndex[j]?.article?.store?.uid}` ===
                sizeModal
              ) {
                itemIndex = j;
                break;
              }
            }
            cartUpdateHandler(
              e,
              sizeModalItemValue,
              currentSizeModalSize
                ? currentSizeModalSize.split("_")[1]
                : sizeModal?.split("_")[1],
              cartItemsWithActualIndex[itemIndex]?.quantity || 0,
              itemIndex,
              "update_item",
              true
            );
          }}
        >
          <div className={styles.updateSizeButton}>{t("resource.facets.update")}</div>
        </button>
      </Modal> */}
    </>
  );
}
