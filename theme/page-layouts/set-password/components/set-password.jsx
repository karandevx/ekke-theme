import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useGlobalTranslation } from "fdk-core/utils";
import { validatePasswordField } from "../../../helper/utils";
import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import EkkeLogo from "../../../assets/images/logo/ekke-logo";

function SetPassword({ error = null, onSetPasswordSubmit = () => {} }) {
  const { t } = useGlobalTranslation("translation");
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (error) {
      setError("root", error);
    } else {
      clearErrors("root");
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      clearErrors("root");
    }
  }, [watch("confirmNewPassword"), watch("newPassword")]);

  return (
    <div className="min-h-screen flex items-center justify-center py-8 w-full px-3">
      <form
        onSubmit={handleSubmit(onSetPasswordSubmit)}
        className="w-full max-w-md flex flex-col gap-8"
      >
        <div className="subheading-4 leading-[50%] text-center">
          {t("resource.auth.create_new_password")}
        </div>
        {/* New Password Field */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="NEW PASSWORD"
              className="body-2 w-full bg-[#F7F7F5] border-none text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8"
              {...register("newPassword", {
                validate: (value) =>
                  validatePasswordField(value) ||
                  t("resource.auth.password_requirements") ||
                  "Password must be at least 8 characters and contain at least 1 letter, 1 number and 1 special character.",
              })}
            />
            {watch("newPassword") && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-900 cursor-pointer"
              >
                <SvgWrapper svgSrc="eye" />
              </button>
            )}
          </div>
          {errors.newPassword && (
            <p className="body-2 text-[#5c2e20] text-left">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="CONFIRM PASSWORD"
              className="body-2 w-full bg-[#F7F7F5] border-none text-neutral-900 text-[11px] font-normal leading-[13.2px] placeholder:text-[#AAA] placeholder:text-[11px] placeholder:font-normal placeholder:leading-[13.2px] placeholder:uppercase focus-visible:ring-0 focus-visible:ring-offset-0 lg:h-6 h-8"
              {...register("confirmNewPassword", {
                required: {
                  value: true,
                  message:
                    t("resource.auth.please_enter_a_valid_password") ||
                    "Please enter a valid password",
                },
                validate: (value) =>
                  value === getValues("newPassword") ||
                  t("resource.auth.password_didnt_match_try_again") ||
                  "Passwords do not match",
              })}
            />
            {watch("confirmNewPassword") && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-900 cursor-pointer"
              >
                <SvgWrapper svgSrc="eye" />
              </button>
            )}
          </div>
          {(errors?.confirmNewPassword || errors?.root) && (
            <p className="body-2 text-[#5c2e20] text-left">
              {errors?.confirmNewPassword?.message || errors?.root?.message}
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="flex justify-center py-6">
          <EkkeLogo width="80" height="120" opacity="1" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-8 body-1 text-left pl-3 mt-8 bg-[#000] !text-white"
        >
          SET PASSWORD
        </button>
      </form>
    </div>
  );
}

export default SetPassword;
