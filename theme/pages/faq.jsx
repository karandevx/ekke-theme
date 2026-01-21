import React from "react";
import useFaq from "../page-layouts/faq/useFaq";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../queries/faqQuery";
import { useGlobalTranslation } from "fdk-core/utils";
import Faq from "../components/faqs/faq";

function Faqs({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const faqProps = useFaq({ fpi });

  console.log("Faq Props", faqProps);

  return (
    <Faq
      {...faqProps}
      EmptyStateComponent={(props) => (
        <EmptyState
          customClassName={props.customClassName}
          title={t("resource.faq.no_frequently_asked_questions_found")}
          Icon={<EmptyFaqIcon />}
          showButton={false}
        />
      )}
    />
  );
}

Faqs.serverFetch = async ({ fpi, router }) => {
  try {
    const { filterQuery = {} } = router;
    const paramsValue = filterQuery?.category;
    const res = await fpi.executeGQL(FAQ_CATEGORIES);
    const faqCategories =
      res?.data?.applicationContent?.faq_categories?.categories;

    const defaultSlug = !paramsValue ? faqCategories[0]?.slug : paramsValue;
    const activeCategory =
      faqCategories.find((i) => i.slug === defaultSlug) ?? null;

    fpi.custom.setValue("activeFaqCategories", activeCategory);

    if (defaultSlug) {
      try {
        await fpi.executeGQL(FAQS_BY_CATEGORY, {
          slug: defaultSlug,
        });
      } catch (err) {
        fpi.custom.setValue(
          "faqError",
          `Error fetching FAQs: ${err?.message || err}`
        );
      }
    }
  } catch (err) {
    fpi.custom.setValue(
      "faqCategoryError",
      `Error fetching FAQ categories: ${err?.message || err}`
    );
  }
};

export const sections = JSON.stringify([
  {
    attributes: {
      page: "faqs",
    },
  },
]);

export default Faqs;
