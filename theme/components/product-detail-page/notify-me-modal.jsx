import React, { useState } from "react";
import { useToast } from "../custom-toaster";

export const NotifyMeModal = ({
  showNotifyModal,
  setShowNotifyModal,
  productData,
}) => {
  const [notifySize, setNotifySize] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [showNotifySizeDropdown, setShowNotifySizeDropdown] = useState(false);
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const toast = useToast();

  const handleClose = () => {
    setShowNotifyModal(false);
    setShowNotifySizeDropdown(false);
    setNotifySize(null);
    setNotifyEmail("");
  };

  const handleSubmit = async () => {
    if (!notifyEmail) return;

    setIsSubmittingNotify(true);
    try {
      // Prepare payload matching the exact structure from working website
      const payload = {
        email: [{ email: notifyEmail }],
        media: productData?.media?.map((img) => ({
          alt: img.alt,
          meta: img.meta,
          type: img.type,
          url: img.url,
        })),
        name: productData?.name,
        description: productData?.description,
        item_id: parseInt(productData?.uid),
        size: notifySize?.value || "",
        // article_id: "88867_3240202-S",
        product_uid: parseInt(productData?.uid),
      };

      // Call the external API
      const response = await fetch(
        "/ext/prodStockNotify/v1/v1.0/out_stock_email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit notification request");
      }

      toast.success("You will be notified when this product is back in stock");
      handleClose();
    } catch (error) {
      console.error("Notify me error:", error);
      toast.error("Failed to submit notification request. Please try again.");
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  if (!showNotifyModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="body-1 absolute top-4 right-4 text-neutral-900 hover:text-neutral-600"
        >
          close
        </button>

        {/* Modal Title */}
        <h3 className="body-1 text-neutral-900 mb-6">
          Notify me when the item gets back in stock!
        </h3>

        {/* Size Dropdown - Custom Styled like main component (Optional) */}
        <div className="flex flex-col gap-3 mb-4">
          <label className="text-[11px] font-normal leading-[13.2px] uppercase text-neutral-900">
            Size (Optional)
          </label>
          <div className="size-dropdown-container relative w-full">
            <button
              className="flex items-center justify-between w-full p-2 bg-[#e3e3e3] border-2 text-left font-normal [font-family:'Archivo',Helvetica] text-[11px] tracking-[0] leading-[13.2px] hover:bg-gray-50"
              onClick={() => setShowNotifySizeDropdown(!showNotifySizeDropdown)}
              style={{
                border: "1px solid #171717",
              }}
              type="button"
            >
              <span className="body-1 text-[#171717]">
                {notifySize ? notifySize.display : "SELECT A SIZE"}
              </span>
              <span className="body-1">
                {showNotifySizeDropdown ? "−" : "+"}
              </span>
            </button>
            {/* Dropdown Options - Opens above the button */}
            {showNotifySizeDropdown && (
              <div
                className="absolute bottom-full left-0 right-0 bg-white z-10 mb-0 max-h-48 overflow-y-auto"
                style={{
                  border: "1px solid #eeeeee",
                }}
              >
                {productData?.sizes?.sizes
                  ?.filter((size) => !size.is_available || size.quantity === 0)
                  .map((option) => (
                    <button
                      key={option.value}
                      className="w-full px-4 py-1 text-left body-1 text-[#171717] hover:bg-gray-100 cursor-pointer"
                      style={{ border: "1px solid #eeeeee" }}
                      onClick={() => {
                        setNotifySize(option);
                        setShowNotifySizeDropdown(false);
                      }}
                      type="button"
                    >
                      {option.display}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-3 mb-6">
          <label className="text-[11px] font-normal leading-[13.2px] uppercase text-neutral-900">
            Your Email*
          </label>
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="Enter your email id"
            className="w-full bg-[#F5F5F5] body-2 h-8 placeholder:text-[#AAA] placeholder:text-[11px] border border-solid outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 border-[#EEEEEE] focus:border-[#AAAAAA] px-3"
            style={{
              fontSize: "11px",
              color: "#171717",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Notify Me Button */}
        <button
          onClick={handleSubmit}
          disabled={!notifyEmail || isSubmittingNotify}
          className="w-full body-2 text-[11px] font-normal leading-[13.2px] uppercase transition-colors outline-none focus:outline-none focus-visible:outline-none"
          style={{
            backgroundColor:
              !notifyEmail || isSubmittingNotify ? "#EEEEEE" : "#171717",
            color: !notifyEmail || isSubmittingNotify ? "#AAAAAA" : "#FFFFFF",
            cursor:
              !notifyEmail || isSubmittingNotify ? "not-allowed" : "pointer",
            height: "32px",
            border: "1px solid",
            borderColor:
              !notifyEmail || isSubmittingNotify ? "#EEEEEE" : "#171717",
            borderRadius: "1px",
          }}
        >
          {isSubmittingNotify ? "Submitting..." : "Notify Me"}
        </button>

        {/* Privacy Text */}
        <p className="body-2 !text-[10px] font-normal leading-[12px] text-neutral-600 mt-4 text-center">
          We respect your privacy & do not share your email with anyone.
        </p>
      </div>
    </div>
  );
};
