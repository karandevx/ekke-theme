import React, { useState, useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
// import styles from "./size-guide.less";
// import FyImage from "../../../../components/core/fy-image/fy-image";
// import FyHTMLRenderer from "../../../../components/core/fy-html-renderer/fy-html-renderer";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
// import Modal from "../../../../components/core/modal/modal";
import { useToast } from "../../../../components/custom-toaster";
import { PLP_ADD_TO_CART } from "../../../../queries/plpQuery";
import { PRODUCT_SIZE_PRICE } from "../../../../queries/pdpQuery";
import useCheckAnnouncementBar from "../../../../helper/hooks/useCheckAnnouncementBar";

function SizeGuide({
  isOpen,
  productMeta,
  onCloseDialog,
  isOutOfStock = false,
  productData,
}) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const toast = useToast();
  const [previewSelectedMetric, setPreviewSelectedMetric] = useState("cm");
  const [selectedMetric, setSelectedMetric] = useState("cm");
  const [activeTab, setActiveTab] = useState("size_guide");
  const [touched, setTouched] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [show, setShow] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  // Add this helper function at the top of the component, after the state declarations (around line 30)
  const extractImageFromDescription = (description) => {
    if (!description) return null;

    // Use regex to extract img src from HTML
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = description.match(imgRegex);

    return match ? match[1] : null;
  };

  // Add this useMemo to get the image URL (around line 100, after other useMemo hooks)
  const sizeGuideImageUrl = useMemo(() => {
    // First check if description has an image
    const descriptionImage = extractImageFromDescription(
      productMeta?.size_chart?.description,
    );

    // Return description image if found, otherwise fallback to size_chart.image
    return descriptionImage || productMeta?.size_chart?.image;
  }, [productMeta?.size_chart?.description, productMeta?.size_chart?.image]);

  const values = {
    in: t("resource.common.inch"),
    cm: t("resource.common.cm"),
  };

  const headers = Object.entries(productMeta?.size_chart?.headers ?? {}).filter(
    ([key, val]) => !key?.includes("__") && val !== null,
  );

  // Filter headers and rows based on selected size
  const filteredHeaders = useMemo(() => {
    if (!selectedSize) {
      // Show all headers if no size is selected
      return headers;
    }

    // Find the column index for the selected size
    const selectedSizeHeader = headers.find(
      ([key, val]) => val?.value?.toUpperCase() === selectedSize?.toUpperCase(),
    );

    if (!selectedSizeHeader) {
      return headers; // If selected size not found, show all
    }

    // Return only col_1 (Size name) and the selected size column
    return headers.filter(
      ([key, val]) =>
        key === "col_1" ||
        val?.value?.toUpperCase() === selectedSize?.toUpperCase(),
    );
  }, [headers, selectedSize]);

  // Filter row data based on selected size
  const getFilteredRowData = (row) => {
    if (!selectedSize) {
      // Show all columns if no size is selected
      return Object.entries(row).filter(
        ([key, val]) => !key?.includes("__") && val !== null,
      );
    }

    // Find the column key for the selected size
    const selectedSizeHeader = headers.find(
      ([key, val]) => val?.value?.toUpperCase() === selectedSize?.toUpperCase(),
    );

    if (!selectedSizeHeader) {
      return Object.entries(row).filter(
        ([key, val]) => !key?.includes("__") && val !== null,
      );
    }

    const selectedColumnKey = selectedSizeHeader[0];

    // Return only col_1 and the selected size column data
    return Object.entries(row).filter(
      ([key, val]) =>
        !key?.includes("__") &&
        val !== null &&
        (key === "col_1" || key === selectedColumnKey),
    );
  };

  useEffect(() => {
    if (productMeta?.size_chart?.unit) {
      setPreviewSelectedMetric(productMeta?.size_chart.unit);
      setSelectedMetric(productMeta?.size_chart.unit);
    }
  }, [productMeta]);

  const changeSelectedMetric = (val) => {
    setPreviewSelectedMetric(val);

    if (selectedMetric === val) {
      setTouched(false);
    } else {
      setTouched(true);
    }
  };

  const isSizeChartAvailable = () => {
    const sizeChartHeader = productMeta?.size_chart?.headers || {};
    return Object.keys(sizeChartHeader).length > 0;
  };

  const convertMetrics = (val) => {
    if (previewSelectedMetric === "cm" && touched) {
      let finalVal = "";
      val = val.split("-");
      for (let i = 0; i < val.length; i += 1) {
        if (i !== 0 && i < val.length) {
          finalVal += "-";
        }
        if (!Number.isNaN(Number(val[i]))) {
          finalVal += (Number(val[i]) * 2.54).toFixed(1); // inches to cm
        } else {
          finalVal += val[i];
        }
      }
      return finalVal;
    }

    if (previewSelectedMetric === "in" && touched) {
      let finalVal = "";
      val = val.split("-");
      for (let i = 0; i < val.length; i += 1) {
        if (i !== 0 && i < val.length) {
          finalVal += "-";
        }
        if (!Number.isNaN(Number(val[i]))) {
          finalVal += (Number(val[i]) / 2.54).toFixed(1); // cm to inches
        } else {
          finalVal += val[i];
        }
      }
      return finalVal;
    }

    return val;
  };

  const displayStyle = useMemo(() => {
    let displayStyle = "none";
    if (activeTab === "measure") {
      displayStyle = "block";
    }
    return displayStyle;
  }, [activeTab]);

  // Animation control
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onCloseDialog();
      setActiveTab("size_guide");
    }, 300);
  };

  // Add to Cart functionality
  const handleAddToCart = async () => {
    // Check if size is selected
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    // Find the size value from productMeta.sizes
    const sizeData = productMeta?.sizes?.find(
      (size) => size.display === selectedSize,
    );

    if (!sizeData) {
      toast.error("Invalid size selection");
      return;
    }

    let sellerId, storeId;

    // Fetch seller and store IDs if not available
    if (!productData?.seller?.uid || !productData?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: productData?.slug,
          size: sizeData.value,
          pincode: "",
        });

        const freshProductPriceData = productPriceResponse?.data?.productPrice;

        if (
          !freshProductPriceData?.seller?.uid ||
          !freshProductPriceData?.store?.uid
        ) {
          console.error(
            "Unable to fetch seller/store data. " + productData?.item_code,
          );
          toast.error("Unable to add product to cart. Please try again later.");
          return;
        }

        sellerId = freshProductPriceData.seller.uid;
        storeId = freshProductPriceData.store.uid;
      } catch (error) {
        toast.error("Unable to fetch product price. Please try again later.");
        return;
      }
    } else {
      sellerId = productData.seller.uid;
      storeId = productData.store.uid;
    }

    const payload = {
      addCartRequestInput: {
        items: [
          {
            item_id: productData?.uid,
            item_size: sizeData.value,
            quantity: 1,
            seller_id: sellerId,
            store_id: storeId,
          },
        ],
      },
      buyNow: false,
    };

    try {
      const { data } = await fpi.executeGQL(PLP_ADD_TO_CART, payload);

      if (data?.addItemsToCart?.success) {
        toast.success(
          "Product added successfully" || data?.addItemsToCart?.message,
        );

        // Close size guide drawer
        handleClose();

        // Open cart drawer after a short delay
        setTimeout(() => {
          fpi.custom.setValue("isCartDrawerOpen", true);
        }, 500);
      } else {
        throw new Error(
          data?.addItemsToCart?.message || "Failed to add product to cart",
        );
      }
    } catch (error) {
      console.error("Failed to add product to cart", error);
      toast.error("Failed to add product to cart. Please try again.");
    }
  };

  // Close size dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSizeDropdown &&
        !event.target.closest(".size-dropdown-container")
      ) {
        setShowSizeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSizeDropdown]);

  if (!isOpen) return null;

  const topPostion = hasAnnouncementBar ? "80px" : "56px";

  return (
    <>
      {/* Overlay - Below header */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-10 ${
          show
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: topPostion }}
        onClick={handleClose}
      />

      {/* Drawer - Starts below header, slides from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full  bg-[#F7F7F5] shadow-xl z-20 transition-opacity duration-300 overflow-y-auto ${
          show
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: topPostion, height: `calc(100vh - ${topPostion})` }}
      >
        {/* New Redesigned Size Guide */}
        <div className="w-full h-full flex flex-col">
          {/* Content Container - Compact Layout */}
          <div className="flex-1 overflow-hidden">
            {/* Desktop Layout: 70/30 split - Image 70%, Details 30% */}
            <div className="hidden lg:flex h-full">
              {/* Left: Image - Compact (70%) */}
              <div
                className="flex flex-col gap-3 h-full"
                style={{
                  width: "70%",
                  height: `calc(100vh - ${topPostion})`,
                }}
              >
                {/* Measurement Image - Smaller */}
                <div
                  className="w-full flex items-center justify-center overflow-hidden"
                  style={{
                    height: `calc(100vh - ${topPostion})`,
                  }}
                >
                  {sizeGuideImageUrl ? (
                    <img
                      src={sizeGuideImageUrl}
                      alt="Measurement Guide"
                      className={`w-full h-full object-contain`}
                      style={{ maxHeight: `calc(100vh - ${topPostion})` }}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400">
                      <p>No size guide image available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details - Compact with scroll (30%) */}

              <div
                className="flex flex-col h-full overflow-y-auto px-3 py-6 bg-[#F7F7F5]"
                style={{ width: "30%" }}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleClose}
                        className="body-1 text-[#171717] hover:text-[#5C2E20] transition-colors w-full text-right"
                      >
                        CLOSE
                      </button>
                    </div>
                    <div className="space-y-8 mt-8">
                      <p className="body-1 uppercase !text-[#aaaaaa]">
                        SIZE GUIDE
                      </p>
                      {/* Unit Selection - Compact */}
                      <div className="flex flex-col items-start justify-start gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="unit"
                            value="cm"
                            checked={previewSelectedMetric === "cm"}
                            onChange={() => changeSelectedMetric("cm")}
                            className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                            style={{
                              border: "1px solid #5C2E20",
                              borderRadius: "1px",
                            }}
                          />
                          <span className="body-2 text-[#171717]">CM</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="unit"
                            value="in"
                            checked={previewSelectedMetric === "in"}
                            onChange={() => changeSelectedMetric("in")}
                            className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                            style={{
                              border: "1px solid #5C2E20",
                              borderRadius: "1px",
                            }}
                          />
                          <span className="body-2 text-[#171717]">INCHES</span>
                        </label>
                      </div>

                      {/* Brand/Designer Name - Compact */}
                      <div>
                        <p className="subheading-1 text-[#171717] uppercase mb-1">
                          {productData?.brand?.name}
                        </p>
                        <p className="body-3 text-[#AAAAAA]">
                          {productData?.name}
                        </p>
                      </div>

                      {/* Add to Cart Button - Compact */}
                      <button
                        className="w-full bg-[#171717] !text-[#F7F7F5] text-left body-1 uppercase hover:bg-[#2a2a2a] transition-colors h-6 pl-1"
                        onClick={handleAddToCart}
                        disabled={!productMeta?.sellable}
                      >
                        {!productMeta?.sellable ? "NOTIFY ME" : "ADD TO CART"}
                      </button>

                      {/* Size Selection Dropdown */}
                      <div className="flex flex-col gap-2">
                        <div className="relative w-full size-dropdown-container">
                          <button
                            className="flex items-center justify-between w-full px-2 bg-[#e3e3e3] border text-left body-2 hover:bg-gray-50 h-6"
                            onClick={() =>
                              setShowSizeDropdown(!showSizeDropdown)
                            }
                            style={{ border: "1px solid #171717" }}
                          >
                            <span className="text-[#171717]">
                              {selectedSize ? selectedSize : "SELECT A SIZE"}
                            </span>
                            <span className="body-1">
                              {showSizeDropdown ? "−" : "+"}
                            </span>
                          </button>
                          {showSizeDropdown && (
                            <div
                              className="absolute bottom-full left-0 right-0 bg-white z-10 mb-0 max-h-40 overflow-y-auto"
                              style={{ border: "1px solid #eeeeee" }}
                            >
                              {productMeta?.sizes?.length > 0 ? (
                                productMeta?.sizes?.map((option) => (
                                  <button
                                    key={option.value}
                                    className="w-full px-4 py-1 text-left body-2 text-[#171717] hover:bg-gray-100 cursor-pointer"
                                    style={{ border: "1px solid #eeeeee" }}
                                    onClick={() => {
                                      setSelectedSize(option.display);
                                      setShowSizeDropdown(false);
                                    }}
                                  >
                                    {option.display}
                                  </button>
                                ))
                              ) : (
                                <p className="body-2 p-2">No sizes available</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Out of Stock Section - Compact */}
                      <div>
                        {!productMeta?.sellable ? (
                          <p className="body-2 text-[#5C2E20] uppercase mb-2">
                            OUT OF STOCK
                          </p>
                        ) : null}
                      </div>

                      {/* Size Chart Table - Scrollable with visible scrollbar */}
                      {isSizeChartAvailable() && (
                        <div className="mt-2">
                          <style
                            dangerouslySetInnerHTML={{
                              __html: `
                          .desktop-table-wrapper {
                            width: 100%;
                          }
                          .desktop-table-header {
                            width: 100%;
                            overflow: hidden;
                          }
                          .desktop-table-header table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          .desktop-table-body-wrapper {
                            width: 100%;
                            max-height: 200px;
                            overflow-y: scroll;
                            overflow-x: hidden;
                            scrollbar-width: auto;
                          }
                          .desktop-table-body-wrapper table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          .desktop-table-body-wrapper::-webkit-scrollbar {
                            width: 6px;
                          }
                          .desktop-table-body-wrapper::-webkit-scrollbar-track {
                            background: #f1f1f1;
                          }
                          .desktop-table-body-wrapper::-webkit-scrollbar-thumb {
                            background-color: #171717;
                            border-radius: 0px;
                          }
                          .desktop-table-body-wrapper::-webkit-scrollbar-thumb:hover {
                            background-color: #000000;
                          }
                        `,
                            }}
                          />
                          <div className="desktop-table-wrapper">
                            {/* Fixed Header */}
                            <div className="desktop-table-header">
                              <table>
                                <thead className="bg-[#F7F7F5]">
                                  <tr>
                                    {filteredHeaders?.map(
                                      ([key, val]) =>
                                        val !== null && (
                                          <th
                                            key={`column${key}`}
                                            className="body-2 text-left py-2 px-1 text-[#AAAAAA] uppercase bg-[#F7F7F5]"
                                            style={{
                                              width: `${100 / filteredHeaders.length}%`,
                                            }}
                                          >
                                            {val?.value}
                                          </th>
                                        ),
                                    )}
                                  </tr>
                                </thead>
                              </table>
                            </div>

                            {/* Scrollable Body */}
                            <div className="desktop-table-body-wrapper">
                              <table>
                                <tbody className="bg-white">
                                  {productMeta?.size_chart?.sizes?.map(
                                    (row, index) => {
                                      const filteredRowData =
                                        getFilteredRowData(row);
                                      return (
                                        <tr
                                          key={`row_${index}`}
                                          className="cursor-pointer transition-colors"
                                          onClick={() =>
                                            setSelectedMeasurement({
                                              name: row.col_1,
                                              value: row.col_2,
                                            })
                                          }
                                        >
                                          {filteredRowData?.map(
                                            ([key, val], index2) => {
                                              // Find the corresponding header for this column
                                              const headerForColumn =
                                                filteredHeaders.find(
                                                  ([hKey]) => hKey === key,
                                                );
                                              return (
                                                <td
                                                  key={`cell_${key}`}
                                                  className="body-2 py-2 px-1 text-[#171717]"
                                                  style={{
                                                    width: `${100 / filteredHeaders.length}%`,
                                                  }}
                                                >
                                                  {headerForColumn?.[1]
                                                    ?.convertable
                                                    ? convertMetrics(val)
                                                    : val}
                                                </td>
                                              );
                                            },
                                          )}
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center w-full">
                    <div className="body-2  text-[#171717]">
                      Custom sizes may be available for some products. Please
                      connect with <br />
                      <FDKLink
                        to="/contact-us"
                        className="body-2 underline text-[#171717] hover:text-[#5C2E20]"
                      >
                        client assistance
                      </FDKLink>{" "}
                      for any queries.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------Mobile Layout: Stacked-------------------------------------- */}
            <div className="lg:hidden flex flex-col h-full overflow-y-auto">
              <div className="flex flex-col h-full justify-between px-3 pt-6 bg-[#F7F7F5]">
                <div className="space-y-8">
                  {/* Close Button */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleClose}
                      className="body-1 text-[#171717] hover:text-[#5C2E20] transition-colors"
                    >
                      CLOSE
                    </button>
                  </div>

                  {/* Size Guide Heading */}
                  <p className="body-1 uppercase !text-[#aaaaaa]">SIZE GUIDE</p>

                  {/* Unit Selection */}
                  <div className="flex flex-col items-start gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="unit-mobile"
                        value="cm"
                        checked={previewSelectedMetric === "cm"}
                        onChange={() => changeSelectedMetric("cm")}
                        className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                        style={{
                          border: "1px solid #5C2E20",
                          borderRadius: "1px",
                        }}
                      />
                      <span className="body-2 text-[#171717]">CM</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="unit-mobile"
                        value="in"
                        checked={previewSelectedMetric === "in"}
                        onChange={() => changeSelectedMetric("in")}
                        className="appearance-none w-2 h-2 border border-solid border-neutral-900 rounded-[1px] cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20] checked:after:rounded-[1px]"
                        style={{
                          border: "1px solid #5C2E20",
                          borderRadius: "1px",
                        }}
                      />
                      <span className="body-2 text-[#171717]">INCHES</span>
                    </label>
                  </div>

                  {/* Brand/Designer Name */}
                  <div>
                    <p className="subheading-1 text-[#171717] uppercase mb-1">
                      {productData?.brand?.name}
                    </p>
                    <p className="body-3 text-[#AAAAAA]">{productData?.name}</p>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className="w-full bg-[#171717] !text-white text-left body-1 uppercase hover:bg-[#2a2a2a] transition-colors h-8 pl-1"
                    onClick={handleAddToCart}
                    disabled={!productMeta?.sellable}
                  >
                    {!productMeta?.sellable ? "NOTIFY ME" : "ADD TO CART"}
                  </button>

                  {/* Size Selection Dropdown */}
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full size-dropdown-container">
                      <button
                        className="flex items-center justify-between w-full px-2 bg-[#e3e3e3] border text-left body-2 hover:bg-gray-50 h-8"
                        onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                        style={{ border: "1px solid #171717" }}
                      >
                        <span className="text-[#171717]">
                          {selectedSize ? selectedSize : "SELECT A SIZE"}
                        </span>
                        <span className="body-1">
                          {showSizeDropdown ? "−" : "+"}
                        </span>
                      </button>
                      {showSizeDropdown && (
                        <div
                          className="absolute bottom-full left-0 right-0 bg-white z-10 mb-0 max-h-40 overflow-y-auto"
                          style={{ border: "1px solid #eeeeee" }}
                        >
                          {productMeta?.sizes?.length > 0 ? (
                            productMeta?.sizes?.map((option) => (
                              <button
                                key={option.value}
                                className="w-full px-4 py-1 text-left body-2 text-[#171717] hover:bg-gray-100 cursor-pointer"
                                style={{ border: "1px solid #eeeeee" }}
                                onClick={() => {
                                  setSelectedSize(option.display);
                                  setShowSizeDropdown(false);
                                }}
                              >
                                {option.display}
                              </button>
                            ))
                          ) : (
                            <p className="body-2 p-2">No sizes available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Out of Stock Section */}
                  <div>
                    {!productMeta?.sellable ? (
                      <p className="body-2 text-[#5C2E20] uppercase mb-2">
                        OUT OF STOCK
                      </p>
                    ) : null}
                  </div>

                  {/* Size Chart Table - Scrollable with visible scrollbar */}
                  {isSizeChartAvailable() && (
                    <div className="mt-2">
                      <style
                        dangerouslySetInnerHTML={{
                          __html: `
                          .mobile-table-wrapper {
                            width: 100%;
                          }
                          .mobile-table-header {
                            width: 100%;
                            overflow: hidden;
                          }
                          .mobile-table-header table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          .mobile-table-body-wrapper {
                            width: 100%;
                            max-height: 200px;
                            overflow-y: scroll;
                            overflow-x: hidden;
                            scrollbar-width: auto;
                          }
                          .mobile-table-body-wrapper table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          .mobile-table-body-wrapper::-webkit-scrollbar {
                            width: 4px;
                          }
                          .mobile-table-body-wrapper::-webkit-scrollbar-track {
                            background: #f1f1f1;
                          }
                          .mobile-table-body-wrapper::-webkit-scrollbar-thumb {
                            background-color: #171717;
                            border-radius: 2px;
                          }
                          .mobile-table-body-wrapper::-webkit-scrollbar-thumb:hover {
                            background-color: #000000;
                          }
                        `,
                        }}
                      />
                      <div className="mobile-table-wrapper" sty>
                        {/* Fixed Header */}
                        <div className="mobile-table-header">
                          <table>
                            <thead className="bg-[#F7F7F5]">
                              <tr>
                                {filteredHeaders?.map(
                                  ([key, val]) =>
                                    val !== null && (
                                      <th
                                        key={`column${key}`}
                                        className="body-2 text-left py-2 px-1 text-[#AAAAAA] uppercase bg-[#F7F7F5]"
                                        style={{
                                          width: `${100 / filteredHeaders.length}%`,
                                        }}
                                      >
                                        {val?.value}
                                      </th>
                                    ),
                                )}
                              </tr>
                            </thead>
                          </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="mobile-table-body-wrapper">
                          <table>
                            <tbody className="bg-white">
                              {productMeta?.size_chart?.sizes?.map(
                                (row, index) => {
                                  const filteredRowData =
                                    getFilteredRowData(row);
                                  return (
                                    <tr
                                      key={`row_${index}`}
                                      className="cursor-pointer transition-colors"
                                      onClick={() =>
                                        setSelectedMeasurement({
                                          name: row.col_1,
                                          value: row.col_2,
                                        })
                                      }
                                    >
                                      {filteredRowData?.map(
                                        ([key, val], index2) => {
                                          // Find the corresponding header for this column
                                          const headerForColumn =
                                            filteredHeaders.find(
                                              ([hKey]) => hKey === key,
                                            );
                                          return (
                                            <td
                                              key={`cell_${key}`}
                                              className="body-2 py-2 px-1 text-[#171717]"
                                              style={{
                                                width: `${100 / filteredHeaders.length}%`,
                                              }}
                                            >
                                              {headerForColumn?.[1]?.convertable
                                                ? convertMetrics(val)
                                                : val}
                                            </td>
                                          );
                                        },
                                      )}
                                    </tr>
                                  );
                                },
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Section */}
                <div>
                  {/* Still Unsure Link */}
                  <div className="flex justify-center w-full">
                    <div className="py-6 body-2 text-[#171717]">
                      Custom sizes may be available for some products.Please
                      connect with{" "}
                      <FDKLink
                        to="/contact-us"
                        className="body-2 underline text-[#171717] hover:text-[#5C2E20]"
                      >
                        client assistance
                      </FDKLink>{" "}
                      for any queries.
                    </div>
                  </div>

                  {/* Measurement Image */}
                </div>
              </div>
              <div
                className="w-full bg-[#F7F7F5] flex items-center justify-center"
                style={{ maxHeight: "400px" }}
              >
                {sizeGuideImageUrl ? (
                  <img
                    src={sizeGuideImageUrl}
                    alt="Measurement Guide"
                    className="w-full h-auto object-contain max-w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400 py-8">
                    <p className="body-2">No size guide image available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SizeGuide;
