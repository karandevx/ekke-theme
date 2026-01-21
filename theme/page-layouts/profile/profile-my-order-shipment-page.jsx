import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import ProfileRoot from "../../components/profile/profile-root";

function ProfileMyOrderShipmentPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );

  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    <ProfileRoot fpi={fpi}>
      {page?.value === "shipment-details" && (
        <>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              height: 10px;
              width: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #000;
              border-radius: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #000;
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #000 #000;
            }
          `}</style>
          <div className="w-full md:pr-[10px] overflow-auto custom-scrollbar">
            <SectionRenderer
              sections={sections}
              fpi={fpi}
              globalConfig={globalConfig}
            />
          </div>
        </>
      )}
    </ProfileRoot>
  );
}

export default ProfileMyOrderShipmentPage;
