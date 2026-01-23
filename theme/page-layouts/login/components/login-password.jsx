import React, { useState, useId, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  checkIfNumber,
  translateDynamicLabel,
  validatePasswordField,
  validateEmailField,
} from "../../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { useToast } from "../../../components/custom-toaster";

import EkkeLogo from "../../../assets/images/logo/ekke-logo";
import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import MobileNumber from "../../../page-layouts/auth/mobile-number/mobile-number";
import TermPrivacy from "../../../page-layouts/login/components/term-privacy";
import styles from "../../../page-layouts/login/components/login-password.less";

function loginPassword({
  loginButtonText,
  error = null,
  isForgotPassword = true,
  onForgotPasswordClick = () => {},
  onLoginFormSubmit = () => {},
  onLoginToggleClick = () => {},
  termsAccepted = false,
  onTermsChange = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const toast = useToast();
  const shownErrorRef = useRef(null);
  const usernameInputId = useId();
  const passwordInputId = useId();
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [showInputNumber, setShowInputNumber] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const REMEMBER_ME_KEY = "ekke_remember_username";

  const togglePasswordDisplay = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPasswordShow((prevState) => !prevState);
  };

  const handleForgotPasswordClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onForgotPasswordClick(e);
  };

  const {
    handleSubmit,
    register,
    setValue,
    control,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      username: "",
      phone: {
        countryCode: "91",
        mobile: "",
        isValidNumber: false,
      },
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Load saved username on component mount
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(REMEMBER_ME_KEY);
      if (savedUsername) {
        setValue("username", savedUsername);
        setRemember(true);
      }
    } catch (error) {
      // Silently handle localStorage errors (e.g., in private browsing mode)
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading saved username:", error);
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (error) {
      // Show API errors in toaster
      const errorMessage = translateDynamicLabel(error.message || error, t);
      const errorKey = JSON.stringify(error);

      // Only show if this exact error hasn't been shown yet
      if (shownErrorRef.current !== errorKey) {
        toast.error(errorMessage);
        shownErrorRef.current = errorKey;
      }

      // Reset loading state when error occurs
      setIsLoading(false);
    }
  }, [error, toast, t]);

  useEffect(() => {
    if (checkIfNumber(watch("username"))) {
      setValue("phone.mobile", watch("username"));
      setShowInputNumber(true);
    }
  }, [watch("username")]);

  useEffect(() => {
    if (errors?.root) {
      clearErrors("root");
    }
  }, [watch("password"), watch("username"), watch("phone")]);

  const handleFormSubmit = async ({ username, phone, password }) => {
    // Reset error tracking on new submit
    shownErrorRef.current = null;

    const finalUsername = showInputNumber
      ? `${phone.countryCode}${phone.mobile}`
      : username;

    // Handle Remember Me functionality
    try {
      if (remember) {
        // Save username to localStorage
        localStorage.setItem(REMEMBER_ME_KEY, finalUsername);
      } else {
        // Remove saved username if remember is unchecked
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error) {
      // Silently handle localStorage errors (e.g., in private browsing mode)
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving username:", error);
      }
    }

    const data = {
      username: finalUsername,
      password,
    };

    setIsLoading(true);
    try {
      await onLoginFormSubmit(data);
      // Success - component will likely unmount due to redirect
    } catch (error) {
      // Error - reset loading state so user can try again
      setIsLoading(false);
    }
  };

  return (
    // <form
    //   className={styles.loginInputWrapper}
    //   onSubmit={handleSubmit(handleFormSubmit)}
    // >
    //   <div className={styles.loginMobileInput}>
    //     <div
    //       className={`${styles.loginInputGroup} ${errors?.username || errors?.phone || errors?.root ? styles.error : ""}`}
    //     >
    //       <label className={styles.loginInputTitle} htmlFor={usernameInputId}>
    //         {t("resource.auth.login.email_or_phone")}
    //       </label>
    //       {!showInputNumber ? (
    //         <input
    //           id={usernameInputId}
    //           type="text"
    //           {...register("username", {
    //             validate: (value) => {
    //               if (showInputNumber) {
    //                 return true;
    //               }
    //               return !!value || t("resource.common.enter_valid_username");
    //             },
    //           })}
    //         />
    //       ) : (
    //         <Controller
    //           name="phone"
    //           control={control}
    //           rules={{
    //             validate: (value) => {
    //               if (!showInputNumber) {
    //                 return true;
    //               }
    //               return (
    //                 value.isValidNumber ||
    //                 t("resource.common.enter_valid_phone_number")
    //               );
    //             },
    //           }}
    //           render={({ field, fieldState: { error } }) => (
    //             <MobileNumber
    //               isShowLabel={false}
    //               isFocused={true}
    //               mobile={field.value.mobile}
    //               countryCode={field.value.countryCode}
    //               error={error}
    //               onChange={(value) => {
    //                 field.onChange(value);
    //               }}
    //             />
    //           )}
    //         />
    //       )}
    //       {(errors?.username || errors?.phone) && (
    //         <p className={styles.loginAlert}>
    //           {errors?.phone?.message || errors?.username?.message}
    //         </p>
    //       )}
    //     </div>
    //     <div
    //       className={`${styles.loginInputGroup} ${errors?.password || errors?.root ? styles.error : ""}`}
    //     >
    //       <div style={{ position: "relative" }}>
    //         <label className={styles.loginInputTitle} htmlFor={passwordInputId}>
    //           {t("resource.auth.login.password")}
    //         </label>
    //         <input
    //           id={passwordInputId}
    //           type={isPasswordShow ? "text" : "password"}
    //           {...register("password", {
    //             validate: (value) =>
    //               validatePasswordField(value) ||
    //               t("resource.common.password_message"),
    //           })}
    //         />
    //         {watch("password") && (
    //           <button
    //             className={styles.passwordToggle}
    //             onClick={togglePasswordDisplay}
    //             aria-label={
    //               !isPasswordShow
    //                 ? t("resource.auth.login.show_password")
    //                 : t("resource.auth.login.hide_password")
    //             }
    //           >
    //             <SvgWrapper
    //               svgSrc={!isPasswordShow ? "show-password" : "hide-password"}
    //             />
    //           </button>
    //         )}
    //       </div>
    //       {(errors?.password || errors?.root) && (
    //         <p className={styles.loginAlert}>
    //           {errors?.password?.message || errors?.root?.message}
    //         </p>
    //       )}
    //     </div>

    //     {isForgotPassword && (
    //       <div className={styles.forgotBtnWrapper}>
    //         <button
    //           className={styles.forgotBtn}
    //           onClick={handleForgotPasswordClick}
    //         >
    //           {t("resource.auth.login.forgot_password")}
    //         </button>
    //       </div>
    //     )}
    //   </div>

    //   <button className={styles.loginButton} type="submit">
    //     {translateDynamicLabel(loginButtonText, t) ||
    //       t("resource.auth.login.login_caps")}
    //   </button>
    // </form>

    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`flex flex-col gap-4 justify-between h-full`}
    >
      {/* <div
        className={`${styles.loginInputGroup} ${errors?.username || errors?.phone || errors?.root ? styles.error : ""}`}
      >
        <label className={styles.loginInputTitle} htmlFor={usernameInputId}>
          {t("resource.auth.login.email_or_phone")}
        </label>
        {!showInputNumber ? (
          <input
            id={usernameInputId}
            type="text"
            {...register("username", {
              validate: (value) => {
                if (showInputNumber) {
                  return true;
                }
                return !!value || t("resource.common.enter_valid_username");
              },
            })}
          />
        ) : (
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => {
                if (!showInputNumber) {
                  return true;
                }
                return (
                  value.isValidNumber ||
                  t("resource.common.enter_valid_phone_number")
                );
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <MobileNumber
                isShowLabel={false}
                isFocused={true}
                mobile={field.value.mobile}
                countryCode={field.value.countryCode}
                error={error}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        )}
        {(errors?.username || errors?.phone) && (
          <p className={styles.loginAlert}>
            {errors?.phone?.message || errors?.username?.message}
          </p>
        )}
      </div> */}

      {/* Old */}
      <div>
        <div className="flex flex-col lg:gap-4 gap-6">
          <div className="flex flex-col gap-3">
            <input
              id={usernameInputId}
              type="text"
              {...register("username", {
                validate: (value) => {
                  if (showInputNumber) {
                    return true;
                  }
                  if (!value) {
                    return t("resource.common.enter_valid_username");
                  }
                  if (!validateEmailField(value)) {
                    return (
                      t("resource.common.invalid_email_address") ||
                      "Please enter a valid email address"
                    );
                  }
                  return true;
                },
              })}
              placeholder="EMAIL"
              className={`body-2 w-full bg-[#F7F7F5] text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8 border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                errors.username
                  ? "border-[#5C2E20] focus:border-[#5C2E20]"
                  : "border-[#EEEEEE] focus:border-[#AAAAAA]"
              }`}
              style={{
                border: errors?.username
                  ? "1px solid #5C2E20"
                  : "1px solid #EEEEEE",
              }}
              required
            />
            {errors.username && (
              <p className="body-2 text-[#5c2e20] text-left">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                id={passwordInputId}
                type={isPasswordShow ? "text" : "password"}
                {...register("password", {
                  validate: (value) =>
                    validatePasswordField(value) ||
                    t("resource.common.password_message"),
                })}
                placeholder="PASSWORD"
                className={`body-2 w-full bg-[#F7F7F5] text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8 border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  errors.password
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordDisplay}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900"
              >
                {!showPassword ? (
                  <SvgWrapper svgSrc="eye" />
                ) : (
                  <SvgWrapper svgSrc="eye" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="body-2 text-[#5c2e20] text-left">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
              style={{
                border: "1px solid #5C2E20",
                borderRadius: "1px",
              }}
            />
            <label
              htmlFor="remember"
              className="text-neutral-900 text-[11px] font-normal leading-[13.2px] uppercase cursor-pointer"
            >
              REMEMBER
            </label>
          </div>

          <a
            href="#"
            onClick={handleForgotPasswordClick}
            className="text-[#AAA] text-[11px] font-normal leading-[13.2px] hover:text-neutral-600 underline cursor-pointer"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="button"
          onClick={onLoginToggleClick}
          className="w-full body-2 text-[11px] font-normal leading-[13.2px] uppercase mt-2 transition-colors outline-none focus:outline-none focus-visible:outline-none hover:bg-[#F7F7F5]"
          style={{
            backgroundColor: "#F7F7F5",
            color: "#171717",
            cursor: "pointer",
            height: "24px",
            border: "1px solid",
            borderColor: "#EEEEEE",
            borderRadius: "1px",
          }}
        >
          {"LOGIN WITH OTP"}
        </button>
      </div>

      <div>
        <div className="flex justify-center py-4">
          <div className="flex items-center justify-center">
            <EkkeLogo width="66" height="100" opacity="1" />
          </div>
        </div>

        <TermPrivacy checked={termsAccepted} onChange={onTermsChange} />

        <button
          type="submit"
          disabled={isLoading || !termsAccepted}
          className="w-full h-8 body-1 text-left pl-3 md:mt-8 mt-2"
          style={{
            backgroundColor: isLoading || !termsAccepted ? "#EEEEEE" : "#000",
            color: isLoading || !termsAccepted ? "#AAAAAA" : "#f7f7f5",
            cursor: isLoading || !termsAccepted ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "SUBMITTING..." : "SUBMIT"}
        </button>
      </div>
    </form>
  );
}

export default loginPassword;
