import Pixelbin, { transformations } from "@pixelbin/core";
import {
  DEFAULT_CURRENCY_LOCALE,
  DEFAULT_UTC_LOCALE,
  DIRECTION_ADAPTIVE_CSS_PROPERTIES,
  FLOAT_MAP,
  TEXT_ALIGNMENT_MAP,
} from "./constant";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isNumberKey(e) {
  // Ensure that it is a number and stop the keypress
  if (
    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
    (e.keyCode < 96 || e.keyCode > 105)
  ) {
    return false;
  }
  return true;
}

export function isFreeNavigation(e) {
  // Ensure Delete ,Backspace , arrow keys nav.
  if (
    e.keyCode === 46 ||
    e.keyCode === 8 ||
    (e.keyCode >= 37 && e.keyCode <= 40)
  ) {
    return true;
  }

  return false;
}

export function translateDynamicLabel(input, t) {
  const safeInput = input
    .toLowerCase()
    .replace(/\//g, "_") // replace slashes with underscores
    .replace(/[^a-z0-9_\s]/g, "") // remove special characters except underscores and spaces
    .trim()
    .replace(/\s+/g, "_"); // replace spaces with underscores

  const translationKey = `resource.dynamic_label.${safeInput}`;
  const translated = t(translationKey);

  return translated.split(".").pop() === safeInput ? input : translated;
}

export const getAddressStr = (item, isAddressTypeAvailable) => {
  if (!item || typeof item !== "object") {
    return "";
  }
  try {
    const parts = [
      item.address || "",
      item.area || "",
      item.landmark?.length > 0 ? item.landmark : "",
      item.sector || "",
      item.city || "",
      item.state || "",
    ].filter(Boolean);

    if (isAddressTypeAvailable && item.address_type) {
      parts.unshift(item.address_type);
    }
    let addressStr = parts.join(", ");
    if (item.area_code) {
      addressStr += ` ${item.area_code}`;
    }
    if (item.country) {
      addressStr += `, ${item.country}`;
    }
    return addressStr;
  } catch (error) {
    console.error("Error constructing address string:", error);
    return "";
  }
};

export function deepEqual(obj1, obj2) {
  // Check if both objects are the same reference
  if (obj1 === obj2) {
    return true;
  }

  // Check if both are objects and not null
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  // Get the keys of both objects
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  // Check if both objects have the same number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys and their values are the same
  for (let key of keys1) {
    // Recursively check for nested objects
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export const debounce = (func, wait) => {
  let timeout;
  const debouncedFunction = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function applyFunc() {
      func.apply(this, args);
    }, wait);
  };
  return debouncedFunction;
};

export const getGlobalConfigValue = (globalConfig, id) =>
  globalConfig?.props?.[id] ?? "";

export const getSocialIcon = (title) =>
  title && typeof title === "string" ? `footer-${title.toLowerCase()}` : "";

export function replaceQueryPlaceholders(queryFormat, value1, value2) {
  return queryFormat.replace("{}", value1).replace("{}", value2);
}

export const singleValuesFilters = {
  sortOn: true,
};

export function capitalize(str) {
  if (!str) return str; // Return the string as-is if it's empty or undefined
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const numberWithCommas = (number = 0) => {
  let num = number;
  if (number?.toString()[0] === "-") {
    num = number?.toString()?.substring(1);
  }

  if (num) {
    let no =
      num?.toString()?.split(".")?.[0]?.length > 3
        ? `${num
            ?.toString()
            ?.substring(0, num?.toString()?.split(".")[0].length - 3)
            ?.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
            ?.toString()
            ?.substring(num?.toString()?.split(".")?.[0]?.length - 3)}`
        : num?.toString();

    if (number?.toString()[0] === "-") {
      no = `-${no}`;
    }
    return no;
  }
  return 0;
};
export function isRunningOnClient() {
  if (typeof window !== "undefined") {
    return globalThis === window;
  }

  return false;
}

export const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

export function convertDate(dateString, locale = "en-US") {
  const date = new Date(dateString);

  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC",
  };

  const formatter = new Intl.DateTimeFormat(locale, options);
  const formattedDate = formatter.format(date);

  return formattedDate;
}

export const convertUTCDateToLocalDate = (date, format, locale = "en-US") => {
  let frm = format;
  if (!frm) {
    frm = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
  }
  const utcDate = new Date(date);
  // Convert the UTC date to the local date using toLocaleString() with specific time zone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
    ...frm,
    timeZone: browserTimezone,
  };
  // Convert the UTC date and time to the desired format
  const formattedDate = utcDate
    .toLocaleString(locale, options)
    .replace(" at ", ", ");
  return formattedDate;
};

