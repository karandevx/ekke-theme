import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { GET_BLOG, FETCH_BLOGS_LIST } from "../../queries/blogQuery";
import { useThemeConfig } from "../../helper/hooks";

const useBlogDetails = ({ fpi }) => {
  const location = useLocation();
  const { slug = "" } = useParams();
  const { pageConfig } = useThemeConfig({ fpi, page: "blog" });

  const footerProps = useMemo(
    () => ({
      button_link: pageConfig.button_link,
      button_text: pageConfig.button_text,
      description: pageConfig.description,
      title: pageConfig.title,
    }),
    [pageConfig]
  );

  const sliderProps = useMemo(
    () => ({
      show_filters: pageConfig?.show_filters || "",
      show_recent_blog: pageConfig?.show_recent_blog || "",
      show_search: pageConfig?.show_search || "",
      show_tags: pageConfig?.show_tags || "",
      show_top_blog: pageConfig?.show_top_blog || "",
      fallback_image: pageConfig?.fallback_image,
      button_text: pageConfig?.button_text || "",
      autoplay: pageConfig?.autoplay || false,
      slide_interval: pageConfig?.slide_interval || 3,
      btn_text: pageConfig?.btn_text || "",
      loadingOption: pageConfig?.loading_options || "",
      show_blog_slide_show: pageConfig?.show_blog_slide_show || "",
      recentBlogs: pageConfig.recent_blogs || [],
      topViewedBlogs: pageConfig.top_blogs || [],
    }),
    [pageConfig]
  );

  const contactInfo = useGlobalStore(fpi.getters.CONTACT_INFO);
  const { blogDetails, isBlogNotFound, recommendedBlogs = {} } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  ) || { blogDetails: {}, isBlogNotFound: false, recommendedBlogs: {} };

  const [isBlogDetailsLoading, setIsBlogDetailsLoading] = useState(
    !blogDetails?.[slug]
  );

  useEffect(() => {
    fpi.custom.setValue("isBlogSsrFetched", false);
  }, []);

  useEffect(() => {
    fpi.custom.setValue("isBlogNotFound", false);
  }, [location.pathname]);

  function getBlog(slug, preview) {
    try {
      setIsBlogDetailsLoading(true);
      const values = {
        slug: slug || "",
        preview: preview || false,
      };
      return fpi
        .executeGQL(GET_BLOG, values)
        .then((res) => {
          if (res?.errors) {
            fpi.custom.setValue(`isBlogNotFound`, true);
          }
          if (res?.data?.blog) {
            const data = res?.data?.blog;
            fpi.custom.setValue("blogDetails", {
              ...blogDetails,
              [slug]: data,
            });
          }
        })
        .finally(() => {
          setIsBlogDetailsLoading(false);
        });
    } catch (error) {
      console.log({ error });
    }
  }

  /**
   * Fetches blogs that have the same tags as the provided tags array
   * @param {Array<string>} tags - Array of tag strings to filter blogs
   * @param {Object} options - Optional parameters
   * @param {number} options.pageNo - Page number (default: 1)
   * @param {number} options.pageSize - Number of blogs per page (default: 12)
   * @param {string} options.excludeSlug - Slug of blog to exclude from results
   * @returns {Promise} Promise that resolves to blogs data with matching tags
   */
  function getBlogsByTags(tags, options = {}) {
    try {
      const { pageNo = 1, pageSize = 12, excludeSlug = null } = options;

      // Convert tags array to comma-separated string if it's an array
      const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

      const values = {
        pageNo,
        pageSize,
        tags: tagsString,
      };

      return fpi
        .executeGQL(FETCH_BLOGS_LIST, values, { skipStoreUpdate: true })
        .then((res) => {
          if (res?.data?.applicationContent?.blogs) {
            let blogs = res.data.applicationContent.blogs;

            // Exclude the current blog if excludeSlug is provided
            if (excludeSlug && blogs.items) {
              blogs = {
                ...blogs,
                items: blogs.items.filter((blog) => blog.slug !== excludeSlug),
              };
            }

            return blogs;
          }
          return { items: [], page: {} };
        })
        .catch((error) => {
          console.error("Error fetching blogs by tags:", error);
          return { items: [], page: {} };
        });
    } catch (error) {
      console.log({ error });
      return Promise.resolve({ items: [], page: {} });
    }
  }

  function getBlogsWithSameTags(options = {}) {
    const currentBlog = blogDetails?.[slug];
    const allTags = currentBlog?.tags || [];
    
    // Filter out tags that start with "Categories" or "Author" (case-insensitive)
    const filteredTags = allTags.filter((tag) => {
      if (!tag || typeof tag !== "string") return false;
      const lowerTag = tag.toLowerCase().trim();
      return (
        !lowerTag.startsWith("categories-") && !lowerTag.startsWith("author-")
      );
    });
    
    // Check if recommended blogs are already cached for this slug
    if (recommendedBlogs?.[slug] && filteredTags.length > 0) {
      return Promise.resolve({ items: recommendedBlogs[slug] });
    }
    
    if (!filteredTags || filteredTags.length === 0) {
      return Promise.resolve({ items: [] });
    }
    
    return getBlogsByTags(filteredTags, { ...options, excludeSlug: slug }).then((blogs) => {
      // Store recommended blogs in fpi.custom for future use
      if (blogs?.items && blogs.items.length > 0) {
        fpi.custom.setValue("recommendedBlogs", {
          ...recommendedBlogs,
          [slug]: blogs.items,
        });
      }
      return blogs;
    });
  }

  console.log("Blog Details", blogDetails?.[slug]);

  return {
    blogDetails: blogDetails?.[slug],
    sliderProps,
    footerProps,
    contactInfo,
    isBlogNotFound,
    getBlog,
    isBlogDetailsLoading,
    getBlogsByTags,
    getBlogsWithSameTags,
    recommendedBlogs: recommendedBlogs?.[slug] || [],
  };
};

export default useBlogDetails;
