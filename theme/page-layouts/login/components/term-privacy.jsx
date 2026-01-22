import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./term-privacy.less";
import { useGlobalTranslation } from "fdk-core/utils";

function TermPrivacy({ onChange, checked }) {
  const { t } = useGlobalTranslation("translation");

  return (
    <>
      <div className="flex items-center gap-2 my-3 w-full">
        <input
          type="checkbox"
          id="terms-privacy"
          onChange={(e) => onChange?.(e.target.checked)}
          checked={checked}
          aria-required="true"
          aria-label={t("resource.common.terms_and_privacy")}
          className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
          style={{
            border: "1px solid #5C2E20",
            borderRadius: 0,
          }}
        />
        <label
          htmlFor="terms-privacy"
          className="body-2 text-left text-[#171717] w-full whitespace-nowrap"
        >
          {"I acknowledge that I have read and understood the"}&nbsp;
          <FDKLink
            to="/terms-and-conditions"
            className="underline inline"
            target="_self"
          >
            {t("resource.auth.login.terms_of_service")}
          </FDKLink>
          &nbsp;{t("resource.auth.login.and_symbol")}&nbsp;
          <FDKLink
            to="/privacy-policy"
            className="underline inline"
            target="_self"
          >
            {t("resource.auth.login.privacy_policy")}
          </FDKLink>
        </label>
      </div>
    </>
  );
}

export default TermPrivacy;
