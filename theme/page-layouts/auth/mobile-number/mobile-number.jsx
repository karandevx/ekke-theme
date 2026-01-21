import React, { useRef, useEffect, useId } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import styles from "./mobile-number.less";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useGlobalTranslation } from "fdk-core/utils";

function MobileNumber({
  name = "",
  mobile = "",
  countryCode = "91",
  disable = false,
  isShowLabel = false,
  isRequired,
  allowDropdown = true,
  isFocused = false,
  placeholder = "",
  label = "",
  error,
  onChange,
  inputClassName,
  containerClassName,
  labelClassName,
  inputContainerClassName,
  inputProps,
  height = "auto",
  textColor = "#171717",
  backgroundColor = "#ffffff",
  fontSize = "11px",
  countryIso,
  ...rest
}) {
  const { t } = useGlobalTranslation("translation");
  const inputId = useId();
  const phoneInputRef = useRef(null);

  const phoneUtil = PhoneNumberUtil.getInstance();

  const isPhoneValid = (phoneNumber, countryIso2) => {
    try {
      return phoneUtil.isValidNumber(
        phoneUtil.parseAndKeepRawInput(phoneNumber, countryIso2)
      );
    } catch (error) {
      return false;
    }
  };

  const getNumber = (mobileNumber, dialCode) =>
    mobileNumber?.replace(new RegExp(`^\\+${dialCode}`), "");

  const handleChange = (phone, { country }) => {
    const mobileNumber = getNumber(phone, country?.dialCode);

    onChange?.({
      mobile: mobileNumber,
      countryCode: country?.dialCode,
      isValidNumber: isPhoneValid(phone),
    });
  };

  useEffect(() => {
    if (isFocused) {
      document.getElementById(inputId)?.focus();
    }
  }, [inputId, isFocused]);

  useEffect(() => {
    if (countryIso && phoneInputRef?.current?.setCountry) {
      phoneInputRef?.current?.setCountry(countryIso);
    }
  }, [countryIso, phoneInputRef?.current, mobile]);

  return (
    <div
      className={`${styles.mobileInputWrapper} ${error ? styles.errorInput : ""} ${containerClassName || ""}`}
    >
      {isShowLabel && (
        <label
          className={`${styles.inputTitle} ${labelClassName || ""}`}
          htmlFor={inputId}
        >
          {label || t("resource.common.mobile")}
          {isRequired === "optional" ? (
            ` (${t("resource.common.optional_lower")})`
          ) : (
            <span className={styles.required}> * </span>
          )}
        </label>
      )}

      <PhoneInput
        name={name}
        defaultCountry="in"
        value={`+${countryCode}${mobile}`}
        onChange={handleChange}
        forceDialCode
        ref={phoneInputRef}
        style={{
          "--react-international-phone-height":
            height === "auto" ? "24px" : height,
          "--react-international-phone-text-color": textColor,
          "--react-international-phone-border-radius": "1px",
          "--react-international-phone-border-color": `${error ? "#5C2E20" : "#EEEEEE"}`,
          "--react-international-phone-background-color": backgroundColor,
          "--react-international-phone-dropdown-item-background-color":
            "#ffffff",
          "--react-international-phone-selected-dropdown-item-background-color":
            "#f7f7f5",
          "--react-international-phone-dropdown-top": "36px",
          "--react-international-phone-font-size": fontSize,
          "--react-international-phone-country-selector-border-color": `${error ? "#5C2E20" : "#EEEEEE"}`,
          "--react-international-phone-country-selector-background-color":
            backgroundColor,
          "--react-international-phone-country-selector-background-color-hover":
            backgroundColor,
          "--react-international-phone-font-family": "inherit",
          "--react-international-phone-placeholder-color": "#AAA",
          direction: "ltr",
        }}
        countrySelectorStyleProps={{
          buttonContentWrapperStyle: {
            gap: "4px",
          },
          buttonStyle: {
            padding: "0 8px",
            backgroundColor: backgroundColor,
            border: `1px solid ${error ? "#5C2E20" : "#EEEEEE"}`,
            borderRadius: "1px",
            height: height === "auto" ? "24px" : height,
          },
          buttonClassName: `${styles.countryButton}`,
          dropdownStyleProps: {
            style: {
              zIndex: 999,
            },
          },
        }}
        disabled={disable}
        className={`${styles.mobileInputContainer} ${inputContainerClassName || ""}`}
        inputClassName={`${styles.mobileNumberInput} ${inputClassName || ""}`}
        inputProps={{
          id: inputId,
          autoComplete: "tel",
          style: {
            backgroundColor: backgroundColor,
            border: `1px solid ${error ? "#5C2E20" : "#EEEEEE"}`,
            borderRadius: "1px",
            fontSize: fontSize,
            color: textColor,
            outline: "none",
            height: height === "auto" ? "24px" : height,
          },
          className: "placeholder:text-[11px] placeholder:text-[#AAA] w-full",
          onFocus: (e) => {
            e.target.style.borderColor = error ? "#5C2E20" : "#AAAAAA";
          },
          onBlur: (e) => {
            e.target.style.borderColor = error ? "#5C2E20" : "#EEEEEE";
          },
          ...inputProps,
        }}
        placeholder={placeholder}
        hideDropdown={!allowDropdown}
        dialCodePreviewStyleProps={{
          className: styles.dialCodePreview,
        }}
        disableDialCodePrefill={true}
        disableDialCodeAndPrefix={true}
        showDisabledDialCodeAndPrefix={true}
        {...rest}
      />
      {error && (
        <p className="body-2 text-[#5c2e20] text-left">{error.message}</p>
      )}
    </div>
  );
}

export default MobileNumber;
