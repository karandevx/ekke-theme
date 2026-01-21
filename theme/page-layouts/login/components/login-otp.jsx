import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useForm, Controller } from "react-hook-form";
import styles from "./login-otp.less";
import MobileNumber from "../../auth/mobile-number/mobile-number";
import { useGlobalTranslation } from "fdk-core/utils";
import ForcedLtr from "../../../components/forced-ltr/forced-ltr";
import { useToast } from "../../../components/custom-toaster";
import TermPrivacy from "./term-privacy";

function LoginOtp({
  mobileInfo = {
    countryCode: "91",
    mobile: "",
    isValidNumber: false,
  },
  submittedMobile = "",
  setSubmittedMobile = () => {},
  otpResendTime = 0,
  otpError = null,
  isFormSubmitSuccess = false,
  setIsFormSubmitSuccess = () => {},
  onLoginFormSubmit = () => {},
  onOtpSubmit = () => {},
  onResendOtpClick = () => {},
  getOtpLoading,
  resetOtpForm = () => {},
  termsAccepted = false,
  onTermsChange = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const { handleSubmit, control, getValues, reset, setValue } = useForm({
    mode: "onChange",
    defaultValues: {
      phone: mobileInfo,
    },
    reValidateMode: "onChange",
  });

  const onChangeButton = () => {
    reset();
    // Clear timer and reset OTP-related state
    resetOtpForm();
    // Reset form visibility state
    setIsFormSubmitSuccess(false);
    setSubmittedMobile("");
  };

  return (
    <div className={styles.loginOtpWrapper}>
      {!isFormSubmitSuccess ? (
        <form onSubmit={handleSubmit(onLoginFormSubmit)}>
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => {
                if (!value.isValidNumber) {
                  return t("resource.common.enter_valid_phone_number");
                }
                return true;
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <MobileNumber
                name={field?.name}
                mobile={field.value.mobile}
                countryCode={field.value.countryCode}
                error={error}
                isFocused={error?.message}
                placeholder="MOBILE"
                height="24px"
                textColor="#171717"
                backgroundColor="#F5F5F5"
                fontSize="11px"
                isShowLabel={false}
                onChange={(value) => {
                  setValue("phone", value);
                }}
              />
            )}
          />

          <TermPrivacy checked={termsAccepted} onChange={onTermsChange} />

          <button
            type="submit"
            disabled={getOtpLoading || !termsAccepted}
            className="w-full body-2 text-[11px] font-normal leading-[13.2px] uppercase md:mt-8 mt-2 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            style={{
              backgroundColor:
                getOtpLoading || !termsAccepted ? "#EEEEEE" : "#171717",
              color: getOtpLoading || !termsAccepted ? "#AAAAAA" : "#FFFFFF",
              cursor:
                getOtpLoading || !termsAccepted ? "not-allowed" : "pointer",
              height: "24px",
              border: "1px solid",
              borderColor:
                getOtpLoading || !termsAccepted ? "#EEEEEE" : "#171717",
              borderRadius: "1px",
            }}
          >
            {t("resource.auth.login.get_otp")}
          </button>
        </form>
      ) : (
        <OtpForm
          submittedMobile={submittedMobile}
          mobileInfo={getValues()}
          otpResendTime={otpResendTime}
          error={otpError}
          onOtpSubmit={onOtpSubmit}
          onResendOtpClick={onResendOtpClick}
          onChangeButton={onChangeButton}
        />
      )}
    </div>
  );
}

export default LoginOtp;

