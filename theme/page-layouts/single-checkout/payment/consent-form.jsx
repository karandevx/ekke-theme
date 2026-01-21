import React, { useState } from "react";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
import styles from "./consent-form.less";
import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import useCart from "../../cart/useCart";

const ConsentForm = ({
  onConsentSubmit,
  onBack,
  getTotalValue,
  currencySymbol,
  payment,
  redirectPaymentOptions,
  showPaymentOptions,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [errors, setErrors] = useState({});
  const fpi = useFPI();
  const { cartItemsWithActualIndex } = useCart(fpi);

  // Check if cart is empty
  const isCartEmpty =
    !cartItemsWithActualIndex || cartItemsWithActualIndex.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that user has agreed to terms
    if (!agreedToTerms) {
      setErrors({
        terms: "You must agree to the terms and conditions to continue",
      });
      return;
    }

    // Call parent handler with consent data
    if (onConsentSubmit) {
      onConsentSubmit({
        agreedToTerms,
        agreeToMarketing,
      });
    }
  };

  const totalValue = getTotalValue ? getTotalValue() : 0;
  const displayTotal = `${currencySymbol || "$"}${totalValue?.toFixed(2)}`;

  return (
    <div
      className={`${styles.consentForm} flex flex-col px-[12px] py-[10px] h-full md:h-[calc(100vh-182px)]`}
    >
      {/* Header */}
      <div className="pb-6 pt-2">
        <p className="font-bold text-[11px] leading-[120%] text-ekke-black font-road-radio uppercase">
          Payment
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col px-[8px] pt-[8px] pb-[24px] justify-between spacae-center h-full gap-6"
      >
        {/* Consent Checkboxes */}
        <div className="flex flex-col gap-6 max-w-[324px] w-full">
          {/* Terms and Conditions Checkbox */}
          <div className="flex gap-2 items-start">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className={styles.checkboxInput}
              />
            </div>
            <label
              htmlFor="terms"
              className="body-1 flex-1 font-archivo text-[11px] leading-[120%] text-ekke-black uppercase cursor-pointer"
            >
              I CONFIRM THAT I HAVE READ AND UNDERSTOOD THE TERMS AND CONDITIONS
              AND PRIVACY POLICY
            </label>
          </div>

          {errors.terms && (
            <p className="text-xs text-red-500 font-archivo pl-[10px]">
              {errors.terms}
            </p>
          )}

          {/* Marketing Consent Checkbox */}
          <div className="flex gap-2 items-start">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                id="marketing"
                checked={agreeToMarketing}
                onChange={(e) => setAgreeToMarketing(e.target.checked)}
                className={styles.checkboxInput}
              />
            </div>
            <label
              htmlFor="marketing"
              className="body-1 flex-1 font-archivo text-[11px] leading-[120%] text-ekke-black uppercase cursor-pointer"
            >
              I would like to receive updates about new launches and other
              inspirational content
            </label>
          </div>
        </div>

        <div>
          {/* Information Sections */}
          <div className="flex flex-col">
            {/* Payment Methods Info */}
            <div className="flex justify-between items-center self-stretch rounded-[1px] border-b border-t border-r-0 border-l-0 border-solid border-[#EEEEEE] py-3 px-2">
              <div className="flex items-center justify-between w-full">
                <p className="font-archivo text-[11px] leading-[120%] text-ekke-black uppercase">
                  We securely accept
                </p>
                <div className="flex gap-1 items-end h-4">
                  <SvgWrapper
                    svgSrc="visa"
                    style={{ filter: "grayscale(100%)" }}
                  />
                  <SvgWrapper
                    svgSrc="mastercard"
                    style={{ filter: "grayscale(100%)" }}
                  />
                  <SvgWrapper
                    svgSrc="applepay"
                    style={{ filter: "grayscale(100%)" }}
                  />
                  <SvgWrapper
                    svgSrc="paytm"
                    style={{ filter: "grayscale(100%)" }}
                  />
                  <SvgWrapper
                    svgSrc="upi"
                    style={{ filter: "grayscale(100%)" }}
                  />
                </div>
              </div>
            </div>

            {/* Free Shipping Info */}
            <div className="flex justify-between items-center self-stretch rounded-[1px] border-b border-t-0 border-r-0 border-l-0 border-solid border-[#EEEEEE] py-3 px-2">
              <div className="flex flex-col gap-2.5">
                <p className="font-archivo text-[11px] leading-[120%] text-ekke-black uppercase">
                  FREE SHIPPING, FREE RETURNS
                </p>
                <div className="flex gap-3">
                  <p className="flex-1 font-archivo text-[11px] leading-[140%] text-neutral-light pl-3">
                    Enjoy complimentary express shipping and free returns. For
                    further details, please consult the{" "}
                    <span className="text-ekke-black underline cursor-pointer">
                      Return Policy.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Client Services Info */}
            <div className="flex justify-between items-center self-stretch rounded-[1px] border-b border-t-0 border-r-0 border-l-0 border-solid border-[#EEEEEE] py-3 px-2">
              <div className="flex flex-col gap-2.5">
                <p className="font-archivo text-[11px] leading-[120%] text-ekke-black uppercase">
                  CLIENT SERVICES
                </p>
                <div className="flex gap-3">
                  <p className="flex-1 font-archivo text-[11px] leading-[140%] text-neutral-light pl-3">
                    Our client advisors are available to answer your questions
                    24/7.{" "}
                    <span className="text-ekke-black underline cursor-pointer">
                      Contact client services
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Save and Continue Button - only enabled if terms are agreed */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!agreedToTerms || isCartEmpty}
          className={`px-2 py-3 w-full font-archivo uppercase rounded-[1px] text-[12px] font-normal leading-[120%] transition-colors ${
            agreedToTerms && !isCartEmpty
              ? "bg-ekke-black text-white hover:bg-opacity-90 cursor-pointer"
              : "bg-[#EEEEEE] text-neutral-light cursor-not-allowed opacity-50"
          }`}
        >
          SAVE AND CONTINUE
        </button>

        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="font-semibold text-[12px] px-2 py-2 text-ekke-black bg-transparent border border-solid border-ekke-black uppercase text-center leading-[140%] cursor-pointer flex items-center justify-center gap-1 hover:opacity-70 transition-opacity"
          >
            <span className="text-[11px] font-archivo leading-[120%] tracking-[0%] uppercase text-ekke-black">
              BACK
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ConsentForm;
