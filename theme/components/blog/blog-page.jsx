/**
 * BlogPage component is responsible for rendering the blog page with details, social links, and a sidebar if applicable.
 * It fetches blog details if they are not already available and displays a loader while the data is being fetched.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.contactInfo - Contains contact information including social links.
 * @param {Object} props.blogDetails - Details of the blog to be displayed.
 * @param {Object} props.sliderProps - Properties for the slider, determining if recent or top blogs should be shown.
 * @param {Object} props.footerProps - Properties for the footer section.
 * @param {Function} props.getBlog - Function to fetch blog details using a slug.
 * @param {boolean} props.isBlogDetailsLoading - Indicates if the blog details are currently being loaded.
 * @param {Function} props.getBlogsByTags - Function to fetch blogs by tags array.
 * @param {Function} props.getBlogsWithSameTags - Function to fetch blogs with the same tags as the current blog.
 *
 * @returns {JSX.Element} The rendered blog page component.
 */

import React, { useEffect, useRef, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/blog-page.less";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import FyImage from "../core/fy-image/fy-image";
import HTMLContent from "../core/html-content/html-content";
import BlogTabs from "./blog-tabs";
import BlogFooter from "./blog-footer";
import {
  convertUTCDateToLocalDate,
  formatLocale,
  isRunningOnClient,
} from "../../helper/utils";
import { useLocation } from "react-router-dom";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import Shimmer from "../shimmer/shimmer";
import BlogRecommedations from "./blog-recommendations";
import BlogShare from "./blog-share";

function BlogPage({
  contactInfo,
  blogDetails,
  sliderProps,
  footerProps,
  getBlog,
  isBlogDetailsLoading,
  SocailMedia = () => {},
  getBlogsByTags,
  getBlogsWithSameTags,
}) {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const locale = i18nDetails?.language?.locale || "en";
  const countryCode = i18nDetails?.countryCode || "IN";
  const params = useParams();
  const location = useLocation();
  const [recommededBlog, setRecommededBlog] = useState([]);
  
  useEffect(() => {
    if (!blogDetails) {
      const searchParams = new URLSearchParams(location.search);
      const previewFlag = searchParams.get("__preview"); // Extract __preview if exists

      getBlog(params?.slug, previewFlag ? true : false);
    }
  }, [params?.slug, location?.search]);

  // Fetch recommended blogs only when blogDetails or slug changes
  useEffect(() => {
    if (blogDetails && params?.slug && blogDetails?.tags?.length > 0) {
      getBlogsWithSameTags({ pageNo: 1, pageSize: 10 })
        .then((blogs) => {
          if (blogs?.items) {
            setRecommededBlog(blogs.items);
          } else {
            setRecommededBlog([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching recommended blogs:", error);
          setRecommededBlog([]);
        });
    } else {
      setRecommededBlog([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogDetails?.slug, params?.slug, blogDetails?.tags?.[0]]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (isRunningOnClient()) {
      setTimeout(() => {
        if (window.instgrm) {
          window.instgrm.Embeds.process(); // Process all embeds
        } else {
          const script = document.createElement("script");
          script.src = "https://www.instagram.com/embed.js";
          script.async = true;
          script.onload = () => {
            if (containerRef.current) {
              window.instgrm.Embeds.process(containerRef.current);
            }
          };
          document.body.appendChild(script);
        }
      }, 0);
    }
  }, [blogDetails?.content?.[0]?.value]);

  const socialLinks = useMemo(() => {
    const socialLinksObj = contactInfo?.social_links || {};
    return Object.entries(socialLinksObj).reduce((acc, [key, value]) => {
      if (value?.link) {
        acc.push({
          ...value,
          key,
          icon: key && typeof key === "string" ? `blog-${key}` : "",
        });
      }
      return acc;
    }, []);
  }, [contactInfo]);

  const getFormattedDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return convertUTCDateToLocalDate(
      dateString,
      options,
      formatLocale(locale, countryCode)
    );
  };

  const {
    show_top_blog,
    topViewedBlogs = [],
    show_recent_blog,
    recentBlogs = [],
  } = sliderProps;

  const isSidebarDisplayed = useMemo(
    () =>
      (show_top_blog && topViewedBlogs?.length) ||
      (show_recent_blog && recentBlogs?.length),
    [show_top_blog, topViewedBlogs, show_recent_blog, recentBlogs]
  );

  const blogTag = () => {
    if (
      blogDetails?.tags?.[0] &&
      blogDetails?.tags?.[0]?.toLowerCase() !== "top5"
    ) {
      return blogDetails?.tags?.[0];
    }
    return blogDetails?.tags?.[1] || "";
  };

  if (isBlogDetailsLoading) {
    return <Shimmer />;
  }

  return (
    <>
      <div
        className={`${styles.blogContainer} ${!isSidebarDisplayed ? `${styles.blog__contentFull}` : ""}`}
      >
        <div className={`${styles.leftCol} ${styles.blogPost}`}>
          <div className={`${styles.blogPost__content}`}>
            {blogDetails?.content && (
              <HTMLContent
                ref={containerRef}
                key="html"
                content={blogDetails?.content?.[0]?.value}
              />
            )}
          </div>
        </div>
        <BlogShare blogTitle={blogDetails?.title} blogSlug={blogDetails?.slug} />
        <BlogRecommedations blog={recommededBlog} />

        <BlogTabs className={`${styles.rightCol}`} {...sliderProps}></BlogTabs>
      </div>
      <BlogFooter {...footerProps}></BlogFooter>
    </>
  );
}

export default BlogPage;
