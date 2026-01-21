import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useMobile } from "../../helper/hooks";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";
import { useLocation } from "react-router-dom";

export const ProductDetailsZoom = ({
  productData,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [textColor, setTextColor] = useState("#000000");
  const [mutedTextColor, setMutedTextColor] = useState("#aaaaaa");
  // const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);
  const sectionRef = useRef(null);
  const lastScrollY = useRef(0);
  const imageRefs = useRef([]); // Refs for each image in the gallery
  const isMobile = useMobile();
  const { hasAnnouncementBar } = useCheckAnnouncementBar();
  const location = useLocation();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setCurrentImageIndex(0);
  };

  // Close zoom modal when location changes (browser back/forward)
  useEffect(() => {
    if (isOpen) {
      handleClose();
    }
  }, [location.pathname]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset to first image
      setCurrentImageIndex(0);

      // Reset scroll position with a small delay to ensure DOM is ready
      setTimeout(() => {
        const modalContainer = document.querySelector(".fixed.inset-0.z-30");
        if (modalContainer) {
          modalContainer.scrollTop = 0;
        }

        // Also reset section scroll if it exists
        if (sectionRef.current) {
          sectionRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);

      // Lock body scroll when zoom is open (desktop only)
      if (!isMobile) {
        const scrollY = window.scrollY;
        const bodyElement = document.body;
        const htmlElement = document.documentElement;

        // Save scroll position and lock body
        bodyElement.style.position = "fixed";
        bodyElement.style.top = `-${scrollY}px`;
        bodyElement.style.left = "0";
        bodyElement.style.right = "0";
        bodyElement.style.width = "100%";
        htmlElement.style.overflow = "hidden";
        bodyElement.style.overflow = "hidden";

        // Store scroll position for restoration
        bodyElement.dataset.scrollY = scrollY;
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore body scroll when zoom closes (desktop only)
      if (!isMobile) {
        const bodyElement = document.body;
        const htmlElement = document.documentElement;
        const scrollY = bodyElement.dataset.scrollY || "0";

        // Restore styles
        bodyElement.style.position = "";
        bodyElement.style.top = "";
        bodyElement.style.left = "";
        bodyElement.style.right = "";
        bodyElement.style.width = "";
        htmlElement.style.overflow = "";
        bodyElement.style.overflow = "";

        // Restore scroll position
        window.scrollTo(0, parseInt(scrollY));

        // Clean up data attribute
        delete bodyElement.dataset.scrollY;
      }
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;

      // Use the modal container scroll (your current structure)
      const modalContainer = document.querySelector(".fixed.inset-0.z-30");
      if (!modalContainer) return;

      const scrollY = modalContainer.scrollTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const modalHeight = modalContainer.clientHeight;

      // Calculate scroll progress (simplified for your layout)
      const scrollProgress = scrollY / Math.max(sectionHeight - modalHeight, 1);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

      // Calculate which image should be shown based on scroll progress
      const totalImages = productData?.media?.length || 1;
      const imageIndex = Math.floor(clampedProgress * totalImages);
      const finalIndex = Math.min(imageIndex, totalImages - 1);

      if (finalIndex !== currentImageIndex) {
        setCurrentImageIndex(finalIndex);
      }

      lastScrollY.current = scrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to modal scroll with your current selector
    const modalContainer = document.querySelector(".fixed.inset-0.z-30");
    if (modalContainer) {
      modalContainer.addEventListener("scroll", throttledScroll, {
        passive: true,
      });
    }

    return () => {
      if (modalContainer) {
        modalContainer.removeEventListener("scroll", throttledScroll);
      }
    };
  }, [isOpen, currentImageIndex, productData?.media?.length]);

  // Initialize image refs array
  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(
      0,
      productData?.media?.length || 0,
    );
  }, [productData?.media?.length]);

  // Function to handle thumbnail click and smooth scroll to image (Mobile & Desktop)
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);

    // Scroll to the specific image smoothly
    if (imageRefs.current[index]) {
      imageRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  // Check for announcement bar - must be before early return
  // useEffect(() => {
  //   // Function to check for announcement bar
  //   const checkAnnouncementBar = () => {
  //     const announcementBar = document.querySelector(".announcementBarBody");
  //     const exists = !!announcementBar;
  //     setHasAnnouncementBar(exists);
  //     return exists;
  //   };

  //   // Initial check
  //   const initialCheck = checkAnnouncementBar();

  //   // If not found initially, set up observer and fallback
  //   if (!initialCheck) {
  //     let isCleanedUp = false;

  //     // Fallback: Check again after a short delay
  //     const timeoutId = setTimeout(() => {
  //       if (!isCleanedUp) {
  //         checkAnnouncementBar();
  //       }
  //     }, 100);

  //     // MutationObserver to detect when announcement bar is added to DOM
  //     const observer = new MutationObserver(() => {
  //       if (checkAnnouncementBar()) {
  //         observer.disconnect();
  //         isCleanedUp = true;
  //       }
  //     });

  //     // Observe the body for child additions
  //     observer.observe(document.body, {
  //       childList: true,
  //       subtree: true,
  //     });

  //     // Maximum wait time: Stop observing after 2 seconds if not found
  //     const maxWaitTimeout = setTimeout(() => {
  //       if (!isCleanedUp) {
  //         observer.disconnect();
  //         isCleanedUp = true;
  //         // Announcement bar doesn't exist, keep hasAnnouncementBar as false
  //       }
  //     }, 2000);

  //     // Cleanup
  //     return () => {
  //       isCleanedUp = true;
  //       clearTimeout(timeoutId);
  //       clearTimeout(maxWaitTimeout);
  //       observer.disconnect();
  //     };
  //   }
  // }, []);

  // Calculate dynamic height based on announcement bar presence
  const dynamicHeight = hasAnnouncementBar
    ? "calc(100vh - 80px)"
    : "calc(100vh - 56px)";

  // Calculate dynamic top position for left section in zoom modal
  // Calculation: header height (56px or 80px with announcement) + top spacing (12px for no announcement, 18px with announcement)
  const leftSectionTop = hasAnnouncementBar ? "92px" : "62px"; // 80px + 18px OR 56px + 12px

  // Compute average color of current image to decide contrasting text color
  useEffect(() => {
    const images = productData?.media || [];
    const current = images[currentImageIndex];
    const src = current?.url || current;
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;

    img.onload = () => {
      try {
        // Small canvas for performance
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const width = (canvas.width = 10);
        const height = (canvas.height = 10);
        context.drawImage(img, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        let r = 0,
          g = 0,
          b = 0;
        const total = width * height;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        r /= total;
        g /= total;
        b /= total;
        // Perceived luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        // Choose contrasting colors
        if (luminance < 140) {
          setTextColor("#FFFFFF");
          setMutedTextColor("#f0f0f0");
        } else {
          setTextColor("#000000");
          setMutedTextColor("#666666");
        }
      } catch (e) {
        // Fallback to defaults
        setTextColor("#000000");
        setMutedTextColor("#aaaaaa");
      }
    };

    img.onerror = () => {
      setTextColor("#000000");
      setMutedTextColor("#aaaaaa");
    };
  }, [currentImageIndex, productData?.media]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed ${isMobile ? (hasAnnouncementBar ? "top-[80px]" : "top-[56px]") : hasAnnouncementBar ? "lg:top-[80px]" : "lg:top-[56px]"} inset-0 z-30 bg-white overflow-y-auto`}
    >
      {/* Mobile Close Button - Only visible on mobile */}
      <button
        onClick={handleClose}
        className="fixed right-0 block z-[35] lg:hidden body-1 hover:text-gray-600 transition-colors bg-transparent px-3 py-2 rounded"
      >
        CLOSE
      </button>

      <section
        ref={sectionRef}
        className="flex w-full items-start justify-between relative"
      >
        {/* Left Section - Hidden on mobile, visible on desktop */}
        <div
          className="hidden lg:flex flex-col w-[373px] items-start gap-4 pl-3 pr-0 fixed z-20"
          style={{ top: leftSectionTop }}
        >
          <div className="flex flex-col items-start justify-between relative w-full flex-1">
            <div className="flex flex-col items-start gap-4 relative w-full">
              <header className="flex flex-col items-start gap-3 relative w-full">
                <div className="flex flex-col items-start gap-2 w-full relative">
                  <p
                    className="font-road-radio subheading-1"
                    style={{ color: textColor }}
                  >
                    {productData?.brand?.name || "BRAND/DESIGNER NAME"}
                  </p>
                  <p className="body-3" style={{ color: mutedTextColor }}>
                    {productData?.name || "Product Name"}
                  </p>
                  <p
                    dangerouslySetInnerHTML={{
                      __html:
                        productData?.description ||
                        "Skirt features a wrap-around construction with a front slit. Crafted from cotton with a treatment finish, detailed with an Acne Studios Stockholm 1996 logo patch and back pleat detail at the back. Cut to a regular fit and below the knee length.",
                    }}
                    className="body-3"
                    style={{ color: mutedTextColor }}
                  />
                </div>

                <div className="inline-flex items-center justify-center gap-2 relative flex-[0_0_auto] mb-4">
                  <span
                    className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-xs tracking-[0] leading-[14.4px] whitespace-nowrap"
                    style={{ color: textColor }}
                  >
                    {productData?.sizes?.price?.effective?.currency_symbol}{" "}
                    {productData?.sizes?.price?.effective?.min}
                  </span>

                  {productData?.sizes?.price?.marked?.min !==
                    productData?.sizes?.price?.effective?.min && (
                    <span
                      className="relative w-fit mt-[-1.00px] [font-family:'Archivo',Helvetica] font-normal text-xs tracking-[0] leading-[14.4px] line-through whitespace-nowrap"
                      style={{ color: mutedTextColor, opacity: 0.7 }}
                    >
                      {productData?.sizes?.price?.marked?.currency_symbol}{" "}
                      {productData?.sizes?.price?.marked?.min}
                    </span>
                  )}
                </div>
              </header>
            </div>
          </div>
        </div>

        {/* Middle Section - Full width on mobile, desktop layout preserved */}
        <div
          className="flex flex-col w-full items-center relative hover:cursor-zoom-out"
          onClick={handleClose}
        >
          <div className="flex flex-col items-center gap-0 relative w-full">
            {(productData?.media || productImages).map((image, index) => (
              <div
                key={image.id || index}
                ref={(el) => (imageRefs.current[index] = el)}
                className={`w-full relative overflow-hidden transition-opacity duration-500`}
                style={
                  isMobile
                    ? {
                        height: dynamicHeight,
                      }
                    : {}
                }
              >
                <img
                  src={image.url || image}
                  alt={image.alt || `Product view ${index + 1}`}
                  className="w-full h-full object-cover lg:object-contain object-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Mobile thumbnails + Desktop layout */}
        <div className="flex flex-col w-[60px] lg:w-[373px] items-end pl-0 lg:pr-3 lg:py-3 lg:pb-0 fixed top-0 h-screen right-0">
          <div className="flex flex-col justify-between items-start relative self-stretch w-full flex-1">
            {/* Desktop Close Button */}
            <div className="flex justify-end w-full mb-4 md:pr-2">
              <button
                onClick={handleClose}
                className="body-1 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer pr-2"
              >
                CLOSE
              </button>
            </div>

            {/* Thumbnails - Responsive sizing with scroll */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .zoom-thumbnail-scroll::-webkit-scrollbar {
                  width: 4px;
                }
                .zoom-thumbnail-scroll::-webkit-scrollbar-track {
                  background: transparent;
                }
                .zoom-thumbnail-scroll::-webkit-scrollbar-thumb {
                  background: #000000;
                  border-radius: 2px;
                }
                .zoom-thumbnail-scroll::-webkit-scrollbar-thumb:hover {
                  background: #333333;
                }
                .zoom-thumbnail-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: #000000 transparent;
                }
              `,
              }}
            />
            <div className="zoom-thumbnail-scroll flex flex-col w-full lg:w-[361px] items-end absolute bottom-0 overflow-y-auto h-[400px] ">
              {productData?.media?.map((image, index) => (
                <div
                  key={index}
                  className={`w-[50px] h-[60px] lg:w-[90.25px] lg:h-[103.72px] relative cursor-pointer overflow-hidden flex-shrink-0`}
                  onClick={() => handleThumbnailClick(index)}
                  style={{
                    borderRight:
                      index === currentImageIndex
                        ? "2px solid #000"
                        : "2px solid #aaaaaa",
                    backgroundColor: "white",
                  }}
                >
                  <img
                    src={image.url || image}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    className={`w-full object-cover transition-opacity duration-200 h-full lg:h-[103px] bg-white ${
                      index === currentImageIndex
                        ? "bg-white opacity-60"
                        : "bg-white opacity-100"
                    }`}
                  />
                  {index === currentImageIndex && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-neutral-900 rounded-[1px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Fixed Bottom Buttons - Hidden on Desktop */}
        {/* <div className="lg:hidden flex items-center gap-2 px-2 py-3 bg-ekke-bg fixed bottom-0 left-0 right-0 z-10">
          <button
            className="flex-1 bg-[#000] cursor-pointer pl-1 py-2 text-left"
            onClick={(e) => {
              if (productData?.attributes?.is_available === false) {
                // Handle notify me logic
                onClose();
              } else {
                onAddToCart && onAddToCart(e);
              }
            }}
          >
            <span className="body-1" style={{ color: "#fff" }}>
              {productData?.attributes?.is_available === false
                ? "NOTIFY ME WHEN ONLINE"
                : "ADD TO BAG"}
            </span>
          </button>

          <button className="w-[72px] cursor-pointer" onClick={onAddToWishlist}>
            <SvgWrapper svgSrc={"mobile-card-wishlist"} />
          </button>
        </div> */}
      </section>
    </div>
  );
};
