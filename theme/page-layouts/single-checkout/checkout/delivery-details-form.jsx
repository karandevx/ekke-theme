// /**
//  * DeliveryDetailsForm Component
//  *
//  * This component represents a delivery details form for checkout. It includes address selection
//  * and contact information fields.
//  *
//  * Key Features:
//  * - Address selection dropdown at the top
//  * - Add new address button functionality
//  * - Edit address functionality
//  * - Form validation for all required fields
//  * - Responsive design matching Figma specifications
//  *
//  * Props:
//  * @param {object} address - Address hook object containing all address-related functions and data
//  * @param {object} user - User object containing profile information
//  * @param {boolean} isGuestUser - Indicates if the user is a guest user
//  * @param {function} onClose - Callback when form is closed
//  *
//  * Example usage:
//  * <DeliveryDetailsForm
//  *   address={addressHook}
//  *   user={userData}
//  *   isGuestUser={false}
//  *   onClose={handleClose}
//  * />
//  *
//  */

// import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import styles from "./delivery-details-form.less";
// import GoogleMapAddress from "../../../components/google-map/v2/google-map";
// import FormInputSelector from "../../../components/address-form/form-input-selector";
// import FyDropdown from "../../../components/core/fy-dropdown/fy-dropdown-lib";
// import { useGlobalTranslation } from "fdk-core/utils";
// import HomeIcon from "../../../assets/images/home-type.svg";
// import OfficeIcon from "../../../assets/images/office-type.svg";
// import FriendsFamilyIcon from "../../../assets/images/friends-family.svg";
// import OtherIcon from "../../../assets/images/other-type.svg";
// import { isRunningOnClient } from "../../../helper/utils";
// import CloseIcon from "../../../assets/images/close.svg";
// import BackIcon from "../../../assets/images/back.svg";
// import LocationPinIcon from "../../../assets/images/location-pin.svg";
// import FyButton from "../../../components/core/fy-button/fy-button";
// // import styles from "./delivery-details-form.less";

// const defaultFormSchema = [
//     {
//         group: "addressInfo", // Group identifier
//         groupLabel: "Address Information", // Label for the group
//         fields: [
//             {
//                 key: "address",
//                 display: "resource.common.house_flat_number",
//                 type: "text",
//                 required: true,
//                 maxLength: 80,
//                 fullWidth: false,
//                 validation: {
//                     required: "resource.common.house_number_required",
//                     pattern: {
//                         value: /^[A-Za-z0-9,./\s-]+$/,
//                         message: "resource.common.house_no_validation_msg",
//                     },
//                     maxLength: {
//                         value: 80,
//                         message: "resource.common.cannot_exceed_80_characters",
//                     },
//                 },
//             },
//             {
//                 key: "area",
//                 display: "resource.common.building_name_street",
//                 type: "text",
//                 required: true,
//                 maxLength: 80,
//                 fullWidth: false,
//                 validation: {
//                     required: "resource.common.building_name_street_required",
//                     pattern: {
//                         value: /^[A-Za-z0-9,./\s-]+$/,
//                         message: "resource.common.address_validation_msg",
//                     },
//                     maxLength: {
//                         value: 80,
//                         message: "resource.common.cannot_exceed_80_characters",
//                     },
//                 },
//             },
//             {
//                 key: "landmark",
//                 display: "resource.common.locality_landmark",
//                 type: "text",
//                 required: false,
//                 fullWidth: false,
//                 maxLength: 80,
//                 validation: {
//                     pattern: {
//                         value: /^[A-Za-z0-9,./\s-]+$/,
//                         message: "resource.common.address_validation_msg",
//                     },
//                     maxLength: {
//                         value: 80,
//                         message: "resource.common.cannot_exceed_80_characters",
//                     },
//                 },
//             },
//             {
//                 key: "area_code",
//                 display: "resource.common.pincode",
//                 type: "text",
//                 required: true,
//                 maxLength: 6,
//                 fullWidth: false,
//                 validation: {
//                     required: "resource.common.pincode_is_required",
//                     pattern: {
//                         value: /^[1-9][0-9]{5}$/,
//                         message: "resource.common.invalid_pincode",
//                     },
//                     maxLength: {
//                         value: 6,
//                         message: "resource.common.cannot_exceed_6_digits",
//                     },
//                 },
//             },
//             {
//                 key: "city",
//                 display: "resource.common.city",
//                 type: "text",
//                 required: true,
//                 fullWidth: false,
//                 validation: {
//                     required: "resource.common.city_is_required",
//                     pattern: {
//                         value: /^[A-Za-z\s_]+$/,
//                         message: "resource.common.city_can_only_contain_letters",
//                     },
//                     maxLength: {
//                         value: 50,
//                         message: "resource.common.city_cannot_exceed_50_characters",
//                     },
//                 },
//             },
//             {
//                 key: "state",
//                 display: "resource.common.state",
//                 type: "text",
//                 required: true,
//                 fullWidth: false,
//                 validation: {
//                     required: "resource.common.state_is_required",
//                     pattern: {
//                         value: /^[A-Za-z\s_]+$/,
//                         message: "resource.common.state_can_only_contain_letters",
//                     },
//                     maxLength: {
//                         value: 50,
//                         message: "resource.common.state_cannot_exceed_50_characters",
//                     },
//                 },
//             },
//             { key: "country", display: "", type: "hidden", required: false },
//         ],
//     },

