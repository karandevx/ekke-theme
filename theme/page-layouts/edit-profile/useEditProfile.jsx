import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import useVerifyDetails from "../auth/useVerifyDetails";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";

const useEditProfile = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  const userData = useGlobalStore(fpi.getters.USER_DATA);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);

  const [isFormSubmitSuccess, setIsFormSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [verifyBothData, setVerifyBothData] = useState(null);

  const { openHomePage, updateProfile, signOut } = useAccounts({ fpi });
  const verifyDetailsProp = useVerifyDetails({
    fpi,
    verifyBothData,
    redirectPath: "/profile/details", // Redirect to account dashboard after verification
  });

  const isEmail = platformData?.required_fields?.email?.is_required;
  const emailLevel = platformData?.required_fields?.email?.level;

  const userInfo = useMemo(() => userData?.user || userData, [userData]);

  const primaryEmail = useMemo(
    () => userInfo?.emails?.find((e) => e.primary),
    [userInfo]
  );

  const isMobile = platformData?.required_fields?.mobile?.is_required;
  const mobileLevel = platformData?.required_fields?.mobile?.level;

  const primaryPhone = useMemo(
    () => userInfo?.phone_numbers?.find((e) => e.primary),
    [userInfo]
  );

  const isSkipButton = useMemo(() => {
    if (isLoggedIn) {
      if (
        platformData?.required_fields?.email?.is_required &&
        platformData?.required_fields?.email?.level === "soft"
      ) {
        return true;
      }
      if (
        platformData?.required_fields?.mobile?.is_required &&
        platformData?.required_fields?.mobile?.level === "soft"
      ) {
        return true;
      }
      return false;
    }
    return false;
  }, [platformData, isLoggedIn]);

  const user = useMemo(
    () => ({
      firstName: userInfo?.first_name || "",
      lastName: userInfo?.last_name || "",
      gender: userInfo?.gender || "male",
      email: primaryEmail?.email || "",
      phone: {
        countryCode: primaryPhone?.country_code || "91",
        mobile: primaryPhone?.phone || "",
        isValidNumber: primaryPhone?.verified || false,
      },
    }),
    [userInfo, primaryPhone, primaryEmail]
  );

  const handleCancelClick = () => {
    const EMAIL_MOBILE_SOFT_SHOW_PROFILE_TIME = 5 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "isCancelButtonClicked",
      EMAIL_MOBILE_SOFT_SHOW_PROFILE_TIME
    );
    openHomePage();
  };

  const handleLogoutClick = () => {
    signOut();
  };

  // Helper function to get user-friendly error messages
  const getUserFriendlyError = (errorMessage) => {
    const msg = errorMessage?.toLowerCase() || "";

    const hasKeywords = (keywords) => keywords.every((k) => msg.includes(k));
    const hasAnyKeyword = (keywords) => keywords.some((k) => msg.includes(k));

    // Check for duplicate/already exists patterns
    const isDuplicate = hasAnyKeyword([
      "exist",
      "already",
      "taken",
      "duplicate",
    ]);

    if (hasKeywords(["email"]) && isDuplicate) {
      return "User with this email already exists.";
    }

    if (hasKeywords(["mobile"]) && isDuplicate) {
      return "User with this mobile number already exists.";
    }

    // if (hasKeywords(["invalid", "register", "token"])) {
    //   return "Unable to complete registration.";
    // }

    return errorMessage;
  };

  const handleProfileUpdate = (formData) => {
    /* eslint-disable no-use-before-define */
    const userPayload = {
      ...formData,
      registerToken: userData?.register_token || "",
    };
    updateProfile(userPayload)
      .then((res) => {
        const {
          verify_mobile_otp: verifyMobileOtp,
          verify_email_otp: verifyEmailOtp,
          verify_email_link: verifyEmailLink,
          email,
        } = res;
        if (verifyEmailLink) {
          const queryParams = new URLSearchParams(location.search);
          queryParams.set("email", email);
          navigate(
            "/auth/verify-email-link" +
              (queryParams?.toString() ? `?${queryParams.toString()}` : "")
          );
          return;
        }
        if (verifyMobileOtp || verifyEmailOtp) {
          setVerifyBothData(res);
          setIsFormSubmitSuccess(true);
          return;
        }
        openHomePage();
      })
      .catch((err) => {
        const errorMessage = err?.message || t("resource.common.error_message");
        setError({
          message: getUserFriendlyError(errorMessage),
        });
      });
  };
  return {
    isFormSubmitSuccess,
    user,
    isEmail,
    emailLevel,
    primaryEmail,
    isMobile,
    mobileLevel,
    primaryPhone,
    isLogoutButton: false, // NOTE: hiding the logout button -> FPPT 1769
    isSkipButton,
    error,
    verifyDetailsProp,
    onEditProfileSubmit: handleProfileUpdate,
    onLogoutButtonClick: handleLogoutClick,
    onSkipButtonClick: handleCancelClick,
  };
};

export default useEditProfile;
