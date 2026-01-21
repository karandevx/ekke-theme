// Sitemap.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useFPI } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import useHeader from "../components/header/useHeader";
import styles from "../styles/sections/sitemap.less";
import useCheckAnnouncementBar from "../helper/hooks/useCheckAnnouncementBar";
import { lockBodyScroll, unlockBodyScroll } from "../helper/utils";

// Helper function to capitalize text (first letter uppercase, rest lowercase for each word)
const capitalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Transform navigation data to sitemap format
const transformNavigationToSitemap = (
  headerNavigation = [],
  footerNavigation = []
) => {
  const allSections = [];
  const allIndexItems = ["VIEW ALL"];

  // Process header navigation
  if (headerNavigation && headerNavigation.length > 0) {
    // Generate INDEX from header navigation items that have sub_navigation
    const headerIndexItems = headerNavigation
      .filter((item) => item.sub_navigation && item.sub_navigation.length > 0)
      .map((item) => item.display?.toUpperCase() || "")
      .filter(Boolean);
    allIndexItems.push(...headerIndexItems);

    // HOMEPAGE section - categories with sub_navigation
    const homepageGroups = headerNavigation
      .filter((item) => item.sub_navigation && item.sub_navigation.length > 0)
      .map((category) => {
        // Get active sub_navigation sections (these become columns)
        const subNavSections = category.sub_navigation
          .filter((item) => item.active)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        // Transform sub_navigation sections into columns
        const columns = subNavSections
          .map((section) => {
            // Get links from section's sub_navigation (nested items)
            let links = [];

            if (section.sub_navigation && section.sub_navigation.length > 0) {
              // If section has nested sub_navigation, use those as links
              links = section.sub_navigation
                .filter((item) => item.active)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((item) => ({
                  text: item.display || "",
                  action: item.action,
                }));
            } else if (section.display) {
              // If no nested sub_navigation, use section itself as a link
              links = [{ text: section.display, action: section.action }];
            }

            return {
              label: section.display?.toUpperCase() || "CATEGORY",
              links: links.map((link) => link.text).filter(Boolean),
              linkActions: links.map((link) => link.action).filter(Boolean),
            };
          })
          .filter((col) => col.links.length > 0); // Only include columns with links

        return {
          title: category.display?.toUpperCase() || "",
          columns: columns,
        };
      })
      .filter((group) => group.columns.length > 0);

    if (homepageGroups.length > 0) {
      allSections.push({
        heading: "HOMEPAGE",
        groups: homepageGroups,
      });
    }
  }

  // Process footer navigation - same structure as header navigation
  if (footerNavigation && footerNavigation.length > 0) {
    // Generate INDEX from footer navigation items that have sub_navigation
    const footerIndexItems = "FOOTER";
    allIndexItems.push(footerIndexItems);

    // FOOTER section - all footer items as columns in one group (similar to EDITORIAL HUB)
    const footerColumns = footerNavigation
      .map((footerItem) => {
        const isCollab = footerItem.display?.toLowerCase().includes("collab");
        let links = [];
        let linkActions = [];

        if (footerItem.sub_navigation && footerItem.sub_navigation.length > 0) {
          // Special handling for collab: include sub_navigation items and their nested items
          if (isCollab) {
            footerItem.sub_navigation
              .filter((item) => item.active)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .forEach((section) => {
                // Add the section itself as a link if it has a display
                if (section.display) {
                  links.push(section.display);
                  linkActions.push(section.action);
                }

                // Add nested sub_navigation items as links
                if (
                  section.sub_navigation &&
                  section.sub_navigation.length > 0
                ) {
                  section.sub_navigation
                    .filter((item) => item.active)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .forEach((nestedItem) => {
                      if (nestedItem.display) {
                        links.push(nestedItem.display);
                        linkActions.push(nestedItem.action);
                      }
                    });
                }
              });
          } else {
            // Regular footer items: sub_navigation items become links
            footerItem.sub_navigation
              .filter((item) => item.active)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .forEach((subItem) => {
                if (subItem.display) {
                  links.push(subItem.display);
                  linkActions.push(subItem.action);
                }
              });
          }
        } else {
          // Footer item without sub_navigation - use itself as a link
          if (footerItem.display) {
            links.push(footerItem.display);
            linkActions.push(footerItem.action);
          }
        }

        return {
          label: footerItem.display?.toUpperCase() || "LINK",
          links: links.filter(Boolean),
          linkActions: linkActions.filter(Boolean),
        };
      })
      .filter((col) => col.links.length > 0);

    // Add footer groups to sections
    if (footerColumns.length > 0) {
      allSections.push({
        heading: "FOOTER",
        groups: [
          {
            title: "",
            columns: footerColumns,
          },
        ],
      });
    }
  }

  return { index: allIndexItems, sections: allSections };
};

