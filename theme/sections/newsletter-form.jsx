import React, { useState, useRef, useReducer } from "react";
import styles from "../styles/sections/newsletter-form.less";
import { useToast } from "../components/custom-toaster";
import { useMobile } from "../helper/hooks";

const ACTION_TYPES = {
  SET_EMAIL: "SET_EMAIL",
  SET_HOVER: "SET_HOVER",
  SET_FOCUS: "SET_FOCUS",
  SET_TYPING: "SET_TYPING",
  SET_ENTERED: "SET_ENTERED",
  SET_BLURRED: "SET_BLURRED",
  SET_ERROR: "SET_ERROR",
  SET_SUBMITTING: "SET_SUBMITTING",
  SET_CONFIRMED: "SET_CONFIRMED",
  SET_DISABLED: "SET_DISABLED",
  SHOW_THANK_YOU: "SHOW_THANK_YOU",
  RESET_STATES: "RESET_STATES",
};
// Initial state for the reducer
const initialState = {
  email: "",
  isSubmitting: false,
  message: "",
  isHovered: false,
  isFocused: false,
  isTyping: false,
  hasEntered: false,
  isBlurred: false,
  isDisabled: false,
  hasError: false,
  isConfirmed: false,
  showThankYou: false,
};

// Reducer function to manage all form states
const formReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_EMAIL:
      return {
        ...state,
        email: action.payload,
        message: "",
        hasError: false,
        isConfirmed: false,
      };
    case ACTION_TYPES.SET_HOVER:
      return { ...state, isHovered: action.payload };
    case ACTION_TYPES.SET_FOCUS:
      return { ...state, isFocused: action.payload };
    case ACTION_TYPES.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload,
        hasEntered: action.payload ? false : state.hasEntered,
      };
    case ACTION_TYPES.SET_ENTERED:
      return { ...state, hasEntered: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        hasError: action.payload.hasError,
        message: action.payload.message || "",
      };
    case ACTION_TYPES.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
    case ACTION_TYPES.SET_BLURRED:
      return { ...state, isBlurred: action.payload };
    case ACTION_TYPES.SET_CONFIRMED:
      return {
        ...state,
        isConfirmed: action.payload.isConfirmed,
        hasError: false,
        message: action.payload.message || "",
        email: action.payload.isConfirmed ? "" : state.email,
        hasEntered: action.payload.isConfirmed ? false : state.hasEntered,
      };
    case ACTION_TYPES.SET_DISABLED:
      return { ...state, isDisabled: action.payload };
    case ACTION_TYPES.SHOW_THANK_YOU:
      return { ...state, showThankYou: action.payload };
    case ACTION_TYPES.RESET_STATES:
      return {
        ...state,
        isTyping: false,
        isFocused: false,
        isHovered: false,
      };
    default:
      return state;
  }
};

