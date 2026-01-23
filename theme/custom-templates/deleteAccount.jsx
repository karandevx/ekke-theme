import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";
// import SvgWrapper from "../components/core/svgWrapper/SvgWrapper";
import Loader from "../components/loader/loader";
import styles from "./deleteAccount.less";
import { useAccounts } from "../helper/hooks/useAccounts";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../helper/hooks/hooks";
import TermPrivacy from "../page-layouts/login/components/term-privacy";
// import { CloudHail } from "lucide-react";
import { isRunningOnClient } from "../helper/utils";

const DeleteAccount = () => {
  // State
  const fpi = useFPI();
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState({});
  const { showSnackbar } = useSnackbar();
  const [isAgreed, setIsAgreed] = useState(false);
  const [descMaxLength] = useState(100);
  const [description, setDescription] = useState("");
  const [otpVal, setOtpVal] = useState();
  const [requestId, setRequestId] = useState("");

  const [isShowResendOtp, setIsShowResendOtp] = useState(false);
  const [otpTime, setOtpTime] = useState(30);
  const otpTimerRef = useRef(null);
  const [showOtpErr, setShowOtpErr] = useState(false);
  const [otpErr] = useState("Please enter valid otp");
  const [showDescErr, setShowDescErr] = useState(false);
  const [descErr] = useState("Enter Description");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);
  const [userId, setUserId] = useState("");
  const userData = useGlobalStore(fpi.getters.USER_DATA);

  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const {
    sendOtp,
    sendOtpMobile,
    sendOtpEmail,
    deleteUserAccount,
    openLogin,
    openHomePage,
  } = useAccounts({
    fpi,
  });

  const [cachedUser, setCachedUser] = useState(null);

  useEffect(() => {
    if (userData?.user_id) {
      setCachedUser(userData);
    }
  }, [userData]);

  const user = cachedUser ?? userData;

  useEffect(() => {
    if (!user?.emails) {
      setLoading(true);
    } else setLoading(false);
  }, [user, platformData]);

  const accountInfo = useMemo(() => {
    if (!user) return null;
    try {
      return {
        userdata: user,
        platformData: {
          delete_account_reasons: platformData?.delete_account_reasons,
        },
        sendOtp,
        sendOtpMobile,
        sendOtpEmail,
        deleteUserAccount,
      };
    } catch (error) {
      console.error("Error accessing FPI state:", error);
      return null;
    }
  }, [loading]);

  const email = useMemo(() => {
    const userEmail = accountInfo?.userdata?.emails?.[0]?.email;
    if (!userEmail) return "";
    // Mask email: show first 2 chars + *** + @ + domain
    const [localPart, domain] = userEmail.split("@");
    if (!domain) return userEmail;
    const maskedLocal =
      localPart.length > 2 ? localPart.substring(0, 2) + "***" : "***";
    return `${maskedLocal}@${domain}`;
  }, [accountInfo]);

  const reasonList = useMemo(
    () => accountInfo?.platformData?.delete_account_reasons || [],
    [accountInfo],
  );

  const isDeleteEnabled = useMemo(() => {
    const hasReason =
      !!selectedReason?.reason_id &&
      (selectedReason?.reason_text !== "Other" ||
        (description?.trim()?.length ?? 0) > 0);

    const otpValid = /^\d{4}$/.test(String(otpVal ?? ""));

    const otpWasSent = !!requestId;

    return hasReason && otpValid && otpWasSent && isAgreed;
  }, [selectedReason, description, otpVal, requestId, isAgreed]);

  // Validation checks for delete button

  const onDescInput = (e) => {
    const val = e.target.value || "";
    setDescription(val.substring(0, descMaxLength));
    if (val.length) setShowDescErr(false);
  };

  const onDescBlur = () => {
    if (!description.length) setShowDescErr(true);
  };

  const otpKeyPress = (e) => {
    if (!/^[0-9]*$/gi.test(e.key)) {
      e.preventDefault();
    }
  };

  const otpInput = (e) => {
    const val = e.target.value;
    setOtpVal(val);
    setShowOtpErr(!(val > 0));
  };

  const timer = (remaining) => {
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    setOtpTime(remaining);
    otpTimerRef.current = setInterval(() => {
      remaining -= 1;
      setOtpTime(remaining);
      if (remaining < 0) {
        clearInterval(otpTimerRef.current);
        setIsShowResendOtp(true);
        setOtpTime(30);
      }
    }, 1000);
  };

  const selectReason = (reason) => {
    setSelectedReason(reason);
  };

  const resendOtpHandler = async () => {
    if (isShowResendOtp) {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      await sendOTP();
      setShowOtpErr(false);
      setIsShowResendOtp(false);
      setOtpVal("");
    }
  };
  const sendOTP = async () => {
    if (!isRunningOnClient()) {
      return;
    }

    const userEmail = accountInfo?.userdata?.emails?.[0]?.email;

    if (!userEmail) {
      showSnackbar("No email address found", "error");
      return;
    }

    const emailInfo = {
      email: userEmail,
      action: "send",
    };

    try {
      setOtpVal("");
      setOtpSending(true);
      const res = await accountInfo?.sendOtpEmail?.(emailInfo);
      setUserId(user?.user_id);

      // For email OTP, we need to generate a request_id
      // The API might return it differently, so we'll use a timestamp-based ID
      const generatedRequestId = `email_otp_${Date.now()}_${user?.user_id}`;
      setRequestId(generatedRequestId);

      const rt = 30; // Default 30 seconds for email OTP
      timer(rt);
      setOtpSent(true);
      setIsShowResendOtp(false);
      showSnackbar("OTP sent to your email", "success");
      return res;
    } catch (err) {
      showSnackbar(err?.message || "Failed to send OTP", "error");
      console.log("err", err);
    } finally {
      setOtpSending(false);
    }
  };

  const goToProfile = () => {
    navigate(-1);
  };

  const deleteUser = async () => {
    if (!isRunningOnClient()) {
      return;
    }

    if (!requestId) {
      showSnackbar("Please send and enter OTP", "error");
      return;
    }

    const reasonSelected =
      (selectedReason?.reason_text === "Other") === false
        ? selectedReason?.reason_text
        : description;

    if (!userId) {
      showSnackbar("User not available", "error");
      return;
    }

    const body = {
      deleteApplicationUserRequestSchemaInput: {
        otp: otpVal,
        reason: reasonSelected,
        reason_id: selectedReason?.reason_id,
        request_id: requestId,
        user_id: userId,
      },
    };

    try {
      setIsLoading(true);
      const res = await accountInfo?.deleteUserAccount?.(body);
      setIsLoading(false);
      setIsAccountDeleted(true);
    } catch (err) {
      setIsLoading(false);
      console.log("res on deleteUser", err);
      showSnackbar(err?.message || "Failed to delete account", "error");
    }
  };

  // UPDATED: no auto-send; just ensure auth & client
  useEffect(() => {
    if (!isRunningOnClient()) {
      return;
    }

    if (!accountInfo?.userdata) {
      openLogin();
    }

    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfo]);

  useEffect(() => {
    if (isAccountDeleted) {
      openHomePage();
    }
  }, [isAccountDeleted]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-[467px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-6 mb-8">
        <div className="subheading-3">DELETE ACCOUNT</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-start gap-8 pt-3">
        {/* Heading and Subtext */}
        <div className="flex flex-col items-start gap-2">
          <p className="body-1">We're sad to see you go.</p>
          <p className="body-2 text-[#aaaaaa]">
            Before you go, please tell us how we can improve.
          </p>
        </div>

        {/* Reason Selection */}
        <div className="flex flex-col items-start gap-3 w-full">
          <label className="body-1 !text-[#aaaaaa]">
            WHY ARE YOU CLOSING YOUR ACCOUNT?*
          </label>
          <div className="flex flex-col gap-3 w-fit">
            {reasonList?.map((reason, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-2 border border-solid border-[#EEEEEE] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                style={{
                  backgroundColor:
                    selectedReason?.reason_id === reason?.reason_id
                      ? "#F5F5F5"
                      : "white",
                }}
                onClick={() => selectReason(reason)}
              >
                <input
                  type="checkbox"
                  name="reason"
                  value={reason?.reason_id}
                  checked={selectedReason?.reason_id === reason?.reason_id}
                  onChange={() => selectReason(reason)}
                  className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                  style={{
                    border: "1px solid #5C2E20",
                    borderRadius: "1px",
                  }}
                />
                <span className="body-2">{reason?.reason_text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description - Only show when "Other" is selected */}
        {selectedReason?.reason_text === "Other" && (
          <div className="flex flex-col items-start gap-3 w-full">
            <label className="body-1 !text-[#aaaaaa]">DESCRIPTION*</label>
            <div className="relative w-full">
              <textarea
                value={description}
                onChange={onDescInput}
                placeholder="Please tell us more about your reason..."
                onBlur={onDescBlur}
                className={`body-2 p-3 w-full h-[120px] border border-solid resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  showDescErr
                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                }`}
              />
              <div className="absolute bottom-3 right-3 body-3 text-[#aaaaaa]">
                {description.length}/{descMaxLength}
              </div>
            </div>
            {showDescErr && (
              <span className="body-3 text-[#5c2e20]">{descErr}</span>
            )}
          </div>
        )}

        {/* OTP Section */}
        <div className="flex flex-col items-start gap-3 w-full">
          <label className="body-2 !text-[#aaaaaa]">
            {otpSent ? (
              <>
                ENTER OTP SENT TO{" "}
                <span className="text-neutral-900">{email}</span>
              </>
            ) : (
              <>
                CLICK SEND OTP TO RECEIVE CODE ON{" "}
                <span className="text-neutral-900">{email}</span>
              </>
            )}
          </label>
          <div className="flex items-center gap-3 w-full">
            <input
              placeholder="Enter 4-digit OTP"
              value={otpVal || ""}
              maxLength={4}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              onChange={otpInput}
              onKeyPress={otpKeyPress}
              className="body-2 p-1 border border-solid border-[#EEEEEE] h-[32px] md:h-[24px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:border-[#AAAAAA]"
              style={{
                border: "1px solid #EEEEEE",
              }}
            />
            {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                disabled={otpSending}
                className="px-6 py-2 bg-neutral-900 text-white body-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {otpSending ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="button"
                onClick={resendOtpHandler}
                disabled={!isShowResendOtp}
                className="px-6 py-2 bg-neutral-900 text-white body-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isShowResendOtp ? "Resend OTP" : `Resend in ${otpTime}s`}
              </button>
            )}
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-center gap-3 w-full">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
            style={{
              border: "1px solid #5C2E20",
              borderRadius: "1px",
            }}
          />
          <label
            className="body-2 cursor-pointer"
            onClick={() => setIsAgreed(!isAgreed)}
          >
            By continuing, I agree to the{" "}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5C2E20] underline"
            >
              Terms of Service
            </a>{" "}
            &{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5C2E20] underline"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-4 mt-4">
          <button
            type="button"
            onClick={goToProfile}
            className="w-full md:flex-1 px-6 py-3 bg-neutral-900 !text-white subheading-3 hover:bg-neutral-800 transition-colors"
          >
            KEEP ACCOUNT
          </button>
          <button
            type="button"
            onClick={deleteUser}
            disabled={!isDeleteEnabled}
            className="w-full md:flex-1 px-6 py-3 border border-solid border-neutral-900 text-neutral-900 subheading-3 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-nowrap whitespace-nowrap"
          >
            DELETE ACCOUNT
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
