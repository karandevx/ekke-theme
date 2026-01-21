import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import {
  useGlobalStore,
  useNavigate,
  useLocale,
  useGlobalTranslation,
} from "fdk-core/utils";
import { CART_COUNT } from "../../queries/headerQuery";
import {
  isRunningOnClient,
  isEmptyOrNull,
  isLocalePresent,
  getDefaultLocale,
} from "../../helper/utils";
import Search from "./search";
import HeaderDesktop from "./desktop-header";
import Navigation from "./navigation";
import useHeader from "./useHeader";
import styles from "./styles/header.less";
import fallbackLogo from "../../assets/images/logo-header.png";
import { useAccounts } from "../../helper/hooks";
import useHyperlocal from "./useHyperlocal";
import CartIcon from "../../assets/images/single-row-cart.svg";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
import "@gofynd/theme-template/components/location-modal/location-modal.css";
import { LANGUAGES } from "../../queries/languageQuery";
import I18Dropdown from "./i18n-dropdown";
import HomeNavbar from "./home-navbar";
// import CartLanding from "../../pages/cart-landing";
import CartDrawer from "../cart/cart-drawer";
import { useFPI } from "fdk-core/utils";
import { useProfileDashboardContext } from "../../contexts/ProfileDashboardContext";

const LocationModal = React.lazy(
  () =>
    import("@gofynd/theme-template/components/location-modal/location-modal")
);