function OtpForm({
  submittedMobile = "",
  mobileInfo = {},
  otpResendTime,
  error,
  onOtpSubmit = () => {},
  onResendOtpClick = () => {},
  onChangeButton = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const toast = useToast();
  const shownErrorRef = useRef(null);
  const otpInputId = useId();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    watch,
    clearErrors,
    resetField,
  } = useForm();
  const mobileOtp = watch("mobileOtp");

  const isResendBtnDisabled = otpResendTime > 0;
  useEffect(() => {
    const inputEle = document?.getElementById?.(otpInputId);
    if (inputEle) {
      inputEle?.focus();
    }
  }, []);
  useEffect(() => {
    if (mobileOtp && mobileOtp.length < 4) {
      clearErrors("root");
    }
  }, [mobileOtp]);

  useEffect(() => {
    if (error) {
      // Show API errors in toaster
      const errorMessage = error.message || error;
      const errorKey = JSON.stringify(error);

      // Only show if this exact error hasn't been shown yet
      if (shownErrorRef.current !== errorKey) {
        toast.error(errorMessage);
        shownErrorRef.current = errorKey;
      }
      // Reset loading state on error
      setIsLoading(false);
    }
  }, [error, toast]);

  useLayoutEffect(() => {
    window?.scrollTo({
      top: 0,
    });
  }, []);

  const resendOtp = () => {
    resetField("mobileOtp");
    onResendOtpClick(mobileInfo);
  };

  return (
    <>
      <form
        className={styles.loginInputGroup}
        onSubmit={(e) => {
          e.preventDefault();
          // Reset error tracking on new submit
          shownErrorRef.current = null;
          setIsLoading(true);
          handleSubmit((data) => {
            const result = onOtpSubmit(data);
            // Handle promise-based submission
            if (result && typeof result.then === "function") {
              result.catch(() => {
                setIsLoading(false);
              });
            }
          })(e);
        }}
      >
        <p className="subheading-4 leading-[50%] mb-4">
          {t("resource.localization.verify_account")}
        </p>
        <p className="body-1">
          {`${t("resource.common.otp_sent_to")}`}{" "}
          <ForcedLtr text={submittedMobile} />
          <button
            type="button"
            className={`${styles.changeBtn} underline`}
            onClick={onChangeButton}
          >
            {t("resource.common.change_caps")}
          </button>
        </p>

        <div className="flex flex-col gap-3">
          <input
            id={otpInputId}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            dir="ltr"
            onInput={(e) => {
              e.target.value = e.target.value
                .replace(/[^0-9]/g, "")
                .slice(0, 4);
            }}
            placeholder="ENTER OTP"
            className={`w-full bg-[#F5F5F5] body-2 lg:h-6 h-8 placeholder:text-[#AAA] placeholder:text-[11px] placeholder:uppercase outline-none`}
            style={{
              fontSize: "11px",
              color: "#171717",
              borderRadius: "1px",
              border:
                errors?.root || errors?.mobileOtp
                  ? "1px solid #5C2E20"
                  : "1px solid #EEEEEE",
              padding: "0 8px",
              marginTop: "24px",
            }}
            {...register("mobileOtp", {
              required: {
                message: t("resource.common.enter_valid_otp"),
                value: true,
              },
              maxLength: 4,
            })}
          />

          {(errors?.root || errors?.mobileOtp) && (
            <p className="body-2 text-[#5c2e20] text-left">
              {errors?.root?.message || errors?.mobileOtp?.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full body-2 text-[11px] font-normal leading-[13.2px] uppercase md:mt-8 mt-2 transition-colors outline-none focus:outline-none focus-visible:outline-none hover:bg-black"
          style={{
            backgroundColor: isLoading ? "#EEEEEE" : "#171717",
            color: isLoading ? "#AAAAAA" : "#FFFFFF",
            cursor: isLoading ? "not-allowed" : "pointer",
            height: "24px",
            border: "1px solid",
            borderColor: isLoading ? "#EEEEEE" : "#171717",
            borderRadius: "1px",
          }}
        >
          {isLoading ? "SUBMITTING..." : t("resource.common.continue")}
        </button>
      </form>
      <button
        onClick={resendOtp}
        disabled={isResendBtnDisabled}
        className="w-full body-2 text-[11px] font-normal leading-[13.2px] uppercase transition-colors outline-none focus:outline-none focus-visible:outline-none"
        style={{
          backgroundColor: isResendBtnDisabled ? "#EEEEEE" : "#F7F7F5",
          color: isResendBtnDisabled ? "#AAAAAA" : "#171717",
          cursor: isResendBtnDisabled ? "not-allowed" : "pointer",
          height: "24px",
          border: "1px solid",
          borderColor: isResendBtnDisabled ? "#EEEEEE" : "#EEEEEE",
          borderRadius: "1px",
        }}
      >
        {`${t("resource.common.resend_otp")}${isResendBtnDisabled ? ` (${otpResendTime}S)` : ""}`}
      </button>
    </>
  );
}
