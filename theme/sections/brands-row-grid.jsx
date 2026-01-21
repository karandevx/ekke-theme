import React, { useEffect, useState } from "react";
import { useFPI } from "fdk-core/utils";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../queries/plpQuery";
import ProductCardV1 from "../components/product-card-v1/product-card-v1";
import styles from "../styles/brands-row-grid.less";
import { FDKLink } from "fdk-core/components";

export function Component({ props, blocks }) {
  const fpi = useFPI();
  const [allProducts, setAllProducts] = useState([]);
  const {
    heading,
    description,
    right_image1,
    right_image1_text,
    right_image_1_url,
    right_image2,
    right_image2_text,
    right_image_2_url,
    left_banner_image,
    left_banner_text,
    right_image_url,
    banner_description,
  } = props;

  const fetchAllProducts = async () => {
    // 1) Collect unique slugs in order of appearance
    const slugs = [];
    (blocks || []).forEach((b) => {
      const s1 = b?.props?.product?.value;
      if (s1 && !slugs.includes(s1)) slugs.push(s1);
    });

    if (!slugs.length) {
      setAllProducts([]);
      return [];
    }

    // 2) Fetch all products (don't fail everything if one slug errors)
    const results = await Promise.allSettled(
      slugs.map((slug) =>
        fpi.executeGQL(GET_QUICK_VIEW_PRODUCT_DETAILS, { slug })
      )
    );

    // 3) Normalize to the exact object shape requested
    const products = results
      .map((res, idx) => {
        if (res.status !== "fulfilled") {
          return null;
        }
        const p = res.value?.data?.product;
        if (!p) return null;

        return {
          uid: p.uid,
          slug: p.slug,
          name: p.name,
          media: Array.isArray(p.media)
            ? p.media.map((m) => ({
                alt: m?.alt ?? "",
                meta: m?.meta ?? null,
                type: m?.type ?? "image",
                url: m?.url || m?.preview || m?.src || "",
              }))
            : [],
          price: p.price ?? null,
          discount: p.discount ?? null,
          brand: p.brand ? { name: p.brand.name, uid: p.brand.uid } : null,
          sizes: p.sizes?.sizes ?? null,
          variants: Array.isArray(p.variants) ? p.variants : [],
          action: {
            page: { params: { slug: p.slug }, type: "product" },
            type: "page",
          },
        };
      })
      .filter(Boolean);

    setAllProducts(products);
  };

  useEffect(() => {
    fetchAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run on mount

  return (
    <div className={styles.brandsRowGridSection}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <p className={styles.heading}>{heading?.value}</p>
        <p className={styles.description}>{description?.value}</p>
      </div>

      <div className={styles.bannerContiner}>
        <div className={styles.rightImagesContainer}>
          {right_image1?.value && (
            <div className="relative group overflow-hidden">
              <img
                src={right_image1.value}
                alt="Right Image 1"
                className="relative aspect-[9/16] h-[306.667px] md:h-[617.778px] 2xl:h-full object-cover  "
              />
              {right_image1_text?.value && (
                <div className="absolute top-1/2 bg-white transition-all duration-300 flex items-center justify-center w-full opacity-0 group-hover:opacity-100 max-h-6">
                  <p className=" text-[11px]  font-normal px-2 py-1 text-center  group-hover:translate-y-0 uppercase">
                    {right_image1_text.value}
                  </p>
                </div>
              )}
              {right_image_1_url?.value && (
                <FDKLink
                  to={right_image_1_url.value}
                  className="absolute inset-0 z-10"
                />
              )}
            </div>
          )}
          {right_image2?.value && (
            <div className="relative group overflow-hidden">
              <img
                src={right_image2.value}
                alt="Right Image 2"
                className="relative aspect-[9/16] h-[306.667px] md:h-[617.778px] 2xl:h-full object-cover "
              />
              {right_image2_text?.value && (
                <div className="absolute top-1/2 bg-white transition-all duration-300 flex items-center justify-center w-full opacity-0 group-hover:opacity-100 max-h-6">
                  <p className=" text-[11px]  font-normal px-2 py-1 text-center  group-hover:translate-y-0 uppercase">
                    {right_image2_text.value}
                  </p>
                </div>
              )}
              {right_image_2_url?.value && (
                <FDKLink
                  to={right_image_2_url.value}
                  className="absolute inset-0 z-10"
                />
              )}
            </div>
          )}
        </div>
        <div className={styles.leftBannerContainer}>
          {left_banner_image?.value && (
            <div className="relative group overflow-hidden h-[600px] md:h-[1031.852px] 2xl:h-full">
              <img
                src={left_banner_image.value}
                alt="Left Banner Image"
                className=" relative w-full aspect-[9/16] object-cover"
              />
              {left_banner_text?.value && (
                <div className="absolute top-1/2 bg-white transition-all duration-300 flex items-center justify-center w-full opacity-0 group-hover:opacity-100 max-h-6">
                  <p className=" text-[11px]  font-normal px-2 py-1 text-center  group-hover:translate-y-0 uppercase">
                    {left_banner_text.value}
                  </p>
                </div>
              )}
              {right_image_url?.value && (
                <FDKLink
                  to={right_image_url.value}
                  className="absolute inset-0 z-10"
                ></FDKLink>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.bannerDescription}>
        {banner_description?.value}
      </div>

      {/* Product Slider */}
      <div className="grid grid-cols-1 md:grid-cols-3 px-[10px]  md:px-[15px] md:py-[10px] gap-[10px] ">
        {allProducts?.map((product) => (
          <div key={product.uid}>
            <ProductCardV1 product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Brand Row Grid",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "Title",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      label: "Description",
    },
    {
      type: "image_picker",
      id: "right_image1",
      label: "Right Image 1",
      default: "",
    },
    {
      type: "text",
      id: "right_image1_text",
      label: "Right Image 1 Text",
      default: "",
    },
    {
      type: "url",
      id: "right_image_1_url",
      label: "Right Image 1 URL",
      default: "",
    },
    {
      type: "image_picker",
      id: "right_image2",
      label: "Right Image 2",
      default: "",
    },
    {
      type: "text",
      id: "right_image2_text",
      label: "Right Image 2 Text",
      default: "",
    },
    {
      type: "url",
      id: "right_image_2_url",
      label: "Right Image 2 URL",
      default: "",
    },
    {
      type: "image_picker",
      id: "left_banner_image",
      label: "Left Banner Image",
      default: "",
    },
    {
      type: "text",
      id: "left_banner_text",
      label: "Left Banner Text",
      default: "",
    },
    {
      type: "url",
      id: "right_image_url",
      label: "Left Banner URL",
      default: "",
    },
    {
      type: "textarea",
      id: "banner_description",
      default: "",
      label: "Description",
    },
  ],
  blocks: [
    {
      type: "Product",
      props: [
        {
          type: "product",
          id: "product",
          label: "Select Product",
          info: "Choose product to display in the carousel",
        },
      ],
    },
  ],
};

export default Component;
