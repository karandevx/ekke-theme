import React, { useState } from "react";
import styles from "../checkout-payment-content.less";
import SvgWrapper from "../../../../components/core/svgWrapper/SvgWrapper";
import Modal from "../../../../components/core/modal/modal";
import Spinner from "../../../../components/spinner/spinner";
import { useViewport } from "../../../../helper/hooks";
import { priceFormatCurrencySymbol } from "../../../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";

const CODPaymentComponent = ({
    codOption,
    codCharges,
    getCurrencySymbol,
    proceedToPay,
    selectedPaymentPayload,
    selectedTab,
    setTab,
    setSelectedTab,
    selectMop,
    translateDynamicLabel,
    isTablet,
}) => {
    const { t } = useGlobalTranslation("translation");
    const [isCodModalOpen, setIsCodModalOpen] = useState(false);

    const handleCodSelection = () => {
        selectMop(codOption.name, codOption.name, codOption.name);
    };

    const handleProceedToPay = () => {
        proceedToPay("COD", selectedPaymentPayload);
    };

    const handleCloseModal = () => {
        setIsCodModalOpen(false);
        setTab("");
        setSelectedTab("");
    };

    const renderCodContent = () => (
        <div>
            {!isTablet ? (
                <div>
                    <div
                        className={`${styles.codHeader} ${styles["view-mobile-up"]}`}
                    >
                        {t("resource.checkout.cash_on_delivery")}
                    </div>
                    <p className={styles.codTitle}>
                        {t("resource.checkout.pay_on_delivery")}
                    </p>
                    {codCharges > 0 && (
                        <div className={styles.codInfo}>
                            +{priceFormatCurrencySymbol(getCurrencySymbol, codCharges)}{" "}
                            {t("resource.checkout.cod_extra_charge")}
                        </div>
                    )}
                    <div className={styles.codPay}>
                        <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={handleProceedToPay}
                        >
                            {t("resource.checkout.place_order")}
                        </button>
                    </div>
                </div>
            ) : (
                <Spinner />
            )}
        </div>
    );

    const renderCodNavigation = () => (
        <div style={{ display: "flex", flex: "1" }}>
            <div
                className={`${styles.linkWrapper} ${selectedTab === codOption.name && !isTablet ? styles.selectedNavigationTab : styles.linkWrapper} ${selectedTab === codOption.name && isTablet ? styles.headerHightlight : ""}`}
                key={codOption?.display_name ?? ""}
                onClick={handleCodSelection}
            >
                <div className={styles["linkWrapper-row1"]}>
                    <div
                        className={` ${selectedTab === codOption.name ? styles.indicator : ""} ${styles.onDesktopView}`}
                    >
                        &nbsp;
                    </div>
                    <div className={styles.link}>
                        <div className={styles.icon}>
                            <SvgWrapper svgSrc={codOption.svg}></SvgWrapper>
                        </div>
                        <div>
                            <div
                                className={`${styles.modeName} ${selectedTab === codOption.name ? styles.selectedModeName : ""}`}
                            >
                                {translateDynamicLabel(
                                    codOption?.display_name ?? "",
                                    t
                                )}
                            </div>
                            {isTablet && codCharges > 0 && (
                                <div className={styles.codCharge}>
                                    +
                                    {priceFormatCurrencySymbol(
                                        getCurrencySymbol,
                                        codCharges
                                    )}{" "}
                                    {t("resource.checkout.extra_charges")}
                                </div>
                            )}
                        </div>
                    </div>
                    {codOption?.image_src && (
                        <div className={styles["payment-icons"]}>
                            <img
                                src={codOption?.image_src}
                                alt={codOption?.svg}
                            />
                        </div>
                    )}
                    <div
                        className={`${styles.arrowContainer} ${styles.activeIconColor} ${styles.codIconContainer}`}
                    >
                        <SvgWrapper
                            className={
                                selectedTab === codOption.name &&
                                    selectedTab === codOption.name
                                    ? styles.upsideDown
                                    : ""
                            }
                            svgSrc="accordion-arrow"
                        />
                    </div>
                </div>
                {isTablet && (
                    <div>
                        {selectedTab === codOption.name && renderCodContent()}
                    </div>
                )}
            </div>
        </div>
    );

    const renderCodModal = () => (
        isCodModalOpen && isTablet && (
            <Modal
                isOpen={isCodModalOpen}
                hideHeader={true}
                closeDialog={handleCloseModal}
            >
                <div className={styles.codModal}>
                    <div className={styles.codIconsContainer}>
                        <SvgWrapper svgSrc="cod-icon"></SvgWrapper>
                        <span
                            className={styles.closeCodModal}
                            onClick={handleCloseModal}
                        >
                            <SvgWrapper svgSrc="closeBold"></SvgWrapper>
                        </span>
                    </div>
                    <div className={styles.codModalContent}>
                        <p className={styles.message}>
                            {t("resource.checkout.confirm_cod")}
                        </p>
                        {codCharges > 0 && (
                            <p className={styles.codCharges}>
                                +{priceFormatCurrencySymbol(getCurrencySymbol, codCharges)}{" "}
                                {t("resource.checkout.extra_charges")}
                            </p>
                        )}
                        <button
                            className={`${styles.commonBtn} ${styles.payBtn}`}
                            onClick={handleProceedToPay}
                        >
                            {t("resource.checkout.continue_with_cod")}{" "}
                            {priceFormatCurrencySymbol(getCurrencySymbol, codCharges)}
                        </button>
                    </div>
                </div>
            </Modal>
        )
    );

    return {
        renderCodContent,
        renderCodNavigation,
        renderCodModal,
        isCodModalOpen,
        setIsCodModalOpen,
    };
};

export default CODPaymentComponent;
