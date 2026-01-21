import React, { useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGlobalTranslation } from "fdk-core/utils";
import { validateEmailField } from "../../../helper/utils";
import EkkeLogo from "../../../assets/images/logo/ekke-logo";

function ForgetPassword({
  isFormSubmitSuccess = false,
  error = null,
  onForgotPasswordSubmit = () => {},
  onBackToLoginClick = () => {},
  onResendEmailClick = () => {},
}) {
  const { t } = useGlobalTranslation("translation");
  const emailInputId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setError,
    clearErrors,
    watch,
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    if (error) {
      setError("email", error);
    } else {
      clearErrors("email");
    }
  }, [error]);

  return (
    <div className="h-full flex flex-col">
      {!isFormSubmitSuccess ? (
        <>
          <div className="text-center mb-4 lg:pt-0 pt-[2rem]">
            <p className="body-1 !text-[#171717] uppercase mb-3">
              Enter your registered email to reset your password.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onForgotPasswordSubmit)}
            className="h-full flex flex-col"
          >
            <div className="flex flex-col lg:gap-6 gap-8 flex-1">
              <div className="flex flex-col gap-3 lg:pt-0 pt-6">
                <input
                  id={emailInputId}
                  type="text"
                  placeholder="EMAIL"
                  className="body-2 w-full bg-[#F7F7F5] border-none text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8"
                  {...register("email", {
                    validate: (value) =>
                      validateEmailField(value) ||
                      t("resource.common.please_enter_valid_email_address") ||
                      "Please enter a valid email address",
                  })}
                />
                {errors.email && (
                  <p className="body-2 text-[#5c2e20] text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                onClick={onBackToLoginClick}
                type="button"
                className="w-full body-1 text-[#AAA] text-[11px] font-normal leading-[13.2px] hover:text-neutral-600 underline cursor-pointer text-left"
              >
                BACK TO LOGIN
              </button>
            </div>

            <div className="flex-shrink-0">
              <div className="flex justify-center py-4">
                <EkkeLogo width="66" height="100" opacity="1" />
              </div>

              <button
                type="submit"
                className="w-full h-8 body-1 text-left pl-3 transition-colors bg-[#000] !text-[#f7f7f5] hover:bg-[#333] mb-3"
              >
                RESET PASSWORD
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <p className="text-neutral-900 text-[14px] font-normal leading-[19.6px] mb-6">
            {t("resource.common.reset_link_sent_to")}{" "}
            <strong>{watch("email")}</strong>
          </p>
          <button
            className="body-1 text-[#000] underline hover:text-[#333] cursor-pointer mb-4"
            onClick={() => onResendEmailClick(getValues())}
            type="button"
          >
            {t("resource.auth.resend_email") || "Resend Email"}
          </button>
          <button
            onClick={onBackToLoginClick}
            type="button"
            className="body-1 text-[#AAA] text-[11px] font-normal leading-[13.2px] hover:text-neutral-600 underline cursor-pointer"
          >
            BACK TO LOGIN
          </button>
        </div>
      )}
    </div>
  );
}

export default ForgetPassword;
