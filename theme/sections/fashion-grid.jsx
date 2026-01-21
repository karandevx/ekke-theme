import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";

// Import slick-carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../components/product-card/product-card";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../queries/plpQuery";

// Mock image URLs - replace with actual image imports
// const fashionModel1 =
//   "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400";
// const fashionModel2 =
//   "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400";
// const fashionModel3 =
//   "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400";
// const fashionModel4 =
//   "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d0?w=400";
// const fashionModel5 =
//   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";
// const heroFashionPortrait =
//   "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800";

// Complete product data structure
// const productData = [
//   {
//     id: 1,
//     image: fashionModel1,
//     heroImage: fashionModel1,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "add-to-cart",
//   },
//   {
//     id: 2,
//     image: fashionModel2,
//     heroImage: fashionModel2,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "add-to-cart",
//   },
//   {
//     id: 3,
//     image: fashionModel3,
//     heroImage: fashionModel3,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "sold-out",
//   },
//   {
//     id: 4,
//     image: fashionModel4,
//     heroImage: fashionModel4,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "quick-add",
//   },
//   {
//     id: 5,
//     image: fashionModel5,
//     heroImage: fashionModel5,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "quick-add",
//   },
//   {
//     id: 6,
//     image: heroFashionPortrait,
//     heroImage: heroFashionPortrait,
//     brand: "BRAND/DESIGNER NAME",
//     name: "Product detail info",
//     price: "888€",
//     status: "add-to-cart",
//   },
// ];

const productCardExternalStyles = {
  productDescriptionContainer: "!bg-ekke-bg",
  productDescription: "!ml-0 md:space-y-2 space-y-2 !pt-[5px]",
  productName: "!pl-0",
  productPrice: "!pl-0",
};

const Component = ({ props, globalConfig, blocks }) => {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState([]);

  // Separate refs for desktop and mobile sliders
  const desktopSliderRef = useRef(null);
  const mobileSliderRef = useRef(null);

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

  const heroImages =
    allProducts?.length > 0
      ? allProducts?.map((product) => product?.media?.[0]?.url)
      : [];

  // Call it when blocks are ready
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const handleNext = () => {
    if (desktopSliderRef.current) {
      desktopSliderRef.current.slickNext();
    }
    if (mobileSliderRef.current) {
      mobileSliderRef.current.slickNext();
    }
  };

  const handlePrevious = () => {
    if (desktopSliderRef.current) {
      desktopSliderRef.current.slickPrev();
    }
    if (mobileSliderRef.current) {
      mobileSliderRef.current.slickPrev();
    }
  };

  return (
    <div className="min-h-screen bg-ekke-bg">
      {/* Navigation */}
      <nav className="lg:flex hidden justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <span className="body-1">INDEX</span>
        </div>
        <div className="flex items-center space-x-6">
          <p className="body-1 !text-[#aaaaaa]">
            {String(currentSlide + 1).padStart(2, "0")}/
            {String(heroImages.length).padStart(2, "0")}
          </p>
          <button
            onClick={handlePrevious}
            className="body-1 hover:text-gray-600"
          >
            PREVIOUS
          </button>
          <button onClick={handleNext} className="body-1 hover:text-gray-600">
            NEXT
          </button>
        </div>
        <div className="flex items-center">
          <span className="body-1">SORT BY</span>
        </div>
      </nav>

      {/* MOBILE Navigation */}
      <nav className="lg:hidden flex flex-col bg-white">
        <div
          className="flex items-center justify-between p-4"
          style={{
            border: "1px solid #eeeeee",
          }}
        >
          <div className="flex items-center gap-4">
            <p className="body-1 !text-[#aaaaaa]">
              {String(currentSlide + 1).padStart(2, "0")}/
              {String(heroImages.length).padStart(2, "0")}
            </p>
            <button
              onClick={handlePrevious}
              className="body-1 hover:text-gray-600"
            >
              PREVIOUS
            </button>
            <button onClick={handleNext} className="body-1 hover:text-gray-600">
              NEXT
            </button>
          </div>
          <span className="body-1">INDEX</span>
        </div>

        <div className="flex items-center justify-end p-4">
          <span className="body-1">SORT BY</span>
        </div>
      </nav>

      {/* Desktop Layout */}
      <div
        className={`hidden lg:flex ${props?.hero_side?.value === "right" ? "flex-row" : "flex-row-reverse"} h-[1055px] gap-[10px] !px-[10px] bg-ekke-bg`}
      >
        {/* Left Side - Product Grid (50% width) */}
        <div className="w-1/2 flex flex-col">
          {/* 3x2 Grid for 6 products */}
          <div className="grid grid-cols-3 grid-rows-2 h-full">
            {allProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                externalStyles={productCardExternalStyles}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Hero Image Slider (50% width) */}
        <div className="w-1/2 relative h-[1055px]">
          <Slider {...sliderSettings} ref={desktopSliderRef} className="h-full">
            {heroImages.map((image, index) => (
              <div key={index} className="h-full">
                <div className="h-[1055px] relative">
                  <img
                    src={image}
                    alt={`Fashion hero ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col p-[10px]">
        {/* Hero Image Slider - Full width on top */}
        <div>
          <Slider {...sliderSettings} ref={mobileSliderRef} className="h-full">
            {heroImages?.map((image, index) => (
              <div key={index} className="h-full">
                <div>
                  <img
                    src={image}
                    alt={`Fashion hero ${index + 1}`}
                    className="w-full h-[600px] object-cover"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Product Grid - 2 columns, 3 rows */}
        <div>
          <div className="grid grid-cols-2 md:gap-y-[10px] lg:gap-y-0">
            {allProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                externalStyles={productCardExternalStyles}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component;

// Section Settings Configuration
export const settings = {
  label: "Fashion Grid",
  props: [
    {
      type: "select",
      id: "hero_side",
      label: "Hero Image Position (Desktop)",
      info: "Choose whether the hero appears on the left or right on desktop.",
      options: [
        { text: "Right", value: "right" },
        { text: "Left", value: "left" },
      ],
      default: "right",
    },
  ],
  blocks: [
    {
      label: "Fashion Grid Slider",
      name: "Brand product",
      props: [
        {
          type: "product",
          id: "product",
          label: "Select Product",
          info: "Choose first product to display in the carousel",
        },
      ],
    },
  ],
};
