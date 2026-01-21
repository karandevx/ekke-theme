import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import { isRunningOnClient } from "../../helper/utils";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";

const useLoginPassword = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const [passwordError, setPasswordError] = useState(null);

  const { openForgotPassword, signIn } = useAccounts({ fpi });

  const handleForgotPasswordClick = () => {
    openForgotPassword();
  };

  const handleLoginWthPassword = ({ username, password }) => {
    if (!username || !password) {
      return Promise.reject(new Error("Username and password are required"));
    }

    const payload = {
      username,
      password,
      isRedirection: true,
    };
    return signIn(payload)
      .then(() => {
        // Success - form will redirect/unmount
      })
      .catch((err) => {
        if (isRunningOnClient() && err?.details?.meta?.is_deleted) {
          navigate(
            "/auth/account-locked" + (location.search ? location.search : "")
          );
        }
        setPasswordError({
          message: err?.message || t("resource.common.error_message"),
        });
        throw err; // Re-throw to let the component handle loading state
      });
  };
  return {
    passwordError,
    setPasswordError,
    onForgotPasswordClick: handleForgotPasswordClick,
    handleLoginWthPassword,
  };
};

export default useLoginPassword;
