import React, { useState } from "react";
import { HTMLContent } from "../../page-layouts/marketing/HTMLContent";
import styles from "./about-us.less";
const AboutUsSection = (blog) => {
  const { props, blocks } = blog;

  const [activePage, setActivePage] = useState(blocks[0]?.name);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageChange = (page) => {
    if (page === activePage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePage(page);
      setIsTransitioning(false);
    }, 300);
  };

  const activeBlock = blocks.find((item) => item.name === activePage);

  return (
    <div className={styles.aboutUsContainer}>
      <div className={styles.aboutUsHeader}>
        <div className={styles.aboutUsTitleWrapper}>
          <div className={styles.aboutUsTitle}>
            {blocks.find((item) => item.name === activePage)?.name}
          </div>
        </div>

        <div className={styles.aboutUsMeta}>
          <div className={styles.aboutUsMetaHeader}>
            {props?.header?.value} /
          </div>
          <div className={styles.aboutUsMetaActive}>
            {blocks.find((item) => item.name === activePage)?.name}
          </div>
        </div>
      </div>

      <nav className={styles.aboutUsNav}>
        {blocks.map((item, index) => {
          const isActive = item.name === activePage;
          return (
            <button
              key={index}
              onClick={() => handlePageChange(item.name)}
              className={` ${styles.aboutUsNavItem} ${isActive ? `${styles.active}` : ""}`}
            >
              <span className={styles.ekkeDot}></span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div
        className={`${styles.aboutUsContent}${
          isTransitioning ? `${styles.fadeIn}` : `${styles.fadeOut}`
        }`}
      >
        {activeBlock && <BlockRenderer block={activeBlock} />}
      </div>
    </div>
  );
};

const BlockRenderer = (block) => {
  return <HTMLContent content={block.block.props.htmlCodeInput.value} />;
};

export default AboutUsSection;
