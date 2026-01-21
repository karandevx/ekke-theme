import React from "react";
import { useFPI } from "fdk-core/utils";
import CustomerExperience from "../components/customer-experience/customer-experience";
import SvgWrapper from "../components/core/svgWrapper/SvgWrapper";

function unwrapValue(input) {
  // Recursively unwrap common CMS shapes like { type, value } or { value: ... }
  if (input == null) return "";
  if (typeof input === "string" || typeof input === "number")
    return String(input);

  if (typeof input === "object") {
    // Prefer explicit "value" field if present
    if ("value" in input) return unwrapValue(input.value);
    // Some editors use { text: "..."} or similar
    if ("text" in input) return unwrapValue(input.text);
    // Final fallback: stringify (prevents React from receiving a raw object)
    try {
      return JSON.stringify(input);
    } catch {
      return "";
    }
  }
  return String(input);
}

function normalizeBlock(block) {
  // Accept both { type, props } and { type, value } shapes
  if (block && typeof block === "object") {
    const type = unwrapValue(block.type);
    const props = block.props ?? block.value ?? {};
    return { type, props };
  }
  return { type: "", props: {} };
}

export function Component({ props, blocks }) {
  const fpi = useFPI();

  const safeBlocks = Array.isArray(blocks) ? blocks.map(normalizeBlock) : [];

  return (
    <div>
      <CustomerExperience />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:py-10 md:px-2 bg-[#F7F7F5]">
        {/* LEFT: make sticky on md+ */}
        <div className="flex items-center justify-center md:sticky md:top-0 md:self-start md:h-full">
          <span className="flex items-center justify-center mb-4">
            <SvgWrapper svgSrc="ekke-grey" />
          </span>
        </div>

        {/* RIGHT: Render blocks */}
        <div className="relative flex flex-col overflow-auto">
          {safeBlocks.map((block, index) => {
            const rawType = (block.type || "").trim().toLowerCase();
            const bprops = block.props || {};

            switch (rawType) {
              case "html_css": {
                const html = unwrapValue(bprops.htmlCodeInput);
                return (
                  <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
                );
              }

              case "gallery": {
                const imgSrc = unwrapValue(bprops.Image);
                const text = unwrapValue(bprops.Text);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center bg-ekke-bg  max-w-xl"
                  >
                    {text && (
                      <div className="text-[11px] text-ekke-black font-archivo uppercase py-3 pl-4 pr-2 w-full ">
                        {text}
                      </div>
                    )}
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={text || "Image"}
                        className="w-full   object-contain"
                      />
                    )}
                  </div>
                );
              }

              case "description": {
                const header = unwrapValue(bprops.headertext);
                const info = unwrapValue(bprops.info);
                const htmlContent = unwrapValue(bprops.htmlCodeDescription);

                console.log("Text ", htmlContent);
                return (
                  <div key={index} className="bg-ekke-bg">
                    {header && (
                      <span className="text-[#AAA] font-archivo text-[12px] font-normal leading-[120%]  py-6">
                        {header}
                      </span>
                    )}
                    {info && (
                      <p className="text-[#171717] font-archivo text-[11px] font-normal leading-[120%] line-clamp-4 max-md:line-clamp-5 mb-6 max-w-[348px] m-0">
                        {info}
                      </p>
                    )}
                    {htmlContent && (
                      <div
                        key={index}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    )}
                  </div>
                );
              }

              case "button_link": {
                const href = unwrapValue(bprops.urlInput);
                const label = unwrapValue(bprops.textInput) || "Click Here";
                return (
                  <div
                    key={index}
                    className="text-left w-full sm:max-w-[543px]  sm:mr-auto my-8"
                  >
                    {/* Only render as a link if we actually have a URL */}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#171717] text-[#FFF] px-2 py-1 w-[230.5px] text-[11px] font-archivo font-normal cursor-not-allowed uppercase"
                      >
                        {label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="inline-block bg-[#171717] text-[#FFF] px-2 py-1 rounded-lg text-[11px] font-archivo font-normal cursor-not-allowed uppercase"
                        title="Missing URL"
                      >
                        {label}
                      </button>
                    )}
                  </div>
                );
              }

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}

export const settings = {
  label: "Ekke Logo",
  props: [
    {
      id: "header",
      label: "Page Title",
      type: "textarea",
      default: "",
      info: "Page title at top of the pages",
    },
  ],
  blocks: [
    {
      type: "Html_css", // authoring label can stay as-is
      name: "html_section",
      label: "Block with HTML/Code Editor",
      props: [
        {
          id: "htmlCodeInput",
          label: "HTML/Code Editor",
          type: "code",
          default: "",
          info: "Enter custom code or HTML.",
        },
      ],
    },
    {
      type: "gallery",
      name: "text_image",
      label: "Image with header",
      props: [
        {
          id: "Text",
          label: "Text",
          type: "text",
          default: "",
          info: "Enter text to Image.",
        },
        {
          id: "Image",
          label: "Image",
          type: "image_picker",
          default: "",
          info: "Upload or select an image.",
        },
      ],
    },
    {
      type: "description",
      name: "header_with_info",
      label: "Header with info",
      props: [
        {
          id: "headertext",
          label: "Text",
          type: "text",
          default: "",
          info: "Enter header text",
        },
        {
          id: "info",
          label: "infoSection",
          type: "textarea",
          default: "",
          info: "Enter the textarea",
        },
        {
          id: "htmlCodeDescription",
          label: "HTML/Code Editor",
          type: "code",
          default: "",
          info: "Enter custom code or HTML.",
        },
      ],
    },
    {
      type: "button_link",
      name: "button_link",
      label: "Button link",
      props: [
        {
          id: "urlInput",
          label: "URL Field",
          type: "url",
          default: "",
          info: "Enter or build a URL.",
        },
        {
          id: "textInput",
          label: "Text Field",
          type: "text",
          default: "",
          info: "Enter text into the text input.",
        },
      ],
    },
  ],
};

export default Component;
