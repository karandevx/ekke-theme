import React from "react";
import styles from "./styles/blog-share.less";
import { copyToClipboard } from "../../helper/utils";
import { useToast } from "../custom-toaster";
import { useGlobalTranslation } from "fdk-core/utils";
import { isRunningOnClient } from "../../helper/utils";

function BlogShare({ blogTitle = "", blogSlug = "" }) {
  const { t } = useGlobalTranslation("translation");
  const toast = useToast();

  const shareUrl = isRunningOnClient() ? window.location.href : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(blogTitle);

  const handleFacebookShare = (e) => {
    e.preventDefault();
    if (isRunningOnClient() && shareUrl) {
      const facebookWindow = window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        "facebook-popup",
        "height=350,width=600"
      );
      if (facebookWindow?.focus) {
        facebookWindow.focus();
      }
    }
  };

  const handleInstagramShare = (e) => {
    e.preventDefault();

    if (!shareUrl) return;

    // Prefill the caption with your blog title + link
    const caption = `${blogTitle}\n\n${shareUrl}`;
    const encodedCaption = encodeURIComponent(caption);

    // Open Instagram post composer on the web with the caption prefilled
    const instagramUrl = `https://www.instagram.com/create/select/?caption=${encodedCaption}`;

    const instagramWindow = window.open(
      instagramUrl,
      "instagram-popup",
      "height=700,width=500"
    );

    if (instagramWindow?.focus) {
      instagramWindow.focus();
    }
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    if (shareUrl) {
      copyToClipboard(shareUrl);
      toast.info(t("resource.common.link_copied") || "Link copied to clipboard");
    }
  };

  return (
    <div className={styles.blogShare}>
      <span className={styles.shareLabel}>SHARE</span>

      <div className={styles.shareOptions}>
        <button
          className={`${styles.shareOption} ${styles.inactive}`}
          onClick={handleFacebookShare}
          aria-label="Share on Facebook"
        >
          <span className={styles.separator}></span>
          FB
        </button>
        <button
          className={`${styles.shareOption} ${styles.inactive}`}
          onClick={handleInstagramShare}
          aria-label="Share on Instagram"
        >
          <span className={styles.separator}></span>
          IG
        </button>
        <button
          className={`${styles.shareOption} ${styles.inactive}`}
          onClick={handleCopyLink}
          aria-label="Link copied to clipboard"
        >
          <span className={styles.separator}></span>
          LINK
        </button>
      </div>
    </div>
  );
}

export default BlogShare;
