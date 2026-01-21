import React, { useState } from "react";
import styles from "./styles/profile-wishlist.less";
import { useMobile } from "../../helper/hooks";
import useWishlistPage from "../wishlist/useWishlist";
import { useToast } from "../../components/custom-toaster";
import EkkeLogo from "../../assets/images/logo/ekke-logo";
import { FDKLink } from "fdk-core/components";
import MediaDisplay from "../../components/media-display";

export const ProfileWishlist = ({ fpi }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItemIndex, setClickedItemIndex] = useState(null);
  const isMobile = useMobile();
  const toast = useToast();
  const { loading, productList, onRemoveClick, onRemoveAllClick } =
    useWishlistPage({
      fpi,
    });

  const removeFromWishlist = (item, index) => {
    onRemoveClick({ product: item }, index);
  };

  // Empty state component matching Figma design
  const EmptyWishlistState = () => (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Empty state text */}
      <div className="mb-20 mt-10">
        <p className="body-1 text-[#171717] text-center">
          Nothing saved yet. Choose what resonates.
        </p>
      </div>

      {/* Logo/Brand placeholder - matching the geometric pattern in Figma */}
      <div className="flex items-center justify-center opacity-40 pb-[110px]">
        <EkkeLogo width="215" height="328" color="#CCCCCC" />
      </div>

      {/* Go Shopping button */}
      <FDKLink
        className="body-2 uppercase bg-[#171717] w-full !text-white hover:bg-[#333333] transition-colors duration-200 text-left py-2 pl-2 md:mr-[10px] mr-0 mb-[10px]"
        to="/products"
      >
        Explore EKKE
      </FDKLink>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-white md:px-0 px-[10px] md:py-0 py-3">
      <div className="flex flex-col w-full overflow-auto">
        <div className="flex items-center justify-between py-[7px] pr-[10px]">
          <p className="subheading-3">WISHLIST</p>
          {productList && productList.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onRemoveAllClick}
                className="body-3 text-[#171717] tracking-[var(--links-3-button-letter-spacing)] leading-[var(--links-3-button-line-height)] underline bg-transparent border-none p-0 cursor-pointer text-left"
              >
                Delete all products
              </button>
            </div>
          )}
        </div>
        {/* Show empty state only when loading is complete and no products */}
        {!loading && (!productList || productList.length === 0) ? (
          <EmptyWishlistState />
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 w-full gap-0">
            {productList?.map((item, index) => (
              <div
                key={item.id}
                className={`${"relative overflow-hidden group cursor-pointer"} ${styles.wishlist_item_container}`}
                style={{
                  width: "100%",
                  height: "157.78px",
                }}
                onMouseEnter={() => !isMobile && setHoveredItem(item.id)}
                onMouseLeave={() => !isMobile && setHoveredItem(null)}
                onClick={() => {
                  if (isMobile) {
                    setClickedItemIndex(
                      clickedItemIndex === index ? null : index
                    );
                  }
                }}
              >
                <FDKLink to={`/product/${item.slug}`}>
                  <MediaDisplay
                    src={item?.media?.[0]?.url}
                    alt={`Wishlist item ${item.id}`}
                  />
                </FDKLink>

                {/* Remove button - Click to show on mobile, hover on desktop */}
                {((!isMobile && hoveredItem === item.id) ||
                  (isMobile && clickedItemIndex === index)) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(item, index);
                    }}
                    className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-black text-xs font-bold bg-white transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 opacity-100 cursor-pointer"
                    style={{
                      fontSize: "10px",
                      lineHeight: "1",
                    }}
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
