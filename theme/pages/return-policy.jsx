import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";
import SvgWrapper from "../components/core/svgWrapper/SvgWrapper";
import LegalNavMenu from "../components/header/legal-nav-menu";

function ReturnPolicy() {
  const fpi = useFPI();
  const { returns } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  console.log("Returns Policy", returns);

  return (
    <div className="bg-white">
      {/* Navigation Menu */}
      <LegalNavMenu />

      {/* Main Content Container */}
      <div className="md:flex md:h-[calc(100vh-57px)] md:overflow-hidden md:px-0 px-[10px] md:pt-10">
        {/* Left Section - Fixed Logo (Desktop only) - NO SCROLL */}
        <div className="flex md:w-1/2 items-center justify-center md:py-0 py-[50px]">
          <div>
            <SvgWrapper svgSrc="ekke-grey" />
          </div>
        </div>

        {/* Right Section - ONLY Scrollable Content */}
        <div className="w-full md:w-1/2 md:overflow-y-auto md:h-full">
          <div>
            <HTMLContent content={returns} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "return-policy",
    },
  },
]);

export default ReturnPolicy;
