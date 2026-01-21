import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./footer.less";
import useHeader from "../header/useHeader";
import SocialLinks from "../socail-media/socail-media";
import { useGlobalTranslation } from "fdk-core/utils";
import fallbackFooterLogo from "../../assets/images/logo-footer.png";
import { useThemeConfig } from "../../helper/hooks";
import { useRadioPlayer } from "../../contexts/RadioPlayerContext";

function Footer({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const { globalConfig, FooterNavigation, contactInfo, supportInfo } =
    useHeader(fpi);
  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};
  const { pallete } = useThemeConfig({ fpi });
  const [isMobile, setIsMobile] = useState(false);
  const { isRadioPlayerOpen, toggleRadioPlayer, isCheckoutPage } =
    useRadioPlayer();

  const isPDP = /^\/product\/[^/]+\/?$/.test(location.pathname); //

  const [openMenus, setOpenMenus] = useState({});
  const [activeParentIndex, setActiveParentIndex] = useState(null);

  const toggleMenu = (index, hasSubNav) => {
    if (!hasSubNav) return; // nothing to toggle if no list

    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(max-width: 767px)");
      setIsMobile(mq.matches);

      const handler = (e) => setIsMobile(e.matches);

      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }

      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      };
    }
  }, []);

  const logoMaxHeightMobile = globalConfig?.footer_logo_max_height_mobile || 25;
  const logoMaxHeightDesktop =
    globalConfig?.footer_logo_max_height_desktop || 36;

  const getArtWork = () => {
    if (globalConfig?.footer_image) {
      return {
        "--background-desktop": `url(${
          globalConfig?.footer_image_desktop ||
          "../../assets/images/placeholder19x6.png"
        })`,
        "--background-mobile": `url(${
          globalConfig?.footer_image_mobile ||
          "../../assets/images/placeholder4x5.png"
        })`,
        "--footer-opacity": 0.25,
        "--footer-opacity-background": `${pallete?.footer?.footer_bottom_background}40`, // The last two digits represents the opacity (0.25 is converted to hex)
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover ",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const getLogo = globalConfig?.logo
    ? globalConfig?.logo?.replace("original", "resize-h:100")
    : fallbackFooterLogo;

  const isSocialLinks = Object.values(contactInfo?.social_links ?? {}).some(
    (value) => value?.link?.trim?.()?.length > 0
  );

  function hasOne() {
    return emailArray?.length || phoneArray?.length || isSocialLinks;
  }

  const footerStyle = {
    ...getArtWork(),
    ...(isMobile && isPDP ? { paddingBottom: "54px" } : {}),
  };

  const isFooterHidden = useMemo(() => {
    const regex =
      /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$|^\/cart\/bag\/?$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  // Helper function to render navigation links
  const renderNavigationLinks = () => {
    const navLinks = [];
    for (let i = 1; i <= 11; i++) {
      const linkText = globalConfig?.[`footer_nav_link_${i}_text`];
      const linkUrl = globalConfig?.[`footer_nav_link_${i}_url`];

      if (linkText && linkText.trim()) {
        navLinks.push({
          text: linkText,
          url: linkUrl || "#",
          key: `nav-link-${i}`,
        });
      }
    }
    return navLinks;
  };
  const hasSubNavigation = useMemo(
    () =>
      Array.isArray(FooterNavigation) &&
      FooterNavigation.some(
        (item) =>
          Array.isArray(item?.sub_navigation) && item.sub_navigation.length > 0
      ),
    [FooterNavigation]
  );

  // Helper function to render footer buttons
  const renderFooterButtons = () => {
    const buttons = [];
    for (let i = 1; i <= 3; i++) {
      const showButton = globalConfig?.[`footer_show_button_${i}`];
      const buttonText = globalConfig?.[`footer_button_text_${i}`];
      const buttonUrl = globalConfig?.[`footer_button_url_${i}`];

      // If showButton setting doesn't exist (undefined), default to showing the button for backward compatibility
      // Only hide if explicitly set to false
      const shouldShow = showButton !== false;

      // Only add button if it should be shown and has text
      if (shouldShow && buttonText && buttonText.trim()) {
        buttons.push({
          text: buttonText,
          url: buttonUrl || "#",
          key: `footer-button-${i}`,
        });
      }
    }
    return buttons;
  };

  const footerButtons = renderFooterButtons();

  // whenever route changes (including subnav clicks), close the active parent
  useEffect(() => {
    setActiveParentIndex(null);
  }, [location.pathname]);

  return (
    !isFooterHidden && (
      <footer
        className={`${styles.footer} fontBody ${isPDP ? "lg:relative lg:z-20" : ""}`}
        style={footerStyle}
      >
        <>
          {/* Footer Buttons Row */}
          <div className={styles.footer__top}>
            <div className={styles.footerContainer}>
              <div className={`${styles["footer__top--wrapper"]} !block`}>
                <div className={styles["footer__top--info"]}>
                  <p className={`${styles.description} b1 ${styles.fontBody}`}>
                    {globalConfig?.footer_description}
                  </p>
                </div>
                <div className={`${styles["footer__top--menu"]}`}>
                  {FooterNavigation?.map((item, index) => {
                    const hasSubNav =
                      Array.isArray(item?.sub_navigation) &&
                      item.sub_navigation.length > 0;
                    // Only allow sub-navigation for items with "social" in display name
                    const isSocialItem = item?.display
                      ?.toLowerCase()
                      .includes("social");
                    const canShowSubNav = hasSubNav && isSocialItem;
                    const isOpen = activeParentIndex === index;

                    return (
                      <div className={styles.linkBlock} key={index}>
                        <h5
                          className={`${styles.menuTitle} ${styles.fontBody} ${canShowSubNav ? styles.menuTitleClickable : ""}`}
                          onClick={() => {
                            if (canShowSubNav) {
                              setActiveParentIndex((prev) =>
                                prev === index ? null : index
                              );
                            }
                          }}
                          role={canShowSubNav ? "button" : undefined}
                          aria-expanded={canShowSubNav ? isOpen : undefined}
                        >
                          {item?.action?.page?.type === "external" ? (
                            <a
                              href={item?.action?.page?.query?.url[0]}
                              rel="noopener noreferrer"
                              onClick={(e) =>
                                canShowSubNav && e.preventDefault()
                              }
                            >
                              {item.display}
                            </a>
                          ) : convertActionToUrl(item?.action)?.length > 0 ? (
                            <FDKLink
                              action={item?.action}
                              onClick={(e) => {
                                if (canShowSubNav) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              {item.display}
                            </FDKLink>
                          ) : (
                            <p>{item.display}</p>
                          )}
                          {/* dot BELOW the text */}
                          <span
                            className={`${styles.menuDot} ${
                              activeParentIndex === index
                                ? styles.menuDotActive
                                : ""
                            }`}
                          ></span>
                        </h5>
                      </div>
                    );
                  })}

                  {FooterNavigation?.length === 1 && (
                    <div className={styles.lineBlock} />
                  )}
                  {FooterNavigation?.length === 2 && (
                    <div className={styles.lineBlock} />
                  )}
                </div>
                {activeParentIndex !== null &&
                  FooterNavigation[activeParentIndex]?.sub_navigation?.length >
                    0 && (
                    <div className={styles.commonSubNavContainer}>
                      <ul className={styles.commonSubNavList}>
                        {FooterNavigation[activeParentIndex].sub_navigation
                          .filter((sub) => sub.active)
                          .map((subItem, idx) => (
                            <li key={idx} className={styles.commonSubNavItem}>
                              {subItem?.action?.page?.type === "external" ? (
                                <a
                                  href={subItem?.action?.page?.query?.url[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {subItem.display}
                                </a>
                              ) : (
                                <FDKLink action={subItem?.action}>
                                  {subItem.display}
                                </FDKLink>
                              )}
                              {/* dot BELOW sub-nav link */}
                              <span className={styles.menuDot}></span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                {globalConfig?.footer_show_button &&
                  footerButtons.length > 0 && (
                    <div className={styles.footer__buttons}>
                      <div className={styles.footerContainer}>
                        <div className={styles.buttonLinks}>
                          {footerButtons.map((button) =>
                            button.text.toLowerCase() === "ekke radio" ? (
                              <button
                                key={button.key}
                                onClick={toggleRadioPlayer}
                                className={`${styles.footerButton} ${styles.fontBody} ${
                                  isCheckoutPage
                                    ? styles.disabled
                                    : "hover:bg-[#F7F7F5] hover:border-[#171717]" // Add hover only when NOT checkout page
                                }`}
                                style={
                                  isRadioPlayerOpen
                                    ? {
                                        backgroundColor: "#F7F7F5",
                                        border: "1px solid #171717",
                                      }
                                    : isCheckoutPage
                                      ? {
                                          opacity: 0.5,
                                          cursor: "not-allowed",
                                        }
                                      : {}
                                }
                                disabled={isCheckoutPage}
                              >
                                {button.text}
                              </button>
                            ) : (
                              <a
                                key={button.key}
                                href={button.url}
                                target={
                                  globalConfig?.footer_button_open_new_tab
                                    ? "_blank"
                                    : "_self"
                                }
                                rel={
                                  globalConfig?.footer_button_open_new_tab
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className={`${styles.footerButton} ${styles.fontBody}`}
                              >
                                {button.text}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                {getLogo?.length > 0 && (
                  <div
                    className={`fx-footer-logo ${styles.logo}`}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={globalConfig?.logo || fallbackFooterLogo}
                      loading="lazy"
                      alt={t("resource.footer.footer_logo_alt_text")}
                      fetchpriority="low"
                      style={
                        isMobile
                          ? {
                              width: "120px",
                              height: "184px",
                              maxHeight: "100%",
                              display: "block",
                            }
                          : {
                              width: "60px",
                              height: "92px",
                            }
                      }
                      onError={(e) => {
                        console.error("Logo failed to load, using fallback");
                        e.target.src = fallbackFooterLogo;
                      }}
                    />
                  </div>
                )}
              </div>
              {hasOne() && (
                <div
                  className={`${styles["footer__top--contactInfo"]} ${globalConfig?.footer_contact_background !== false ? "" : styles["footer__top--noBackground"]}`}
                >
                  {emailActive && emailArray?.length > 0 && (
                    <div className={styles.listData}>
                      {emailArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`email-${idx}`}
                        >
                          <h5
                            className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                          >
                            {item?.key}
                          </h5>
                          <a
                            href={`mailto:${item?.value}`}
                            className={`${styles.detail} b1 ${styles.fontBody}`}
                          >
                            {item?.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {phoneActive && phoneArray?.length > 0 && (
                    <div className={styles.listData}>
                      {phoneArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`phone-${idx}`}
                        >
                          <h5
                            className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                          >
                            {item?.key}
                          </h5>
                          <a
                            href={`tel:${item?.number}`}
                            className={`${styles.detail} b1 ${styles.fontBody}`}
                          >
                            {`${item?.code ? `+${item.code}-` : ""}${item?.number}`}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`${styles.list} ${styles.listSocial} `}>
                    {isSocialLinks && (
                      <>
                        <div className={`${styles.socialContainer}`}>
                          {globalConfig?.footer_social_text && (
                            <h5
                              className={`${styles.title} ${styles.socialTitle} ${styles.contacts} ${styles.fontBody}`}
                            >
                              {globalConfig?.footer_social_text}
                            </h5>
                          )}
                          <span>
                            <SocialLinks
                              social_links={contactInfo?.social_links}
                            />
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {contactInfo?.copyright_text && (
            <div className={styles.footer__bottom}>
              <div className={styles.footerContainer}>
                <div className={`${styles.copyright} b1 ${styles.fontBody}`}>
                  {contactInfo?.copyright_text}
                </div>
                {globalConfig?.payments_logo && (
                  <div className={styles.paymentLogo}>
                    <img
                      src={globalConfig?.payments_logo}
                      alt={t("resource.footer.payment_logo_alt_text")}
                      loading="lazy"
                      fetchpriority="low"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      </footer>
    )
  );
}

export default Footer;
