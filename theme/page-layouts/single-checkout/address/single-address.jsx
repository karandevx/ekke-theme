import React from "react";
import AddressForm from "../../../components/address-form/address-form";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import SingleAddressContent from "./single-address-content";
import SinglesAddressHeader from "./single-address-header";
import styles from "./single-address-header.less";
import { useTranslation } from "react-i18next";

function SingleAddress({
  address,
  showPayment,
  showShipment,
  setShowPayment,
  setShowShipment,
  mapApiKey,
  showGoogleMap,
  loader,
  isGuestUser = false,
}) {
  const { t } = useTranslation();
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
    isNewAddress,
    addressItem,
    showAddNewAddressModal,
    getLocality,
    isInternationalShippingEnabled,
    defaultFormSchema,
    setI18nDetails,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry,
    countryDetails,
  } = address;

  function backToEdit() {
    setShowPayment(false);
    setShowShipment(false);
  }

  return (
    <>
      <div
        className={`${styles.addressContainerLeft} ${showPayment ? styles.hideAddress : ""}`}
      >
        <SinglesAddressHeader
          allAddresses={allAddresses}
          showAddNewAddressModal={showAddNewAddressModal}
          showPayment={showPayment}
          showShipment={showShipment}
          backToEdit={backToEdit}
        ></SinglesAddressHeader>
        <Modal
          title={modalTitle}
          isOpen={openModal}
          closeDialog={resetAddressState}
          modalType="center-modal"
          hideHeader={true}
          containerClassName={styles.addressModalContainer}
          // containerClassName={styles.addressModalContainer}
          // bodyClassName={styles.addressModalBody}
        >
          <div className={styles.addressWrapper}>
            <div className="flex mb-7">
              <span className="body-1 font-archivo text-[11px] text-ekke-black leading-[120%] tracking-[0%] uppercase">
                {t("resource.common.address.add_new_address")}
              </span>
            </div>
            <AddressForm
              internationalShipping={isInternationalShippingEnabled}
              formSchema={defaultFormSchema}
              isNewAddress={isNewAddress}
              addressItem={addressItem}
              onUpdateAddress={updateAddress}
              onAddAddress={addAddress}
              mapApiKey={mapApiKey}
              showGoogleMap={showGoogleMap}
              openModal={openModal}
              onGetLocality={getLocality}
              setI18nDetails={setI18nDetails}
              handleCountrySearch={handleCountrySearch}
              getFilteredCountries={getFilteredCountries}
              selectedCountry={selectedCountry?.display_name ?? ""}
              countryDetails={countryDetails}
              isGuestUser={isGuestUser}
              closeAddressForm={() => setOpenModal((prev) => !prev)}
            ></AddressForm>
          </div>
        </Modal>
        {/* {showShipment || showPayment ? null : (
          <SingleAddressContent
            allAddresses={allAddresses}
            addressLoading={isAddressLoading}
            editAddress={editAddress}
            removeAddress={removeAddress}
            addressLoader={addressLoader}
            selectAddress={selectAddress}
            invalidAddressError={invalidAddressError}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            getOtherAddress={getOtherAddress}
            getDefaultAddress={getDefaultAddress}
            loader={loader}
          ></SingleAddressContent>
        )} */}
      </div>
    </>
  );
}

export default SingleAddress;