export function validateName(name) {
  const regexp = /^[a-zA-Z0-9-_'. ]+$/;
  return regexp.test(String(name).toLowerCase().trim());
}

export function validateEmailField(value) {
  const emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailPattern.test(value);
}

export function validatePhone(phoneNo) {
  const re = /^[0-9]{10}$/;
  return phoneNo && phoneNo.length && re.test(phoneNo.trim());
}

export function validatePasswordField(value) {
  const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±])[A-Za-z\d`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±]{8,}$/;
  return passwordPattern.test(value);
}

export function checkIfNumber(value) {
  const numberPattern = /^[0-9]+$/;
  return numberPattern.test(value);
}

export function isEmptyOrNull(obj) {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === "object" && Object.keys(obj).length === 0)
  );
}

export const transformImage = (url, width, height) => {
  if (!url || (!width && !height)) return url;

  let updatedUrl = url;

  try {
    const obj = Pixelbin.utils.urlToObj(url);

    const pixelbin = new Pixelbin({
      cloudName: obj.cloudName,
      zone: obj.zone || "default",
    });

    const resizeOptions = {
      dpr: 1,
      ...(width && { width }),
      ...(height && { height }),
    };

    const resizeTransformation = transformations.Basic.resize(resizeOptions);

    updatedUrl = pixelbin
      .image(obj.workerPath)
      .setTransformation(resizeTransformation)
      .getUrl();
  } catch (error) {
    console.warn(
      "[transformImage] Error processing the URL:",
      error?.message || error,
    );
  }

  return updatedUrl;
};

export function updateGraphQueryWithValue(mainString, replacements) {
  if (!mainString || !replacements || !Array.isArray(replacements)) {
    return mainString;
  }
  let mStr = mainString;
  // Iterate over the replacements and replace each occurrence in the main string
  replacements.forEach((replacement) => {
    const [search, replaceWith] = replacement;
    if (search && replaceWith) {
      mStr = mainString.split(search).join(replaceWith);
    }
  });
  return mStr;
}

export function throttle(func, wait) {
  let waiting = false;

  function throttleHandler(...args) {
    if (waiting) {
      return;
    }

    waiting = true;
    setTimeout(function executeFunction() {
      func.apply(this, args);
      waiting = false;
    }, wait);
  }

  return throttleHandler;
}

export const startsWithResource = (str) => {
  return str.startsWith("resource.");
};

export const detectMobileWidth = () => {
  if (isRunningOnClient()) {
    if (window && window.screen?.width <= 768) {
      return true;
    }
    return false;
  }
};

export function sanitizeHTMLTag(data) {
  return typeof data === "string" ? data.replace(/[<>"]/g, "") : "";
}

export const getProductImgAspectRatio = (
  global_config,
  defaultAspectRatio = 0.8,
) => {
  const productImgWidth = global_config?.product_img_width;
  const productImgHeight = global_config?.product_img_height;
  if (productImgWidth && productImgHeight) {
    const aspectRatio = Number(productImgWidth / productImgHeight).toFixed(2);
    return aspectRatio >= 0.6 && aspectRatio <= 1
      ? aspectRatio
      : defaultAspectRatio;
  }

  return defaultAspectRatio;
};

export const currencyFormat = (value, currencySymbol, locale = "en-IN") => {
  // Check if value is defined (including 0) and currencySymbol is provided
  if (value != null) {
    const formattedValue = value.toLocaleString(locale);

    // If currencySymbol is a valid uppercase currency code
    if (currencySymbol && /^[A-Z]+$/.test(currencySymbol)) {
      return `${currencySymbol} ${formattedValue}`;
    }

    // If currencySymbol is provided, attach it without space
    if (currencySymbol) {
      return `${currencySymbol}${formattedValue}`;
    }

    // Return formatted value without currencySymbol
    return formattedValue;
  }

  // Handle cases where value is null or undefined
  return "";
};

export const getReviewRatingData = (customMeta) => {
  const data = {};

  if (customMeta && customMeta.length) {
    customMeta.forEach((item) => {
      if (item.key) {
        data[item.key] = Number(item?.value || "");
      }
    });

    const avgRating = data.rating_sum / data.rating_count;

    data.avg_ratings = Number(Number(avgRating).toFixed(1)) || 0;
  }

  return data;
};
export function removeCookie(name) {
  if (isRunningOnClient()) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export function getCookie(key) {
  if (isRunningOnClient()) {
    const name = `${key}=`;
    const decoded = decodeURIComponent(document.cookie);
    const cArr = decoded.split("; ");
    let res;
    cArr.forEach((val) => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    });
    if (!res) {
      return "";
    }
    try {
      return JSON.parse(res);
    } catch (e) {
      return res || null;
    }
  } else {
    return null;
  }
}

export const getValidLocales = (languagesList) => {
  return languagesList.map((lang) => lang.locale);
};

const isValidLocale = (tag) => {
  try {
    new Intl.Locale(tag);
    return true;
  } catch {
    return false;
  }
};

export const formatLocale = (locale, countryCode, isCurrencyLocale = false) => {
  if ((locale === "en" || !locale) && isCurrencyLocale) {
    return DEFAULT_CURRENCY_LOCALE;
  }
  if (locale === "en" || !locale) {
    return DEFAULT_UTC_LOCALE;
  }
  const finalLocale = locale.includes("-")
    ? locale
    : `${locale}${countryCode ? "-" + countryCode : ""}`;
  return isValidLocale(finalLocale) ? finalLocale : DEFAULT_UTC_LOCALE;
};

export const getDirectionAdaptiveValue = (cssProperty, value) => {
  switch (cssProperty) {
    case DIRECTION_ADAPTIVE_CSS_PROPERTIES.TEXT_ALIGNMENT:
      return TEXT_ALIGNMENT_MAP[value];
    case DIRECTION_ADAPTIVE_CSS_PROPERTIES.FLOAT:
      return FLOAT_MAP[value];
    default:
      return value;
  }
};
export function createFieldValidation(field, t) {
  if (!field) return () => {};
  const {
    display_name,
    required,
    validation: { type, regex },
  } = field;
  return (value) => {
    if (required && !value) {
      return `${display_name} ${t("resource.common.address.is_required")}.`;
    }

    if ((required || value) && type === "regex" && regex?.value) {
      try {
        const regExp = new RegExp(regex.value);
        if (!regExp.test(value)) {
          return `${t("resource.common.invalid")} ${display_name}`;
        }
      } catch (error) {
        return `${t("resource.common.invalid")} ${display_name}`;
      }
    }
    const { min, max } = regex?.length || {};
    if (
      (required || value) &&
      ((max && value.length > max) || (min && value.length < min))
    ) {
      return `${display_name} ${t("resource.common.validation_length", { min: min || 0, max: max || "∞" })}`;
    }
    return true;
  };
}

export function createLocalitiesPayload(slug, fieldsMap, values) {
  if (!slug) return {};
  const field = fieldsMap?.[slug];
  let result = {};
  if (field?.prev) {
    result = {
      ...result,
      ...createLocalitiesPayload(field?.prev, fieldsMap, values),
    };
  }
  result[slug] = values?.[slug]?.display_name || values?.[slug] || undefined;
  return result;
}

export const resetScrollPosition = () => {
  if (typeof window !== "undefined") {
    window?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
};

export const getConfigFromProps = (props) => {
  const getConfigValue = (key) => ({ [key]: props?.[key]?.value });

  return Object.keys(props)?.reduce(
    (acc, curr) => ({ ...getConfigValue(curr), ...acc }),
    {},
  );
};

export function getLocalizedRedirectUrl(path = "", currentLocale) {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If we have a non-English locale and path doesn't already have it
  if (
    currentLocale &&
    currentLocale !== "en" &&
    !normalizedPath.startsWith(`/${currentLocale}`)
  ) {
    return `/${currentLocale}${normalizedPath}`;
  }

  return normalizedPath;
}

export function getDefaultLocale(locales) {
  const defaultLocaleObj = locales.find((item) => item.is_default === true);
  return defaultLocaleObj ? defaultLocaleObj.locale : null;
}

export function isLocalePresent(locale, localesArray = []) {
  return localesArray.some((item) => item.locale === locale);
}

export function getLocaleDirection(fpi) {
  const dir = fpi?.store?.getState()?.custom?.currentLocaleDetails?.direction;
  return dir || "ltr";
  return localesArray.some((item) => item.locale === locale);
}

export function priceFormatCurrencySymbol(symbol, price = 0) {
  const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);
  let sanitizedPrice = price;
  if (typeof price !== "string") {
    let num = price;

    if (!isNaN(price)) num = roundToDecimals(price);
    if (num?.toString()[0] === "-") {
      num = num?.toString()?.substring(1);
    }

    if (num) {
      sanitizedPrice =
        num?.toString()?.split(".")?.[0].length > 3
          ? `${num
              ?.toString()
              ?.substring(0, num?.toString()?.split(".")?.[0]?.length - 3)
              ?.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
              ?.toString()
              ?.substring(num?.toString()?.split?.(".")?.[0]?.length - 3)}`
          : num?.toString();
    } else {
      sanitizedPrice = 0;
    }
  }

  return `${price.toString()[0] === "-" ? "-" : ""}${
    hasAlphabeticCurrency
      ? `${symbol} ${sanitizedPrice}`
      : `${symbol}${sanitizedPrice}`
  }`;
}

export function roundToDecimals(number, decimalPlaces = 2) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
}

export const getUserFullName = (user) => {
  if (!user) return "";

  const { first_name, last_name } = user;
  if (first_name && last_name) {
    return `${first_name} ${last_name}`.trim();
  }
  return first_name || last_name || "";
};

export const translateValidationMessages = (validationObject, t) => {
  const updatedValidation = { ...validationObject };

  Object.keys(updatedValidation).forEach((key) => {
    const rule = updatedValidation[key];

    if (typeof rule === "object" && rule.message) {
      rule.message = translateDynamicLabel(rule.message, t);
    } else if (typeof rule === "string") {
      updatedValidation[key] = translateDynamicLabel(rule, t);
    }
  });

  return updatedValidation;
};
export const getUserPrimaryPhone = (user) => {
  if (!user || !user.phone_numbers || !Array.isArray(user.phone_numbers)) {
    return null;
  }

  const primaryPhone = user.phone_numbers.find((phone) => phone.primary);
  if (!primaryPhone) return null;

  const countryCode = primaryPhone.country_code?.toString() || "91";
  const mobile = primaryPhone.phone || "";

  return {
    mobile,
    countryCode,
  };
};
export const getUserPrimaryEmail = (user) => {
  if (!user || !user.emails || !Array.isArray(user.emails)) {
    return "";
  }

  const primaryEmail = user.emails.find((email) => email.primary);
  return primaryEmail?.email || "";
};

export const getUserAutofillData = (user, isGuestUser = false) => {
  if (!user || isGuestUser) {
    return {};
  }

  return {
    name: getUserFullName(user),
    phone: getUserPrimaryPhone(user),
    email: getUserPrimaryEmail(user),
  };
};

// Track the scroll lock state
let scrollLockCount = 0;
let scrollPosition = 0;

// Helper to check if body scroll is currently locked
export const isBodyScrollLocked = () => scrollLockCount > 0;

export const lockBodyScroll = () => {
  if (!isRunningOnClient()) return;

  scrollLockCount++;

  // Only apply styles on the first lock
  if (scrollLockCount === 1) {
    // Store current scroll position BEFORE any style changes
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Simple overflow hidden without position changes to prevent scroll jump
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`; // Prevent layout shift from scrollbar

    // Prevent touch scrolling on mobile
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    // Also lock html element to prevent any background scrolling
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
  }
};

