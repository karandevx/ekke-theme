import React from "react";
import { useFPI } from "fdk-core/utils";
import AboutUsSection from "../components/about-us/about-us";

export function Component({ props, blocks }) {
  const fpi = useFPI();

  return <AboutUsSection props={props} blocks={blocks} />;
}

export const settings = {
  label: "About / Tabbed Content",
  props: [
    {
      id: "header",
      label: "Breadcrumb title",
      type: "text",
      default: "",
      info: "Page title at top of the pages",
    },
  ],
  blocks: [
    {
      name: "Html Section", // Added name property
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
  ],
};

export default Component;