export function Component({ props }) {
  const fpi = useFPI();
  const { HeaderNavigation = [], FooterNavigation = [] } = useHeader(fpi);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndexItem, setSelectedIndexItem] = useState(null); // For filtering
  const groupRefs = useRef({});

  const { index, sections } = useMemo(() => {
    return transformNavigationToSitemap(HeaderNavigation, FooterNavigation);
  }, [HeaderNavigation, FooterNavigation]);

  // Filter sections based on selected index item
  const filteredSections = useMemo(() => {
    if (!selectedIndexItem || selectedIndexItem === "VIEW ALL") {
      return sections;
    }

    // Special handling for "FOOTER" - show only the FOOTER section
    if (selectedIndexItem === "FOOTER") {
      return sections.filter((section) => section.heading === "FOOTER");
    }

    // Find sections and groups that match the selected index item
    return sections
      .map((section) => {
        // Filter groups within the section that match the selected index
        const matchingGroups = section.groups.filter((group) => {
          const groupTitle = group.title?.toUpperCase() || "";
          return groupTitle === selectedIndexItem;
        });

        // If we have matching groups, return section with only those groups
        if (matchingGroups.length > 0) {
          return {
            ...section,
            groups: matchingGroups,
          };
        }

        // Return null if no matching groups (will be filtered out)
        return null;
      })
      .filter(Boolean); // Remove null entries
  }, [sections, selectedIndexItem]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 720);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMobile && isDrawerOpen) {
      // Delay body lock slightly to allow scroll to complete
      const timeoutId = setTimeout(() => {
        lockBodyScroll();
      }, 200);
      return () => {
        clearTimeout(timeoutId);
        unlockBodyScroll();
      };
    } else {
      unlockBodyScroll();
    }

    // Cleanup: unlock on unmount
    return () => {
      unlockBodyScroll();
    };
  }, [isMobile, isDrawerOpen]);

  // Handle index click - filter and scroll to corresponding group
  const handleIndexClick = (e, indexItem, indexIndex) => {
    e.preventDefault();
    setActiveIndex(indexIndex);
    setSelectedIndexItem(indexItem);

    // Close drawer on mobile after selection
    if (isMobile) {
      setIsDrawerOpen(false);
      // Don't scroll when clicking from drawer/modal
      return;
    }

    if (indexItem === "VIEW ALL") {
      // Show all sections
      setSelectedIndexItem(null);
      // Scroll to top of content
      const contentGrid = document.querySelector(
        `.${styles["sitemap__contentGrid"]}`
      );

      return;
    }

    // Special handling for "FOOTER" - scroll to FOOTER section
    if (indexItem === "FOOTER") {
      // Find section by heading text
      const sections = document.querySelectorAll(
        `.${styles["sitemap__section"]}`
      );
      sections.forEach((section) => {
        const heading = section.querySelector(
          `.${styles["sitemap__sectionHeading"]}`
        );
      });
      return;
    }

    // Find the group with matching title and scroll to it
    const groupId = `sitemap-group-${indexItem.toLowerCase().replace(/\s+/g, "-")}`;
    const groupElement = groupRefs.current[groupId];
  };
  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "378px" : "354px";

  return (
    <div className={styles["sitemap"]} onClick={() => setIsDrawerOpen(false)}>
      <div className={styles["sitemap__topbar"]}>
        <div className={styles["sitemap__crumbs"]}>
          <span className={styles["sitemap__crumb"]}>HOME</span>
          <span className={styles["sitemap__crumbSep"]}>/</span>
          <span
            className={[
              styles["sitemap__crumb"],
              styles["sitemap__crumb--active"],
            ].join(" ")}
          >
            SITEMAP
          </span>
        </div>
        <div className={styles["sitemap__title"]}>Sitemap</div>
      </div>

      <div className={styles["sitemap__wrap"]}>
        <div className={styles["sitemap__rule"]} />

        {/* Mobile Index Button */}
        {isMobile && (
          <button
            className={styles["sitemap__mobileIndexButton"]}
            onClick={() => {
              const willOpen = !isDrawerOpen;
              if (willOpen) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => {
                  setIsDrawerOpen(true);
                }, 150);
              } else {
                setIsDrawerOpen(false);
              }
            }}
          >
            <span className={styles["sitemap__mobileIndexButtonText"]}>
              {isDrawerOpen ? "CLOSE INDEX" : "INDEX"}
            </span>
          </button>
        )}

        <div className={styles["sitemap__layout"]}>
          {/* Left index - hidden on mobile, shown in drawer */}
          <aside
            className={[
              styles["sitemap__index"],
              isMobile ? styles["sitemap__index--hidden"] : "",
            ].join(" ")}
          >
            <div className={styles["sitemap__indexTitle"]}>INDEX</div>
            <ul className={styles["sitemap__indexList"]}>
              {index.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className={[
                    styles["sitemap__indexItem"],
                    activeIndex === i ? styles["is-active"] : "",
                    activeIndex !== i ? styles["is-muted"] : "",
                  ].join(" ")}
                >
                  <a
                    href="#"
                    className={styles["sitemap__indexLink"]}
                    aria-label={item}
                    onClick={(e) => handleIndexClick(e, item, i)}
                  >
                    <span
                      className={[
                        activeIndex === i ? styles["sitemap__bullet"] : "",
                      ].join(" ")}
                    ></span>
                    <span className={styles["sitemap__indexText"]}>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right content */}
          <main className={styles["sitemap__contentGrid"]}>
            <div className={styles["sitemap__sitemap__layout"]}>
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <div
                    key={section.heading}
                    className={styles["sitemap__section"]}
                  >
                    <div className={styles["sitemap__sectionHeading"]}>
                      {section.heading}
                    </div>

                    <div
                      className={[
                        section.heading === "FOOTER"
                          ? styles["sitemap__groupsRow"]
                          : "",
                      ].join(" ")}
                    >
                      {section.groups.map((group, gi) => {
                        const groupId = group.title
                          ? `sitemap-group-${group.title.toLowerCase().replace(/\s+/g, "-")}`
                          : `sitemap-group-${section.heading.toLowerCase()}-${gi}`;

                        return (
                          <div
                            key={`${section.heading}-${gi}`}
                            id={groupId}
                            ref={(el) => {
                              if (el) {
                                groupRefs.current[groupId] = el;
                              }
                            }}
                            className={styles["sitemap__group"]}
                          >
                            {group.title && (
                              <div className={styles["sitemap__groupTitle"]}>
                                {group.title}
                              </div>
                            )}
                            <div
                              className={[
                                styles["sitemap__cols"],
                                group.compact
                                  ? styles["sitemap__cols--compact"]
                                  : "",
                              ].join(" ")}
                            >
                              {group.columns.map((col, ci) => (
                                <div
                                  key={`${gi}-${ci}`}
                                  className={styles["sitemap__col"]}
                                >
                                  <div className={styles["sitemap__colLabel"]}>
                                    {col.label}
                                  </div>
                                  <ul className={styles["sitemap__links"]}>
                                    {col.links.map((t, li) => {
                                      const linkAction = col.linkActions?.[li];
                                      return (
                                        <li
                                          key={`${ci}-${li}`}
                                          className={
                                            styles["sitemap__linkItem"]
                                          }
                                        >
                                          {linkAction ? (
                                            <FDKLink
                                              action={linkAction}
                                              className={
                                                styles["sitemap__link"]
                                              }
                                            >
                                              {capitalizeText(t)}
                                            </FDKLink>
                                          ) : (
                                            <a
                                              href="#"
                                              className={
                                                styles["sitemap__link"]
                                              }
                                            >
                                              {capitalizeText(t)}
                                            </a>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {section.heading !== "FOOTER" && (
                              <div className={styles["sitemap__groupRule"]} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles["sitemap__empty"]}>
                  No navigation data available
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          {/* Overlay */}
          {isDrawerOpen && (
            <div
              className={styles["sitemap__drawerOverlay"]}
              onClick={() => setIsDrawerOpen(false)}
              style={{
                top: topPosition,
              }}
            />
          )}

          {/* Drawer */}
          <div
            className={[
              styles["sitemap__drawer"],
              isDrawerOpen ? styles["sitemap__drawer--open"] : "",
            ].join(" ")}
            style={{
              top: topPosition,
            }}
          >
            <div className={styles["sitemap__drawerHeader"]}>
              <div className={styles["sitemap__indexTitle"]}>INDEX</div>
            </div>
            <ul className={styles["sitemap__indexList"]}>
              {index.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className={[
                    styles["sitemap__indexItem"],
                    activeIndex === i ? styles["is-active"] : "",
                    activeIndex !== i ? styles["is-muted"] : "",
                  ].join(" ")}
                >
                  <a
                    href="#"
                    className={styles["sitemap__indexLink"]}
                    aria-label={item}
                    onClick={(e) => handleIndexClick(e, item, i)}
                  >
                    <span
                      className={[
                        activeIndex === i ? styles["sitemap__bullet"] : "",
                      ].join(" ")}
                    ></span>
                    <span className={styles["sitemap__indexText"]}>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Site Map",
  props: [],
  blocks: [],
};

export default Component;
