import React, { useState } from "react";
import styles from "./login.less";
import LoginPassword from "../../page-layouts/login/components/login-password";
import LoginOtp from "../../page-layouts/login/components/login-otp";
import LoginModeButton from "../../page-layouts/login/components/login-mode-button";
// import LoginRegisterToggle from "../../page-layouts/login/components/login-register-toggle";
import TermPrivacy from "../../page-layouts/login/components/term-privacy";
import { useGlobalTranslation } from "fdk-core/utils";
import useForgetPassword from "../forgot-password/useForgetPassword";
import ForgetPassword from "../forgot-password/components/forgot-password";

// import GoogleLoginButton from "../../page-layouts/login/component/soacial-login-button/google-login-button";
// import FacebookLogin from "../../page-layouts/login/component/soacial-login-button/facebook-login-button";
// import AppleLoginButton from "../../page-layouts/login/component/soacial-login-button/apple-login-button";

function Login({
  logo = {},
  title,
  subTitle,
  isPassword = false,
  isOtp = true,
  showLoginToggleButton = true,
  isRegisterEnabled = true,
  registerButtonLabel,
  onLoginToggleClick = () => {},
  onRegisterButtonClick = () => {},
  onLoginFormSubmit = () => {},

  mobileInfo,
  submittedMobile,
  setSubmittedMobile,
  otpResendTime,
  otpError,
  isFormSubmitSuccess,
  setIsFormSubmitSuccess,
  onOtpSubmit,
  onResendOtpClick,

  loginButtonText,
  isForgotPassword,
  passwordError,
  onForgotPasswordClick,
  getOtpLoading,
  googleClientId,
  onGoogleCredential,
  handleGoogleError,
  social,
  facebookAppId,
  appleId,
  appleRedirectURI,
  loginWithFacebookMutation,
  application_id,
  onAppleCredential,
  isMobile,
  fpi,
  onForgotPasswordStateChange = () => {},
  showForgotPassword,
}) {
  const { t } = useGlobalTranslation("translation");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const forgotPasswordProps = useForgetPassword({ fpi });
  // Override back to login to show login form instead of navigating
  const handleBackToLogin = () => {
    onForgotPasswordStateChange(false);
  };
  const handleShowForgotPassword = () => {
    onForgotPasswordStateChange(true);
  };

  return (
    <div className={`${styles.loginWrapper} h-full`}>
      {/* default form */}
      <div className="h-full">
        {!isFormSubmitSuccess && (
          <>
            {/* {logo?.desktop?.url && (
              <FDKLink to={logo?.desktop?.link}>
                <img
                  className={styles.loginLogoDesktop}
                  src={logo?.desktop?.url}
                  alt={logo?.desktop?.alt}
                />
              </FDKLink>
            )}
            {logo?.mobile?.url && (
              <FDKLink to={logo?.mobile?.link}>
                <img
                  className={styles.loginLogoMobile}
                  src={logo?.mobile?.url}
                  alt={logo?.mobile?.alt}
                />
              </FDKLink>
            )}
            {title && (
              <h1 className={styles.loginTitle}>
                {title || t("resource.auth.login.login")}
              </h1>
            )}
            {subTitle && (
              <p
                className={
                  styles.loginSubText || t("resource.auth.login.login_to_shop")
                }
              >
                {subTitle}
              </p>
            )} */}
          </>
        )}
        {showForgotPassword ? (
          <ForgetPassword
            {...forgotPasswordProps}
            onBackToLoginClick={handleBackToLogin}
          />
        ) : !isOtp ? (
          <LoginPassword
            {...{
              loginButtonText,
              error: passwordError,
              isForgotPassword,
              onForgotPasswordClick,
              onLoginFormSubmit,
              onLoginToggleClick,
              termsAccepted,
              onTermsChange: setTermsAccepted,
            }}
            onForgotPasswordClick={handleShowForgotPassword}
          />
        ) : null}
        {isOtp && (
          <LoginOtp
            {...{
              mobileInfo,
              submittedMobile,
              setSubmittedMobile,
              otpResendTime,
              otpError,
              isFormSubmitSuccess,
              setIsFormSubmitSuccess,
              onOtpSubmit,
              onResendOtpClick,
              onLoginFormSubmit,
              getOtpLoading,
              termsAccepted,
              onTermsChange: setTermsAccepted,
            }}
          />
        )}
        {!isFormSubmitSuccess && !showForgotPassword && (
          <>
            <div className={styles.loginBtnGroup}>
              {/* Only show LoginModeButton in OTP mode - password form has its own toggle button */}
              {showLoginToggleButton && isOtp && (
                <LoginModeButton {...{ onLoginToggleClick, isOtp }} />
              )}
              {social?.google && (
                <GoogleLoginButton
                  googleClientId={googleClientId}
                  onGoogleCredential={onGoogleCredential}
                  onError={handleGoogleError}
                />
              )}
              {social?.facebook && (
                <FacebookLogin
                  facebookAppId={facebookAppId}
                  loginWithFacebookMutation={loginWithFacebookMutation}
                  application_id={application_id}
                />
              )}
              {social?.apple && (
                <AppleLoginButton
                  appleClientId={appleId}
                  onAppleCredential={onAppleCredential}
                  redirectURI={appleRedirectURI}
                  onError={handleGoogleError}
                />
              )}
              {/* {isRegisterEnabled && (
                <LoginRegisterToggle
                  label={
                    registerButtonLabel || t("resource.common.go_to_register")
                  }
                  onClick={onRegisterButtonClick}
                />
              )} */}
            </div>
          </>
        )}
      </div>

      {/* Our main Figma design */}

      {/* Duplicate LoginOtp - Commented out to fix double Verify Account issue */}
      {/* {isOtp && (
        <LoginOtp
          {...{
            mobileInfo,
            submittedMobile,
            setSubmittedMobile,
            otpResendTime,
            otpError,
            isFormSubmitSuccess,
            setIsFormSubmitSuccess,
            onOtpSubmit,
            onResendOtpClick,
            onLoginFormSubmit,
            getOtpLoading,
          }}
        />
      )} */}
    </div>
  );
}

export default Login;
