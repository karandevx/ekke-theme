import React, { useCallback, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import ShipmentUpdateItem from "../components/shipments-update-item/shipments-update-item";
import ReasonsList from "../components/reasons-list/reasons-list";
import ReasonItem from "../components/reasons-list/reason-item";
import styles from "../page-layouts/profile/styles/profile-shipment-update-page.less";
import { useSnackbar } from "../helper/hooks";
import EmptyState from "../components/empty-state/empty-state";
import Loader from "../components/loader/loader";
// import ProfileRoot from "../../components/profile/profile-root";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
import ArrowDropdownIcon from "../assets/images/arrow-dropdown-black.svg";
import CrossContainedIcon from "../assets/images/cross-contained-black.svg";
import OrdersHeader from "../components/order-header/order-header";
import useExchangeDetails from "../page-layouts/orders/useExchangeDetails";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import { useGlobalStore } from "fdk-core/utils";
import {
  START_MEDIA_UPLOAD,
  COMPLETE_MEDIA_UPLOAD,
} from "../queries/shipmentQuery";
import { ADDRESS_LIST } from "../queries/addressQuery";

function ProfileExchangePage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const auth = useGlobalStore(fpi.getters.USER_DATA);
  console.log("authhhhhh", auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId } = useParams();

  const DEFAULT_ERROR_TEXT = t("resource.common.error_message");
  const [updatedQty, setUpdatedQty] = useState("");
  const [selectedBagId, setSelectedBagId] = useState("");
  const [imageList, setImageList] = useState([]);
  const [previewList, setPreviewList] = useState([]);
  const [selectedReason, setSelectedReason] = useState({});
  const [showReasonsAccordion, setShowReasonsAccordion] = useState({ 0: true });
  const [inProgress, setInProgress] = useState(false);
  const [reasonOtherText, setReasonOtherText] = useState("");
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real shipment details using existing hook
  const { shipmentDetails, isLoading: shipmentLoading } =
    useShipmentDetails(fpi);

  // Multi-step state management
  const [currentStep, setCurrentStep] = useState(1);
  const [exchangeState, setExchangeState] = useState({
    reason: null,
    reasonText: "",
    images: [],
    pickupAddress: null,
    deliveryAddress: null,
    selectedProduct: null,
    selectedSize: null,
    selectedPrice: null,
    newSizePrice: null,
    originalPrice: null,
    priceDifference: null,
    originalSize: null, // Store the original item's size to disable it
  });

  // Use exchange hook for API calls
  const {
    isLoading: exchangeLoading,
    exchangeReasons,
    fetchExchangeReasons,
    getExchangeableProducts,
    getProductSizePrice,
    createExchangeCart,
    checkoutExchange,
  } = useExchangeDetails();

  // Additional state for steps 2, 3, 4
  const [addresses, setAddresses] = useState([]);
  const [exchangeableProducts, setExchangeableProducts] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSizePrice, setLoadingSizePrice] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const selected_bag_id = queryParams.get("selectedBagId") || "";

  // Fetch exchange reasons on mount
  useEffect(() => {
    if (shipmentId && selected_bag_id) {
      fetchExchangeReasons(shipmentId, selected_bag_id, 1);
    }
  }, [shipmentId, selected_bag_id]);

  // Update accordion when reasons are fetched
  const [accordianlv1, setAccordianlv1] = useState({
    0: [],
  });

  useEffect(() => {
    if (exchangeReasons && exchangeReasons.length > 0) {
      setAccordianlv1({
        0: exchangeReasons,
      });
    }
  }, [exchangeReasons]);

  const toggelAccordian = (index) => {
    setShowReasonsAccordion({
      ...showReasonsAccordion,
      [index]: !showReasonsAccordion[index],
    });
  };

  const onReasonChange = (reason, index) => {
    setSelectedReason({
      ...selectedReason,
      [index]: reason,
    });
  };

  const onOtherReason = (text, index) => {
    setReasonOtherText(text);
    if (selectedReason[index]) {
      setSelectedReason({
        ...selectedReason,
        [index]: {
          ...selectedReason[index],
          reason_other_text: text,
        },
      });
    }
  };

  const getBag = useMemo(() => {
    if (shipmentDetails) {
      // Try different possible field names for bags
      const bags =
        shipmentDetails?.bags ||
        shipmentDetails?.bag_list ||
        shipmentDetails?.items ||
        (shipmentDetails?.bag ? [shipmentDetails.bag] : null);

      if (!bags || bags.length === 0) {
        // If shipmentDetails itself is the bag, wrap it in array
        if (shipmentDetails.id || shipmentDetails.bag_id) {
          return [
            {
              ...shipmentDetails,
              bag_ids: [selected_bag_id],
            },
          ];
        }
        return [];
      }

      // The selected_bag_id from URL is actually the item.id (product ID), not bag.id
      const filterBag = bags?.filter(
        (bag) =>
          bag.id === Number(selected_bag_id) ||
          bag.bag_id === Number(selected_bag_id) ||
          bag.item?.id === Number(selected_bag_id) || // Match by item.id
          bag.id === selected_bag_id ||
          bag.bag_id === selected_bag_id ||
          bag.item?.id === selected_bag_id // Match by item.id (string)
      );

      if (filterBag && filterBag.length > 0) {
        const finalbag = filterBag.map((item) => {
          return {
            ...item,
            bag_ids: [selected_bag_id],
          };
        });
        return finalbag;
      }

      return [];
    }
    return [];
  }, [shipmentDetails, selected_bag_id]);

  const updatedQuantity = (qty) => {
    setUpdatedQty(qty);
  };

  const onDontExchange = () => {
    navigate(`/profile/orders/shipment/${shipmentId}`);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file, index) => {
      if (
        [
          "image/png",
          "image/jpg",
          "image/jpeg",
          "video/quicktime",
          "video/mp4",
        ].includes(file.type)
      ) {
        const fileId = `${Date.now()}_${index}`;
        const reader = new FileReader();

        reader.onloadend = () => {
          newImages.push({
            id: fileId,
            file: file,
            name: file.name,
            type: file.type,
            size: file.size,
            preview: reader.result,
          });

          newPreviews.push(reader.result);

          if (newImages.length === files.length) {
            setImageList([...imageList, ...newImages]);
            setPreviewList([...previewList, ...newPreviews]);
          }
        };

        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveFile = (fileId) => {
    const newImageList = imageList.filter((file) => file.id !== fileId);
    const fileIndex = imageList.findIndex((file) => file.id === fileId);
    const newPreviewList = previewList.filter(
      (_, index) => index !== fileIndex
    );
    setImageList(newImageList);
    setPreviewList(newPreviewList);
  };

  const showUpdateErrorText = (text) => {
    setInProgress(false);
    window.scrollTo(0, 0);
    if (text) {
      showSnackbar(text.toString(), "error");
    } else {
      showSnackbar(DEFAULT_ERROR_TEXT, "error");
    }
  };

  const onContinue = async () => {
    const reason = selectedReason[0];

    // Validation
    if (
      reason?.display_name === "Others" &&
      reason?.reason_other_text?.length <= 0
    ) {
      return showUpdateErrorText(
        t("resource.profile.write_reason_for_cancellation")
      );
    } else if (!reason) {
      return showUpdateErrorText(t("resource.profile.select_one_reason_below"));
    }

    // File upload validation (optional - images only)
    if (imageList.length > 0) {
      // Check max 4 images
      if (imageList.length > 4) {
        return showUpdateErrorText(
          t("resource.profile.max_4_images_allowed_upload")
        );
      }

      // Check file size (max 5MB per image)
      const filesizecheck = imageList.every((item) => item.size / 1000 < 5000);
      if (!filesizecheck) {
        return showUpdateErrorText(t("resource.profile.image_size_max_5mb"));
      }

      // Check file type (only PNG, JPG, JPEG)
      const filetype = imageList.every((item) =>
        ["image/png", "image/jpg", "image/jpeg"].includes(item.type)
      );
      if (!filetype) {
        return showUpdateErrorText(
          "Only PNG, JPG, and JPEG image formats are allowed"
        );
      }
    }

    setInProgress(true);

    // Upload files to CDN if any
    let cdnUrls = [];
    if (imageList.length > 0) {
      try {
        // Start upload for all files
        const startUploadResponse = await Promise.all(
          imageList.map((item) => {
            return fpi.executeGQL(START_MEDIA_UPLOAD, {
              startUploadReqInput: {
                file_name: item.name,
                content_type: item.type,
                size: item.size,
              },
              namespace: "misc",
            });
          })
        );

        // Upload files to CDN
        await Promise.all(
          startUploadResponse.map((mediaObj, index) => {
            const item = mediaObj.data?.startUpload || {};

            return fetch(item.upload?.url, {
              method: item.method,
              body: imageList[index].file,
              headers: {
                "Content-Type": item.content_type,
              },
            });
          })
        );

        // Complete upload and get CDN URLs
        const completeUploadResponse = await Promise.all(
          startUploadResponse.map((mediaObj) => {
            const item = mediaObj.data?.startUpload || {};

            return fpi.executeGQL(COMPLETE_MEDIA_UPLOAD, {
              completeUploadReqInput: {
                file_name: item.file_name,
                file_path: item.file_path,
                content_type: item.content_type,
                method: item.method,
                namespace: item.namespace,
                operation: item.operation,
                size: item.size,
                upload: item.upload,
              },
              namespace: "misc",
            });
          })
        );

        cdnUrls = completeUploadResponse
          .map((item) => {
            return item.data?.completeUpload?.cdn?.url;
          })
          .filter(Boolean);
      } catch (uploadError) {
        setInProgress(false);
        return showUpdateErrorText("Failed to upload files. Please try again.");
      }
    }

    // Initiate exchange with API
    const exchangeData = {
      shipment_id: shipmentId,
      bag_id: selected_bag_id,
      reason_id: reason.id,
      reason_text: reason.reason_other_text || "",
      images: cdnUrls,
    };

    // Save to state and move to next step
    setExchangeState({
      ...exchangeState,
      reason: reason,
      reasonText: reason.reason_other_text || "",
      images: cdnUrls,
    });

    showSnackbar("Reason saved. Please select pickup address.", "success");
    setInProgress(false);
    setCurrentStep(2);

    // Fetch addresses for step 2
    fetchAddressesForStep2();
  };

  // Fetch addresses for Step 2 using GraphQL
  const fetchAddressesForStep2 = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fpi.executeGQL(ADDRESS_LIST, {});

      if (response?.data?.addresses?.address) {
        const addressList = response.data.addresses.address;
        setAddresses(Array.isArray(addressList) ? addressList : []);

        // Auto-select default address or first address for both pickup and delivery
        if (addressList.length > 0) {
          const defaultAddress =
            addressList.find((addr) => addr.is_default_address) ||
            addressList[0];
          setExchangeState((prev) => ({
            ...prev,
            pickupAddress: defaultAddress,
            deliveryAddress: defaultAddress,
          }));
        }
      } else {
        showSnackbar("Failed to fetch addresses", "error");
        setAddresses([]);
      }
    } catch (error) {
      showSnackbar("Error fetching addresses", "error");
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Handle Step 2: Address Selection
  const onContinueStep2 = () => {
    if (!exchangeState.pickupAddress) {
      return showSnackbar("Please select a pickup address", "error");
    }
    if (!exchangeState.deliveryAddress) {
      return showSnackbar("Please select a delivery address", "error");
    }
    setCurrentStep(3);
    fetchProductsForStep3();
  };

  // Fetch exchangeable products for Step 3
  const fetchProductsForStep3 = async () => {
    setLoadingProducts(true);
    try {
      const currentBag = getBag?.[0];

      if (!currentBag) {
        showSnackbar("Product details not found. Please try again.", "error");
        setLoadingProducts(false);
        return;
      }

      // Extract product details from the bag
      const itemSlug =
        currentBag.item?.slug_key ||
        currentBag.item?.slug ||
        currentBag.article?.slug;
      const itemSize = currentBag.item?.size || currentBag.article?.size;
      const itemPrice =
        currentBag.prices?.price_effective ||
        currentBag.price?.effective ||
        currentBag.financial_breakup?.[0]?.price_effective;

      // Store the original size to disable it in selection
      setExchangeState((prev) => ({
        ...prev,
        originalSize: itemSize,
        originalPrice: itemPrice,
      }));

      if (!itemSlug) {
        showSnackbar("Product slug not found. Cannot fetch sizes.", "error");
        setLoadingProducts(false);
        return;
      }

      const response = await getExchangeableProducts({
        item_slug: itemSlug,
        item_size: itemSize,
        price: itemPrice,
      });

      if (response.ok && response.data) {
        // Extract sizes from the API response structure
        // API returns: { variants: [{ sizeDetails: { sizes: [...] } }] }
        let sizes = [];

        if (response.data.variants && response.data.variants.length > 0) {
          const variant = response.data.variants[0];
          if (variant.sizeDetails && variant.sizeDetails.sizes) {
            // Filter only exchangeable sizes with quantity > 0
            sizes = variant.sizeDetails.sizes.filter(
              (size) =>
                size.can_exchange && size.is_available && size.quantity > 0
            );
          }
        }

        setAvailableSizes(sizes);
        setExchangeableProducts(response.data.variants || []);

        if (sizes.length === 0) {
          showSnackbar("No sizes available for exchange", "error");
        }
      } else {
        showSnackbar(
          response.message || "Failed to fetch exchange products",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Error fetching products", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle size selection and fetch price
  const onSizeSelect = async (size) => {
    setLoadingSizePrice(true);
    try {
      const currentBag = getBag?.[0];
      const itemSlug =
        currentBag.item?.slug_key ||
        currentBag.item?.slug ||
        currentBag.article?.slug;
      const deliveryPincode =
        exchangeState.deliveryAddress?.area_code || "400101";
      const originalPrice =
        currentBag.prices?.price_effective ||
        currentBag.price?.effective ||
        currentBag.financial_breakup?.[0]?.price_effective;

      const priceResponse = await getProductSizePrice({
        slug: itemSlug,
        size: size,
        pincode: deliveryPincode,
      });

      if (priceResponse.ok && priceResponse.data) {
        const newPrice =
          priceResponse.data.price?.effective ||
          priceResponse.data.price_per_piece?.effective;
        const priceDiff = newPrice - originalPrice;

        setExchangeState((prev) => ({
          ...prev,
          selectedSize: size,
          newSizePrice: newPrice,
          originalPrice: originalPrice,
          priceDifference: priceDiff,
        }));

        showSnackbar(
          priceDiff > 0
            ? `You need to pay ₹${priceDiff} more for this size`
            : priceDiff < 0
              ? `You will get ₹${Math.abs(priceDiff)} refund for this size`
              : "No price difference for this size",
          "success"
        );
      } else {
        showSnackbar(
          priceResponse.message || "Failed to fetch size price",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Error fetching size price", "error");
    } finally {
      setLoadingSizePrice(false);
    }
  };

  // Handle Step 3: Product/Size Selection
  const onContinueStep3 = () => {
    if (!exchangeState.selectedSize) {
      return showSnackbar("Please select a size", "error");
    }
    if (exchangeState.newSizePrice === null) {
      return showSnackbar("Please wait for price to load", "error");
    }
    setCurrentStep(4);
  };

  // Handle Step 4: Final Confirmation & Checkout
  const onConfirmExchange = async () => {
    setInProgress(true);
    try {
      // CRITICAL DEBUG: Log current user info from FPI
      // console.log("=== EXCHANGE CHECKOUT START ===");
      // console.log("Current User from FPI:", {
      //   user_id: auth?.user_id,
      //   uid: auth?.uid,
      //   _id: auth?._id,
      //   full_auth: auth,
      // });
      // console.log("All Cookies:", document.cookie);
      // console.log("================================");

      // Get the original bag/product details
      const currentBag = getBag?.[0];

      console.log("bagggggggg", currentBag);

      if (!currentBag) {
        throw new Error("Product details not found");
      }

      const productId = currentBag.item?.id; // This is the article/product ID for new_product
      const storeId = shipmentDetails?.fulfilling_store?.id; // Store ID from shipment level
      const bagId = currentBag.id; // This is the actual bag ID for cart creation
      const sellerIdentifier = currentBag.seller_identifier; // Seller identifier/SKU for checkout

      if (!productId) {
        throw new Error(
          "Product ID not found in shipment details. Please contact support."
        );
      }

      if (!sellerIdentifier) {
        throw new Error(
          "Seller identifier not found in shipment details. Please contact support."
        );
      }

      // Step 1: Create cart with actual product data
      const cartPayload = {
        new_product: {
          id: productId,
          size: exchangeState.selectedSize,
          store_id: storeId,
        },
        original_product: {
          shipment_id: shipmentId,
          bag_id: bagId, // Use actual bag ID (48371136), not item ID (17228589)
          line_number: 1,
        },
      };

      const cartResponse = await createExchangeCart({
        ...cartPayload,
        user_id: auth?.user_id || auth?._id,
      });

      console.log("carttttttt", cartResponse);

      if (!cartResponse.ok || !cartResponse.data?.cart_id) {
        throw new Error("Failed to create exchange cart");
      }

      // Build reason object matching exact API docs structure
      const checkoutPayload = {
        exchange_reason: {
          reason: {
            id: exchangeState.reason.id,
            meta: exchangeState.reason.meta || {
              show_text_area: false,
              remark_required: false,
            },
            // slug: exchangeState.reason.slug,
            // state: exchangeState.reason.state,
            qc_type: exchangeState.reason.qc_type || [],
            qc_enabled: true,
            show_text_area: exchangeState.reason.meta?.show_text_area || true,
            remark_required: exchangeState.reason.meta?.remark_required || true,
            reasons: exchangeState.reason.reasons,
            category: exchangeState.reason.category,
            is_active: exchangeState.reason.is_active,
            // created_ts: null,
            // updated_ts: null,
            display_name: exchangeState.reason.display_name,
            question_set: [],
            application_id: null,
          },
          medias: exchangeState.images,
        },
        return_order: {
          product: {
            identifier: sellerIdentifier,
            line_number: 1,
          },
          address_id: exchangeState.pickupAddress.id,
          original_delivery_address_id: exchangeState.deliveryAddress.id,
          shipment: shipmentId,
        },
        forward_order: {
          address_id: exchangeState.deliveryAddress.id,
          cart_id: cartResponse?.data?.id || String(cartResponse.data.cart_id),
        },
      };

      console.log(
        "Checkout payload:",
        JSON.stringify(checkoutPayload, null, 2)
      );

      const checkoutResponse = await checkoutExchange({
        ...checkoutPayload,
        user_id: auth?.user_id || auth?._id,
      });
      console.log("Checkout response:", checkoutResponse);

      if (checkoutResponse.ok) {
        showSnackbar("Exchange completed successfully!", "success");
        setTimeout(() => {
          navigate("/profile/orders");
        }, 2000);
      } else {
        throw new Error(checkoutResponse.message || "Checkout failed");
      }
    } catch (error) {
      showSnackbar(error.message || "Failed to complete exchange", "error");
    } finally {
      setInProgress(false);
    }
  };

  const buttondisable = !selectedReason[0] || inProgress || exchangeLoading;

  return (
    <>
      {isLoading || exchangeLoading || shipmentLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col w-full h-full bg-white md:px-0 px-[10px] md:py-0 py-3">
          <div className="flex flex-col w-full overflow-auto">
            {!shipmentDetails && (
              <div className={`${styles.error} ${styles.shipment}`}>
                <EmptyState></EmptyState>
              </div>
            )}
            {shipmentDetails && (
              <div className="rounded">
                {shipmentDetails && (
                  <div className="px-4 md:px-0">
                    <OrdersHeader
                      flag={true}
                      title={`Exchange Request - Step ${currentStep} of 4`}
                      customClassName={styles.headerWidth}
                    ></OrdersHeader>

                    {/* Step Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 my-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              step < currentStep
                                ? "bg-green-500 text-white"
                                : step === currentStep
                                  ? "bg-black text-white"
                                  : "bg-gray-300 text-gray-600"
                            }`}
                          >
                            {step < currentStep ? "✓" : step}
                          </div>
                          {step < 4 && (
                            <div
                              className={`w-12 h-1 ${
                                step < currentStep
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between text-xs text-center mb-6">
                      <div className="flex-1">Select Reason</div>
                      <div className="flex-1">Pickup Address</div>
                      <div className="flex-1">Select Product</div>
                      <div className="flex-1">Confirm</div>
                    </div>
                  </div>
                )}
                {/* Show product info on all steps */}
                {getBag?.map((item, index) => (
                  <ShipmentUpdateItem
                    key={`shipment_item${index}`}
                    selectedBagId={selected_bag_id}
                    updatedQuantity={(e) => updatedQuantity(e)}
                    item={item}
                  ></ShipmentUpdateItem>
                ))}

                {/* STEP 1: Reason Selection */}
                {currentStep === 1 && (
                  <>
                    <div>
                      {Object.values(accordianlv1).map((item, i) => (
                        <div
                          className="border-b border-[#EEEEEE] pt-4 px-4 md:px-0"
                          key={i}
                        >
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => {
                              if (item?.length > 1) toggelAccordian(i);
                            }}
                          >
                            <div className="flex-1">
                              <p className="subheading-3 text-ekke-black">
                                Reason for exchange request
                              </p>
                            </div>
                            {item?.length > 1 && (
                              <ArrowDropdownIcon
                                className={`transition-transform duration-300 ${showReasonsAccordion[i] ? "rotate-180" : ""}`}
                              />
                            )}
                          </div>
                          {showReasonsAccordion[i] && (
                            <div className="mt-4">
                              <ReasonsList
                                reasons={item}
                                change={(e) => onReasonChange(e, i)}
                                selectedReason={selectedReason[i]}
                                otherReason={(e) => onOtherReason(e, i)}
                              ></ReasonsList>
                            </div>
                          )}
                          {selectedReason[i]?.id &&
                            !showReasonsAccordion[i] && (
                              <div className="mt-4">
                                <ReasonItem
                                  reason={selectedReason[i]}
                                  selectedReason={selectedReason[i]}
                                  otherReason={(e) => onOtherReason(e, i)}
                                ></ReasonItem>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    {/* File Upload Section */}
                    <div className="border-t border-[#EEEEEE] my-4"></div>
                    <div className={`${styles.cancelimg} px-4 md:px-0`}>
                      <p className="subheading-3 text-ekke-black">
                        {t("resource.profile.add_product_images")}
                      </p>
                      <div className={styles.addPhoto}>
                        <label className={styles.addImg} htmlFor="my-file">
                          Upload Images
                          <input
                            type="file"
                            accept="image/png, image/jpg, image/jpeg"
                            multiple="multiple"
                            onChange={handleFileUpload}
                            className={`${styles.formControlFile}`}
                            id="my-file"
                          />
                        </label>

                        <ul className={styles.fileList}>
                          {imageList.map((file) => (
                            <li key={file.id} className={styles.fileItem}>
                              <img
                                className={styles.uploadedImage}
                                src={file.preview}
                                alt={file.name}
                              />
                              <span
                                className={styles.cancel}
                                onClick={() => handleRemoveFile(file.id)}
                              >
                                <CrossContainedIcon />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.makesure}>
                        {t("resource.profile.ensure_product_tag_visible")}
                      </div>
                      <div className={styles.accept}>
                        {t("resource.profile.accepted_image_formats_and_size")}
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6 px-4 md:px-0 pb-4">
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full transition-colors"
                        onClick={onDontExchange}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          border: "1px solid #000000",
                          cursor: "pointer",
                          borderRadius: "1px",
                        }}
                      >
                        {t("resource.common.dont")} Exchange
                      </button>
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full transition-colors"
                        disabled={buttondisable}
                        onClick={() => onContinue()}
                        style={{
                          backgroundColor: buttondisable
                            ? "#EEEEEE"
                            : "#000000",
                          color: buttondisable ? "#AAAAAA" : "#F7F7F5",
                          cursor: buttondisable ? "not-allowed" : "pointer",
                          border: "1px solid #000000",
                          borderRadius: "1px",
                        }}
                      >
                        {t("resource.common.continue")}
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2: Address Selection */}
                {currentStep === 2 && (
                  <div className="px-4 md:px-0">
                    <div className="border-b border-[#EEEEEE] pt-4 pb-4">
                      <p className="subheading-3 text-ekke-black mb-4">
                        Select Pickup Address
                      </p>
                      {loadingAddresses ? (
                        <div className="text-center py-4">
                          Loading addresses...
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-4">
                          No addresses found. Please add an address.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() =>
                                setExchangeState({
                                  ...exchangeState,
                                  pickupAddress: addr,
                                })
                              }
                              className={`p-4 border rounded cursor-pointer transition-colors ${
                                exchangeState.pickupAddress?.id === addr.id
                                  ? "border-black bg-gray-50"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <div className="subheading-3">{addr.name}</div>
                              <div className="body-1">
                                {addr.address}, {addr.city}, {addr.state} -{" "}
                                {addr.pincode}
                              </div>
                              <div className="body-1">{addr.phone}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#EEEEEE] pt-4 pb-4">
                      <p className="subheading-3 text-ekke-black mb-4">
                        Select Delivery Address
                      </p>
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() =>
                              setExchangeState({
                                ...exchangeState,
                                deliveryAddress: addr,
                              })
                            }
                            className={`p-4 border rounded cursor-pointer transition-colors ${
                              exchangeState.deliveryAddress?.id === addr.id
                                ? "border-black bg-gray-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="subheading-3">{addr.name}</div>
                            <div className="body-1">
                              {addr.address}, {addr.city}, {addr.state} -{" "}
                              {addr.pincode}
                            </div>
                            <div className="body-1">{addr.phone}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6 pb-4">
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        onClick={() => setCurrentStep(1)}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          border: "1px solid #000000",
                          cursor: "pointer",
                          borderRadius: "1px",
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        disabled={
                          !exchangeState.pickupAddress ||
                          !exchangeState.deliveryAddress
                        }
                        onClick={onContinueStep2}
                        style={{
                          backgroundColor:
                            !exchangeState.pickupAddress ||
                            !exchangeState.deliveryAddress
                              ? "#EEEEEE"
                              : "#000000",
                          color:
                            !exchangeState.pickupAddress ||
                            !exchangeState.deliveryAddress
                              ? "#AAAAAA"
                              : "#F7F7F5",
                          cursor:
                            !exchangeState.pickupAddress ||
                            !exchangeState.deliveryAddress
                              ? "not-allowed"
                              : "pointer",
                          border: "1px solid #000000",
                          borderRadius: "1px",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Product/Size Selection */}
                {currentStep === 3 && (
                  <div className="px-4 md:px-0">
                    <div className="border-b border-[#EEEEEE] pt-4 pb-4">
                      <p className="subheading-3 text-ekke-black mb-6">
                        Select Exchange Product
                      </p>

                      {/* Side by Side Product Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {/* Returning Item */}
                        <div className="border border-[#EEEEEE] p-4">
                          <p className="subheading-5 text-ekke-black mb-3">
                            Returning Item
                          </p>
                          <div className="flex gap-[11px] items-start">
                            <div className="flex flex-col items-start gap-2 relative">
                              <div className="w-[65px] relative">
                                <img
                                  className="relative w-full max-h-[74px] object-cover"
                                  alt="Product"
                                  src={
                                    getBag?.[0]?.item?.image?.[0] ||
                                    "/product.svg"
                                  }
                                />
                                <span className="body-3 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                                  01
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <p className="body-1">
                                {getBag?.[0]?.item?.slug ||
                                  getBag?.[0]?.item?.seller_identifier ||
                                  "SKU"}
                              </p>
                              <p className="body-3 text-neutral-light">
                                {getBag?.[0]?.item?.name ||
                                  getBag?.[0]?.item?.brand}
                              </p>
                              <div className="inline-flex items-center gap-2 relative">
                                <span className="body-3 text-[#171717]">
                                  ₹
                                  {exchangeState.originalPrice ||
                                    getBag?.[0]?.prices?.price_effective ||
                                    getBag?.[0]?.price?.effective}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Exchange To Item */}
                        <div className="border border-[#EEEEEE] p-4">
                          <p className="subheading-5 text-ekke-black mb-3">
                            Exchange To
                          </p>
                          <div className="flex gap-[11px] items-start">
                            <div className="flex flex-col items-start gap-2 relative">
                              <div className="w-[65px] relative">
                                <img
                                  className="relative w-full max-h-[74px] object-cover"
                                  alt="Product"
                                  src={
                                    getBag?.[0]?.item?.image?.[0] ||
                                    "/product.svg"
                                  }
                                />
                                <span className="body-3 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                                  01
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <p className="body-1">
                                {getBag?.[0]?.item?.slug ||
                                  getBag?.[0]?.item?.seller_identifier ||
                                  "SKU"}
                              </p>
                              <p className="body-3 text-neutral-light">
                                {getBag?.[0]?.item?.name ||
                                  getBag?.[0]?.item?.brand}
                              </p>
                              <div className="inline-flex items-center gap-2 relative">
                                {exchangeState.newSizePrice !== null ? (
                                  <span className="body-3 text-[#171717]">
                                    ₹{exchangeState.newSizePrice}
                                  </span>
                                ) : (
                                  <span className="body-3 text-neutral-light">
                                    Select size
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="subheading-5 text-ekke-black mb-3">
                        Select a size for the same product:
                      </p>

                      {loadingProducts ? (
                        <div className="text-center py-4 body-2">
                          Loading sizes...
                        </div>
                      ) : availableSizes.length === 0 ? (
                        <div className="text-center py-4 body-2 text-ekke-gray">
                          No sizes available for exchange
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          {availableSizes.map((sizeObj) => {
                            // Handle both string and object formats
                            const sizeValue =
                              typeof sizeObj === "string"
                                ? sizeObj
                                : sizeObj.value ||
                                  sizeObj.display ||
                                  sizeObj.size;
                            const sizeDisplay =
                              typeof sizeObj === "string"
                                ? sizeObj
                                : sizeObj.display ||
                                  sizeObj.value ||
                                  sizeObj.size;

                            // Check if this is the original size (should be disabled)
                            const isOriginalSize =
                              sizeValue === exchangeState.originalSize;
                            const isSelected =
                              exchangeState.selectedSize === sizeValue;

                            return (
                              <button
                                key={sizeValue}
                                onClick={() =>
                                  !isOriginalSize && onSizeSelect(sizeValue)
                                }
                                disabled={loadingSizePrice || isOriginalSize}
                                className={`py-3 px-4 border text-center body-1 transition-colors ${
                                  isOriginalSize
                                    ? "border-[#EEEEEE] bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed"
                                    : isSelected
                                      ? "border-ekke-black bg-ekke-black !text-white"
                                      : "border-[#EEEEEE] !text-ekke-black hover:border-ekke-black"
                                } ${loadingSizePrice && !isOriginalSize ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {sizeDisplay}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Price Information Display */}
                      {exchangeState.selectedSize &&
                        exchangeState.newSizePrice !== null && (
                          <div className="mt-6 p-4 border border-[#EEEEEE]">
                            <p className="subheading-5 text-ekke-black mb-3">
                              Price Summary
                            </p>
                            <div className="space-y-2">
                              <div className="ekke-flex-between">
                                <span className="body-2 text-ekke-gray">
                                  Original Price:
                                </span>
                                <span className="body-2 text-ekke-black">
                                  ₹{exchangeState.originalPrice}
                                </span>
                              </div>
                              <div className="ekke-flex-between">
                                <span className="body-2 text-ekke-gray">
                                  New Size ({exchangeState.selectedSize}) Price:
                                </span>
                                <span className="body-2 text-ekke-black">
                                  ₹{exchangeState.newSizePrice}
                                </span>
                              </div>
                              <div className="ekke-flex-between pt-2 border-t border-[#EEEEEE] mt-2">
                                <span className="body-1 text-ekke-black">
                                  {exchangeState.priceDifference > 0
                                    ? "Amount to Pay:"
                                    : exchangeState.priceDifference < 0
                                      ? "Refund Amount:"
                                      : "Price Difference:"}
                                </span>
                                <span className="body-1 text-ekke-black">
                                  ₹{Math.abs(exchangeState.priceDifference)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 mt-6 pb-4">
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        onClick={() => setCurrentStep(2)}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          border: "1px solid #000000",
                          cursor: "pointer",
                          borderRadius: "1px",
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        disabled={!exchangeState.selectedSize}
                        onClick={onContinueStep3}
                        style={{
                          backgroundColor: !exchangeState.selectedSize
                            ? "#EEEEEE"
                            : "#000000",
                          color: !exchangeState.selectedSize
                            ? "#AAAAAA"
                            : "#F7F7F5",
                          cursor: !exchangeState.selectedSize
                            ? "not-allowed"
                            : "pointer",
                          border: "1px solid #000000",
                          borderRadius: "1px",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="px-4 md:px-0">
                    <div className="border-b border-[#EEEEEE] pt-4 pb-4">
                      <p className="subheading-3 text-ekke-black mb-6">
                        Confirm Exchange
                      </p>

                      {/* Exchange Summary - Side by Side */}
                      <div className="mb-6">
                        <p className="subheading-5 text-ekke-black mb-4">
                          Exchange Summary
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Returning Item */}
                          <div className="border border-[#EEEEEE] p-4">
                            <p className="subheading-5 text-ekke-black mb-3">
                              Returning
                            </p>
                            <div className="flex gap-[11px] items-start">
                              <div className="flex flex-col items-start gap-2 relative">
                                <div className="w-[65px] relative">
                                  <img
                                    className="relative w-full max-h-[74px] object-cover"
                                    alt="Product"
                                    src={
                                      getBag?.[0]?.item?.image?.[0] ||
                                      "/product.svg"
                                    }
                                  />
                                  <span className="body-3 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                                    01
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <p className="body-1">
                                  {getBag?.[0]?.item?.slug ||
                                    getBag?.[0]?.item?.seller_identifier ||
                                    "SKU"}
                                </p>
                                <p className="body-3 text-neutral-light">
                                  {getBag?.[0]?.item?.name ||
                                    getBag?.[0]?.item?.brand}
                                </p>
                                <div className="inline-flex items-center gap-2 relative">
                                  <span className="body-3 text-[#171717]">
                                    ₹{exchangeState.originalPrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Exchange To Item */}
                          <div className="border border-[#EEEEEE] p-4">
                            <p className="subheading-5 text-ekke-black mb-3">
                              Receiving
                            </p>
                            <div className="flex gap-[11px] items-start">
                              <div className="flex flex-col items-start gap-2 relative">
                                <div className="w-[65px] relative">
                                  <img
                                    className="relative w-full max-h-[74px] object-cover"
                                    alt="Product"
                                    src={
                                      getBag?.[0]?.item?.image?.[0] ||
                                      "/product.svg"
                                    }
                                  />
                                  <span className="body-3 text-neutral-light absolute top-0 left-0 min-w-[30px] min-h-[24px] flex items-center justify-center bg-white text-[11px]">
                                    01
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <p className="body-1">
                                  {getBag?.[0]?.item?.slug ||
                                    getBag?.[0]?.item?.seller_identifier ||
                                    "SKU"}
                                </p>
                                <p className="body-3 text-neutral-light">
                                  {getBag?.[0]?.item?.name ||
                                    getBag?.[0]?.item?.brand}
                                </p>
                                <div className="inline-flex items-center gap-2 relative">
                                  <span className="body-3 text-[#171717]">
                                    ₹{exchangeState.newSizePrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="subheading-5 text-ekke-black">
                            Exchange Reason:
                          </p>
                          <p className="body-2 text-ekke-gray">
                            {exchangeState.reason?.display_name}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="subheading-5 text-ekke-black">
                              Pickup Address:
                            </p>
                            <p className="body-2 text-ekke-gray">
                              {exchangeState.pickupAddress?.name}
                            </p>
                            <p className="body-4 text-ekke-gray">
                              {exchangeState.pickupAddress?.address},{" "}
                              {exchangeState.pickupAddress?.city},{" "}
                              {exchangeState.pickupAddress?.area_code}
                            </p>
                          </div>

                          <div>
                            <p className="subheading-5 text-ekke-black">
                              Delivery Address:
                            </p>
                            <p className="body-2 text-ekke-gray">
                              {exchangeState.deliveryAddress?.name}
                            </p>
                            <p className="body-4 text-ekke-gray">
                              {exchangeState.deliveryAddress?.address},{" "}
                              {exchangeState.deliveryAddress?.city},{" "}
                              {exchangeState.deliveryAddress?.area_code}
                            </p>
                          </div>
                        </div>

                        {/* Price Breakdown in Confirmation */}
                        {exchangeState.newSizePrice !== null && (
                          <div className="mt-6 p-4 border border-[#EEEEEE]">
                            <p className="subheading-5 text-ekke-black mb-4">
                              Payment Summary
                            </p>
                            <div>
                              <div className="ekke-flex-between">
                                <span className="body-2 text-ekke-gray">
                                  Original Product Price:
                                </span>
                                <span className="body-2 text-ekke-black">
                                  ₹{exchangeState.originalPrice}
                                </span>
                              </div>
                              <div className="ekke-flex-between">
                                <span className="body-2 text-ekke-gray">
                                  New Size ({exchangeState.selectedSize}) Price:
                                </span>
                                <span className="body-2 text-ekke-black">
                                  ₹{exchangeState.newSizePrice}
                                </span>
                              </div>
                              <div className="ekke-flex-between">
                                <span className="body-2 text-ekke-gray">
                                  Previously Paid (Adjusted):
                                </span>
                                <span className="body-2 text-ekke-gray">
                                  -₹{exchangeState.originalPrice}
                                </span>
                              </div>
                              <div className="ekke-flex-between pt-2 border-t border-[#EEEEEE]">
                                <span className="body-1 text-ekke-black">
                                  {exchangeState.priceDifference > 0
                                    ? "Amount to Pay:"
                                    : exchangeState.priceDifference < 0
                                      ? "Refund Amount:"
                                      : "Total Amount:"}
                                </span>
                                <span className="body-1 text-ekke-black">
                                  ₹{Math.abs(exchangeState.priceDifference)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6 pb-4">
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        onClick={() => setCurrentStep(3)}
                        disabled={inProgress}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          border: "1px solid #000000",
                          cursor: inProgress ? "not-allowed" : "pointer",
                          borderRadius: "1px",
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="body-1 text-center py-4 px-4 w-full"
                        disabled={inProgress}
                        onClick={onConfirmExchange}
                        style={{
                          backgroundColor: inProgress ? "#EEEEEE" : "#000000",
                          color: inProgress ? "#AAAAAA" : "#F7F7F5",
                          cursor: inProgress ? "not-allowed" : "pointer",
                          border: "1px solid #000000",
                          borderRadius: "1px",
                        }}
                      >
                        {inProgress ? "Processing..." : "Confirm Exchange"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileExchangePage;
