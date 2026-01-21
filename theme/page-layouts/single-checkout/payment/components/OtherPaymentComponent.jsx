import React, { useState } from "react";
import styles from "../checkout-payment-content.less";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import { useViewport } from "../../../../helper/hooks";
import { priceFormatCurrencySymbol } from "../../../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import StickyPayNow from "../sticky-pay-now/sticky-pay-now";

const OtherPaymentComponent = ({
    otherPaymentOptions,
    selectedPaymentPayload,
    proceedToPay,
    selectMop,
    removeDialogueError,
    onPriceDetailsClick,
    enableLinkPaymentOption,
    getCurrencySymbol,
    getTotalValue,
    acceptOrder,
    isTablet,
    setTab,
    setSelectedTab,
    toggleMop,
    selectedTab,
    activeMop,
    selectedOtherPayment,
    setSelectedOtherPayment,
}) => {
    const { t } = useGlobalTranslation("translation");

    const getOPBorder = (op) => {
        if (op && selectedOtherPayment.code === op.code) {
            return `${styles.selectedBorder}`;
        }
        return `${styles.nonSelectedBorder}`;
    };

    const handleOtherPaymentSelection = (other) => {
        removeDialogueError();
        if (other?.list?.[0]?.code) {
            selectMop("Other", other?.name, other?.list?.[0]?.code);
            setSelectedOtherPayment(other?.list?.[0]);
        }
    };

    const handleProceedToPay = () => {
        proceedToPay("Other", selectedPaymentPayload);
        acceptOrder();
    };

    const OtherItem = ({ other, key }) => {
        return (
            <div
                key={key}
                className={`${styles.modeItemWrapper} ${getOPBorder(other?.list?.[0])}`}
                onClick={() => handleOtherPaymentSelection(other)}
            >
                <label>
                    <div className={styles.modeItem}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div className={styles.modeItemLogo}>
                                <img
                                    src={other?.list?.[0]?.logo_url?.small}
                                    alt={other?.list?.[0]?.display_name}
                                />
                            </div>
                            <div className={styles.modeItemName}>
                                {other?.list?.[0]?.display_name ?? ""}
                            </div>
                        </div>
                        <div className={`${styles.otherLeft} ${styles.onMobileView}`}>
                            {(!selectedOtherPayment ||
                                selectedOtherPayment?.code !==
                                other?.list?.[0]?.code) && (
                                    <SvgWrapper svgSrc={"radio"}></SvgWrapper>
                                )}
                            {selectedOtherPayment &&
                                selectedOtherPayment?.code === other?.list?.[0]?.code && (
                                    <SvgWrapper svgSrc="radio-selected" />
                                )}
                        </div>
                    </div>
                </label>
                <div className={styles.otherPay}>
                    {isTablet ? (
                        <StickyPayNow
                            customClassName={styles.visibleOnTab}
                            value={priceFormatCurrencySymbol(
                                getCurrencySymbol,
                                getTotalValue()
                            )}
                            onPriceDetailsClick={onPriceDetailsClick}
                            disabled={!selectedOtherPayment?.code}
                            enableLinkPaymentOption={enableLinkPaymentOption}
                            proceedToPay={handleProceedToPay}
                        />
                    ) : (
                        selectedOtherPayment?.code &&
                        selectedOtherPayment.code === other?.list?.[0]?.code && (
                            <button
                                className={`${styles.commonBtn} ${styles.payBtn}`}
                                onClick={handleProceedToPay}
                            >
                                {t("resource.common.pay_caps")}{" "}
                                {priceFormatCurrencySymbol(
                                    getCurrencySymbol,
                                    getTotalValue()
                                )}
                            </button>
                        )
                    )}
                </div>
            </div>
        );
    };

    const renderOtherContent = () => (
        <div>
            <div
                className={`${styles.otherHeader} ${styles["view-mobile-up"]}`}
            >
                {t("resource.checkout.select_payment_option")}
            </div>
            <div className={styles.modeOption}>
                {otherPaymentOptions?.length &&
                    otherPaymentOptions.map((op, index) => (
                        <OtherItem other={op} key={`other-${index}`} />
                    ))}
            </div>
        </div>
    );

    const renderOtherNavigation = () => (
        <div
            className={`${styles.linkWrapper} ${selectedTab === "Other" && !isTablet ? styles.selectedNavigationTab : styles.linkWrapper} ${selectedTab === "Other" && isTablet ? styles.headerHightlight : ""}`}
        >
            <div
                className={styles["linkWrapper-row1"]}
                onClick={() => {
                    setTab("Other");
                    setSelectedTab("Other");
                    toggleMop("Other");
                }}
            >
                <div
                    className={`${selectedTab === "Other" ? styles.indicator : ""} ${styles.onDesktopView}`}
                >
                    &nbsp;
                </div>
                <div className={styles.link}>
                    <div className={styles.icon}>
                        <SvgWrapper svgSrc="payment-other"></SvgWrapper>
                    </div>
                    <div
                        className={`${styles.modeName} ${selectedTab === "Other" ? styles.selectedModeName : ""}`}
                    >
                        {t("resource.checkout.more_payment_options")}
                    </div>
                </div>
                <div
                    className={`${styles.arrowContainer}  ${styles.activeIconColor}`}
                >
                    <SvgWrapper
                        className={
                            selectedTab === "Other" && activeMop === "Other"
                                ? styles.upsideDown
                                : ""
                        }
                        svgSrc="accordion-arrow"
                    />
                </div>
            </div>
            {isTablet && activeMop === "Other" && (
                <div className={` ${styles.onMobileView}`}>
                    {selectedTab === "Other" && renderOtherContent()}
                </div>
            )}
        </div>
    );

    return {
        renderOtherContent,
        renderOtherNavigation,
    };
};

export default OtherPaymentComponent;
