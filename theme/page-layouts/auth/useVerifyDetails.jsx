import { useState, useMemo, useEffect, useRef } from "react";
import { useAccounts } from "../../helper/hooks";
import { useGlobalTranslation } from "fdk-core/utils";

const useVerifyDetails = ({ fpi, verifyBothData }) => {
  const { t } = useGlobalTranslation("translation");
  const [mobileFormError, setMobileFormError] = useState(null);
  const [isValidMobileOtp, setIsValidMobileOtp] = useState(false);
  const [mobileOtpResendTime, setMobileOtpResendTime] = useState(30);
  const mobileTimerRef = useRef(null);

  const [emailFormError, setEmailFormError] = useState(null);
  const [isValidEmailOtp, setIsValidEmailOtp] = useState(false);
  const [emailOtpResendTime, setEmailOtpResendTime] = useState(90);
  const emailTimerRef = useRef(null);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [userExists, setUserExists] = useState(null);

  const {
    verifyMobileOtp,
    resendVerifyMobileOtp,
    verifyEmailOtp,
    resendVerifyEmailOtp,
  } = useAccounts({
    fpi,
  });

  const isShowVerifyMobile = useMemo(
    () => !!verifyBothData?.verify_mobile_otp,
    [verifyBothData]
  );

  const isShowMobileOtp = useMemo(() => {
    if (isShowVerifyMobile) {
      return !isValidMobileOtp;
    }
    return false;
  }, [isShowVerifyMobile, isValidMobileOtp]);

  const isShowVerifyEmail = useMemo(
    () => !!verifyBothData?.verify_email_otp,
    [verifyBothData]
  );

  const isShowEmailOtp = useMemo(() => {
    if (isShowVerifyEmail) {
      return !isValidEmailOtp;
    }
    // setIsShowEmail(false);
    return false;
  }, [isShowVerifyEmail, isValidEmailOtp]);

  const mobileTimer = (time) => {
    if (mobileTimerRef.current) {
      clearInterval(mobileTimerRef.current);
    }
    setMobileOtpResendTime(time);
    mobileTimerRef.current = setInterval(() => {
      setMobileOtpResendTime((prevRemaining) => {
        if (prevRemaining <= 0) {
          clearInterval(mobileTimerRef.current);
          return 0;
        }
        return prevRemaining - 1;
      });
    }, 1000);
  };

  const emailTimer = (time) => {
    if (emailTimerRef.current) {
      clearInterval(emailTimerRef.current);
    }

    setEmailOtpResendTime(time);

    emailTimerRef.current = setInterval(() => {
      setEmailOtpResendTime((prevRemaining) => {
        if (prevRemaining <= 1) {
          clearInterval(emailTimerRef.current);
          return 0;
        }
        return prevRemaining - 1;
      });
    }, 1000);
  };

  const handleVerifyMobile = (data) => {
    if (!data.otp) {
      return;
    }
    const payload = {
      requestId: verifyBothData?.request_id,
      registerToken: verifyBothData?.register_token,
      otp: data.otp,
      isEmailVerified: isValidEmailOtp,
      isRedirection: false, // Don't redirect yet, wait for both verifications
    };
    return verifyMobileOtp(payload)
      .then((res) => {
        setIsValidMobileOtp(true);
        setMobileFormError(null);
        // Store user_exists from response to determine redirect
        if (res?.user_exists !== undefined) {
          setUserExists(res.user_exists);
        }
        return res;
      })
      .catch((err) => {
        setIsValidMobileOtp(false);
        setMobileFormError({
          message: err?.message || t("resource.common.error_message"),
        });
        throw err;
      });
  };

  const handleResendMobileOtp = () => {
    const payload = {
      mobile: verifyBothData.mobile,
      countryCode: verifyBothData.country_code,
      token: verifyBothData.resend_token,
    };
    resendVerifyMobileOtp(payload)
      .then((res) => {
        setMobileOtpResendTime(res?.resend_timer || 30);
        mobileTimer(res?.resend_timer || 30);
        setMobileFormError(null);
      })
      .catch((err) => {
        setIsValidMobileOtp(false);
        setMobileFormError({
          message: err?.message || t("resource.common.error_message"),
        });
      });
  };

  const handleVerifyEmail = (data) => {
    if (!data.otp) {
      return;
    }
    const payload = {
      otp: data?.otp,
      email: verifyBothData?.email,
      registerToken: verifyBothData?.register_token,
      action: "register",
      isMobileVerified: isValidMobileOtp,
      isRedirection: false, // Don't redirect yet, wait for both verifications
    };
    return verifyEmailOtp(payload)
      .then((res) => {
        setIsValidEmailOtp(true);
        setEmailFormError(null);
        // Store user_exists from response to determine redirect
        if (res?.user_exists !== undefined) {
          setUserExists(res.user_exists);
        }
        return res;
      })
      .catch((err) => {
        setIsValidEmailOtp(false);
        setEmailFormError({
          message: err?.message || t("resource.common.error_message"),
        });
        throw err;
      });
  };
  const handleResendEmailOtp = () => {
    const payload = {
      email: verifyBothData.email,
      registerToken: verifyBothData.register_token,
      token: verifyBothData.resend_email_token,
    };
    resendVerifyEmailOtp(payload)
      .then((res) => {
        setEmailOtpResendTime(90);
        emailTimer(90);
        setEmailFormError(null);
      })
      .catch((err) => {
        setIsValidEmailOtp(false);
        setEmailFormError({
          message: err?.message || t("resource.common.error_message"),
        });
      });
  };

  useEffect(() => {
    if (verifyBothData) {
      mobileTimer(verifyBothData?.resend_timer || 30);
      emailTimer(90);
    }
    return () => {
      clearInterval(mobileTimerRef.current);
      clearInterval(emailTimerRef.current);
    };
  }, [verifyBothData]);

  // Handle redirect when both OTPs are verified
  useEffect(() => {
    const bothRequired = isShowVerifyMobile && isShowVerifyEmail;
    const bothVerified = isValidMobileOtp && isValidEmailOtp;
    const mobileOnlyVerified =
      isShowVerifyMobile && !isShowVerifyEmail && isValidMobileOtp;
    const emailOnlyVerified =
      !isShowVerifyMobile && isShowVerifyEmail && isValidEmailOtp;

    if (bothRequired && bothVerified) {
      // Both are required and both are verified - redirect based on user_exists
      setIsRedirecting(true);
      setTimeout(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const redirectUrl = queryParams.get("redirectUrl") || "/";

        if (userExists === true) {
          // Existing user - redirect to home or redirectUrl
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        } else {
          // New user - redirect to complete profile
          window.location.href =
            window.location.origin +
            "/auth/edit-profile" +
            (window.location.search || "");
        }
      }, 500);
    } else if (mobileOnlyVerified) {
      // Only mobile is required and it's verified - redirect based on user_exists
      setIsRedirecting(true);
      setTimeout(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const redirectUrl = queryParams.get("redirectUrl") || "/";

        if (userExists === true) {
          // Existing user - redirect to home or redirectUrl
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        } else {
          // New user - redirect to complete profile
          window.location.href =
            window.location.origin +
            "/auth/edit-profile" +
            (window.location.search || "");
        }
      }, 500);
    } else if (emailOnlyVerified) {
      // Only email is required and it's verified - redirect based on user_exists
      setIsRedirecting(true);
      setTimeout(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const redirectUrl = queryParams.get("redirectUrl") || "/";

        if (userExists === true) {
          // Existing user - redirect to home or redirectUrl
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        } else {
          // New user - redirect to complete profile
          window.location.href =
            window.location.origin +
            "/auth/edit-profile" +
            (window.location.search || "");
        }
      }, 500);
    }
  }, [
    isValidMobileOtp,
    isValidEmailOtp,
    isShowVerifyMobile,
    isShowVerifyEmail,
    userExists,
  ]);

  return {
    isShowMobileOtp,
    isShowEmailOtp,
    submittedMobile: verifyBothData?.mobile || "",
    mobileOtpResendTime,
    mobileFormError,
    submittedEmail: verifyBothData?.email || "",
    emailOtpResendTime,
    emailFormError,
    onVerifyMobileSubmit: handleVerifyMobile,
    onResendMobileOtpClick: handleResendMobileOtp,
    onVerifyEmailSubmit: handleVerifyEmail,
    onResendEmailOtpClick: handleResendEmailOtp,
    isValidMobileOtp,
    isValidEmailOtp,
    isRedirecting,
  };
};

export default useVerifyDetails;
