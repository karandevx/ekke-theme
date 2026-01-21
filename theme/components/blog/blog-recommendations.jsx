// blog-recommedations.jsx
import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/blog-recommendation.less";
import FyImage from "../core/fy-image/fy-image";

const BlogRecommedations = ({ blog = [] }) => {
  if (!blog?.length) return null;

  return (
    <div className={styles.recoCardWrapper}>
      {blog.map((item, index) => {
        const {
          slug,
          title,
          feature_image,
          publish_date,
          tags = [],
        } = item || {};

        const imageUrl = feature_image?.secure_url;
        const year = publish_date ? new Date(publish_date).getFullYear() : "";

        return (
          <FDKLink
            key={slug || index}
            to={`/blog/${slug}`}
            className={styles.recoCard}
            aria-label={title}
          >
            {/* Main image */}
            <div>
              {imageUrl && (
                <FyImage
                  src={imageUrl}
                  alt={title}
                  aspectRatio={16 / 9}
                  mobileAspectRatio={16 / 9}
                  disableAnimation={true}
                />
              )}
            </div>

            {/* Text block at the bottom */}
            <div className={styles.recoMeta}>
              <div>
                <div className={styles.recoTitle}>
                  {title || "Untitled Article"}
                </div>
                {!!year && <div className={styles.recoYear}>{year}</div>}
              </div>

              <FDKLink
                key={slug || index}
                to={`/blog/${slug}`}
                className={styles.link}
                aria-label={title}
              >
                View more
              </FDKLink>
            </div>
          </FDKLink>
        );
      })}
    </div>
  );
};

export default BlogRecommedations;
