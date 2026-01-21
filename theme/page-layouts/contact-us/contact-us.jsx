import React, { useEffect, useMemo, useState } from "react";
import styles from "./contact-us.less";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import FyImage from "../../components/core/fy-image/fy-image";
import { useGlobalTranslation } from "fdk-core/utils";
import EkkeLogo from "../../assets/images/logo/ekke-logo";
import ContactForm from "../../components/contact-form/contact-form";
import CustomerExperience from "../../components/customer-experience/customer-experience";

function ContactSupport({
  contactInfo = "",
  supportInfo = "",
  handleSubmitForm = () => {},
  pageConfig = "",
  SocailMedia = () => <></>,
  appInfo,
  prefillData: { values = {}, errors: prefillErrors = {} } = {},
}) {
  const { t } = useGlobalTranslation("translation");
  const contact = supportInfo?.contact?.phone?.phone[0];
  const email = supportInfo?.contact?.email?.email[0]?.value;

  const overlayStyles = {
    "--overlay-opacity": `${pageConfig?.opacity}%`,
  };

  const showAddress =
    typeof pageConfig?.show_address === "boolean"
      ? pageConfig.show_address
      : true;

  const showPhone =
    typeof pageConfig?.show_phone === "boolean" ? pageConfig?.show_phone : true;

  const showEmail =
    typeof pageConfig?.show_email === "boolean" ? pageConfig?.show_email : true;
  const showWorkingHours =
    typeof pageConfig?.show_working_hours === "boolean"
      ? pageConfig?.show_working_hours
      : true;
  const showIcons =
    typeof pageConfig?.show_icons === "boolean" ? pageConfig?.show_icons : true;
  const showDescription =
    typeof pageConfig?.show_description === "boolean"
      ? pageConfig?.show_description
      : true;

  const showListItems = useMemo(
    () =>
      (showAddress && contactInfo?.address?.address_line?.[0]?.length > 0) ||
      (showPhone && contact?.number) ||
      (showEmail && email?.length) ||
      (showIcons && contactInfo?.social_links) ||
      (showWorkingHours && contactInfo?.support?.timing),
    [
      showAddress,
      showPhone,
      showEmail,
      showIcons,
      showWorkingHours,
      contactInfo,
      supportInfo,
    ]
  );

  return (
    <div className={`basePageContainer margin0auto`}>
      <CustomerExperience />
      <div
        className={`${styles.contactUs_mainContainer} ${pageConfig?.align_image === "left" && styles.invert}`}
      >
        <div className={styles.imageContainer}>
          <SvgWrapper svgSrc="ekke-grey" />
        </div>
        <div
          className={`${styles.contact_container} ${pageConfig?.image_desktop ? styles.onImageContainer : ""} ${pageConfig?.align_description === "above_footer" ? styles.reducedBottomGap : ""}`}
        >
          <div className={`${styles.flex_item}`}>
            <div>
              {appInfo?.description?.length > 0 &&
                showDescription &&
                pageConfig?.align_description !== "above_footer" && (
                  <p
                    className={`${styles.description}  ${styles.showDesktop} fontBody`}
                  >
                    {appInfo?.description}
                  </p>
                )}
            </div>
          </div>
          <div>
            <ContactForm
              onSubmit={handleSubmitForm}
              prefillData={{ values, errors: prefillErrors }}
              description={appInfo?.description}
              showDescriptionInForm={
                appInfo?.description?.length > 0 &&
                showDescription &&
                pageConfig?.align_description !== "above_footer"
              }
              supportEmail={email}
            />
          </div>
        </div>
        {/* {pageConfig?.image_desktop && (
          <div className={styles.imageContainer} style={overlayStyles}>
            <FyImage
              customClass={styles.imageWrapper}
              src={pageConfig?.image_desktop}
              aspectRatio={3 / 4}
              showOverlay={true}
              overlayColor="#000000"
              overlayCustomClass={styles.overlay}
            />
          </div>
        )} */}
      </div>
      {/* {appInfo?.description?.length > 0 &&
        showDescription &&
        pageConfig?.align_description === "above_footer" && (
          <div
            className={`${styles.flex_item} ${styles.descriptionMargin} ${pageConfig?.image_desktop ? styles.descriptionPaddingTop : ""}`}
          >
            <p className={`${styles.description} fontBody`}>
              {appInfo?.description}
            </p>
          </div>
        )} */}
    </div>
  );
}

export default ContactSupport;
