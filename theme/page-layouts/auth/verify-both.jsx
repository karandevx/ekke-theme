import React, { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./verify-both.less";
import { useGlobalTranslation } from "fdk-core/utils";
import ForcedLtr from "../../components/forced-ltr/forced-ltr";
import Loader from "../../components/loader/loader";

function VerifyBoth({
  isShowMobileOtp = true,
  isShowEmailOtp = true,
  submittedMobile = "",
  mobileOtpResendTime = 0,
  mobileFormError = null,
  submittedEmail = "",
  emailOtpResendTime = 0,
  emailFormError = null,
  onVerifyMobileSubmit = () => {},
  onResendMobileOtpClick = () => {},
  onVerifyEmailSubmit = () => {},
  onResendEmailOtpClick = () => {},
  isValidMobileOtp = false,
  isValidEmailOtp = false,
  isRedirecting = false,
}) {
  // Check if both verifications are required
  const bothRequired = isShowMobileOtp && isShowEmailOtp;

  // Show loader when redirecting
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader customClassName="" />
        <p className="body-2 text-[#171717] mt-4 uppercase">
          {"Redirecting..."}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:gap-12 gap-8 md:pt-10 pt-4">
      {isShowMobileOtp && (
        <VerifyMobile
          error={mobileFormError}
          {...{
            submittedMobile,
            mobileOtpResendTime,
            onVerifyMobileSubmit,
            onResendMobileOtpClick,
          }}
        />
      )}
      {isShowEmailOtp && (
        <VerifyEmail
          error={emailFormError}
          isDisabled={bothRequired && !isValidMobileOtp}
          {...{
            submittedEmail,
            emailOtpResendTime,
            onVerifyEmailSubmit,
            onResendEmailOtpClick,
          }}
        />
      )}
    </div>
  );
}

export default VerifyBoth;

function VerifyMobile({
  submittedMobile = "",
  mobileOtpResendTime = 0,
  error = null,
  onVerifyMobileSubmit = () => {},
  onResendMobileOtpClick = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setError,
    clearErrors,
    resetField,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });
  const mobileOtpId = useId();

  const isResendBtnDisabled = mobileOtpResendTime > 0;

  useEffect(() => {
    if (error) {
      setError("otp", error);
      setIsLoading(false);
    } else {
      clearErrors("otp");
    }
  }, [error]);

  const resendOtp = () => {
    resetField("otp");
    onResendMobileOtpClick();
  };

  const handleSubmitWithLoading = (data) => {
    setIsLoading(true);
    const result = onVerifyMobileSubmit(data);
    if (result && typeof result.then === "function") {
      result.catch(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="flex flex-col">
      <p className="subheading-4 mb-3 uppercase">
        {t("resource.auth.verify_mobile")}
      </p>
      <form
        className="flex flex-col lg:gap-6 gap-8"
        onSubmit={handleSubmit(handleSubmitWithLoading)}
      >
        <div className="flex flex-col gap-3">
          <input
            id={mobileOtpId}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            placeholder="ENTER OTP"
            className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
              errors?.otp
                ? "border-[#5C2E20] focus:border-[#5C2E20]"
                : "border-[#EEEEEE] focus:border-[#AAAAAA]"
            }`}
            dir="ltr"
            onInput={(e) => {
              e.target.value = e.target.value
                .replace(/[^0-9]/g, "")
                .slice(0, 4);
            }}
            {...register("otp", {
              validate: (value) =>
                /^[0-9]{4}$/.test(value) ||
                t("resource.common.enter_valid_otp"),
            })}
          />
          {errors?.otp && (
            <p className="body-2 text-[#5c2e20] text-left">
              {errors?.otp?.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full lg:h-6 h-8 body-2 text-left pl-3 transition-colors outline-none focus:outline-none focus-visible:outline-none uppercase"
          style={{
            backgroundColor: "#171717",
            color: "#FFFFFF",
            cursor: "pointer",
            border: "1px solid #171717",
          }}
        >
          {t("resource.facets.submit_action")}
        </button>
      </form>
      <button
        type="button"
        onClick={resendOtp}
        disabled={isResendBtnDisabled}
        className="body-2 text-[#AAAAAA] hover:text-[#171717] text-left mt-2 uppercase transition-colors"
        style={{
          cursor: isResendBtnDisabled ? "not-allowed" : "pointer",
          opacity: isResendBtnDisabled ? 0.5 : 1,
        }}
      >
        {`${t("resource.common.resend_otp")}${isResendBtnDisabled ? ` (${mobileOtpResendTime}S)` : ""}`}
      </button>
    </div>
  );
}

function VerifyEmail({
  submittedEmail = "",
  emailOtpResendTime = 0,
  error = null,
  onVerifyEmailSubmit = () => {},
  onResendEmailOtpClick = () => {},
  isDisabled = false,
}) {
  const { t } = useGlobalTranslation("translation");
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
    resetField,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });
  const emailOtpId = useId();

  const isResendBtnDisabled = emailOtpResendTime > 0;

  useEffect(() => {
    if (error) {
      setError("otp", error);
      setIsLoading(false);
    } else {
      clearErrors("otp");
    }
  }, [error]);

  const resendOtp = () => {
    resetField("otp");
    onResendEmailOtpClick();
  };

  const handleSubmitWithLoading = (data) => {
    setIsLoading(true);
    const result = onVerifyEmailSubmit(data);
    if (result && typeof result.then === "function") {
      result.catch(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="flex flex-col">
      <p className="subheading-4 mb-3 uppercase">
        {t("resource.auth.verify_email")}
      </p>
      <form
        className="flex flex-col lg:gap-6 gap-8"
        onSubmit={handleSubmit(handleSubmitWithLoading)}
      >
        <div className="flex flex-col gap-3">
          <input
            id={emailOtpId}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            placeholder="ENTER OTP"
            className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
              errors?.otp
                ? "border-[#5C2E20] focus:border-[#5C2E20]"
                : "border-[#EEEEEE] focus:border-[#AAAAAA]"
            }`}
            dir="ltr"
            onInput={(e) => {
              e.target.value = e.target.value
                .replace(/[^0-9]/g, "")
                .slice(0, 4);
            }}
            {...register("otp", {
              validate: (value) =>
                /^[0-9]{4}$/.test(value) ||
                t("resource.common.enter_valid_otp"),
            })}
          />
          {errors?.otp && (
            <p className="body-2 text-[#5c2e20] text-left">
              {errors?.otp?.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full lg:h-6 h-8 body-2 text-left pl-3 transition-colors outline-none focus:outline-none focus-visible:outline-none uppercase"
          style={{
            backgroundColor: "#171717",
            color: "#FFFFFF",
            cursor: "pointer",
            border: "1px solid #171717",
          }}
        >
          {t("resource.facets.submit_action")}
        </button>
      </form>
      <button
        type="button"
        onClick={resendOtp}
        disabled={isResendBtnDisabled}
        className="body-2 text-[#AAAAAA] hover:text-[#171717] text-left mt-2 uppercase transition-colors"
        style={{
          cursor: isResendBtnDisabled ? "not-allowed" : "pointer",
          opacity: isResendBtnDisabled ? 0.5 : 1,
        }}
      >
        {`${t("resource.common.resend_otp")}${isResendBtnDisabled ? ` (${emailOtpResendTime}S)` : ""}`}
      </button>
    </div>
  );
}
