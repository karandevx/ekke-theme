import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/product-card/product-card";
import { useFPI } from "fdk-core/utils";
import useCollectionListing from "../page-layouts/collection-listing/useCollectionListing";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";

// const externalStyles = {
//   productDescriptionContainer: "!block",
//   productImage: "max-h-[309px] md:max-h-[616px]",
//   imageContainer: "h-[309px] md:h-[616px]",
// };

export function ProductCollectionListing({
  heading,
  with_slider,
  number_of_products,
  collection_name,
}) {
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
      // {
      //   breakpoint: 1920, // Very large screens
      //   settings: {
      //     slidesToShow: 8, // Show 8 products
      //     slidesToScroll: 1,
      //   },
      // },
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
        },
      },
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

  const fpi = useFPI();
  const { fetchProducts, productList } = useCollectionListing({
    fpi,
    slug: collection_name?.value,
    props: {},
  });

  const finalProducts = useMemo(() => {
    return productList
      ?.map((p, idx) => {
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
          sizes: p.size_options ?? null,
          variants: Array.isArray(p.variants) ? p.variants : [],
          action: {
            page: { params: { slug: p.slug }, type: "product" },
            type: "page",
          },
        };
      })
      .filter(Boolean);
  });

  useEffect(() => {
    fetchProducts({
      slug: collection_name?.value,
      ...(!with_slider?.value && {
        first: number_of_products?.value,
      }),
    });
  }, []);

  return (
    <div className="w-full">
      <div>
        {/* Section Title */}
        <div className="flex items-center md:justify-normal justify-between md:gap-[123px] gap-0 md:px-4 py-4 px-[10px]">
          <p className="subheading-3">{heading?.value}</p>
          <p className="body-2 text-neutral-light">
            {String(currentSlide).padStart(2, "0")}/
            {String(productList?.length).padStart(2, "0")}
          </p>
        </div>

        {/* product slider */}
        {with_slider?.value ? (
          <div className="products-slider">
            <Slider {...sliderSettings}>
              {finalProducts?.map((product) => (
                <FDKLink to={`/product/${product.slug}`} key={product.uid}>
                  <ProductCard
                    product={product}
                    imageContainerStyle={{
                      width: "100%",
                      height: "auto",
                      aspectRatio: "240/402", // Desktop Figma: 240×402
                    }}
                    mobileImageContainerStyle={{
                      width: "100%",
                      height: "500px", // 👈 Mobile Figma height
                      aspectRatio: "auto", // Override aspect-ratio on mobile
                    }}
                  />
                </FDKLink>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-[32px] md:gap-y-0">
            {finalProducts?.map((product) => (
              <FDKLink to={`/product/${product.slug}`} key={product.uid}>
                <ProductCard
                  product={product}
                  imageContainerStyle={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "360/616",
                  }}
                  mobileImageContainerStyle={{
                    width: "100%",
                    height: "309px", // 👈 Mobile Figma height
                    aspectRatio: "auto", // Override aspect-ratio on mobile
                  }}
                />
              </FDKLink>
            ))}
          </div>
        )}
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
