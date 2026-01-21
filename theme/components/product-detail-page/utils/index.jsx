// Simple attribute mapping by category
export const CATEGORY_ATTRIBUTES = {
  fashion: [
    "short_description",
    "material",
    "custom-attribute-14",
    "color",
    "package_contents",
    "custom-attribute-4",
    "custom-attribute-5",
    "closure_type",
    "embellishment",
    "necktype",
    "sleeve_length",
    "technique_description",
    "sleeve_type",
    "bottomwear_length",
    "waist_rise",
    "product_fit",
    "occasion",
  ],
  accessories: [
    "short_description",
    "material",
    "custom-attribute-14",
    "color",
    "package_contents",
    "custom-attribute-4",
    "custom-attribute-5",
    "closure_type",
    // "compartments",
    "number-of-pockets",
    "pattern",
    "dimensions",
    "style",
    "adjustable",
    "occasion",
    "stone_type",
  ],
  footwear: [
    "short_description",
    "material",
    "custom-attribute-14",
    "color",
    "package_contents",
    "custom-attribute-4",
    "custom-attribute-5",
    "closure_type",
    "sole_material",
    "heel_height",
    "style",
    "toe_type",
    "pattern",
  ],
  eyewear: [
    "short_description",
    "material",
    "custom-attribute-14",
    "color",
    "package_contents",
    "custom-attribute-4",
    "custom-attribute-5",
    "lens_material",
    "frame_shape",
    "frame_type",
    "frame_material",
    "hinge_type",
    "uv_protection",
    "polarized",
    "temple_color",
    "temple_material",
    "lens_color",
    "shade",
    "surface_material",
  ],
};

// Label mapping for better display names
export const ATTRIBUTE_LABELS = {
  short_description: "",
  material: "",
  ["custom-attribute-14"]: "",
  color: "",
  package_contents: "",
  ["custom-attribute-4"]: "",
  ["custom-attribute-5"]: "",
  // closure_type: "Closure Type",
  // embellishment: "Embellishment",
  // necktype: "Neck Type",
  // sleeve_length: "Sleeve Length",
  // technique_description: "Technique",
  // sleeve_type: "Sleeve Type",
  // bottomwear_length: "Length",
  // waist_rise: "Waist Rise",
  // product_fit: "Fit",
  // occasion: "Occasion",
  // compartments: "Compartments",
  ["number-of-pockets"]: "Pockets : ",
  // pattern: "Pattern",
  // dimensions: "Dimensions",
  // style: "Style",
  // adjustable: "Adjustable",
  // stone_type: "Stone Type",
  // sole_material: "Sole Material",
  // heel_height: "Heel Height",
  // toe_type: "Toe Type",
  // lens_material: "Lens Material",
  // frame_shape: "Frame Shape",
  // frame_type: "Frame Type",
  // frame_material: "Frame Material",
  // hinge_type: "Hinge Type",
  // uv_protection: "UV Protection",
  // polarized: "Polarized",
  // temple_color: "Temple Color",
  // temple_material: "Temple Material",
  // lens_color: "Lens Color",
  // shade: "Shade",
  // surface_material: "Surface Material",
};

// Color options data
export const colorOptions = [
  { id: 1, name: "Black", value: "#000000", selected: false },
  { id: 2, name: "Brown", value: "#8B4513", selected: false },
  { id: 3, name: "Taupe", value: "#B8A082", selected: true }, // Currently selected
  { id: 4, name: "Beige", value: "#F5F5DC", selected: false },
  { id: 5, name: "White", value: "#FFFFFF", selected: false },
];