// Helper function to validate email with strict validation
const isValidEmail = (email) => {
  if (!email) return false;

  const trimmed = email.trim();
  if (!trimmed) return false;

  // List of valid top-level domains (TLDs)
  const validTLDs = [
    // Generic TLDs
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "mil",
    "int",
    // Country code TLDs (most common)
    "uk",
    "us",
    "ca",
    "au",
    "de",
    "fr",
    "it",
    "es",
    "nl",
    "be",
    "ch",
    "at",
    "se",
    "no",
    "dk",
    "fi",
    "pl",
    "ie",
    "pt",
    "gr",
    "jp",
    "cn",
    "in",
    "kr",
    "sg",
    "hk",
    "tw",
    "my",
    "th",
    "id",
    "ph",
    "vn",
    "nz",
    "br",
    "mx",
    "ar",
    "cl",
    "co",
    "pe",
    "za",
    "ae",
    "sa",
    "il",
    "tr",
    "ru",
    // New generic TLDs (common ones)
    "io",
    "co",
    "ai",
    "app",
    "dev",
    "tech",
    "online",
    "site",
    "website",
    "store",
    "shop",
    "blog",
    "info",
    "biz",
    "xyz",
    "me",
    "tv",
    "cc",
    "ws",
    "name",
    "pro",
    "mobi",
    "asia",
    "jobs",
    "travel",
    "tel",
    "email",
  ];

  // Stricter email pattern: local part + @ + domain with valid TLD
  // Local part: alphanumeric, dots, hyphens, underscores, plus signs (but not at start/end/consecutive)
  // Domain: alphanumeric and hyphens (but not at start/end)
  // TLD: must be from valid list, 2-6 characters
  const emailPattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(trimmed)) {
    return false;
  }

  // Extract domain and TLD
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1];
  const domainParts = domain.split(".");

  if (domainParts.length < 2) return false;

  // Get the TLD (last part after last dot)
  const tld = domainParts[domainParts.length - 1].toLowerCase();

  // Check if TLD is in the valid list
  if (!validTLDs.includes(tld)) {
    return false;
  }

  // Additional validation: domain should not have consecutive dots
  if (domain.includes("..")) return false;

  // Domain should be at least 3 characters (e.g., a.co)
  if (domain.length < 3) return false;

  // Domain name (before TLD) should be at least 3 characters and contain at least one letter
  // This rejects very short gibberish domains like "sdcdsc" that are unlikely to be real
  const domainName = domainParts.slice(0, -1).join(".");
  if (domainName.length < 3) return false;

  // Domain name should contain at least one letter (not just numbers/hyphens)
  if (!/[a-zA-Z]/.test(domainName)) return false;

  // Each subdomain part should be at least 2 characters (more realistic)
  // Main domain (last part before TLD) should be at least 3 characters
  const mainDomain = domainParts[domainParts.length - 2];
  if (mainDomain.length < 3) return false;

  // Each part of the domain should be at least 1 character
  for (const part of domainParts.slice(0, -1)) {
    if (part.length < 1) return false;
    // Each part should not start or end with hyphen
    if (part.startsWith("-") || part.endsWith("-")) return false;
  }

  // Local part should be at least 1 character
  if (parts[0].length < 1) return false;

  // Local part should not have consecutive dots
  if (parts[0].includes("..")) return false;

  // Local part should not start or end with dot
  if (parts[0].startsWith(".") || parts[0].endsWith(".")) return false;

  return true;
};

