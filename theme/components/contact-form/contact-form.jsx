import React, { useEffect, useMemo, useState } from "react";
import styles from "./contact-form.less";
import FyInput from "../core/fy-input/fy-input";
import FyDropdown from "../core/fy-dropdown/fy-dropdown-lib";
import FyButton from "../core/fy-button/fy-button";
import { Controller, useForm } from "react-hook-form";
import { useGlobalTranslation } from "fdk-core/utils";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";

function ContactForm({
  onSubmit = () => {},
  prefillData: { values = {}, errors: prefillErrors = {} } = {},
  description = "",
  showDescriptionInForm = false,
  supportEmail = "",
  categoryOptions: categoryOptionsProp,
}) {
  const { t } = useGlobalTranslation("translation");

  const categoryOptions = useMemo(
    () =>
      categoryOptionsProp || [
        { key: "order-help", display: "ORDER HELP" },

        { key: "list-with-us", display: "LIST WITH US" },

        { key: "press", display: "PRESS" },

        { key: "collaborations", display: "COLLABORATIONS" },

        { key: "styling-inquiry", display: "STYLING INQUIRY" },

        { key: "careers", display: "CAREERS" },

        { key: "feedback", display: "FEEDBACK" },

        { key: "other", display: "OTHER" },
      ],
    [categoryOptionsProp],
  );

  const [subjectText, setSubjectText] = useState("");
  const [detailsText, setDetailsText] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      phone: (values?.phone || "").replace(/^"|"$/g, ""),
      email: (values?.email || "").replace(/^"|"$/g, ""),
      category: values?.category || "",
      subject: (values?.subject || "").replace(/^"|"$/g, ""),
      details: (values?.details || "").replace(/^"|"$/g, ""),
      terms: false,
      file: null,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (values?.details) setDetailsText(values.details.replace(/^"|"$/g, ""));
    if (values?.subject) setSubjectText(values.subject.replace(/^"|"$/g, ""));
  }, [values?.details, values?.subject]);

  useEffect(() => {
    if (prefillErrors?.phone) {
      setError("phone", {
        type: "manual",
        message: t("resource.contact_us.please_enter_a_valid_phone_number"),
      });
    }
    if (prefillErrors?.email) {
      setError("email", {
        type: "manual",
        message: t("resource.contact_us.please_enter_a_valid_email_address"),
      });
    }
    if (prefillErrors?.subject) {
      const isTooLong = values?.subject?.length > 400;
      setError("subject", {
        type: "manual",
        message: isTooLong
          ? "Subject exceeds 400 characters"
          : "Please enter subject",
      });
    }
    if (prefillErrors?.details) {
      const isTooLong = values?.details?.length > 1000;
      setError("details", {
        type: "manual",
        message: isTooLong
          ? "Details exceed 1000 characters"
          : "Please enter details",
      });
    }
  }, [prefillErrors, setError, t, values]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];
      const hasInvalid = files.some((f) => !validTypes.includes(f.type));
      if (hasInvalid) {
        setError("file", {
          type: "manual",
          message:
            "Invalid file format. Please upload PNG, JPG, JPEG, DOCX, or PDF files only.",
        });
        return;
      }
      setSelectedFiles((prevFiles) => {
        const existingNames = new Set(prevFiles.map((f) => f.name));
        const uniqueNewFiles = files.filter((f) => !existingNames.has(f.name));
        return [...prevFiles, ...uniqueNewFiles];
      });
      clearErrors("file");
    } else {
      setSelectedFiles([]);
    }
  };

  useEffect(() => {
    const urls = selectedFiles.map((f) => ({
      url: f.type?.startsWith("image/") ? URL.createObjectURL(f) : null,
      isImage: !!f.type?.startsWith("image/"),
      name: f.name,
    }));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => {
        if (u.url) URL.revokeObjectURL(u.url);
      });
    };
  }, [selectedFiles]);

  const removeFileAtIndex = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    clearErrors("file");
  };

  const submitForm = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = {
        ...data,
        file: selectedFiles,
      };
      await onSubmit(formData);
      reset({
        phone: "",
        email: "",
        category: "",
        subject: "",
        details: "",
        terms: false,
        file: null,
      });
      setSubjectText("");
      setDetailsText("");
      setSelectedFiles([]);
    } catch (err) {
      console.error("Form submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      {description?.length > 0 && showDescriptionInForm && (
        <p className={`${styles.description} ${styles.showMobile} fontBody`}>
          {description}
        </p>
      )}
      <p className={styles.formHeading}>Get in touch</p>
      <p className="body-2 text-[#171717] md:max-w-[350px]">
        &nbsp; &nbsp;For assistance with orders, delivery, or queries, reach out
        via the details below, or fill out the form and we’ll get back to you.
      </p>
      <div className="pt-6 flex justify-center flex-col sm:items-center md:items-start">
        <p className="body-2 text-[#171717] pl-2 ">
          &nbsp; &nbsp;Phone: <a href="tel:+918490823230">+91 8490823230</a>
        </p>
        <p className="body-2 text-[#171717] pl-2 ">
          &nbsp; &nbsp;Email: <a href="mailto:hello@ekke.co">hello@ekke.co</a>
        </p>
        <p className="body-2 text-[#171717] pb-6 pl-2">
          &nbsp; &nbsp;Monday to Friday, 10 AM to 8 PM (IST)
        </p>

        <form onSubmit={handleSubmit(submitForm)}>
          <div className={styles.formInputContainer}>
            <div className={styles.form_first}>
              <div className={styles.formField}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: t(
                      "resource.contact_us.please_enter_your_phone_number",
                    ),
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: t(
                        "resource.contact_us.please_enter_a_valid_phone_number",
                      ),
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <FyInput
                        htmlFor="phone"
                        labelClassName={styles.labelText}
                        label={"mobile number"}
                        inputClassName={`${styles.inputPlaceholder} fontBody`}
                        placeholder="Mobile No."
                        showAsterik={true}
                        required={true}
                        maxLength={10}
                        type="tel"
                        onInput={(e) => {
                          e.target.value = e.target.value
                            .replace(/[^+\d\s]/g, "")
                            .slice(0, 15);
                          onChange(e);
                        }}
                        onChange={(e) => onChange(e)}
                        value={value || ""}
                      />
                      <div className={styles.error}>
                        {errors?.phone?.message ?? ""}
                      </div>
                    </>
                  )}
                />
              </div>
              <div className={styles.formField}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: t(
                      "resource.contact_us.please_enter_your_email_address",
                    ),
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,6}){1,2}$/,
                      message: t(
                        "resource.contact_us.please_enter_a_valid_email_address",
                      ),
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <FyInput
                        htmlFor="email"
                        labelClassName={styles.labelText}
                        label={"email"}
                        inputClassName={`${styles.inputPlaceholder} fontBody`}
                        placeholder="Email"
                        showAsterik={true}
                        required={true}
                        type="text"
                        inputSize="small"
                        onChange={(e) => onChange(e)}
                        value={value || ""}
                      />
                      <div className={styles.error}>
                        {errors?.email?.message ?? ""}
                      </div>
                    </>
                  )}
                />
              </div>
            </div>

            <div className={styles.form_row}>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Please select a category" }}
                render={({ field: { onChange, value } }) => (
                  <FyDropdown
                    label="CATEGORY"
                    labelClassName={styles.labelText}
                    dropdownListClassName={styles.dropdownList}
                    dropdownOptionClassName={styles.dropdownOption}
                    dropdownButtonClassName={styles.dropdownButton}
                    dropdownButtonWrapperClassName={
                      styles.dropdownButtonWrapper
                    }
                    valueClassName={styles.dropdownValue}
                    placeholder="SELECT A CATEGORY"
                    options={categoryOptions}
                    value={
                      value
                        ? categoryOptions.find((o) => o.key === value).key
                        : null
                    }
                    onChange={(val) => onChange(val)}
                    required={true}
                    showAsterik={true}
                    error={errors.category}
                    containerClassName={styles.dropdownContainer}
                    disableSearch={true}
                    showPlusIcon={true}
                  ></FyDropdown>
                )}
              />
            </div>
            <div className={`${styles.form_row} ${styles.hasCharCounter}`}>
              <Controller
                name="subject"
                control={control}
                rules={{
                  required: "Please enter subject",
                  validate: (val) =>
                    val && val.length > 400
                      ? "Details exceed 1000 characters"
                      : true,
                }}
                render={({ field: { onChange, value } }) => (
                  <div style={{ position: "relative" }}>
                    <FyInput
                      htmlFor="subject"
                      labelClassName={styles.labelText}
                      inputClassName={`body-2 !bg-[#fff] text-[11px] line-height-[13.2px] p-2 font-archivo`}
                      label={"Subject"}
                      placeholder=""
                      showAsterik={true}
                      required={true}
                      type="textarea"
                      multiline={true}
                      maxLength={400}
                      error={errors.subject}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(e);
                        setSubjectText(val);
                      }}
                      value={value || ""}
                      errorMessage={
                        errors.subject ? errors.subject.message : ""
                      }
                    />
                    <div className={styles.charCounter}>
                      {subjectText.length}/400
                    </div>
                  </div>
                )}
              />
            </div>

            <div className={`${styles.form_row} ${styles.hasCharCounter}`}>
              <Controller
                name="details"
                control={control}
                rules={{
                  required: "Please enter details",
                  validate: (val) =>
                    val && val.length > 1000
                      ? "Details exceed 1000 characters"
                      : true,
                }}
                render={({ field: { onChange, value } }) => (
                  <div style={{ position: "relative" }}>
                    <FyInput
                      htmlFor="details"
                      labelClassName={styles.labelText}
                      inputClassName={`body-2 !bg-[#fff]text-[11px] line-height-[13.2px] p-2 font-archivo`}
                      label={"share details here"}
                      placeholder=""
                      showAsterik={true}
                      required={true}
                      type="textarea"
                      multiline={true}
                      maxLength={1000}
                      error={errors.details}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(e);
                        setDetailsText(val);
                      }}
                      value={value || ""}
                      errorMessage={
                        errors.details ? errors.details.message : ""
                      }
                    />
                    <div className={styles.charCounter}>
                      {detailsText.length}/1000
                    </div>
                  </div>
                )}
              />
            </div>

            <div className={styles.form_row}>
              <label className={styles.labelText}>
                upload image (optional)
              </label>
              <div className={styles.fileUploadContainer}>
                <label
                  htmlFor="file-upload"
                  className={styles.fileUploadButton}
                >
                  CHOOSE FILE
                  <input
                    type="file"
                    id="file-upload"
                    accept=".png,.jpg,.jpeg,.pdf,"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    multiple
                  />
                </label>
              </div>

              {selectedFiles?.length > 0 && (
                <div className={styles.previewGrid}>
                  {previewUrls.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className={styles.previewItem}
                    >
                      {item.isImage && item.url ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className={styles.previewThumb}
                        />
                      ) : (
                        <div className={styles.previewFilePlaceholder}>
                          <span className={styles.previewFileExt}>
                            {item.name?.split(".")?.pop()?.toUpperCase() ||
                              "FILE"}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => removeFileAtIndex(idx)}
                        aria-label="Remove file"
                      >
                        <SvgWrapper
                          svgSrc="close"
                          height={"12"}
                          width={"12px"}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p
                className={`${styles.fileHelperText} ${errors ? (errors?.file ? styles.error : "") : ""}`}
              >
                Upload clear images of Product & Packaging Box in PNG, JPG,
                JPEG, DOCX, PDF format only.
              </p>
            </div>

            {errors.file && (
              <div className={styles.error}>{errors.file.message}</div>
            )}
          </div>

          <div className={`${styles.form_row} ${styles.terms}`}>
            <div className={styles.checkboxContainer}>
              <Controller
                name="terms"
                control={control}
                rules={{ required: "Please accept terms and conditions" }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={value || false}
                      onChange={(e) => onChange(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label
                      htmlFor="terms"
                      class={styles.customCheckBox}
                    ></label>
                    <a
                      href="/terms-and-conditions"
                      className={styles.checkboxLabel}
                    >
                      Terms and conditions
                    </a>
                  </>
                )}
              />
            </div>
          </div>
          {errors.terms && (
            <div className={styles.error}>{errors.terms.message}</div>
          )}

          <div>
            <button
              className="body-2 uppercase bg-[#eee] text-ekke-black w-full hover:bg-ekke-black hover:text-white h-8 pl-2 text-left"
              type="submit"
            >
              SUBMIT
            </button>
          </div>
        </form>

        <p className={styles.assistanceText}>
          Should you need any further assistance please email us at{" "}
          <a
            href={`mailto:${supportEmail || "help@tirabeauty.com"}`}
            className={styles.emailLink}
          >
            {supportEmail || "help@tirabeauty.com"}
          </a>
        </p>
      </div>
    </div>
  );
}

export default ContactForm;
