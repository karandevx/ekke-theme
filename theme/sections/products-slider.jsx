import React, { useEffect, useState } from "react";
import ProductCard from "../components/product-card/product-card";
import Slider from "react-slick";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../queries/plpQuery";

export function Component({ props, blocks }) {
  const { heading } = props;
  const [allProducts, setAllProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);

  // Slider settings for responsive design
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Desktop: show 6 products
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    afterChange: (currentSlide) => setCurrentSlide(currentSlide),
    responsive: [
      {
        breakpoint: 1024, // Tablet
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Mobile
        settings: {
          slidesToShow: 3, // Show 1 full + half of next product
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
        },
      },
    ],
  };

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

    // 2) Fetch all products (don’t fail everything if one slug errors)
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
          sizes: p.sizes ?? null,
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
  }, []);

  return (
    <div className="w-full">
      <div>
        {/* Section Title */}
        <div className="flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px]">
          <p className="subheading-3">{heading?.value}</p>
          <p className="body-2 text-neutral-light">
            {String(currentSlide).padStart(2, "0")}/
            {String(allProducts?.length).padStart(2, "0")}
          </p>
        </div>

        {/* Product Slider */}
        <div className="products-slider">
          <Slider {...sliderSettings}>
            {allProducts?.map((product) => (
              <div key={product.uid}>
                <ProductCard
                  product={product}
                  externalStyles={{
                    imageContainer:
                      "!h-[524px] !md:h-[426px] !max-h-[524px] !md:max-h-[426px]",
                  }}
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .products-slider .slick-prev,
        .products-slider .slick-next {
          z-index: 1;
          width: 40px;
          height: 40px;
        }

        .products-slider .slick-prev {
          left: -20px;
        }

        .products-slider .slick-next {
          right: -20px;
        }

        .products-slider .slick-prev:before,
        .products-slider .slick-next:before {
          font-size: 20px;
          color: #333;
        }

        @media (max-width: 768px) {
          .products-slider .slick-prev,
          .products-slider .slick-next {
            display: none !important;
          }
        }

        .products-slider .slick-track {
          display: flex;
          align-items: stretch;
        }

        .products-slider .slick-slide > div {
          height: 100%;
        }
      `}</style>
    </div>
  );
}

// Section Settings Configuration
export const settings = {
  label: "Product Slider",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "Title",
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