export const unlockBodyScroll = () => {
  if (!isRunningOnClient()) return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);

  // Only remove styles when all locks are released
  if (scrollLockCount === 0) {
    // Remove all scroll lock styles from body
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.touchAction = "";
    document.body.style.overscrollBehavior = "";

    // Remove scroll lock styles from html element
    document.documentElement.style.overflow = "";
    document.documentElement.style.overscrollBehavior = "";

    // Scroll position should already be maintained since we didn't use position: fixed
    scrollPosition = 0;
  }
};

// utils/sizeSort.js

// utils/sortSizes.js

// Normalized size order for alpha sizes
export function sortSizes(sizes) {
  return sizes.sort((a, b) => {
    const aStr = String(a.value);
    const bStr = String(b.value);

    // Define order for alphabetic sizes
    const sizeOrder = {
      XXS: 1,
      XS: 2,
      S: 3,
      SM: 4, // Small-Medium (optional hybrid)
      M: 5,
      L: 6,
      XL: 7,
      XXL: 8,
      XXXL: 9,
      "2XL": 9,
      "3XL": 10,
      "4XL": 11,
      "5XL": 12,
      "6XL": 13,
      "7XL": 14,
      "8XL": 15,
      "9XL": 16,
      "9XL": 17,
      "10XL": 18,
      "11XL": 19,
      "12XL": 20,

      CUSTOM: 999, // Always last, very large number to stay at the end
    };

    // Check if both are alphabetic sizes
    if (sizeOrder[aStr] && sizeOrder[bStr]) {
      return sizeOrder[aStr] - sizeOrder[bStr];
    }

    // If one is alphabetic and other isn't, alphabetic comes first
    if (sizeOrder[aStr]) return -1;
    if (sizeOrder[bStr]) return 1;

    // Handle numeric sizes including decimals
    const aFloat = parseFloat(aStr);
    const bFloat = parseFloat(bStr);
    if (!isNaN(aFloat) && !isNaN(bFloat)) {
      return aFloat - bFloat;
    }

    if (!isNaN(aFloat)) return -1;
    if (!isNaN(bFloat)) return 1;

    // Handle alphanumeric sizes (e.g., 50A)
    const aMatch = aStr.match(/^(\d+)([A-Z]*)$/);
    const bMatch = bStr.match(/^(\d+)([A-Z]*)$/);
    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[1]);
      const bNum = parseInt(bMatch[1]);
      if (aNum !== bNum) return aNum - bNum;
      return aMatch[2].localeCompare(bMatch[2]);
    }

    if (aMatch) return -1;
    if (bMatch) return 1;

    // Handle hyphenated sizes (e.g., 30-31)
    const aHyphen = aStr.split("-");
    const bHyphen = bStr.split("-");
    if (aHyphen.length === 2 && bHyphen.length === 2) {
      const aFirst = parseInt(aHyphen[0]);
      const bFirst = parseInt(bHyphen[0]);
      if (aFirst !== bFirst) return aFirst - bFirst;
      return parseInt(aHyphen[1]) - parseInt(bHyphen[1]);
    }

    if (aHyphen.length === 2) return -1;
    if (bHyphen.length === 2) return 1;

    // Handle slash sizes (e.g., 35/36)
    const aSlash = aStr.split("/");
    const bSlash = bStr.split("/");

    if (aSlash.length === 2 && bSlash.length !== 2) {
      return parseInt(aSlash[0]) <= parseInt(bStr) ? -1 : 1;
    }
    if (bSlash.length === 2 && aSlash.length !== 2) {
      return parseInt(bSlash[0]) <= parseInt(aStr) ? 1 : -1;
    }
    if (aSlash.length === 2 && bSlash.length === 2) {
      return parseInt(aSlash[0]) - parseInt(bSlash[0]);
    }

    if (aSlash.length === 2) return -1;
    if (bSlash.length === 2) return 1;

    return aStr.localeCompare(bStr);
  });
}

export const CustomerExperienceNavigation = [
  {
    display: "ACCOUNT DASHBOARD",
    url: "/profile/details",
  },
  {
    display: "FAQ",
    url: "/faq",
  },
  {
    display: "SIZING HELP",

    url: "/sections/sizing-guide",
  },
  {
    display: "EXCHANGE & REPLACEMENTS",

    url: "/sections/returns-exchanges",
  },
  {
    display: "ASSISTANCE",
    url: "/contact-us",
  },
];
