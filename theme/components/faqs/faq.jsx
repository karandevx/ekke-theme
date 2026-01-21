import React from "react";
import { FDKLink } from "fdk-core/components";
import SvgWrapper from "../../components/core/svgWrapper/SvgWrapper";
import styles from "./faq.less";
import { useGlobalTranslation } from "fdk-core/utils";
import CustomerExperience from "../customer-experience/customer-experience";

function Faq({
  faqCategories,
  activeFaqCat,
  faqs,
  setFaqs,
  updateSearchParams,
  hasCatQuery,
  isLoading = false,
  defaultFaqCategory,
  EmptyStateComponent = () => <></>,
}) {
  const { t } = useGlobalTranslation("translation");
  const handleQuestionClick = (index) => {
    setFaqs((preVal) => {
      const updatedFaqs = [...preVal];
      updatedFaqs[index] = {
        ...updatedFaqs[index],
        open: !updatedFaqs[index].open,
      };
      return updatedFaqs;
    });
  };

  const handleCategoryClick = (params) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    updateSearchParams(params);
  };

  const navigateToContactUsPage = () => {};

  return (
    <div>
      <CustomerExperience />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:py-10 md:px-2 bg-[#F7F7F5]">
        {/* LEFT: make sticky on md+ */}
        <div className="flex items-center justify-center md:sticky md:top-0 md:self-start md:h-screen max-md:py-[52.5px]">
          <span className="flex items-center justify-center mb-4">
            <SvgWrapper svgSrc="ekke-grey" />
          </span>
        </div>
        <div
          className={`${styles.faq} ${styles.basePageContainer} ${styles.margin0auto} fontBody`}
        >
          {faqCategories?.length > 0 ? (
            <>
              <div
                className={`${styles["faq-container"]} ${faqs?.length === 0 ? styles["emptyStateCentre"] : ""}`}
              >
                {activeFaqCat?.title && (
                  <div className={styles.faqHeader}>
                    {activeFaqCat?.description && (
                      <p className={styles.description}>
                        {activeFaqCat?.description}
                      </p>
                    )}
                  </div>
                )}
                {!isLoading &&
                  (faqs?.length > 0 ? (
                    <div className={`${styles.contentContainer} `}>
                      <div className={styles.content}>
                        <div className={styles["faq-list"]}>
                          <ul>
                            {faqs?.map((item, index) => (
                              <li
                                className={`${styles["faq-item"]} ${item.open ? styles.isOpen : ""}`}
                                key={index}
                                onClick={() => handleQuestionClick(index)}
                              >
                                <div className={styles.quesContainer}>
                                  <div className={styles["qa-box"]}>
                                    <span
                                      className={`${styles.question} fontHeader`}
                                    >
                                      {item.question}
                                    </span>
                                  </div>
                                  {item.open ? (
                                    <SvgWrapper
                                      svgSrc="minus-center"
                                      className="w-2 h-2"
                                    />
                                  ) : (
                                    <SvgWrapper
                                      svgSrc="plusblack"
                                      className="w-2 h-2"
                                    />
                                  )}
                                </div>
                                {item.open && (
                                  <div className={styles.answer}>
                                    {item.answer}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyStateComponent customClassName={styles.emptyState} />
                  ))}
              </div>
            </>
          ) : (
            <>{!isLoading && <EmptyStateComponent />}</>
          )}
        </div>
      </div>
    </div>
  );
}

export const sections = JSON.stringify([]);

export default Faq;
