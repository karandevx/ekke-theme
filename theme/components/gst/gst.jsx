import React, { useState, useEffect } from "react";
import styles from "./gst.less";
import { CART_META_UPDATE } from "../../queries/cartQuery";
import { useGlobalStore } from "fdk-core/utils";
import { gstMaps } from "../../helper/gst-maps";
import Loader from "../loader/loader";

const Gst = ({
  fpi,
  cartData,
  billState = "",
  shipState = "",
  billShip = false,
  diffAdd = false,
  onGstErrorChange = () => {},
}) => {
  // Helper to notify parent of error changes
  const notifyErrorChange = (formatError, stateError) => {
    if (typeof onGstErrorChange === "function") {
      // Support both old signature (single boolean) and new signature (two booleans)
      if (onGstErrorChange.length === 2) {
        onGstErrorChange(formatError, stateError);
      } else {
        onGstErrorChange(formatError || stateError);
      }
    }
  };
  const custom_value = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const GST_NUMBER_LENGTH = 15;
  const [gstNumber, setGstNumber] = useState(
    cartData?.gstin || custom_value?.gstNo || "",
  );
  const [gstError, setGstError] = useState(false);
  const [gstStateError, setGstStateError] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [gstErrorEmpty, setGstErrorEmpty] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const normalize = (s) => (s ?? "").toString().trim().toLowerCase();

  const getGstLoc = (gstin) => {
    const g = gstin?.toUpperCase?.().trim() || "";
    if (!g || g.length < 2) return "";
    const gstCode = g.slice(0, 2);
    const state = gstMaps.find((item) => item.gstCode === gstCode);
    return state ? normalize(state.state) : "";
  };

  const validateGstWithAddress = (gstin) => {
    const g = gstin?.toUpperCase?.().trim() || "";
    if (!g || g.length < 15) {
      return { isValid: false, error: null };
    }

    // Strict GSTIN format validation
    const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/i;
    if (!GSTIN_REGEX.test(g)) {
      return { isValid: false, error: "format" };
    }

    const gstLocation = getGstLoc(g);
    const activeStateName = billShip || !!diffAdd ? billState : shipState;

    if (!activeStateName) {
      return { isValid: false, error: "state_missing" };
    }

    const match = normalize(activeStateName) === gstLocation;
    if (!match) {
      return { isValid: false, error: "state_mismatch" };
    }

    return { isValid: true, error: null };
  };

  useEffect(() => {
    const g = gstNumber?.toUpperCase?.().trim() || "";
    // Don't flag while typing until 15 chars
    if (!g) {
      setGstError(false);
      setGstStateError(false);
      notifyErrorChange(false, false);
      return;
    }
    if (g.length < 15) {
      setGstError(false);
      setGstStateError(false);
      notifyErrorChange(false, false);
      return;
    }

    const validation = validateGstWithAddress(g);
    if (validation.error === "format") {
      setGstError(true);
      setGstStateError(false);
      notifyErrorChange(true, false);
    } else if (
      validation.error === "state_mismatch" ||
      validation.error === "state_missing"
    ) {
      setGstError(false);
      setGstStateError(true);
      notifyErrorChange(false, true);
    } else {
      setGstError(false);
      setGstStateError(false);
      notifyErrorChange(false, false);
    }
  }, [gstNumber, billState, shipState, billShip, diffAdd]);

  const applyGST = async (e, gstin) => {
    e.preventDefault();
    e.stopPropagation();

    if (!gstNumber || gstNumber.trim().length === 0) {
      setGstErrorEmpty(true);
      setGstError(false);
      setGstStateError(false);
      setShowMessage(false);
      notifyErrorChange(true, false);
      return;
    }

    const trimmedGst = gstNumber.trim().toUpperCase();

    // First validate format
    if (!isValidGSTIN(trimmedGst)) {
      setGstError(true);
      setGstStateError(false);
      setGstErrorEmpty(false);
      setShowMessage(false);
      notifyErrorChange(true, false);
      return;
    }

    // Then validate with address state
    const validation = validateGstWithAddress(trimmedGst);
    if (!validation.isValid) {
      if (
        validation.error === "state_mismatch" ||
        validation.error === "state_missing"
      ) {
        setGstStateError(true);
        setGstError(false);
        setGstErrorEmpty(false);
        setShowMessage(false);
        notifyErrorChange(false, true);
        return;
      } else {
        setGstError(true);
        setGstStateError(false);
        setGstErrorEmpty(false);
        setShowMessage(false);
        notifyErrorChange(true, false);
        return;
      }
    }

    // All validations passed, proceed to apply
    const payload = {
      updateCartMetaId: cartData?.id?.toString(),
      cartMetaRequestInput: {
        gstin: trimmedGst,
      },
    };

    try {
      const res = await fpi.executeGQL(CART_META_UPDATE, payload);
      if (res?.data?.updateCartMeta?.is_valid) {
        fpi.custom.setValue("gstNo", trimmedGst);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          setIsReloading(true);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }, 1000);
        setGstError(false);
        setGstStateError(false);
        setGstErrorEmpty(false);
        notifyErrorChange(false, false);
      } else {
        setGstError(true);
        setGstStateError(false);
        setShowMessage(false);
        notifyErrorChange(true, false);
      }
    } catch (err) {
      console.log({ err });
      setGstError(true);
      setShowMessage(false);
      notifyErrorChange(true, false);
    }
  };

  const removeGST = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = {
      updateCartMetaId: cartData?.id?.toString(),
      cartMetaRequestInput: {
        gstin: "",
      },
    };
    fpi
      .executeGQL(CART_META_UPDATE, payload)
      .then((res) => {
        if (res?.data?.updateCartMeta?.is_valid) {
          fpi.custom.setValue("gstNo", "");
          setGstError(false);
          setGstNumber("");
          setShowMessage(true); // Show message
          setTimeout(() => {
            setShowMessage(false);
            setIsReloading(true);
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  // ✅ GST Validation Function
  const isValidGSTIN = (gstin) => {
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) return false;

    const stateCode = parseInt(gstin.substring(0, 2), 10);
    if (stateCode < 1 || stateCode > 37) return false;

    return true;
  };

  // const onGstChange = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const gst = e.target.value;
  //   if (gst.length <= GST_NUMBER_LENGTH) {
  //     setGstNumber(gst);
  //   }
  //   if (gst.length > 0) {
  //   setGstErrorEmpty(false);
  // }
  //   if (gst.length === GST_NUMBER_LENGTH) {
  //     setGstError(false);
  //   } else {
  //     // setGstError(true);
  //   }
  // };
  const onGstChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const gst = e.target.value.toUpperCase().replace(/\s/g, "");

    if (gst.length <= GST_NUMBER_LENGTH) {
      setGstNumber(gst);
    }

    if (gst.length > 0) {
      setGstErrorEmpty(false);
    }

    if (isValidGSTIN(gst)) {
      setGstError(false);
    }
  };

  return (
    <>
      <Loader visible={isReloading} />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="gstInput"
            autoComplete="off"
            value={gstNumber}
            placeholder="GST Number"
            className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[32px] h-[40px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#AAAAAA] pl-9 ${
              cartData?.gstin?.length
                ? "bg-[#e9ecef] cursor-not-allowed"
                : "bg-white"
            } ${
              gstError || gstErrorEmpty || gstStateError
                ? "border-[#5C2E20] focus:border-[#5C2E20]"
                : "border-[#EEEEEE] focus:border-[#AAAAAA]"
            }`}
            onChange={(e) => {
              onGstChange(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!cartData?.gstin?.length) {
                  applyGST(e, gstNumber);
                } else {
                  removeGST(e);
                }
              }
            }}
            disabled={!!cartData?.gstin?.length}
            style={{
              backgroundImage:
                "url('https://cdn.anscommerce.com/temp/new-01.svg')",
              backgroundPosition: "8px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "20px 20px",
            }}
          />
          <button
            onClick={(e) => {
              if (!cartData?.gstin?.length) {
                applyGST(e, gstNumber);
              } else {
                removeGST(e);
              }
            }}
            className="bg-[#171717] !text-white body-1 uppercase px-6 py-2 cursor-pointer hover:bg-black transition-colors whitespace-nowrap"
            disabled={!!cartData?.gstin?.length && !gstNumber}
          >
            {!cartData?.gstin?.length ? "Apply" : "Remove"}
          </button>
        </div>

        {gstErrorEmpty && (
          <div className="body-3 text-[#5C2E20] mt-1">
            &nbsp; Warning: Please enter GST Number!
          </div>
        )}
        {gstError && (
          <div className="body-3 text-[#5C2E20] mt-1">
            &nbsp; Warning: GST No. is invalid!
          </div>
        )}
        {gstStateError && (
          <div className="body-3 text-[#5C2E20] mt-1">
            &nbsp; Warning: GST Number doesn't match with billing/shipping
            state. Please enter correct GST Number!
          </div>
        )}

        {showMessage && !cartData?.gstin && (
          <div className="body-3 text-[#218736] mt-1">
            &nbsp; GST No. applied.
          </div>
        )}
        {showMessage && cartData?.gstin && (
          <div className="body-3 text-[#218736] mt-1">
            &nbsp; GST No. removed.
          </div>
        )}
      </div>
    </>
  );
};
export default Gst;
