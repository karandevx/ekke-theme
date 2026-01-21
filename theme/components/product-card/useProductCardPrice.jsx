import { useState, useEffect, useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { PRODUCT_SIZE_PRICE } from "../../queries/pdpQuery";

/**
 * Custom hook to fetch product price data for product cards
 * Similar to how PDP fetches price but optimized for card display
 */
const useProductCardPrice = ({ fpi, product, selectedSize = null }) => {
  const [priceData, setPriceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const locationPincode = locationDetails?.pincode || "";

  // Determine which size to use for price fetching
  const sizeForPrice = useMemo(() => {
    if (selectedSize) return selectedSize;

    // If no specific size selected, try to use the first available size
    const availableSizes = product?.sizes?.sizes;
    if (availableSizes?.length > 0) {
      // Prefer sizes that are in stock
      const inStockSize = availableSizes.find((size) => size.quantity > 0);
      return inStockSize?.value || availableSizes[0]?.value;
    }

    return null;
  }, [selectedSize, product?.sizes?.sizes]);

  const fetchProductPrice = async (size, pincode) => {
    if (!product?.slug || !size || !fpi) {
      console.log(": Missing required data", {
        slug: product?.slug,
        size,
        hasFpi: !!fpi,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        slug: product.slug,
        size: size.toString(),
        pincode: pincode.toString() || "",
      };

      const response = await fpi.executeGQL(PRODUCT_SIZE_PRICE, payload);

      if (response?.data?.productPrice) {
        setPriceData(response.data.productPrice);
      } else if (response?.errors) {
        console.warn(
          "ProductCardPrice: API returned errors for",
          product.name,
          response.errors
        );
        setError(response.errors[0]?.message || "Failed to fetch price");
      } else {
        console.warn(
          "ProductCardPrice: No price data returned for",
          product.name
        );
        setError("No price data available");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch price");
      console.error(
        "ProductCardPrice: Error fetching price for",
        product.name,
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch price when dependencies change
  useEffect(() => {
    if (sizeForPrice && product?.slug) {
      fetchProductPrice(sizeForPrice, locationPincode);
    }
  }, [sizeForPrice, product?.slug, locationPincode]);

  // Memoized price getters similar to PDP
  const getPrice = useMemo(() => {
    return (key) => {
      if (!priceData?.price) return null;

      const price = priceData.price[key];
      return {
        amount: price,
        currency_symbol: priceData.price.currency_symbol,
        currency_code: priceData.price.currency_code,
      };
    };
  }, [priceData]);

  const hasDiscount = useMemo(() => {
    if (!priceData?.price) return false;
    return priceData.price.effective !== priceData.price.marked;
  }, [priceData]);

  return {
    priceData,
    isLoading,
    error,
    getPrice,
    hasDiscount,
    discount: priceData?.discount || null,
    isInStock: priceData?.quantity > 0,
    quantity: priceData?.quantity || 0,
    refetchPrice: () => {
      if (sizeForPrice) {
        fetchProductPrice(sizeForPrice, locationPincode);
      }
    },
  };
};

export default useProductCardPrice;
