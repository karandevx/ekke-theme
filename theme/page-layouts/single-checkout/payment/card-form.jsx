import React, { useEffect, useRef } from "react";
import { IMaskInput } from "react-imask";
import styles from "./checkout-payment-content.less";
import Modal from "../../../components/core/modal/modal";
import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import StickyPayNow from "./sticky-pay-now/sticky-pay-now";
import { priceFormatCurrencySymbol } from "../../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import JuspayCardForm from "./juspay-card-from";

function CardForm({
  cardNumberRef,
  handleNewCardNumberChange,
  cardNumberError,
  CREDIT_CARD_MASK,
  nameRef,
  cardNameError,
  cardExpiryDate,
  handleNewCardExpiryChange,
  cardExpiryError,
  cvvNumber,
  keypressCvv,
  setCvvNumber,
  showError,
  cardCVVError,
  loggedIn,
  isCardSecure,
  handleNewCardSaveState,
  openGuidelinesModal,
  setOpenGuidelinesModal,
  payUsingCard,
  getCurrencySymbol,
  getTotalValue,
  cardNumber,
  handleCardNumberInput,
  handleCardNumberPaste,
  validateCardNumber,
  nameOnCard,
  handleNameOnCardInput,
  validateNameOnCard,
  validateCardExpiryDate,
  handleCvvNumberInput,
  validateCvv,
  isCardValid,
  cardDetailsData,
  isTablet,
  onPriceDetailsClick = () => {},
  addNewCard,
  isCvvInfo,
  handleCvvInfo,
  validateCardDetails,
  setCardValidity,
  resetCardValidationErrors,
  paymentResponse,
  paymentOption,
  isJuspayEnabled,
  enableLinkPaymentOption,
  handleShowFailedMessage,
  cardDetails,
  selectMop,
  setIsJuspayCouponApplied,
}) {
  const { t } = useGlobalTranslation("translation");
  const isFormatterSet = useRef(false);

  useEffect(() => {
    if (!isFormatterSet.current) {
      isFormatterSet.current = true;
      resetCardValidationErrors();
      const parentEl = document.getElementById("card-validation");
      const element = document.getElementById("card-number");
      if (parentEl && element) {
        validateCardDetails(parentEl, element, setCardValidity);
      }
    }
  }, []);

  const starPlaceholder = (
    <>
      {t("resource.checkout.expiry_date")}
      <span style={{ color: "red" }}>*</span>
    </>
  );

  const CvvInfo = () => {
    return (
      <div className={styles.cvvInfoContainer}>
        <div className={styles.cvvInfo}>
          {!isTablet && isCvvInfo ? (
            <SvgWrapper
              svgSrc="paymentTooltipArrow"
              className={styles.upArrowMark}
            />
          ) : (
            <span
              onClick={() => handleCvvInfo(false)}
              className={styles.crossMobile}
            >
              {" "}
              <SvgWrapper svgSrc="closeBold" />{" "}
            </span>
          )}
          {cardDetailsData &&
            (!cardDetailsData.card_brand ||
              (cardDetailsData.card_brand &&
                cardDetailsData.card_brand !== "American Express")) && (
              <div className={styles.type}>
                <p className={styles.title}>
                  {t("resource.checkout.what_is_cvv_number")}
                </p>
                <p className={styles.desc}>
                  {t("resource.checkout.cvv_description")}
                </p>
                <div className={styles.cvImage}>
                  <SvgWrapper svgSrc="non-amex-card-cvv" />
                </div>
              </div>
            )}
          {cardDetailsData &&
            (!cardDetailsData.card_brand ||
              (cardDetailsData.card_brand &&
                cardDetailsData.card_brand === "American Express")) && (
              <div className={styles.type}>
                <p className={styles.title}>
                  {t("resource.checkout.have_american_express_card")}
                </p>
                <p className={styles.desc}>
                  {t("resource.checkout.amex_cvv_description")}
                </p>
                <div className={styles.cvImage}>
                  <SvgWrapper svgSrc="amex-card-cvv" />
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  if (isJuspayEnabled()) {
    return (
      <JuspayCardForm
        paymentResponse={paymentResponse}
        paymentOption={paymentOption}
        getCurrencySymbol={getCurrencySymbol}
        getTotalValue={getTotalValue}
        loggedIn={loggedIn}
        setOpenGuidelinesModal={setOpenGuidelinesModal}
        openGuidelinesModal={openGuidelinesModal}
        onPriceDetailsClick={onPriceDetailsClick}
        handleShowFailedMessage={handleShowFailedMessage}
        cardDetails={cardDetails}
        selectMop={selectMop}
        setIsJuspayCouponApplied={setIsJuspayCouponApplied}
      />
    );
  }

  return (
    <>
      <div className="w-full" id="card-validation">
        {/* Section Heading */}
        {/* <h3 className="body-1 font-semibold text-[#171717] mb-2">
          Enter card details
        </h3> */}

        {/* Helper Text */}
        <p className="body-2 text-[#AAAAAA] mb-6">
          All fields are required unless marked otherwise
        </p>

        {/* Card Number Field */}
        <div className="mb-4">
          <input
            id="card-number"
            type="text"
            value={cardNumber}
            onChange={validateCardNumber}
            onPaste={handleCardNumberPaste}
            onBlur={validateCardNumber}
            placeholder="Card Number"
            className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#AAAAAA]  ${
              cardNumberError
                ? "border-[#5C2E20] focus:border-[#5C2E20]"
                : "border-[#EEEEEE] focus:border-[#AAAAAA]"
            }`}
            dir="ltr"
          />
          {cardNumberError && (
            <span className="lg:body-2 body-5 text-[#5c2e20] mt-1 block">
              {cardNumberError}
            </span>
          )}
        </div>

        {/* Expiry Date and Security Code Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Expiry Date */}
          <div>
            <IMaskInput
              value={cardExpiryDate}
              onAccept={handleNewCardExpiryChange}
              mask="MM{/}YY"
              blocks={{
                MM: {
                  mask: IMask.MaskedRange,
                  from: 1,
                  to: 12,
                },
                YY: {
                  mask: IMask.MaskedRange,
                  from: 0,
                  to: 99,
                },
              }}
              unmask={true}
              definitions={{
                "/": {
                  mask: "/",
                },
              }}
              placeholder="Expiry Date"
              className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#AAAAAA] ${
                cardExpiryError
                  ? "border-[#5C2E20] focus:border-[#5C2E20]"
                  : "border-[#EEEEEE] focus:border-[#AAAAAA]"
              }`}
              onBlur={validateCardExpiryDate}
            />
            {cardExpiryError && (
              <span className="lg:body-2 body-5 text-[#5c2e20] mt-1 block">
                {cardExpiryError}
              </span>
            )}
          </div>

          {/* Security Code */}
          <div className="relative">
            <div className="relative">
              <input
                type="password"
                value={cvvNumber}
                onKeyPress={keypressCvv}
                maxLength="4"
                onChange={handleCvvNumberInput}
                onBlur={validateCvv}
                placeholder="Security code"
                className={`body-2 p-1 pr-[38px] w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#AAAAAA] ${
                  cardCVVError
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
                dir="ltr"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 body-5 !text-[8px] text-[#171717] underline cursor-pointer z-10"
                onClick={() => handleCvvInfo(true)}
                onMouseEnter={() => {
                  if (!isTablet) {
                    handleCvvInfo(true);
                  }
                }}
                onMouseLeave={() => {
                  if (!isTablet) {
                    handleCvvInfo(false);
                  }
                }}
              >
                Info
              </button>
            </div>
            {cardCVVError && (
              <span className="lg:body-2 body-5 text-[#5c2e20] mt-1 block">
                {cardCVVError}
              </span>
            )}
            {!isTablet && isCvvInfo && (
              <div className="absolute mt-2 z-50 right-0">
                <CvvInfo />
              </div>
            )}
          </div>
        </div>

        {/* Name on Card Field */}
        <div className="mb-4">
          <input
            type="text"
            maxLength="20"
            ref={nameRef}
            value={nameOnCard}
            onChange={handleNameOnCardInput}
            onBlur={validateNameOnCard}
            placeholder="Name On Card"
            className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#AAAAAA]  ${
              cardNameError
                ? "border-[#5C2E20] focus:border-[#5C2E20]"
                : "border-[#EEEEEE] focus:border-[#AAAAAA]"
            }`}
          />
          {cardNameError && (
            <span className="lg:body-2 body-5 text-[#5c2e20] mt-1 block">
              {cardNameError}
            </span>
          )}
        </div>

        {/* Save Card Checkbox */}
        {loggedIn && !enableLinkPaymentOption && (
          <div className="flex items-center gap-2">
            {/* <input
              type="checkbox"
              id="save-card"
              checked={isCardSecure}
              onChange={handleNewCardSaveState}
              className="w-4 h-4 mt-0.5 accent-black"
            />
            <label htmlFor="save-card" className="body-2 text-[#171717] flex-1">
              Save for my next payment
            </label> */}

            <input
              type="checkbox"
              checked={isCardSecure}
              onChange={handleNewCardSaveState}
              id="save-card"
              className="appearance-none w-2 h-2 border border-solid cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
              style={{
                borderRadius: 0,
                border: isCardSecure
                  ? "1px solid #5C2E20"
                  : "1px solid #AAAAAA",
              }}
            />
            <label className="body-4 text-[#171717] flex-1">
              Save for my next payment
            </label>
          </div>
        )}

        {/* RBI Guidelines Modal */}
        {loggedIn && !enableLinkPaymentOption && (
          <Modal
            isOpen={openGuidelinesModal}
            containerClassName={styles.rbiGuidelinesModal}
            closeDialog={() => {
              setOpenGuidelinesModal(false);
            }}
            title={(() => {
              return (
                <div style={{ display: "flex", padding: "8px" }}>
                  <SvgWrapper svgSrc="card-payment" />
                  <span style={{ paddingInlineStart: "8px", fontSize: "14px" }}>
                    {t("resource.checkout.improve_your_card_security")}
                  </span>
                </div>
              );
            })()}
          >
            <div className={styles.rbiGuidelinesContent}>
              <ul>
                <li className="fontBody">
                  {t("resource.checkout.card_consent_request_1")}
                </li>
                <li className="fontBody">
                  {t("resource.checkout.card_consent_request_2")}
                </li>
              </ul>
            </div>
          </Modal>
        )}
      </div>

      {/* Place Order Button - Mobile sticky */}
      {!addNewCard && isTablet && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white">
          <button
            className={`w-full py-3 body-1 uppercase text-left pl-2 transition-colors ${
              !isCardValid()
                ? "bg-[#AAAAAA] !text-white cursor-not-allowed"
                : "bg-[#171717] !text-white hover:bg-[#2a2a2a] cursor-pointer"
            }`}
            onClick={() => payUsingCard()}
            disabled={!isCardValid()}
          >
            PLACE ORDER,{" "}
            {priceFormatCurrencySymbol(getCurrencySymbol, getTotalValue())}
          </button>
        </div>
      )}
      {/* </div> */}
      {isCvvInfo && isTablet && (
        <Modal isOpen={isCvvInfo} hideHeader={true}>
          <CvvInfo />
        </Modal>
      )}
    </>
  );
}

export default CardForm;