function Header({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const CART_ITEMS = useGlobalStore(fpi?.getters?.CART);
  const { headerHeight = 0 } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const { first_name, last_name, profile_pic_url, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const {
    globalConfig,
    cartItemCount,
    appInfo,
    HeaderNavigation = [],
    wishlistCount,
    loggedIn,
  } = useHeader(fpi);
  const { openLogin } = useAccounts({ fpi });
  const { isMobileProfileMenuOpen, setIsMobileProfileMenuOpen } =
    useProfileDashboardContext();
  const shouldHide = location.pathname.startsWith("/payment/link/");
  const { activeLocale } = useLocale();
  const i18N_DETAILS = useGlobalStore(fpi.getters.i18N_DETAILS);
  const { supportedLanguages, isCartDrawerOpen } =
    useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
  const [languageIscCode, setLanguageIscCode] = useState([]);

  const buyNow = searchParams?.get("buy_now") || false;

  const userName =
    `${first_name ?? user?.first_name ?? ""} ${last_name ?? user?.last_name ?? ""}`.trim();

  const isListingPage = useMemo(() => {
    const regex = /^\/(products\/?|collection\/.+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const isHeaderHidden = useMemo(() => {
    const regex = /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const {
    announcement_bg_color_picker,
    announcement_text1,
    announcement_text2,
    announcement_text3,
    announcement_text_color_picker,
  } = globalConfig;

  useEffect(() => {
    if (supportedLanguages?.items?.length > 0) {
      setLanguageIscCode(supportedLanguages?.items);
    } else {
      setLanguageIscCode([]);
    }

    const i18n = i18N_DETAILS;
    if (!i18n?.language?.locale) {
      fpi.setI18nDetails({
        ...i18n,
        language: {
          ...i18n.language,
          locale: "en",
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!isRunningOnClient()) return;

    const currentLocale = i18N_DETAILS?.language?.locale;
    const validLocale = isLocalePresent(activeLocale, supportedLanguages?.items)
      ? activeLocale
      : getDefaultLocale(supportedLanguages?.items);

    if (!i18N_DETAILS || currentLocale === validLocale) return;

    fpi.setI18nDetails({
      ...i18N_DETAILS,
      language: {
        ...i18N_DETAILS.language,
        locale: validLocale || "en",
      },
    });
    window.location.reload();
  }, [activeLocale, i18N_DETAILS, supportedLanguages]);

  useEffect(() => {
    if (
      isEmptyOrNull(CART_ITEMS?.cart_items) &&
      location.pathname !== "/cart/bag/"
    ) {
      const payload = {
        includeAllItems: true,
        includeCodCharges: true,
        includeBreakup: true,
        buyNow: buyNow === "true",
      };
      fpi.executeGQL(CART_COUNT, payload);
    }

    const observers = [];

    if (isRunningOnClient()) {
      const header = document?.querySelector(".fdk-theme-header");
      if (header) {
        const resizeObserver = new ResizeObserver(() => {
          fpi.custom.setValue(
            `headerHeight`,
            header.getBoundingClientRect().height
          );
        });
        resizeObserver.observe(header);
        observers.push(resizeObserver);
      }

      if (headerRef.current) {
        const themeHeaderObserver = new ResizeObserver(() => {
          fpi.custom.setValue(
            `themeHeaderHeight`,
            headerRef.current.getBoundingClientRect().height
          );
        });
        themeHeaderObserver.observe(headerRef.current);
        observers.push(themeHeaderObserver);
      }
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    if (isRunningOnClient()) {
      setTimeout(() => {}, 1000);
      const cssVariables = {
        "--headerHeight": `${headerHeight}px`,
      };

      const styleElement = document.createElement("style");
      const variables = JSON.stringify(cssVariables)
        .replaceAll(",", ";")
        .replace(/"/g, "");
      const str = `:root, ::before, ::after${variables}`;
      styleElement.innerHTML = str;

      // Append the <style> element to the document's head
      document.head.appendChild(styleElement);

      // Clean up the <style> element on component unmount
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [headerHeight]);

  // // Open cart drawer
  // const openCart = () => {
  //   fpi.custom.setValue("isCartDrawerOpen", true);
  // };

  // // Close cart drawer
  // const closeCart = () => {
  //   fpi.custom.setValue("isCartDrawerOpen", false);
  // };

  const getShopLogoMobile = () =>
    appInfo?.mobile_logo?.secure_url?.replace("original", "resize-h:165") ||
    appInfo?.logo?.secure_url?.replace("original", "resize-h:165") ||
    fallbackLogo;

  const checkLogin = (type) => {
    if (type === "cart") {
      fpi.custom.setValue("isCartDrawerOpen", true);
      return;
    }

    if (!loggedIn) {
      openLogin();
      return;
    }

    const routes = {
      profile: "/profile/details",
      profile_mobile: "/profile/profile-tabs",
      wishlist: "/wishlist",
    };

    if (routes[type]) {
      navigate?.(routes[type]);
    }
  };

  const {
    isHyperlocal,
    isLoading,
    pincode,
    deliveryMessage,
    servicibilityError,
    isCurrentLocButton,
    isLocationModalOpen,
    handleLocationModalOpen,
    handleLocationModalClose,
    handleCurrentLocClick,
    handlePincodeSubmit,
  } = useHyperlocal(fpi);

  return (
    <>
      {!isHeaderHidden && !shouldHide && (
        <div
          className={`${styles.ctHeaderWrapper} fontBody ${isListingPage ? styles.listing : ""}`}
          ref={headerRef}
        >
          {(announcement_text1 || announcement_text2 || announcement_text2) && (
            <div
              className={`announcementBarBody ${styles.announcementContainer}`}
              style={{
                background: announcement_bg_color_picker,
                color: announcement_text_color_picker,
              }}
            >
              {announcement_text1 && (
                <div className={styles.announcenetText}>
                  {announcement_text1}
                </div>
              )}
              {announcement_text2 && (
                <div className={styles.announcenetText}>
                  {announcement_text2}
                </div>
              )}
              {announcement_text2 && (
                <div className={styles.announcenetText}>
                  {announcement_text3}
                </div>
              )}
            </div>
          )}

          <header
            className={`${styles.header} ${globalConfig?.header_border ? styles.seperator : ""}`}
          >
            <div
              className={`${styles.headerContainer} basePageContainer margin0auto `}
            >
              <div className={styles.desktop}>
                <HomeNavbar
                  navigationList={HeaderNavigation}
                  checkLogin={checkLogin}
                  cartItemCount={cartItemCount}
                  wishlistCount={wishlistCount}
                  loggedIn={loggedIn}
                  globalConfig={globalConfig}
                  fpi={fpi}
                  languageIscCode={languageIscCode}
                  profileUserName={userName}
                  isMobileProfileMenuOpen={isMobileProfileMenuOpen}
                  setIsMobileProfileMenuOpen={setIsMobileProfileMenuOpen}
                />
              </div>
            </div>
          </header>
        </div>
      )}
      {isLocationModalOpen && !shouldHide && (
        <Suspense fallback={<div />}>
          <LocationModal
            isOpen={isLocationModalOpen}
            pincode={pincode}
            error={servicibilityError}
            isLocationButton={isCurrentLocButton}
            onClose={handleLocationModalClose}
            onSubmit={handlePincodeSubmit}
            onCurrentLocationClick={handleCurrentLocClick}
          />
        </Suspense>
      )}
      {isCartDrawerOpen && (
        <CartDrawer
          isOpen={isCartDrawerOpen}
          fpi={fpi}
          onClose={() => fpi.custom.setValue("isCartDrawerOpen", false)}
        />
      )}
    </>
  );
}

export default Header;
