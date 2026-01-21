import React, { useEffect } from "react";
import { useGlobalStore, useNavigate } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { useThemeConfig } from "../helper/hooks";
import CartLandingSection from "../sections/cart-landing";
import PageNotFound from "../components/page-not-found/page-not-found";

function CartPage({ fpi, handleClose }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  // console.log("page", page);
  const navigate = useNavigate();
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  useEffect(() => {
    if (globalConfig?.disable_cart) {
      navigate("/");
    }
  }, [globalConfig]);

  return (
    // page?.value === "cart-landing" && (
    <>
      {/* <CartLandingSection blocks={sections} handleClose={handleClose} /> */}
      <PageNotFound title={"Not Found"} />
    </>
    // )
  );
}

export const settings = JSON.stringify({
  props: [],
});

// CartPage.authGuard = isLoggedIn;
export const sections = JSON.stringify([
  {
    attributes: {
      page: "cart-landing",
    },
  },
]);

export default CartPage;
