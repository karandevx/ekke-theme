import React from "react";
import { Controller } from "react-hook-form";
import FyInputGroup from "../core/fy-input-group/fy-input-group";
import FyDropdown from "../../components/core/fy-dropdown/fy-dropdown-lib";
import MobileNumber from "../../page-layouts/auth/mobile-number/mobile-number";
import styles from "./form-input-selector.less";
import {
  startsWithResource,
  translateValidationMessages,
} from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";

const FormInputSelector = ({
  formData,
  control,
  allowDropdown,
  isSingleField = false,
  mobileNumberProps = {},
  labelClassName = "",
  formMethods = {},
}) => {
  const { t } = useGlobalTranslation("translation");
  const {
    display = "",
    enum: options = [],
    key = "",
    placeholder = "",
    regex = "",
    showRegexInput = false,
    required = false,
    type = "",
    error_message = "",
    countryCode,
    disabled = false,
    readOnly = false,
    onChange = () => {},
    countryIso = "",
    maxLength,
  } = formData;
  const getInput = ({ error, field }) => {
    switch (type) {
      case "checkbox":
      case "radio": {
        return (
          <FyInputGroup
            name={key}
            options={options}
            label={startsWithResource(display) ? t(display) : display}
            type={type}
            required={required}
            error={error}
            value={field?.value}
            onChange={(value) => {
              field?.onChange(value);
              onChange(value, formMethods);
            }}
            inputClassName={{ height: "24px" }}
          />
        );
      }
      case "list": {
        return (
          <FyDropdown
            name={key}
            error={error}
            options={options}
            value={field?.value}
            required={required}
            label={startsWithResource(display) ? t(display) : display}
            placeholder={placeholder}
            containerClassName={`${styles.customClass} ${isSingleField ? styles.singleField : ""}`}
            disabled={disabled}
            onChange={(value) => {
              field?.onChange(value);
              onChange(value, formMethods);
            }}
          />
        );
      }
      case "mobile": {
        return (
          <MobileNumber
            name={key}
            mobile={field?.value?.mobile}
            label={startsWithResource(display) ? `${t(display)}` : `${display}`}
            error={error}
            isRequired={required}
            isShowLabel={true}
            placeholder={placeholder}
            countryCode={countryCode}
            containerClassName={`${styles.customClass} ${isSingleField ? styles.singleField : ""}`}
            labelClassName={`${styles.mobileLabel} ${labelClassName}`}
            telInputClassName={styles.telInput}
            {...mobileNumberProps}
            allowDropdown={allowDropdown}
            backgroundColor="#ffffff"
            height="24px"
            textColor="#171717"
            fontSize="12px"
            disabled={disabled}
            inputProps={{ readOnly }}
            countryIso={countryIso}
            onChange={(value) => {
              field?.onChange(value);
              onChange(value, formMethods);
            }}
          />
        );
      }
      default: {
        const labelText = startsWithResource(display) ? t(display) : display;
        return (
          <div
            className={`${styles.inputContainer} ${styles.customClass} ${isSingleField ? styles.singleField : ""}`}
          >
            {labelText && (
              <label className={`${styles.inputLabel} ${labelClassName}`}>
                {labelText}
                {required && <span className={styles.required}> *</span>}
              </label>
            )}
            {type === "textarea" ? (
              <textarea
                name={key}
                placeholder={placeholder}
                value={field.value || ""}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                disabled={disabled}
                readOnly={readOnly}
                maxLength={maxLength}
                rows={5}
                onChange={(event) => {
                  field?.onChange(event?.target?.value);
                  onChange(event?.target?.value, formMethods);
                }}
              />
            ) : (
              <input
                name={key}
                type={type || "text"}
                placeholder={placeholder}
                value={field.value || ""}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                disabled={disabled}
                readOnly={readOnly}
                maxLength={maxLength}
                onInput={(event) => {
                  // For pincode field, enforce 6 digit limit and numeric only
                  if (key === "area_code") {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                    event.target.value = value;
                  } else if (maxLength) {
                    // For other fields with maxLength, enforce the limit
                    event.target.value = event.target.value.slice(0, maxLength);
                  }
                }}
                onChange={(event) => {
                  field?.onChange(event?.target?.value);
                  onChange(event?.target?.value, formMethods);
                }}
              />
            )}
            {error && (
              <span className={styles.errorMessage}>
                {error?.message || t("resource.common.invalid_input")}
              </span>
            )}
          </div>
        );
      }
    }
  };

  return (
    <Controller
      name={key}
      control={control}
      rules={translateValidationMessages(formData.validation, t)}
      render={({ field, fieldState: { error } }) => {
        return getInput({ field, error });
      }}
    />
  );
};

export default FormInputSelector;
