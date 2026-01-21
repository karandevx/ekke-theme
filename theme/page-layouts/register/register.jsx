import React, { useId, useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  validateName,
  validateEmailField,
  validatePasswordField,
  translateDynamicLabel,
} from "../../helper/utils";
import styles from "./register.less";
import MobileNumber from "../../page-layouts/auth/mobile-number/mobile-number";
import { useGlobalTranslation } from "fdk-core/utils";
import EkkeLogo from "../../assets/images/logo/ekke-logo";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import { useToast } from "../../components/custom-toaster";
// import { useAccounts } from "../../helper/hooks";
import VerifyBoth from "../auth/verify-both";
import TermPrivacy from "../login/components/term-privacy";

function Register({
  isFormSubmitSuccess = false,
  isMobile = true,
  mobileLevel = "hard",
  mobileInfo,
  isEmail = true,
  emailLevel = "hard",
  error = null,
  clearError = () => {},
  loginButtonLabel,
  onLoginButtonClick = () => {},
  onRegisterFormSubmit = () => {},
  verifyDetailsProp = {},
  fpi,
  onVerifyBothStateChange = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const toast = useToast();
  const shownErrorRef = useRef(null);
  const firstnameId = useId();
  const lastnameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // const { sendOtp, verifyMobileOtp } = useAccounts({ fpi });

  const validateEmail = (value) => {
    if ((isEmail && emailLevel === "hard") || value) {
      return validateEmailField(value);
    }
    return true;
  };

  const validatePassword = (value) => validatePasswordField(value);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting, isSubmitted },
    getValues,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "male",
      consent: true,
      email: "",
      phone: {
        ...mobileInfo,
      },
      agreedToTerms: false,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const isEmailRequired = useMemo(() => {
    if (emailLevel === "soft") {
      return (
        <>
          {t("resource.common.email")}{" "}
          <span className={styles.optional}>
            ({t("resource.common.optional")})
          </span>
        </>
      );
    }
    if (emailLevel === "hard") {
      return (
        <>
          {t("resource.common.email")}{" "}
          <span className={styles.required}>*</span>
        </>
      );
    }
    return "";
  }, [emailLevel]);

  const isMobileRequired = useMemo(() => {
    if (mobileLevel === "soft") {
      return "optional";
    }
    if (mobileLevel === "hard") {
      return "required";
    }
    return "";
  }, [mobileLevel]);

  // const togglePasswordDisplay = (e) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   setIsPasswordShow((prevState) => !prevState);
  // };

  // const toggleConfirmPasswordDisplay = (e) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   setIsConfirmPasswordShow((prevState) => !prevState);
  // };

  // Clear error on component mount to prevent showing stale errors when switching forms
  useEffect(() => {
    shownErrorRef.current = null;
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error && shownErrorRef.current !== error.message) {
      toast.error(error.message);
      shownErrorRef.current = error.message;
      setIsLoading(false); // Reset loading state when error occurs
    }
  }, [error]);

  useEffect(() => {
    onVerifyBothStateChange(isFormSubmitSuccess);
  }, [isFormSubmitSuccess, onVerifyBothStateChange]);

  return (
    <div
      className={`${styles.containerWrapper} overflow-y-auto lg:max-h-[calc(100vh-200px)] max-h-[calc(100vh-180px)] max-md:pb-2`}
    >
      {!isFormSubmitSuccess ? (
        // default form
        // <form
        //   className={styles.registerFormWrapper}
        //   onSubmit={handleSubmit(onRegisterFormSubmit)}
        // >
        //   <h1 className={styles.title}>
        //     {t("resource.common.complete_signup")}
        //   </h1>
        //   <div
        //     className={`${styles.registerNameInput} ${errors.firstName ? styles.errorInput : ""}`}
        //   >
        //     <label className={styles.inputTitle} htmlFor={firstnameId}>
        //       {t("resource.common.first_name")}
        //       <span className={styles.required}> *</span>
        //     </label>
        //     <input
        //       id={firstnameId}
        //       type="text"
        //       maxLength="30"
        //       {...register("firstName", {
        //         validate: (value) =>
        //           validateName(value) ||
        //           t("resource.common.please_enter_valid_first_name"),
        //         maxLength: {
        //           value: 30,
        //           message: t("resource.common.maximum_30_characters_allowed"),
        //         },
        //       })}
        //     />
        //     {errors.firstName && (
        //       <p className={styles.errorText}>{errors.firstName.message}</p>
        //     )}
        //   </div>
        //   <div
        //     className={`${styles.registerNameInput} ${errors.lastName ? styles.errorInput : ""}`}
        //   >
        //     <label className={styles.inputTitle} htmlFor={lastnameId}>
        //       {t("resource.common.last_name")}
        //       <span className={styles.required}> *</span>
        //     </label>
        //     <input
        //       id={lastnameId}
        //       type="text"
        //       maxLength="30"
        //       {...register("lastName", {
        //         validate: (value) =>
        //           validateName(value) ||
        //           t("resource.common.please_enter_valid_last_name"),
        //         maxLength: {
        //           value: 30,
        //           message: t("resource.common.maximum_30_characters_allowed"),
        //         },
        //       })}
        //     />
        //     {errors.lastName && (
        //       <p className={styles.errorText}>{errors.lastName.message}</p>
        //     )}
        //   </div>
        //   <div className={styles.genderRadioContainer}>
        //     <label className={styles.radioContainer}>
        //       {t("resource.common.male")}
        //       <input type="radio" value="male" {...register("gender")} />
        //       <span className={styles.checkmark} />
        //     </label>
        //     <label className={styles.radioContainer}>
        //       {t("resource.common.female")}
        //       <input type="radio" value="female" {...register("gender")} />
        //       <span className={styles.checkmark} />
        //     </label>
        //     <label className={styles.radioContainer}>
        //       {t("resource.common.other")}
        //       <input type="radio" value="unisex" {...register("gender")} />
        //       <span className={styles.checkmark} />
        //     </label>
        //   </div>
        //   {isEmail && (
        //     <div
        //       className={`${styles.registerEmail} ${errors.email ? styles.errorInput : ""}`}
        //     >
        //       <label className={styles.inputTitle} htmlFor={emailId}>
        //         {isEmailRequired}
        //       </label>
        //       <input
        //         id={emailId}
        //         type="text"
        //         {...register("email", {
        //           validate: (value) =>
        //             validateEmail(value) ||
        //             t("resource.common.please_enter_valid_email_address"),
        //         })}
        //       />
        //       {errors.email && (
        //         <p className={styles.errorText}>{errors.email.message}</p>
        //       )}
        //     </div>
        //   )}
        //   {isMobile && (
        //     <div className={styles.registerMobileInput}>
        //       <Controller
        //         name="phone"
        //         control={control}
        //         rules={{
        //           validate: (value) => {
        //             if (isMobileRequired === "required" || value?.mobile) {
        //               return (
        //                 value.isValidNumber ||
        //                 t("resource.common.enter_valid_phone_number")
        //               );
        //             }
        //             return true;
        //           },
        //         }}
        //         render={({ field, fieldState: { error } }) => (
        //           <MobileNumber
        //             mobile={field.value.mobile}
        //             countryCode={field.value.countryCode}
        //             isRequired={isMobileRequired}
        //             error={error}
        //             onChange={(value) => {
        //               field.onChange(value);
        //             }}
        //           />
        //         )}
        //       />
        //     </div>
        //   )}
        //   <div
        //     className={`${styles.registerPasswordInput} ${
        //       errors.password ? styles.errorInput : ""
        //     }`}
        //   >
        //     <label className={styles.inputTitle} htmlFor={passwordId}>
        //       {t("resource.auth.login.password")}
        //       <span className={styles.required}> *</span>
        //     </label>
        //     <div className={styles.passwordInputWrapper}>
        //       <input
        //         id={passwordId}
        //         type={isPasswordShow ? "text" : "password"}
        //         {...register("password", {
        //           validate: (value) =>
        //             validatePassword(value) ||
        //             t("resource.auth.password_requirements"),
        //         })}
        //       />
        //       {watch("password") && (
        //         <button
        //           className={styles.passwordToggle}
        //           aria-label={
        //             !isPasswordShow
        //               ? t("resource.auth.show_confirm_password")
        //               : t("resource.auth.hide_confirm_password")
        //           }
        //           onClick={togglePasswordDisplay}
        //         >
        //           {!isPasswordShow ? (
        //             <ShowPasswordIcon />
        //           ) : (
        //             <HidePasswordIcon />
        //           )}
        //         </button>
        //       )}
        //     </div>
        //     {errors.password && (
        //       <p className={styles.errorText}>{errors.password.message}</p>
        //     )}
        //   </div>
        //   <div
        //     className={`${styles.registerConfirmPasswordInput} ${
        //       errors.confirmPassword ? styles.errorInput : ""
        //     }`}
        //   >
        //     <label className={styles.inputTitle} htmlFor={confirmPasswordId}>
        //       {t("resource.auth.confirm_password")}
        //       <span className={styles.required}> *</span>
        //     </label>
        //     <div className={styles.passwordInputWrapper}>
        //       <input
        //         id={confirmPasswordId}
        //         type={isConfirmPasswordShow ? "text" : "password"}
        //         {...register("confirmPassword", {
        //           required: {
        //             value: true,
        //             message: t("resource.auth.please_enter_a_valid_password"),
        //           },
        //           validate: (value) =>
        //             value === getValues("password") ||
        //             t("resource.auth.password_does_not_match"),
        //         })}
        //       />
        //       {watch("confirmPassword") && (
        //         <button
        //           className={styles.passwordToggle}
        //           aria-label={
        //             !isConfirmPasswordShow
        //               ? t("resource.auth.show_confirm_password")
        //               : t("resource.auth.hide_confirm_password")
        //           }
        //           onClick={toggleConfirmPasswordDisplay}
        //         >
        //           {!isConfirmPasswordShow ? (
        //             <ShowPasswordIcon />
        //           ) : (
        //             <HidePasswordIcon />
        //           )}
        //         </button>
        //       )}
        //     </div>
        //     {errors.confirmPassword && (
        //       <p className={styles.errorText}>
        //         {errors.confirmPassword.message}
        //       </p>
        //     )}
        //   </div>
        //   {errors.root && (
        //     <div className={styles.loginAlert}>
        //       <span>{translateDynamicLabel(errors.root.message, t)}</span>
        //     </div>
        //   )}

        //   {/* Extension slot: above_register_button */}

        //   <div className={styles.consentWrapper}>
        //     <Controller
        //       name="consent"
        //       control={control}
        //       rules={{
        //         required: t("resource.auth.terms_and_condition"),
        //       }}
        //       render={({ field, fieldState: { error } }) => (
        //         <div className={styles.consentWrapper}>
        //           <TermPrivacy
        //             onChange={field.onChange}
        //             checked={field.value}
        //           />
        //           {error && <p className={styles.errorText}>{error.message}</p>}
        //         </div>
        //       )}
        //     />
        //   </div>

        //   <button className={styles.registerBtn} type="submit">
        //     {t("resource.common.continue")}
        //   </button>

        //   <LoginRegisterToggle
        //     label={loginButtonLabel || t("resource.auth.login.go_to_login")}
        //     onClick={onLoginButtonClick}
        //   />
        // </form>
        <form
          onSubmit={handleSubmit(async (data) => {
            // Reset error tracking on new submit
            shownErrorRef.current = null;

            setIsLoading(true);
            try {
              await onRegisterFormSubmit(data);
              // Success - component will likely unmount/redirect
            } catch (error) {
              // Error - reset loading state so user can try again
              setIsLoading(false);
            }
          })}
        >
          <div className="flex flex-col lg:gap-6 gap-8">
            <div className="text-center mb-4 lg:pt-0 pt-[2rem]"></div>

            <div className="flex flex-col gap-3">
              <input
                id={firstnameId}
                type="text"
                maxLength="30"
                className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  errors.firstName
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
                {...register("firstName", {
                  validate: (value) =>
                    validateName(value) ||
                    t("resource.common.please_enter_valid_first_name"),
                  maxLength: {
                    value: 30,
                    message: t("resource.common.maximum_30_characters_allowed"),
                  },
                })}
                style={{
                  border: errors.firstName
                    ? "1px solid #5C2E20"
                    : "1px solid #EEEEEE",
                }}
                placeholder="FIRST NAME"
              />
              {errors.firstName && (
                <p className="body-2 text-[#5c2e20] text-left">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <input
                id={lastnameId}
                type="text"
                maxLength="30"
                className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  errors.lastName
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
                {...register("lastName", {
                  validate: (value) =>
                    validateName(value) ||
                    t("resource.common.please_enter_valid_last_name"),
                  maxLength: {
                    value: 30,
                    message: t("resource.common.maximum_30_characters_allowed"),
                  },
                })}
                style={{
                  border: errors.lastName
                    ? "1px solid #5C2E20"
                    : "1px solid #EEEEEE",
                }}
                placeholder="LAST NAME"
              />
              {errors.lastName && (
                <p className="body-2 text-[#5c2e20] text-left">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {isMobile && (
              <div className={styles.registerMobileInput}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    validate: (value) => {
                      // Check if mobile has actual value (not just empty string)
                      const isEmpty =
                        !value?.mobile || value.mobile.trim().length === 0;

                      // If empty and optional, allow it
                      if (isEmpty && isMobileRequired !== "required") {
                        return true;
                      }

                      // If empty and required, show error
                      if (isEmpty && isMobileRequired === "required") {
                        return t("resource.common.enter_valid_phone_number");
                      }

                      // Has value - validate it
                      return (
                        value.isValidNumber ||
                        t("resource.common.enter_valid_phone_number")
                      );
                    },
                  }}
                  render={({ field, fieldState: { error } }) => {
                    // Show error if: user has typed something OR form has been submitted
                    const hasTyped =
                      field.value.mobile &&
                      field.value.mobile.trim().length > 0;
                    const shouldShowError = error && (hasTyped || isSubmitted);

                    return (
                      <MobileNumber
                        mobile={field.value.mobile}
                        countryCode={field.value.countryCode}
                        isRequired={isMobileRequired}
                        error={shouldShowError ? error : null}
                        placeholder="MOBILE"
                        height="24px"
                        textColor="#171717"
                        backgroundColor="#F5F5F5"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />
              </div>
            )}

            {isEmail && (
              <div className="flex flex-col gap-3">
                <input
                  id={emailId}
                  type="email"
                  {...register("email", {
                    required: {
                      value: true,
                      message: "Email is required",
                    },
                    validate: (value) => {
                      // Check if email is empty
                      if (!value || !value.trim()) {
                        return "Email is required";
                      }
                      return (
                        validateEmailField(value) ||
                        t("resource.common.please_enter_valid_email_address")
                      );
                    },
                  })}
                  placeholder="EMAIL"
                  style={{
                    border: errors.email
                      ? "1px solid #5C2E20"
                      : "1px solid #EEEEEE",
                  }}
                  className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                    errors.email
                      ? "border-[#5C2E20] focus:border-[#5C2E20]"
                      : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                  }`}
                />
                {errors.email && (
                  <p className="body-2 text-[#5c2e20] text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  id={passwordId}
                  type={isPasswordShow ? "text" : "password"}
                  {...register("password", {
                    validate: (value) =>
                      validatePassword(value) ||
                      t("resource.auth.password_requirements"),
                  })}
                  placeholder="PASSWORD"
                  style={{
                    border: errors.password
                      ? "1px solid #5C2E20"
                      : "1px solid #EEEEEE",
                  }}
                  className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                    errors.password
                      ? "border-[#5C2E20] focus:border-[#5C2E20]"
                      : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordShow(!isPasswordShow)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900"
                >
                  {!isPasswordShow ? (
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

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  id={confirmPasswordId}
                  type={isConfirmPasswordShow ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: {
                      value: true,
                      message: t("resource.auth.please_enter_a_valid_password"),
                    },
                    validate: (value) =>
                      value === getValues("password") ||
                      t("resource.auth.password_does_not_match"),
                  })}
                  placeholder="CONFIRM PASSWORD"
                  className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                    errors.confirmPassword
                      ? "border-[#5C2E20] focus:border-[#5C2E20]"
                      : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                  }`}
                  style={{
                    border: errors.confirmPassword
                      ? "1px solid #5C2E20"
                      : "1px solid #EEEEEE",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordShow(!isConfirmPasswordShow)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900"
                >
                  {!isConfirmPasswordShow ? (
                    <SvgWrapper svgSrc="eye" />
                  ) : (
                    <SvgWrapper svgSrc="eye" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="body-2 text-[#5c2e20] text-left">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 pt-3">
            {/* <input
              type="checkbox"
              id="terms"
              checked={watch("consent")}
              {...register("consent")}
              className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
              style={{
                border: "1px solid #5C2E20",
                borderRadius: 0,
              }}
            />
            <label htmlFor="terms" className="body-4 text-left text-[#171717]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </label> */}
            <TermPrivacy checked={termsAccepted} onChange={setTermsAccepted} />
          </div>

          <div className="flex items-center pt-[14px] lg:gap-0 gap-[48px] pl-4">
            <label className="flex items-center gap-2 cursor-pointer lg:min-w-[144px]">
              <input
                type="radio"
                name="gender"
                className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
                style={{
                  border: "1px solid #5C2E20",
                  borderRadius: 0.5,
                }}
                value="female"
                {...register("gender")}
              />
              <span className="body-1">FEMALE</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer lg:min-w-[144px]">
              <input
                type="radio"
                name="gender"
                value="male"
                {...register("gender")}
                className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
                style={{
                  border: "1px solid #5C2E20",
                  borderRadius: 0.5,
                }}
              />
              <span className="body-1">MALE</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer lg:min-w-[144px]">
              <input
                type="radio"
                name="gender"
                value="unisex"
                {...register("gender")}
                className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
                style={{
                  border: "1px solid #5C2E20",
                  borderRadius: 0.5,
                }}
              />
              <span className="body-1">NON BINARY</span>
            </label>
          </div>

          <div className="lg:pt-[2rem] pt-[2rem]">
            <div className="flex justify-center">
              <EkkeLogo width="66" height="100" opacity="1" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="w-full h-8 body-1 text-left pl-3 mt-8 transition-colors"
              style={{
                backgroundColor:
                  isLoading || !termsAccepted ? "#EEEEEE" : "#000",
                color: isLoading || !termsAccepted ? "#AAAAAA" : "#f7f7f5",
                cursor: isLoading || !termsAccepted ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>
        </form>
      ) : (
        <VerifyBoth {...verifyDetailsProp} />
      )}
    </div>
  );
}

export default Register;
