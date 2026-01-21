import React from "react";
import { ProductSideDetails } from "../components/product-detail-page/product-side-details";
import { ProductCollectionListing } from "./product-collection-listing";
// import styles from "../styles/sections/info-text.less";

export function Component({ props, blocks, globalConfig }) {
  // const { subtitle, content, text_alignment, background_color, text_color } =
  //   props;

  // // Don't render if no content
  // if (!content?.value) {
  //   return null;
  // }

  // const sectionStyles = {
  //   backgroundColor: background_color?.value || "transparent",
  //   textAlign: text_alignment?.value || "left",
  //   color: text_color?.value || "#000",
  // };

  return (
    <section>
      <ProductSideDetails />
      {blocks?.map((block, index) => {
        return (
          <ProductCollectionListing
            key={`${block?.name}-${block?.uid || index}`}
            {...block?.props}
          />
        );
      })}
    </section>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Product Details Info",
  props: [],
  blocks: [
    {
      label: "Collection",
      type: "gallery",
      props: [
        {
          type: "text",
          id: "heading",
          default: "",
          label: "Title",
        },
        {
          type: "collection",
          id: "collection_name",
          label: "Select Collection",
          info: "Choose a collection to display in the carousel",
        },
        {
          id: "number_of_products",
          label: "Number of Products",
          type: "range",
          default: 4,
          info: "Select a value from the range slider.",
          min: 0,
          max: 8,
          step: 1,
          unit: "",
        },
        {
          id: "with_slider",
          label: "Include Slider",
          type: "checkbox",
          default: false,
          info: "Enable or disable the slider.",
        },
      ],
    },
  ],
};

export default Component;