export const getAvailableColors = (productData) => {
  // Find the color variant group (can be primary_color or color)
  const colorVariant = productData?.variants?.find(
    (variant) => variant.key === "primary_color" || variant.key === "color"
  );

  if (!colorVariant?.items || colorVariant.items.length === 0) {
    // Fallback to old logic if no variants
    return productData?.attributes?.primary_color_hex
      ? [
          {
            id: 1,
            name: productData?.attributes?.primary_color,
            value: `#${productData?.attributes?.primary_color_hex}`,
            selected: true,
            slug: productData?.slug,
            uid: productData?.uid,
            display_type: "color", // Default to color type
          },
        ]
      : [];
  }

  // Get display_type from variant (can be "color" or "image")
  const displayType = colorVariant.display_type || "color";

  // Map variant items to color objects
  return colorVariant.items.map((item, index) => {
    // Get color hex - use item.color if available, otherwise fallback to primary_color_hex
    let colorHex = "#CCCCCC"; // Default gray

    if (item.color && item.color.trim() !== "") {
      // If color field has value, use it
      colorHex = item.color.startsWith("#") ? item.color : `#${item.color}`;
    } else if (productData?.attributes?.primary_color_hex) {
      // Fallback to primary color hex
      colorHex = `#${productData.attributes.primary_color_hex}`;
    }

    return {
      id: item.uid || index,
      name: item.color_name,
      value: colorHex,
      selected: item.uid === productData?.uid, // Current product is selected
      slug: item.slug,
      uid: item.uid,
      medias: item.medias,
      is_available: item.is_available,
      display_type: displayType, // Add display_type to each color object
    };
  });
};

