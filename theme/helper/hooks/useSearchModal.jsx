async function addToCart(e) {
  e.preventDefault();

  

  let sellerId, storeId;

  if (!productPriceBySlug?.seller?.uid || !productPriceBySlug?.store?.uid) {
    try {
      const productPriceResponse = await fpi.executeGQL(PRODUCT_SIZE_PRICE, {
        slug: product?.slug,
        size: product?.sizes?.size_details?.[0]?.value,
        pincode: "",
      });

      const freshProductPriceData = productPriceResponse?.data?.productPrice;

      if (
        !freshProductPriceData?.seller?.uid ||
        !freshProductPriceData?.store?.uid
      ) {
        Sentry.captureException("PLP page exception. " + product?.item_code);
        showSnackbar(
          "Unable to add product to cart. Please try again later.",
          "error"
        );
        return;
      }

      sellerId = freshProductPriceData.seller.uid;
      storeId = freshProductPriceData.store.uid;
    } catch (error) {
      console.log("Error fetching product price:", error);
      showSnackbar(
        "Unable to fetch product price. Please try again later.",
        "error"
      );
      return;
    }
  } else {
    sellerId = productPriceBySlug.seller.uid;
    storeId = productPriceBySlug.store.uid;
  }

  const payload = {
    addCartRequestInput: {
      items: [
        {
          item_id: product?.uid,
          item_size: product?.sizes?.size_details?.[0]?.value,
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
      showSnackbar(
        "Product added successfully" || data?.addItemsToCart?.message,
        "success"
      );
      fpi.custom.setValue("showMiniCart", true);
      // fpi.executeGQL(FETCH_CARTCOUNT_QUERY).then(
      //   (res) => {
      //     console.log("cart count res", res);
      //   }
      // );
      fireCustomGtmEvent("cart.customAdd", {
        responseData: data?.addItemsToCart?.cart,
        productDetails: product,
      });
    } else {
      throw new Error(
        data?.addItemsToCart?.message || "Failed to add product to cart"
      );
    }
  } catch (error) {
    console.error("Failed to add product to cart", error);
    showSnackbar(error?.message || "Failed to add product to cart", "error");
  }
}
