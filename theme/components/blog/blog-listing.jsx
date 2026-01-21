import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/blog-listing.less";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import FyImage from "../../components/core/fy-image/fy-image";

import EmptyState from "../../components/empty-state/empty-state";
import InfiniteLoader from "../../components/core/infinite-loader/infinite-loader";
import Pagination from "../../page-layouts/plp/Components/pagination/pagination";
import {
  useNavigate,
  useGlobalStore,
  useFPI,
  useGlobalTranslation,
} from "fdk-core/utils";

import { isRunningOnClient, throttle } from "../../helper/utils";
import Shimmer from "../../components/shimmer/shimmer";

import useLocaleDirection from "../../helper/hooks/useLocaleDirection";

import BlogSortDrawer from "./blog-sort-modal";
import MediaDisplay from "../media-display";

function BlogList({
  blogs,
  totalBlogsList,
  sliderBlogs,
  footerProps,
  sliderProps,
  paginationProps,
  onLoadMoreProducts,
  isLoading,
  isBlogPageLoading,
  ssrSearch,
  ssrFilters,
}) {
  const { isRTL } = useLocaleDirection();
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const locale = i18nDetails?.language?.locale || "en";
  const countryCode = i18nDetails?.countryCode || "IN";
  const navigate = useNavigate();
  const location = useLocation();
  const [blogFilter, setBlogFilter] = useState(ssrFilters || []);
  const [searchText, setSearchText] = useState(ssrSearch || "");
  const [blogCount, setBlogCount] = useState(
    totalBlogsList?.page?.item_total || 0
  );
  const {
    show_top_blog,
    topViewedBlogs = [],
    show_recent_blog,
    recentBlogs = [],
  } = sliderProps;
  // local state to open/close drawer
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  const hasActiveCategoryFilters = useMemo(
    () =>
      (blogFilter || []).some((f) =>
        f.display?.toLowerCase()?.startsWith("categories-")
      ),
    [blogFilter]
  );

  const isCategoryActive = useCallback(
    (cat) => {
      // cat comes from categoryTags values: { key, display, displaytext, pretext: "tag" }
      // We match by original `display` (e.g., "categories-fashion") which is what goes into the URL
      return (blogFilter || []).some(
        (f) =>
          f.pretext === "tag" &&
          f.display?.toLowerCase() === cat.display?.toLowerCase()
      );
    },
    [blogFilter]
  );
  // responsive position: right (>=768), bottom (<768)
  const drawerPosition = windowWidth >= 768 ? "right" : "bottom";

  const onSelectDrawerTag = (tag) => {
    if (
      tag.display?.toLowerCase().startsWith("categories-") ||
      tag.displaytext
    ) {
      toggleCategoriesTagFilter(tag);
    } else {
      toggleTagFilter(tag);
    }
    // Close instantly after each click (feels snappy for “tap to apply”)
    setIsSortOpen(false);
  };

  // Reset handler in drawer
  const onResetDrawer = () => {
    resetFilters();
  };

  useEffect(() => {
    setBlogCount(totalBlogsList?.page?.item_total);
  }, [totalBlogsList]);

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    }, 500);

    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const searchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;
    const search = searchParams?.get("search");
    setSearchText(search || "");

    const tagBlogFilters = searchParams?.getAll("tag")?.map((item) => ({
      display: item,
      pretext: "tag",
      key: item?.toLowerCase(),
    }));

    setBlogFilter([...(tagBlogFilters || [])]);
  }, [location?.search]);

  // const removeFilter = (filter) => {
  //   const searchParams = isRunningOnClient()
  //     ? new URLSearchParams(location?.search)
  //     : null;
  //   searchParams?.delete("page_no");
  //   if (filter.key === "search_text") {
  //     searchParams?.delete("search", filter?.display);
  //     setSearchText("");
  //   } else {
  //     searchParams?.delete(filter?.pretext, filter?.display);
  //   }
  //   navigate?.({
  //     pathname: location?.pathname,
  //     search: searchParams?.toString(),
  //   });
  // };
  const resetFilters = () => {
    setSearchText("");
    navigate?.({
      pathname: location?.pathname,
    });
  };
  const showTags =
    typeof sliderProps?.show_tags === "boolean" || sliderProps?.show_tags === ""
      ? sliderProps?.show_tags
      : true;

  // Separate "Categories" tags and normal tags
  const getSeparatedTags = () => {
    // if (!showTags) return { categoryTags: {}, normalTags: {} };

    return (blogs?.filters?.tags || []).reduce(
      (acc, tag) => {
        tag = tag?.trim();
        if (!tag) return acc;

        const tagKey = tag.replace(/ /g, "_").toLowerCase();

        // Check if the tag starts with "Categories:"
        if (tag.toLowerCase().startsWith("categories-")) {
          const displaytext = tag.replace(/^categories-/i, "").trim();
          acc.categoryTags[tagKey] = {
            key: tagKey,
            display: tag,
            displaytext: displaytext,
            pretext: "tag",
          };
        } else if (tag.toLowerCase().startsWith("author-")) {
          const displaytext = tag.replace(/^Author-/i, "").trim();
          acc.authorTags[tagKey] = {
            key: tagKey,
            display: tag,
            displaytext: displaytext,
            pretext: "tag",
          };
        } else {
          acc.normalTags[tagKey] = {
            key: tagKey,
            display: tag,
            pretext: "tag",
          };
        }

        return acc;
      },
      { categoryTags: {}, normalTags: {}, authorTags: {} }
    );
  };
  const { categoryTags, normalTags, authorTags } = getSeparatedTags();

  const toggleTagFilter = (tag) => {
    const searchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.delete("page_no");
    if (searchParams?.has(tag?.pretext, tag?.display)) {
      searchParams?.delete(tag?.pretext, tag?.display);
    } else {
      searchParams?.append(tag?.pretext, tag?.display);
    }

    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
  };
  const toggleCategoriesTagFilter = (tag) => {
    const searchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.delete("page_no");
    if (searchParams?.has(tag?.pretext, tag?.display)) {
      searchParams?.delete(tag?.pretext, tag?.display);
    } else {
      searchParams?.append(tag?.pretext, tag?.display);
    }

    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
  };

  const renderBlogs = () => {
    return (
      <div>
        {blogs?.items?.map((blog, index) => (
          <FDKLink key={`${blog.title}_${index}`} to={`/blog/${blog.slug}`}>
            <div class={styles.article}>
              <div class={styles.imageContainer}>
                <MediaDisplay
                  src={blog?.feature_image?.secure_url}
                  alt="Fashion Article"
                />
              </div>
              <div class={styles.details}>
                <div class={styles.meta}>
                  <p>0{index + 1}</p>
                  <p>
                    {(blog?.tags ?? [])
                      .flat()
                      .find(
                        (t) => typeof t === "string" && /^categories/i.test(t)
                      )
                      ?.replace(/^categories[-:\s]*/i, "")
                      .trim() ?? ""}
                  </p>
                </div>
                <div class={styles.info}>
                  <p class={styles.articleName}>{blog.title}</p>
                  <p class={styles.year}>
                    {new Date(blog?.publish_date).getFullYear()}
                  </p>
                </div>

                <FDKLink
                  key={`${blog.title}_${index}`}
                  to={`/blog/${blog.slug}`}
                  title={blog.title}
                  className={`${styles.viewMore} `}
                >
                  <span>See More</span>
                </FDKLink>
              </div>
            </div>
          </FDKLink>
        ))}
      </div>
    );
  };
  // const searchTextUpdate = (value) => {
  //   if (value.length > 90) {
  //     value = value.substring(0, 80);
  //   }
  //   setSearchText(value);

  //   const searchParams = isRunningOnClient()
  //     ? new URLSearchParams(location?.search)
  //     : null;
  //   searchParams?.delete("page_no");
  //   if (value) {
  //     searchParams?.set("search", value);
  //   } else {
  //     searchParams?.delete("search");
  //   }
  //   navigate?.({
  //     pathname: location?.pathname,
  //     search: searchParams?.toString(),
  //   });
  // };

  const isViewAllActive = !hasActiveCategoryFilters;
  if (isBlogPageLoading) {
    return <Shimmer />;
  }
  // const showSearch =
  //   typeof sliderProps?.show_search === "boolean" ||
  //   sliderProps?.show_search === ""
  //     ? sliderProps?.show_search
  //     : true;
  return (
    <div className="bg-ekke-bg">
      <div className={styles.editorialHeaderContainer}>
        <div className={styles.editorialHeader}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              EDITORIAL
              <br />
              HUB
            </div>
          </div>
          <div className={styles.contentContainer}>
            <div className={styles.categories}>
              <p>Categories</p>
              <div className="flex flex-col items-start justify-start gap-2">
                <button
                  className={`${styles.listItem} ${isViewAllActive ? styles.active : ""}`}
                  onClick={resetFilters}
                >
                  View All
                </button>
                {Object.values(categoryTags)?.map((cat) => (
                  <button
                    key={cat.key}
                    className={`${styles.listItem} ${isCategoryActive(cat) ? styles.active : ""}`}
                    onClick={() => toggleCategoriesTagFilter(cat)}
                  >
                    {cat.displaytext}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.breadcrumbwrapper}>
              <span className={styles.breadcrumb}>JOURNAL</span>
              <span className={styles.slash}>/</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.sortBy}>
        <button
          type="button"
          onClick={() => setIsSortOpen(true)}
          aria-expanded={isSortOpen}
        >
          <p>sort by</p>
        </button>
      </div>

      <div className={styles.blogContainer}>
        {blogFilter?.length === 0 &&
          blogs?.page?.item_total === 0 &&
          !searchText && (
            <EmptyState title={t("resource.blog.no_blogs_found")}></EmptyState>
          )}
        <div className={`${styles.blog__content} ${styles.blog__contentFull}`}>
          <div className={`${styles.blog__contentLeft}`}>
            {(blogFilter?.length > 0 || searchText) &&
              blogs?.page?.item_total === 0 && (
                <EmptyState
                  title={t("resource.blog.no_blogs_found")}
                  customClassName={styles.emptyBlog}
                ></EmptyState>
              )}

            <div className={`${styles.blogContainer__grid}`}>
              {sliderProps?.loadingOption === "infinite" ? (
                <InfiniteLoader
                  hasNext={paginationProps?.hasNext}
                  isLoading={isLoading}
                  loadMore={onLoadMoreProducts}
                >
                  {renderBlogs()}
                </InfiniteLoader>
              ) : (
                renderBlogs()
              )}
            </div>
            {sliderProps?.loadingOption === "pagination" &&
              blogs?.page?.item_total !== 0 && (
                <div className={styles.paginationWrapper}>
                  <Pagination {...paginationProps} />
                </div>
              )}
          </div>
        </div>
      </div>
      <BlogSortDrawer
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        position={drawerPosition}
        categoryTags={categoryTags}
        normalTags={normalTags}
        authorTags={authorTags}
        selected={blogFilter}
        onSelectTag={onSelectDrawerTag}
        onReset={onResetDrawer}
        blogFilter={blogFilter}
        blogs={blogs}
      />
    </div>
  );
}

export default BlogList;
