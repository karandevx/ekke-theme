import React from "react";
import styles from "./product-card-v1.less";
import FyImage from "../core/fy-image/fy-image";
import { PLP_ADD_TO_CART } from "../../queries/plpQuery";
import { PRODUCT_SIZE_PRICE } from "../../queries/pdpQuery";
import { useToast } from "../custom-toaster";
import MediaDisplay from "../media-display";

const ProductCardV1 = ({ product }) => {
  const toast = useToast();
  if (!product) return null;

  const handleAddToCart = async (product) => {
    if (!product?.sizes?.[0]?.value) {
      return;
    }

    let sellerId, storeId;

    if (!product?.seller?.uid || !product?.store?.uid) {
      try {
        const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
          slug: product?.slug,
          size: product?.sizes?.[0]?.value,
          pincode: "",
        });

        const freshProductPriceData = productPriceResponse?.data?.productPrice;

        if (
          !freshProductPriceData?.seller?.uid ||
          !freshProductPriceData?.store?.uid
        ) {
          console.error("PLP page exception. " + product?.item_code);
          toast.error("Unable to add product to cart. Please try again later.");
          return;
        }

        sellerId = freshProductPriceData.seller.uid;
        storeId = freshProductPriceData.store.uid;
        console.log("Fetched sellerId and storeId:", sellerId, storeId);
      } catch (error) {
        toast.error("Unable to fetch product price. Please try again later.");
        return;
      }
    } else {
      sellerId = product.seller.uid;
      storeId = product.store.uid;
    }

    const payload = {
      addCartRequestInput: {
        items: [
          {
            item_id: product?.uid,
            item_size: product?.sizes?.[0].value,
            quantity: 1,
            seller_id: sellerId,
            store_id: storeId,
          },
        ],
      },
      buyNow: false,
    };

    try {
      const { data } = await fpi.executeGQL(PLP_ADD_TO_CART, payload);

      if (data?.addItemsToCart?.success) {
        toast.success(
          "Product added successfully" || data?.addItemsToCart?.message
        );

        setTimeout(() => {
          fpi.custom.setValue("isCartDrawerOpen", true);
        }, 2000);
      } else {
        throw new Error(
          data?.addItemsToCart?.message || "Failed to add product to cart"
        );
      }
    } catch (error) {
      console.log("Failed to add product to cart", error);
      toast.error(`${error}`);
    }
  };

  return (
    <div className={styles.productCardV1}>
      <div className={styles.productImage}>
        {product.media && product.media.length > 0 ? (
          <MediaDisplay
            src={product.media[0].url}
            alt={product.name || "Product Image"}
            className={`${styles.image}`}
            // aspectRatio={9 / 16}
          />
        ) : (
          <div className="placeholder-image">No Image Available</div>
        )}
        <button
          className={styles.AddToCart}
          onClick={() => handleAddToCart(product)}
        >
          <span>Add To Cart</span>
        </button>
      </div>
    </div>
  );
};
export default ProductCardV1;
