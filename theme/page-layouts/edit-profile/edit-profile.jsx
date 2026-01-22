import React, { useId, useMemo, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MobileNumber from "../../page-layouts/auth/mobile-number/mobile-number";
import {
  validateName,
  validateEmailField,
  validatePasswordField,
} from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import VerifyBoth from "../auth/verify-both";
import EkkeLogo from "../../assets/images/logo/ekke-logo";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";

function EditProfile({
  isFormSubmitSuccess = false,
  user = {
    firstName: "",
    lastName: "",
    gender: "male",
    email: "",
    phone: {
      countryCode: "91",
      mobile: "",
      isValidNumber: false,
    },
  },
  isEmail = true,
  emailLevel = "hard",
  primaryEmail = {},
  isMobile = true,
  mobileLevel = "hard",
  primaryPhone = {},
  isLogoutButton = true,
  isSkipButton = true,
  error = null,
  verifyDetailsProp = {},
  onEditProfileSubmit = () => {},
  onLogoutButtonClick = () => {},
  onSkipButtonClick = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const fNameInputId = useId();
  const lNameInputId = useId();
  const emailInputId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value) => {
    if ((isEmail && emailLevel === "hard") || value) {
      return validateEmailField(value);
    }
    return true;
  };

  const validatePassword = (value) => validatePasswordField(value);

  const isEmailRequired = useMemo(() => {
    if (emailLevel === "soft") {
      return ` (${t("resource.common.optional_lower")})`;
    }
    if (emailLevel === "hard") {
      return "*";
    }
    return "";
  }, [emailLevel]);

  const isMobileRequired = useMemo(() => {
    if (mobileLevel === "soft") {
      return t("resource.common.optional_lower");
    }
    if (mobileLevel === "hard") {
      return t("resource.common.required_lower");
    }
    return "";
  }, [mobileLevel]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    reset,
    clearErrors,
  } = useForm({
    defaultValues: user,
  });

  useEffect(() => {
    reset({ ...user });
  }, [user]);

  useEffect(() => {
    if (error) {
      setError("root", error);
      setIsLoading(false); // Reset loading state on error
    } else {
      clearErrors("root");
    }
  }, [error]);

  return (
    <div className="w-[400px] p-6">
      {!isFormSubmitSuccess ? (
        <>
          <form
            onSubmit={handleSubmit(async (data) => {
              setIsLoading(true);
              try {
                await onEditProfileSubmit(data);
              } catch (error) {
                setIsLoading(false);
              }
            })}
          >
            <div className="flex flex-col lg:gap-4 gap-6">
              <div className="text-center mb-4 lg:pt-0">
                <p className="subheading-4 mb-3">
                  {t("resource.common.complete_signup")}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  id={fNameInputId}
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
                      message: t(
                        "resource.common.maximum_30_characters_allowed",
                      ),
                    },
                  })}
                  placeholder="FIRST NAME"
                  style={{
                    border: errors.firstName
                      ? "1px solid #5C2E20"
                      : "1px solid #EEEEEE",
                  }}
                />
                {errors.firstName && (
                  <p className="body-2 text-[#5c2e20] text-left">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <input
                  id={lNameInputId}
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
                      message: t(
                        "resource.common.maximum_30_characters_allowed",
                      ),
                    },
                  })}
                  placeholder="LAST NAME"
                  style={{
                    border: errors.lastName
                      ? "1px solid #5C2E20"
                      : "1px solid #EEEEEE",
                  }}
                />
                {errors.lastName && (
                  <p className="body-2 text-[#5c2e20] text-left">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {isMobile && (
                <div>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (isMobileRequired === "required" || value?.mobile) {
                          return (
                            value.isValidNumber ||
                            t("resource.common.enter_valid_phone_number")
                          );
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <MobileNumber
                        mobile={field.value.mobile}
                        countryCode={field.value.countryCode}
                        error={error}
                        disable={true}
                        isRequired={isMobileRequired}
                        placeholder="MOBILE"
                        height="24px"
                        textColor="#171717"
                        backgroundColor="#F5F5F5"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {isEmail && (
                <div className="flex flex-col gap-3">
                  <input
                    id={emailInputId}
                    type="email"
                    disabled={primaryEmail?.verified}
                    {...register("email", {
                      validate: (value) =>
                        validateEmail(value) ||
                        t("resource.common.please_enter_valid_email_address"),
                    })}
                    placeholder="EMAIL"
                    className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                      errors.email
                        ? "border-[#5C2E20] focus:border-[#5C2E20]"
                        : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                    } ${primaryEmail?.verified ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      border: errors.email
                        ? "1px solid #5C2E20"
                        : "1px solid #EEEEEE",
                    }}
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
                    className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                      errors.password
                        ? "border-[#5C2E20] focus:border-[#5C2E20]"
                        : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                    }`}
                    style={{
                      border: errors.password
                        ? "1px solid #5C2E20"
                        : "1px solid #EEEEEE",
                    }}
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
                        message: t(
                          "resource.auth.please_enter_a_valid_password",
                        ),
                      },
                      validate: (value) =>
                        value === watch("password") ||
                        t("resource.auth.password_does_not_match"),
                    })}
                    placeholder="CONFIRM PASSWORD"
                    className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                      errors.confirmPassword
                        ? "border-[#5C2E20] focus:border-[#5C2E20]"
                        : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                    }`}
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

            <div className="flex items-center pt-[14px] lg:gap-0 lg:pl-0 gap-[48px] pl-4">
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

            {errors.root && (
              <div className="pt-4">
                <p className="body-2 text-[#5c2e20] text-left">
                  {errors.root.message}
                </p>
              </div>
            )}

            <div className="lg:pt-[2rem] pt-[2rem]">
              <div className="flex justify-center">
                <EkkeLogo width="66" height="100" opacity="1" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-8 body-1 text-left pl-3 mt-8 transition-colors"
                style={{
                  backgroundColor: isLoading ? "#EEEEEE" : "#000",
                  color: isLoading ? "#AAAAAA" : "#f7f7f5",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </form>
          {isLogoutButton && (
            <button
              className="w-full h-8 body-1 text-left pl-3 mt-4 transition-colors"
              style={{
                backgroundColor: "#EEEEEE",
                color: "#171717",
                cursor: "pointer",
              }}
              onClick={onLogoutButtonClick}
            >
              {t("resource.profile.logout")}
            </button>
          )}
          {isSkipButton && (
            <button
              className="w-full h-8 body-1 text-left pl-3 mt-4 transition-colors"
              style={{
                backgroundColor: "#EEEEEE",
                color: "#171717",
                cursor: "pointer",
              }}
              onClick={onSkipButtonClick}
            >
              {t("resource.profile.skip_caps")}
            </button>
          )}
        </>
      ) : (
        <VerifyBoth {...verifyDetailsProp} />
      )}
    </div>
  );
}

export default EditProfile;
