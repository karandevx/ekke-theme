import React from "react";
import DOMPurify from "dompurify";

const HTMLContent = React.forwardRef(({ content }, ref) => {
  // Sanitize content to prevent XSS attacks
  const sanitizedContent = React.useMemo(() => {
    if (!content) return "";
    if (typeof window === "undefined") return content; // SSR fallback
    try {
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
          "a",
          "img",
          "div",
          "span",
          "blockquote",
          "pre",
          "code",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "style"],
        ALLOW_DATA_ATTR: false,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sanitizing HTML content:", error);
      }
      return "";
    }
  }, [content]);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div
        data-testid="html-content"
        ref={ref}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
});

export { HTMLContent };
export default HTMLContent;
