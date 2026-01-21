import React from "react";
import useHeader from "../components/header/useHeader";
import { CREATE_TICKET } from "../queries/supportQuery";
import { useSnackbar } from "../helper/hooks";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import ContactPage from "../page-layouts/contact-us";
import SocailMedia from "../components/socail-media/socail-media";
import "@gofynd/theme-template/pages/contact-us/contact-us.css";
import { getConfigFromProps } from "../helper/utils";
import ContactSupport from "../page-layouts/contact-us/contact-us";
import { SUBMIT_CUSTOM_FORM } from "../queries/formItemQuery";
import { useToast } from "../components/custom-toaster";

function Component({ props = {} }) {
  const fpi = useFPI();
  const { contactInfo, supportInfo, appInfo } = useHeader(fpi);
  const { t } = useGlobalTranslation("translation");

  const pageConfig = getConfigFromProps(props);
  const { showSnackbar } = useSnackbar();
  const toast = useToast();

  const handleSubmitForm = async (data) => {
    try {
      let finalText = "";
      if (data?.name) {
        finalText += `<b>${t("resource.header.shop_logo_alt_text")}: </b>${data?.name}<br>`;
      }
      if (data?.phone) {
        finalText += `<b>${t("resource.header.contact")}: </b>${data?.phone}<br>`;
      }
      if (data?.email) {
        finalText += `<b>${t("resource.common.email")}: </b>${data?.email}<br>`;
      }
      if (data?.comment) {
        finalText += `<b>${t("resource.header.comment")}: </b>${data?.comment}<br>`;
      }
      finalText = `<div>${finalText}</div>`;
      const wordArray = Utf8.parse(finalText);
      finalText = Base64.stringify(wordArray);

      const uploadedFilesRes = [];

      const files = data?.file;
      console.log("FILES", files);
      for (const file of files) {
        try {
          const completeRes = await fpi.uploadFile(file);
          console.log("RES", completeRes);
          const data = completeRes?.data?.completeUpload;
          uploadedFilesRes.push(data);
        } catch (error) {
          console.error("Upload error:", error);
        }
      }

      const attachments = uploadedFilesRes.map((item) => {
        return {
          value: item.cdn.url,
        };
      });
      const allImagesString = attachments.map((a) => a.value).join(",");

      console.log("attachement", attachments);
      const formValues = [
        {
          key: "mobile-number",
          value: {
            code: "91",
            number: data?.phone,
            valid: true,
          },
        },
        {
          key: "email",
          value: data?.email,
        },
        {
          key: "category",
          value: data?.category,
        },
        {
          key: "share-details-here",
          value: data?.details,
        },
        {
          key: "subject",
          value: data?.subject,
        },
        {
          key: "upload-image",
          value: allImagesString,
        },
      ];

      const payload = {
        slug: "contact-us",
        customFormSubmissionPayloadInput: {
          response: formValues,
        },
      };

      fpi
        .executeGQL(SUBMIT_CUSTOM_FORM, payload)
        .then(() => {
          // showSnackbar(t("resource.common.ticket_success"), "success");
          toast.success("Thanks For reaching out!!! ");
        })
        .catch(() => showSnackbar(t("resource.common.error_message"), "error"));
    } catch (error) {
      console.log("Error submitting form:", error);
      toast.error(t("resource.common.error_occurred_submitting_form"), "error");
    }
  };

  return (
    <ContactSupport
      contactInfo={contactInfo}
      supportInfo={supportInfo}
      handleSubmitForm={handleSubmitForm}
      pageConfig={pageConfig}
      SocailMedia={SocailMedia}
      appInfo={appInfo}
    />
  );
}

export const settings = {
  label: "t:resource.sections.contact_us.contact_us",
  props: [
    {
      id: "align_image",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.left",
        },
        {
          value: "right",
          text: "t:resource.common.right",
        },
      ],
      default: "right",
      label: "t:resource.sections.contact_us.banner_alignment",
      info: "t:resource.sections.contact_us.banner_alignment_info",
    },
    {
      id: "align_description",
      type: "select",
      options: [
        {
          value: "below_header",
          text: "t:resource.sections.contact_us.below_header",
        },
        {
          value: "above_footer",
          text: "t:resource.sections.contact_us.above_footer",
        },
      ],
      default: "below_header",
      label: "t:resource.sections.contact_us.description_alignment",
      info: "t:resource.sections.contact_us.description_alignment_info",
    },
    {
      type: "image_picker",
      id: "image_desktop",
      label: "t:resource.sections.contact_us.upload_banner",
      default: "",
      info: "t:resource.sections.contact_us.upload_banner_info",
      options: {
        aspect_ratio: "3:4",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "range",
      id: "opacity",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      label: "t:resource.sections.contact_us.overlay_banner_opacity",
      default: 20,
    },
    {
      type: "checkbox",
      id: "show_description",
      default: true,
      label: "t:resource.sections.contact_us.description",
      info: "t:resource.sections.contact_us.show_description",
    },
    {
      type: "checkbox",
      id: "show_address",
      default: true,
      label: "t:resource.sections.contact_us.address",
      info: "t:resource.sections.contact_us.show_address",
    },
    {
      type: "checkbox",
      id: "show_phone",
      default: true,
      label: "t:resource.sections.contact_us.phone",
      info: "t:resource.sections.contact_us.show_phone",
    },
    {
      type: "checkbox",
      id: "show_email",
      default: true,
      label: "t:resource.sections.contact_us.email",
      info: "t:resource.sections.contact_us.show_email",
    },
    {
      type: "checkbox",
      id: "show_icons",
      default: true,
      label: "t:resource.sections.contact_us.social_media_icons",
      info: "t:resource.sections.contact_us.show_icons",
    },
    {
      type: "checkbox",
      id: "show_working_hours",
      default: true,
      label: "t:resource.sections.contact_us.working_hours",
      info: "t:resource.sections.contact_us.show_working_hours",
    },
  ],
};

export default Component;