//     {
//         group: "contactInfo",
//         groupLabel: "Contact Information", // Label for the group
//         fields: [
//             {
//                 key: "name",
//                 display: "resource.common.full_name",
//                 type: "text",
//                 required: true,
//                 fullWidth: true,
//                 validation: {
//                     required: "resource.common.name_is_required",
//                     pattern: {
//                         value: /^[A-Za-z\s]+$/,
//                         message: "resource.common.name_can_only_contain_letters",
//                     },
//                     maxLength: {
//                         value: 50,
//                         message: "resource.common.name_cannot_exceed_50_characters",
//                     },
//                 },
//             },
//             {
//                 key: "phone",
//                 display: "resource.common.mobile_number",
//                 type: "mobile",
//                 required: true,
//                 fullWidth: false,
//                 validation: {
//                     required: "Mobile number is required",
//                     validate: (value) => {
//                         if (!value) return "Mobile number is required";

//                         // Always expect an object from MobileNumber component
//                         if (typeof value === 'object') {
//                             // Trust the component's validation if available
//                             if (value.isValidNumber === true) return true;

//                             // If no validation flag, validate the mobile number
//                             if (value.mobile) {
//                                 const mobileNumber = value.mobile.toString().replace(/[\s\-+]/g, '');
//                                 if (mobileNumber.length !== 10) return "Mobile number must be 10 digits";
//                                 return /^[6-9]\d{9}$/.test(mobileNumber) || "Invalid mobile number format";
//                             }
//                             return "Invalid mobile number";
//                         }

//                         // Convert any string input to proper format
//                         const mobileNumber = value.toString().replace(/[\s\-+]/g, '');
//                         if (mobileNumber.length !== 10) return "Mobile number must be 10 digits";
//                         return /^[6-9]\d{9}$/.test(mobileNumber) || "Invalid mobile number format";
//                     }
//                 },
//             },
//             {
//                 key: "email",
//                 display: "resource.common.email",
//                 type: "email",
//                 fullWidth: false,
//                 validation: {
//                     pattern: {
//                         value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
//                         message: "resource.common.invalid_email_address",
//                     },
//                     maxLength: {
//                         value: 50,
//                         message: "resource.common.email_cannot_exceed_50_characters",
//                     },
//                 },
//             },
//         ],
//     },
// ];

// const addressTypes = [
//     {
//         label: "resource.common.breadcrumb.home",
//         value: "Home",
//         icon: <HomeIcon className={styles.typeIcon} />,
//     },
//     {
//         label: "resource.common.work",
//         value: "Work",
//         icon: <OfficeIcon className={styles.typeIcon} />,
//     },
//     {
//         label: "resource.common.friends_&_family",
//         value: "Friends & Family",
//         icon: <FriendsFamilyIcon className={styles.typeIcon} />,
//     },
//     {
//         label: "resource.common.other",
//         value: "Other",
//         icon: <OtherIcon className={styles.typeIcon} />,
//     },
//     // Add more address types as needed
// ];