// Function to generate accordion data from product data
export const generateAccordionData = (
  productData,
  isSizeGuideAvailable = false,
  sizeBasedPrice = null,
  returnConfig = null
) => {
  const attributes = productData?.attributes || {};
  const accordionItems = [];

  // 1. About Designer/Brand (optional - can be added if needed)
  const brandInfo = productData?.brand?.description;
  const brandSlug = productData?.brand?.action?.page?.query?.brand?.[0];
  if (brandInfo && brandInfo.trim()) {
    // Extract //Link URL from description if present
    const linkMatch = brandInfo.match(/\/\/Link\s*:\s*([^\s]+)/);
    const extractedUrl = linkMatch ? linkMatch[1] : null;

    // Remove //Link : URL from the description text
    const cleanedBrandInfo = brandInfo
      .replace(/\/\/Link\s*:\s*[^\s]+/g, "")
      .trim();

    // Determine button URL: use extracted URL if present, otherwise use brand slug
    const buttonUrl = extractedUrl || `/sections/${brandSlug}`;

    // Only show button if we have a URL (either extracted or from brand slug)
    const hasButton = !!extractedUrl;

    accordionItems.push({
      id: "about-designer",
      title: "ABOUT THE MAKER",
      titleStyle: "text-neutral-900",
      hasIcon: false,
      content: {
        type: "rich",
        text: cleanedBrandInfo,
        hasButton: hasButton,
        buttonText: "Read more",
        buttonUrl: buttonUrl,
      },
    });
  }

  // 2. Care Instructions
  const careInstructions = attributes.care_instructions;
  if (careInstructions && careInstructions.trim()) {
    accordionItems.push({
      id: "care-instructions",
      title: "CARE",
      titleStyle: "text-neutral-900",
      hasIcon: false,
      content: {
        type: "simple",
        text: careInstructions,
        hasButton: false,
      },
    });
  }

  // 3. Delivery, Return, and Exchange Policy
  // Generate policy text based on return config
  const generatePolicyText = () => {
    const deliveryText =
      "Delivery:\nFree shipping across India. Shipping time varies with each product. Please enter your pincode to see the estimated delivery date.";

    let returnsText = "";
    if (returnConfig?.returnable && returnConfig?.time > 0) {
      // Product is returnable
      const timeUnit = returnConfig.unit || "days";
      returnsText = `\n\nReturns and Replacements:\nThis item qualifies for replacement within ${returnConfig.time} ${timeUnit} under EKKE's replacement policy. Style and size exchanges are subject to availability and may be possible in some cases. Contact customer care for more information.`;
    } else {
      // Product is not returnable
      returnsText =
        "\n\nReturns and Replacements:\nThis item is not eligible for returns or exchanges. Contact customer care for more information.";
    }

    return deliveryText + returnsText;
  };

  // Always show delivery policy accordion
  accordionItems.push({
    id: "delivery-policy",
    title: "EXCHANGE & REPLACEMENT",
    titleStyle: "text-neutral-900",
    hasIcon: false,
    content: {
      type: "simple",
      text: generatePolicyText(),
      hasButton: true,
      buttonText: "Read more about Replacements and Exchanges",
      buttonUrl: "/return-policy",
    },
  });

  // 4. ASSISTANCE
  let assistanceText = "";

  // Customer Care Info
  assistanceText +=
    "For assistance with earlier deliveries, custom sizing, and any other queries, reach out to us below.\n\n";
  assistanceText += "Phone: +91 8490823230 \n";
  assistanceText += "Email: hello@ekke.co\n";
  assistanceText += "Monday to Friday, 10 AM to 7 PM (IST)";

  // Extract manufacturer and marketer from trader array in sizeBasedPrice API response
  const traderData = sizeBasedPrice?.trader || [];

  // Find manufacturer and marketer from trader array
  const manufacturerData = traderData.find(
    (item) => item.key === "Manufacturer"
  );
  const marketerData = traderData.find((item) => item.key === "Marketer");

  // Manufacturer Name and Address from API or fallback to attributes
  if (manufacturerData?.value) {
    assistanceText += "\n\nManufacturer:\n";
    assistanceText += manufacturerData.value;
  } else {
    const manufacturerName =
      attributes["manufacturer-name"] || attributes["marketer-name"];
    const manufacturerAddress =
      attributes["manufacturer-address"] || attributes["marketer-address"];
    if (manufacturerName || manufacturerAddress) {
      assistanceText += "\n\nManufacturer:\n";
      if (manufacturerName) {
        assistanceText += manufacturerName + "\n";
      }
      if (manufacturerAddress) {
        assistanceText += manufacturerAddress;
      }
    }
  }

  // Marketer Name and Address from API or fallback to attributes
  if (marketerData?.value) {
    assistanceText += "\n\nMarketer:\n";
    assistanceText += marketerData.value;
  } else {
    const marketerName = attributes["marketer-name"];
    const marketerAddress = attributes["marketer-address"];
    if (marketerName || marketerAddress) {
      assistanceText += "\n\nMarketer:\n";
      if (marketerName) {
        assistanceText += marketerName + "\n";
      }
      if (marketerAddress) {
        assistanceText += marketerAddress;
      }
    }
  }

  // Country of Origin
  const countryOfOrigin = attributes["country_of_origin"];
  if (countryOfOrigin) {
    assistanceText += `\n\nCountry of Origin: ${countryOfOrigin}`;
  }

  if (assistanceText.trim().length > 0) {
    accordionItems.push({
      id: "additional-info",
      title: "ASSISTANCE",
      titleStyle: "text-neutral-900",
      hasIcon: false,
      content: {
        type: "simple",
        text: assistanceText.trim(),
        hasButton: false,
      },
    });
  }

  // 5. Size Guide & Fit Notes - Always last position
  // Special accordion that triggers size guide modal instead of expanding
  if (isSizeGuideAvailable) {
    accordionItems.push({
      id: "size-guide",
      title: "SIZE GUIDE & FIT NOTES",
      titleStyle: "text-neutral-900",
      hasIcon: false,
      isTrigger: true, // Special flag to indicate this is a trigger, not an expandable accordion
      content: {
        type: "simple",
        text: "",
        hasButton: false,
      },
    });
  }

  return accordionItems;
};

/**
 * Calculate the "GET IT BY" date based on manufacturing time and delivery promise
 *
 * Edge Cases:
 * 1. delivery_promise is null but custom_order exists -> Show manufacturing time only
 * 2. delivery_promise exists but custom_order is missing -> Show delivery_promise.max only
 * 3. Both are null/missing -> Return null to show "GET IT BY [ DATE ]"
 *
 * Formula: estimated_get_date = current_date + manufacturing_time + delivery_time
 *
 * Data Sources:
 * - manufacturing_time: From productData.custom_order.manufacturing_time (in days/hours/weeks)
 * - delivery_time: From fulfillmentOptions[0].delivery_promise.max (ISO date string)
 *
 * @param {Object} productData - Product data containing custom_order info
 * @param {Array} fulfillmentOptions - Array of fulfillment options from API
 * @returns {string|null} - Formatted date string like "29 Nov 2025" or null if data unavailable
 */
