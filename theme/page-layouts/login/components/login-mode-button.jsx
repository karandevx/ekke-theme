import React, { useMemo } from "react";
import styles from "./login-mode-button.less";
// import LoginIcon from "../../../../assets/images/login_icon.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function LoginModeButton({ isOtp = true, onLoginToggleClick = () => {} }) {
  const { t } = useGlobalTranslation("translation");
  const getButtonLabel = useMemo(
    () =>
      `${t("resource.auth.login.login_with_caps")} ${isOtp ? t("resource.auth.login.password_caps") : t("resource.auth.login.otp")}`,
    [isOtp]
  );
  return (
    <button
      // className={`btnSecondary ${styles.loginModeBtn}`}
      onClick={onLoginToggleClick}
      className="w-full h-6 body-1 pl-3 mt-6 transition-colors"
      style={{
        backgroundColor: "#f7f7f5",
        color: "#171717",
        cursor: "pointer",
      }}
    >
      {/* <LoginIcon /> */}
      <span className={styles.loginModeLabel}>{getButtonLabel}</span>
    </button>
  );
}

export default LoginModeButton;