export function Component({ props, globalConfig }) {
  const {
    heading,
    description,
    placeholder_text,
    submit_button_text,
    thank_you_text,
    section_image,
    section_image_mobile,
    colorPicker,
    thank_you_subtext,
  } = props;
  const toast = useToast();

  const formId = window?.newsletter_form_id || "6926b4c480c42657b6c613b5";

  const [state, dispatch] = useReducer(formReducer, initialState);
  const typingTimeoutRef = useRef(null);

  const isMobile = useMobile();

  // Create background image styles with responsive support
  const getBackgroundStyle = () => {
    const desktopImage = section_image?.value || section_image;
    const mobileImage = section_image_mobile?.value || section_image_mobile;

    // Use desktop image as primary, fallback to mobile if no desktop image
    const primaryImage = isMobile ? mobileImage : desktopImage;

    if (!primaryImage) return {};

    return {
      backgroundImage: `url(${primaryImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    dispatch({ type: ACTION_TYPES.SET_EMAIL, payload: value });

    dispatch({ type: ACTION_TYPES.SET_TYPING, payload: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      dispatch({ type: ACTION_TYPES.SET_TYPING, payload: false });
      if (value.trim()) {
        dispatch({ type: ACTION_TYPES.SET_ENTERED, payload: true });
      }
    }, 500);
  };

  const handleFocus = () => {
    dispatch({ type: ACTION_TYPES.SET_FOCUS, payload: true });
    dispatch({ type: ACTION_TYPES.SET_BLURRED, payload: false });
  };

  const handleBlur = () => {
    dispatch({ type: ACTION_TYPES.SET_FOCUS, payload: false });
    dispatch({ type: ACTION_TYPES.SET_TYPING, payload: false });

    // Set blurred state if there's content and reset hasEntered
    if (state.email.trim()) {
      dispatch({ type: ACTION_TYPES.SET_BLURRED, payload: true });
      dispatch({ type: ACTION_TYPES.SET_ENTERED, payload: false });
    }

    if (!isValidEmail(state.email)) {
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: {
          hasError: true,
          message: "Please enter a valid email address",
        },
      });
    }
  };

  const handleMouseEnter = () => {
    dispatch({ type: ACTION_TYPES.SET_HOVER, payload: true });
  };

  const handleMouseLeave = () => {
    dispatch({ type: ACTION_TYPES.SET_HOVER, payload: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(state.email)) {
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: {
          hasError: true,
          message: "Please enter a valid email address",
        },
      });
      return;
    }

    dispatch({ type: ACTION_TYPES.SET_SUBMITTING, payload: true });

    try {
      // Get dynamic domain from window URL
      const baseUrl = window.location.origin;

      // Call newsletter API
      const response = await fetch(
        `${baseUrl}/ext/newsletter/application/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: state.email,
            form_id: formId,
            platform: "web",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      // Success
      toast.success("Successfully subscribed to newsletter!");
      dispatch({
        type: ACTION_TYPES.SET_CONFIRMED,
        payload: { isConfirmed: true, message: "Thank you for subscribing!" },
      });
      dispatch({ type: ACTION_TYPES.SET_SUBMITTING, payload: false });
      dispatch({ type: ACTION_TYPES.SET_DISABLED, payload: false });

      // Show thank you message
      dispatch({ type: ACTION_TYPES.SHOW_THANK_YOU, payload: true });

      // Hide thank you message after 4 seconds and reset all states
      setTimeout(() => {
        dispatch({ type: ACTION_TYPES.SHOW_THANK_YOU, payload: false });
        // Reset all states to initial state
        dispatch({ type: ACTION_TYPES.SET_EMAIL, payload: "" });
        dispatch({
          type: ACTION_TYPES.SET_CONFIRMED,
          payload: { isConfirmed: false, message: "" },
        });
        dispatch({ type: ACTION_TYPES.SET_ENTERED, payload: false });
        dispatch({ type: ACTION_TYPES.SET_BLURRED, payload: false });
        dispatch({ type: ACTION_TYPES.SET_HOVER, payload: false });
        dispatch({ type: ACTION_TYPES.SET_FOCUS, payload: false });
        dispatch({ type: ACTION_TYPES.SET_TYPING, payload: false });
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: { hasError: false, message: "" },
        });
      }, 4000);
    } catch (error) {
      // Error handling
      console.error("Newsletter subscription error:", error);
      toast.error(error.message || "Failed to subscribe. Please try again.");
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: {
          hasError: true,
          message: error.message || "Subscription failed",
        },
      });
      dispatch({ type: ACTION_TYPES.SET_SUBMITTING, payload: false });
      dispatch({ type: ACTION_TYPES.SET_DISABLED, payload: false });
    }
  };

  const getInputClasses = () => {
    let baseClasses = `${styles.inputWrapper}`;

    // Check if any interaction has occurred
    const hasInteraction =
      state.isHovered ||
      state.isFocused ||
      state.isTyping ||
      state.hasEntered ||
      state.isBlurred ||
      state.hasError ||
      state.isConfirmed ||
      state.isDisabled ||
      state.isSubmitting;

    // Add width class based on interaction
    baseClasses += hasInteraction
      ? ` ${styles.widthInteractive}`
      : ` ${styles.widthDefault}`;

    if (state.isDisabled || state.isSubmitting) {
      baseClasses += ` ${styles.disabled}`;
    } else if (state.hasError) {
      baseClasses += ` ${styles.error}`;
    } else if (state.isConfirmed) {
      baseClasses += ` ${styles.confirmed}`;
    } else if (state.isBlurred) {
      baseClasses += ` ${styles.blurred}`; // Check blurred BEFORE other states
    } else if (state.isTyping) {
      baseClasses += ` ${styles.typing}`;
    } else if (state.hasEntered) {
      baseClasses += ` ${styles.entered}`;
    } else if (state.isFocused) {
      baseClasses += ` ${styles.focused}`;
    } else if (state.isHovered) {
      baseClasses += ` ${styles.hover}`;
    }

    return baseClasses;
  };
  // Get dynamic submit button text based on state
  const getSubmitButtonText = () => {
    if (state.isSubmitting) return "SUBMITTING...";
    if (state.isConfirmed) return "SUBSCRIBED!";
    if (state.hasError) return "EMAIL NOT VALID";
    if (state.isTyping) return "SUBMIT MAIL";
    if (state.hasEntered) return "SUBMIT MAIL";
    if (state.isFocused) return "SUBMIT MAIL";
    if (state.isHovered) return "SUBMIT MAIL";

    // Show success toast
    return submit_button_text?.value || "SUBMIT MAIL";
  };

  const getInputClassName = () => {
    const baseClass = styles.emailInput;
    const hasInteraction =
      state.isHovered ||
      state.isFocused ||
      state.isTyping ||
      state.hasEntered ||
      state.hasError ||
      state.isConfirmed ||
      state.isDisabled;

    return hasInteraction ? `${baseClass} hasInteraction` : baseClass;
  };

  const getPlaceholderText = () => {
    // If no interaction has occurred, show the default placeholder
    const hasInteraction =
      state.isHovered ||
      state.isFocused ||
      state.isTyping ||
      state.hasEntered ||
      state.hasError ||
      state.isConfirmed ||
      state.isDisabled;

    if (!hasInteraction) {
      return "Join our mailing list for first looks, special prices, and the stories informing our curations.";
    }

    // Interactive states use specific placeholders
    if (state.isDisabled) return "NOPE";
    if (state.hasError) return "UPPS";
    if (state.isConfirmed) return "YEAH!";
    if (state.isTyping) return "TYPING";
    if (state.hasEntered) return "TYPED";
    return placeholder_text?.value || "NAMEMAIL@GMAIL.COM";
  };

  // Show submit button when user has typed any content
  const shouldShowSubmitButton = () => {
    return state.email.trim().length > 0;
  };
  return (
    <section className={styles.newsletterSection} style={getBackgroundStyle()}>
      <div className={styles.container}>
        <div className={styles.content}>
          {state.showThankYou ? (
            // Thank you message content
            <div className="flex flex-col gap-6 text-center">
              <div
                className={styles.messageHeading}
                style={{ color: colorPicker.value || "#000000" }}
              >
                {thank_you_text?.value ||
                  "Thanks for joining the ekke community"}
              </div>
              {thank_you_subtext?.value && (
                <p
                  className={styles.messageDescription}
                  style={{ color: colorPicker.value || "#000000" }}
                >
                  {thank_you_subtext?.value}
                </p>
              )}
            </div>
          ) : (
            // Normal form content
            <>
              {heading?.value && (
                <h2 className={`${styles.heading} heading-2`}>
                  {heading.value}
                </h2>
              )}

              {description?.value && (
                <p className={`${styles.description} paragraph-1`}>
                  {description.value}
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                className={styles.form}
                onMouseLeave={handleMouseLeave}
                noValidate
              >
                <div
                  className={getInputClasses()}
                  onMouseEnter={handleMouseEnter}
                >
                  <input
                    type="email"
                    value={state.email}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={getPlaceholderText()}
                    className={getInputClassName()}
                    disabled={state.isDisabled || state.isSubmitting}
                    aria-invalid={state.hasError && state.isBlurred}
                    aria-describedby={
                      state.hasError && state.isBlurred
                        ? "email-error"
                        : undefined
                    }
                  />
                  {shouldShowSubmitButton() && (
                    <button
                      type="submit"
                      className={`${styles.submitButton} ${
                        state.isSubmitting
                          ? "opacity-60 cursor-not-allowed"
                          : "opacity-80"
                      } group`}
                      disabled={state.isSubmitting || state.isDisabled}
                    >
                      <div className="flex items-center gap-1">
                        <div className="relative w-1 h-1 bg-neutral-900 rounded-[1px] transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                        <span>{getSubmitButtonText()}</span>
                      </div>
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Section Settings Configuration - Simplified to only text inputs
export const settings = {
  label: "Newsletter Form",
  props: [
    {
      type: "image_picker",
      id: "section_image",
      label: "Hero Image (Desktop)",
      info: "Single desktop image",
      default: "",
    },
    {
      type: "image_picker",
      id: "section_image_mobile",
      label: "Hero Image (Mobile/Tablet)",
      info: "Single mobile or tablet image",
      default: "",
    },
    {
      type: "text",
      id: "placeholder_text",
      label: "Email Placeholder",
      default: "NAMEMAIL@GMAIL.COM",
      info: "Placeholder text for the email input field",
    },
    {
      type: "text",
      id: "submit_button_text",
      label: "Submit Button Text",
      default: "SUBMIT MAIL",
      info: "Text for the submit button",
    },
    {
      type: "text",
      id: "thank_you_text",
      label: "Thank You Text",
      default: "",
      info: "Message to show when the form is submitted successfully",
    },
    {
      type: "text",
      id: "thank_you_subtext",
      label: "Thank You  SubText",
      default: "",
      info: "Message to show when the form is submitted successfully",
    },
    {
      id: "colorPicker",
      label: "Color Chooser For Thank you text",
      type: "color",
      default: "#7043F7",
      info: "Pick a color from the color picker.",
    },
  ],
};

export default Component;