export const calculateGetItByDate = (productData, fulfillmentOptions) => {
  try {
    // Helper function to format date
    const formatDate = (date) => {
      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    // Get delivery promise max date from fulfillment options
    const deliveryPromiseMax = fulfillmentOptions?.[0]?.delivery_promise?.max;

    // Get custom order info
    const hasCustomOrder = productData?.custom_order?.is_custom_order === true;
    const manufacturingTime =
      productData?.custom_order?.manufacturing_time || 0;
    const manufacturingTimeUnit =
      productData?.custom_order?.manufacturing_time_unit || "days";

    // Convert manufacturing time to days if needed
    let manufacturingDays = manufacturingTime;
    if (manufacturingTimeUnit === "hours") {
      manufacturingDays = Math.ceil(manufacturingTime / 24);
    } else if (manufacturingTimeUnit === "weeks") {
      manufacturingDays = manufacturingTime * 7;
    }

    // EDGE CASE 1: delivery_promise is null but custom_order exists
    // Show manufacturing time only (current_date + manufacturing_time)
    if (!deliveryPromiseMax && hasCustomOrder && manufacturingDays > 0) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + manufacturingDays);
      return formatDate(currentDate);
    }

    // EDGE CASE 2: delivery_promise exists but custom_order is missing/null
    // Show delivery_promise.max date only
    if (deliveryPromiseMax && (!hasCustomOrder || manufacturingDays === 0)) {
      const deliveryDate = new Date(deliveryPromiseMax);
      return formatDate(deliveryDate);
    }

    // NORMAL CASE: Both delivery_promise and custom_order exist
    // Add manufacturing time to delivery date
    if (deliveryPromiseMax && hasCustomOrder && manufacturingDays > 0) {
      const deliveryDate = new Date(deliveryPromiseMax);
      deliveryDate.setDate(deliveryDate.getDate() + manufacturingDays);
      return formatDate(deliveryDate);
    }

    // EDGE CASE 3: Both are null/missing
    // Return null to show "GET IT BY [ DATE ]"
    return null;
  } catch (error) {
    console.error("Error calculating GET IT BY date:", error);
    return null;
  }
};

// Your accordion data remains the same...
// const accordionData = [
//   {
//     id: "about-designer",
//     title: "ABOUT THE DESIGNER/BRAND",
//     titleStyle: "text-neutral-900",
//     hasIcon: false,
//     content: {
//       type: "rich",
//       text: "Skirt features a wrap-around construction with a front slit. Crafted from cotton with a treatment finish, detailed with an Acne Studios Stockholm 1996 logo patch and back pleat detail at the back. Cut to a regular fit and below the knees length.",
//       hasButton: true,
//       buttonText: "Read more",
//     },
//   },
//   {
//     id: "care-instructions",
//     title: "CARE INSTRUCTIONS",
//     titleStyle: "text-neutral-900",
//     hasIcon: false,
//     content: {
//       type: "simple",
//       text: "Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on low heat if needed. Do not dry clean.",
//       hasButton: false,
//     },
//   },
//   {
//     id: "delivery-policy",
//     title: "DELIVERY, RETURN, AND EXCHANGE POLICY",
//     titleStyle: "text-neutral-900",
//     hasIcon: false,
//     content: {
//       type: "simple",
//       text: "Free standard delivery on orders over $100. Express delivery available for $15. Easy returns within 30 days.",
//       hasButton: false,
//     },
//   },
//   {
//     id: "size-guide",
//     title: "SIZE GUIDE & FIT NOTES",
//     titleStyle: "text-neutral-900",
//     hasIcon: false,
//     content: {
//       type: "simple",
//       text: "This item runs true to size. Model is 5'11\" and wears size 36. For best fit, refer to our size chart.",
//       hasButton: false,
//     },
//   },
//   {
//     id: "faq",
//     title: "FAQ",
//     titleStyle: "text-neutral-900",
//     hasIcon: true,
//     content: {
//       type: "simple",
//       text: "Q: Is this item sustainable? A: Yes, made with recycled cotton lining. Q: How should I style this? A: Perfect with boots and a fitted top.",
//       hasButton: false,
//     },
//   },
// ];