// const DeliveryDetailsForm = ({
//     address,
//     internationalShipping,
//     formSchema = defaultFormSchema,
//     addressItem,
//     mapApiKey = "",
//     isMap = false,
//     isNewAddress = true,
//     onAddAddress = () => { },
//     onUpdateAddress = () => { },
//     onGetLocality = () => { },
//     isGuestUser = false,
//     user = null,
//     customFooter,
//     onClose = () => { },
// }) => {
//     const { t } = useGlobalTranslation("translation");
//     const isOtherAddressType = !["Home", "Work", "Friends & Family"].includes(
//         addressItem?.address_type
//     );

//     const {
//         allAddresses = [],
//         isAddressLoading = false,
//         editAddress,
//         removeAddress,
//         addressLoader,
//         selectAddress,
//         invalidAddressError,
//         selectedAddressId,
//         setSelectedAddressId,
//         getOtherAddress,
//         getDefaultAddress,
//         setOpenModal,
//         openModal,
//         resetAddressState,
//         updateAddress,
//         addAddress,
//         modalTitle,
//         isNewAddress: isNewAddressFromHook,
//         addressItem: addressItemFromHook,
//         showAddNewAddressModal,
//         getLocality,
//         isInternationalShippingEnabled,
//         defaultFormSchema: defaultFormSchemaFromHook,
//         setI18nDetails,
//         handleCountrySearch,
//         getFilteredCountries,
//         selectedCountry,
//         countryDetails,
//     } = address;

//     // State for address selection and form
//     const [selectedAddress, setSelectedAddress] = useState(null);
//     const [showAddressDropdown, setShowAddressDropdown] = useState(false);

//     const {
//         register,
//         handleSubmit,
//         setValue,
//         watch,
//         formState: { errors },
//     } = useForm({
//         defaultValues: {
//             selectedAddress: "",
//             firstName: "",
//             lastName: "",
//             email: "",
//             phone: "",
//         },
//     });
//     const formContainerRef = useRef(null);

//     // Handle initial address selection when addresses are loaded
//     useEffect(() => {
//         if (allAddresses && allAddresses.length > 0 && !selectedAddress) {
//             // Auto-select the first address if available
//             const defaultAddress = allAddresses.find(addr => addr.is_default_address) || allAddresses[0];
//             if (defaultAddress) {
//                 handleAddressSelect(defaultAddress);
//             }
//         }
//     }, [allAddresses, selectedAddress, handleAddressSelect]);

//     const onSubmit = (data) => {
//         const formData = {
//             selectedAddress: selectedAddress,
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//             phone: data.phone,
//         };

//         console.log("Form submitted with data:", formData);
//         // You can add your form submission logic here
//     };

//     // Format address for display
//     const formatAddress = (address) => {
//         if (!address) return "";
//         return `${address.address}, ${address.area}, ${address.city}, ${address.state} ${address.area_code}`;
//     };

//     // Handle address selection from dropdown
//     const handleAddressSelect = useCallback((address) => {
//         setSelectedAddress(address);
//         setShowAddressDropdown(false);

//         // You can add autofill logic here later if needed
//         console.log("Address selected:", address);
//     }, []);

//     // Handle add new address
//     const handleAddNewAddress = () => {
//         showAddNewAddressModal();
//     };

//     // Handle edit address
//     const handleEditAddress = (address) => {
//         editAddress(address);
//     };

//     return (
//         <div className={styles.formWrapper}>
//             <div className={styles.formBody}>
//                 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
//                     {/* Required fields notice */}
//                     <p className={styles.requiredNotice}>
//                         Fields marked with * are required
//                     </p>

//                     {/* Debug test input */}
//                     <div style={{ marginBottom: '10px' }}>
//                         <label>Test Input: </label>
//                         <input
//                             type="text"
//                             placeholder="Test if inputs work"
//                             style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                     </div>

//                     {/* Address Selection Section */}
//                     <div className={styles.addressSelectionSection}>
//                         <label className={styles.formLabel}>
//                             Address <span className={styles.required}>*</span>
//                         </label>
//                         <div className={styles.addressSelectionContainer}>
//                             <div className={styles.addressDropdownContainer}>
//                                 <input
//                                     {...register("selectedAddress", { required: "Please select an address" })}
//                                     type="text"
//                                     placeholder="SELECT ADDRESS"
//                                     readOnly
//                                     onClick={() => setShowAddressDropdown(!showAddressDropdown)}
//                                     className={`${styles.formInput} ${styles.addressInput}`}
//                                     value={selectedAddress ? formatAddress(selectedAddress) : ""}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowAddressDropdown(!showAddressDropdown)}
//                                     className={styles.dropdownButton}
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                     </svg>
//                                 </button>
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={handleAddNewAddress}
//                                 className={styles.addAddressButton}
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                 </svg>
//                             </button>
//                         </div>

//                         {/* Address Dropdown */}
//                         {showAddressDropdown && (
//                             <div className={styles.addressDropdown}>
//                                 {allAddresses && allAddresses.length > 0 ? (
//                                     allAddresses.map((address) => (
//                                         <div
//                                             key={address.id}
//                                             onClick={() => handleAddressSelect(address)}
//                                             className={`${styles.addressOption} ${selectedAddress?.id === address.id ? styles.selectedAddress : ""}`}
//                                         >
//                                             <div className={styles.addressOptionContent}>
//                                                 <p className={styles.addressName}>{address.name}</p>
//                                                 <p className={styles.addressDetails}>{formatAddress(address)}</p>
//                                             </div>
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <div className={styles.noAddressMessage}>
//                                         No addresses found
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {errors.selectedAddress && (
//                             <p className={styles.formError}>{errors.selectedAddress.message}</p>
//                         )}
//                     </div>

//                     {/* Selected Address Display */}
//                     {selectedAddress && (
//                         <div className={styles.selectedAddressDisplay}>
//                             <div className={styles.addressHeader}>
//                                 <h3 className={styles.addressStoreTitle}>
//                                     ADDRESS STORE
//                                 </h3>
//                                 <button
//                                     type="button"
//                                     onClick={() => handleEditAddress(selectedAddress)}
//                                     className={styles.editAddressButton}
//                                 >
//                                     EDIT DETAILS
//                                 </button>
//                             </div>
//                             <div className={styles.newTag}>
//                                 <span className={styles.newTagText}>NEW!</span>
//                             </div>
//                             <div className={styles.addressDetails}>
//                                 <p className={styles.addressLine}>{selectedAddress.address}</p>
//                                 <p className={styles.addressLine}>{selectedAddress.area}</p>
//                                 <p className={styles.addressLine}>
//                                     {selectedAddress.city}, {selectedAddress.state} {selectedAddress.area_code}
//                                 </p>
//                                 <p className={styles.addressLine}>{selectedAddress.country || "Australia"}</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Contact Information Fields */}
//                     <div className={styles.contactInfoSection}>
//                         <div className={styles.formRow}>
//                             <div className={styles.formField}>
//                                 <label className={styles.formLabel}>
//                                     FIRST NAME <span className={styles.required}>*</span>
//                                 </label>
//                                 <input
//                                     {...register("firstName", { required: "First name is required" })}
//                                     type="text"
//                                     placeholder="NAME"
//                                     className={styles.formInput}
//                                 />
//                                 {errors.firstName && (
//                                     <p className={styles.formError}>{errors.firstName.message}</p>
//                                 )}
//                             </div>

//                             <div className={styles.formField}>
//                                 <label className={styles.formLabel}>
//                                     LAST NAME <span className={styles.required}>*</span>
//                                 </label>
//                                 <input
//                                     {...register("lastName", { required: "Last name is required" })}
//                                     type="text"
//                                     placeholder="Sanch"
//                                     className={styles.formInput}
//                                 />
//                                 {errors.lastName && (
//                                     <p className={styles.formError}>{errors.lastName.message}</p>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={styles.formRow}>
//                             <div className={styles.formField}>
//                                 <label className={styles.formLabel}>
//                                     EMAIL ID <span className={styles.required}>*</span>
//                                 </label>
//                                 <input
//                                     {...register("email", {
//                                         required: "Email is required",
//                                         pattern: {
//                                             value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                                             message: "Invalid email address"
//                                         }
//                                     })}
//                                     type="email"
//                                     placeholder="EMAIL ID"
//                                     className={styles.formInput}
//                                     onChange={(e) => console.log("Email input changed:", e.target.value)}
//                                 />
//                                 {errors.email && (
//                                     <p className={styles.formError}>{errors.email.message}</p>
//                                 )}
//                             </div>

//                             <div className={styles.formField}>
//                                 <label className={styles.formLabel}>
//                                     PHONE NUMBER <span className={styles.required}>*</span>
//                                 </label>
//                                 <input
//                                     {...register("phone", {
//                                         required: "Phone number is required",
//                                         pattern: {
//                                             value: /^\+?[1-9]\d{1,14}$/,
//                                             message: "Invalid phone number"
//                                         }
//                                     })}
//                                     type="tel"
//                                     placeholder="PHONE NUMBER"
//                                     className={styles.formInput}
//                                 />
//                                 <p className={styles.phoneNote}>For delivery updates.</p>
//                                 {errors.phone && (
//                                     <p className={styles.formError}>{errors.phone.message}</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className={styles.submitSection}>
//                         <button
//                             type="submit"
//                             className={styles.submitButton}
//                         >
//                             SAVE AND CONTINUE
//                         </button>
//                     </div>
//                 </form>

//             </div>
//         </div>
//     );
// };

// export default DeliveryDetailsForm;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import styles from "./delivery-details-form.less";
import FyInput from "../../../components/core/fy-input/fy-input";
import useCart from "../../cart/useCart";

const DeliveryDetailsForm = ({
  address,
  isGuestUser = false,
  onFormSubmit,
  onAddressSelect,
  getTotalValue,
  showPaymentOptions,
  payment,
  redirectPaymentOptions,
}) => {
  const {
    allAddresses = [],
    isAddressLoading = false,
    editAddress,
    removeAddress,
    addressLoader,
    selectAddress,
    invalidAddressError,
    selectedAddressId,
    setSelectedAddressId,
    getOtherAddress,
    getDefaultAddress,
    setOpenModal,
    openModal,
    resetAddressState,
    updateAddress,
    addAddress,
    modalTitle,
    isNewAddress: isNewAddressFromHook,
    addressItem: addressItemFromHook,
    showAddNewAddressModal,
    getLocality,
    isInternationalShippingEnabled,
    defaultFormSchema: defaultFormSchemaFromHook,
    setI18nDetails,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry,
    countryDetails,
  } = address;

  const fpi = useFPI();
  const userDetails = useGlobalStore(fpi.getters.USER_DATA);
  const { isOutOfStock, isNotServicable, cartItemsWithActualIndex } =
    useCart(fpi);

  // Check if cart is empty
  const isCartEmpty =
    !cartItemsWithActualIndex || cartItemsWithActualIndex.length === 0;

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (allAddresses && allAddresses.length > 0 && !selectedAddress) {
      // Find default address first, then fallback to first address
      const defaultAddress =
        allAddresses.find((addr) => addr.is_default_address) || allAddresses[0];
      if (defaultAddress) {
        handleAddressSelect(defaultAddress);
      }
    }
  }, [allAddresses, selectedAddress]);

  // Update form when selectedAddressId changes
  useEffect(() => {
    if (selectedAddressId && allAddresses.length > 0) {
      const address = allAddresses.find(
        (addr) => addr.id === selectedAddressId
      );
      if (address) {
        setSelectedAddress(address);
        setValue("fullName", address.name || "");
        setValue("email", address.email || "");
        setValue("phone", address.phone || "");
      }
    }
  }, [selectedAddressId, allAddresses, setValue]);

  // Handle address selection - replicates logic from single-address-content.jsx
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressDropdown(false);
    setSelectedAddressId(address.id);

    // Auto-fill form fields with address data
    setValue("fullName", address.name || "");
    setValue("email", address.email || "");
    setValue("phone", address.phone || "");

    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const handleEditAddress = (addressToEdit) => {
    if (editAddress) {
      editAddress(addressToEdit);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAddressDropdown &&
        !event.target.closest(".address-dropdown-container")
      ) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddressDropdown]);

  const onSubmit = (data) => {
    // First, call selectAddress from address hook - same as "deliver to this address" click
    if (selectedAddressId) {
      selectAddress(selectedAddressId);
    }

    // Call the form submit callback - parent will handle showing consent form
    if (onFormSubmit) {
      const formData = {
        ...data,
        selectedAddress: selectedAddress,
      };
      onFormSubmit(formData);
    }

    // Note: Payment logic is now handled in consent form submit
    // Do not navigate directly to payment from here
  };

  return (
    <div className={styles.deliveryDetailsForm}>
      <div className="px-[10px] py-2 pt-1 flex flex-col gap-6">
        <p className="font-archivo font-normal leading-[120%] text-ekke-black pl-3 body-2">
          Fields marked with * are required
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Address Selection */}
          <div className="flex flex-col gap-3 md:w-[51%] w-full">
            <label className="font-archivo font-normal leading-[120%] uppercase body-1 !text-neutral-light">
              ADDRESS *
            </label>
            <div className="address-dropdown-container relative">
              <div className="relative w-full">
                <input
                  placeholder="SELECT ADDRESS"
                  readOnly
                  className={`${styles.formInput} ${styles.addressInput} cursor-pointer font-archivo pl-2 pr-5 pb-2 pt-2`}
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  value={
                    selectedAddress
                      ? `${selectedAddress.address}${selectedAddress.area ? ", " + selectedAddress.area : ""}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.area_code}`
                      : ""
                  }
                  style={{ outline: "none" }}
                />
                <div
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer bg-ekke-white"
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#AAAAAA"
                    strokeWidth="2"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Address Dropdown */}
              {showAddressDropdown && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#AAAAAA] z-30 max-h-60 overflow-y-auto">
                  {allAddresses && allAddresses.length > 0 ? (
                    allAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-3 cursor-pointer hover:bg-[#f7f7f7] border-b border-[#EEEEEE] last:border-b-0 ${selectedAddress?.id === address.id ? "bg-[#f7f7f7]" : ""}`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1">
                            <div className="text-[12px] font-archivo text-ekke-black font-[400] leading-[120%]">
                              {address.name}
                            </div>
                            <div className="text-[11px] text-neutral-light mt-1 font-archivo leading-[120%]">
                              {address.address}
                              {address.area ? ", " + address.area : ""},{" "}
                              {address.city}, {address.state}{" "}
                              {address.area_code}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="ml-2 text-ekke-black hover:text-neutral-light transition-colors"
                            title="Edit Address"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[12px] text-neutral-light font-archivo">
                      No addresses found. Please add address.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Name - Read-only after address selection */}
          <div className="flex flex-col gap-3 md:w-[51%] w-full">
            <label className="font-archivo font-normal leading-[120%] uppercase body-1 !text-neutral-light">
              FULL NAME *
            </label>
            <input
              {...register("fullName", { required: "Full name is required" })}
              placeholder="FULL NAME"
              readOnly={!!selectedAddress}
              className={`${styles.formInput} ${styles.addressInput} font-archivo ${selectedAddress ? "bg-gray-50 cursor-not-allowed" : "cursor-text"}`}
              style={{ outline: "none" }}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-archivo">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email - Read-only after address selection */}
          <div className="flex flex-col gap-3 md:w-[51%] w-full">
            <label className="font-archivo font-normal leading-[120%] uppercase body-1 !text-neutral-light">
              EMAIL ID *
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="EMAIL ID"
              readOnly={!!selectedAddress}
              className={`${styles.formInput} ${styles.addressInput} font-archivo ${selectedAddress ? "bg-gray-50 cursor-not-allowed" : "cursor-text"}`}
              style={{ outline: "none" }}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-archivo">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number - Read-only after address selection */}
          <div className="flex flex-col gap-3 md:w-[51%] w-full">
            <label className="font-archivo font-normal leading-[120%] uppercase body-1 !text-neutral-light">
              PHONE NUMBER *
            </label>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: "Invalid phone number",
                },
              })}
              placeholder="+91"
              readOnly={!!selectedAddress}
              className={`${styles.formInput} ${styles.addressInput} font-archivo ${selectedAddress ? "bg-gray-50 cursor-not-allowed" : "cursor-text"}`}
              style={{ outline: "none" }}
            />
            <p className="font-archivo text-xs text-[#AAAAAA]">
              Delivery updates will be sent to this number.
            </p>
            {errors.phone && (
              <p className="text-xs text-red-500 font-archivo">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Save and Continue Button */}
          <div className="flex justify-start mt-2">
            <button
              type="submit"
              disabled={
                isOutOfStock ||
                isNotServicable ||
                !selectedAddress ||
                isCartEmpty
              }
              className="px-2 py-3 text-left w-full bg-[#EEEEEE] text-ekke-black hover:bg-ekke-black hover:text-white font-archivo uppercase rounded-[1px] text-[11px] font-[400] leading-[120%] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#EEEEEE] disabled:hover:text-ekke-black uppercase"
              // className={`${styles.formInput} ${styles.addressInput} cursor-pointer font-archivo`}
            >
              Save and Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryDetailsForm;
