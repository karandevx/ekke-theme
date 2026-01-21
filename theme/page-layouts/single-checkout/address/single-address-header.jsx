import React, { useMemo } from "react";
import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import styles from "./single-address-header.less";
import { getAddressStr } from "../../../helper/utils";
import { useSearchParams } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";

function SinglesAddressHeader({
  allAddresses,
  showAddNewAddressModal,
  showPayment,
  showShipment,
  backToEdit,
}) {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const selectedAddId = searchParams.get("address_id");

  const selectedAddress = useMemo(() => {
    if (allAddresses?.length) {
      const item = allAddresses?.find((item) => item.id == selectedAddId);
      return { name: item?.name, addressStr: getAddressStr(item, false) };
    }
  }, [allAddresses, selectedAddId]);

  return (
    // <>
    //   {showShipment || showPayment ? (
    //     <>
    //       <div className={styles.addressSelectedHeaderContainer}>
    //         <div className={styles.leftSelected}>
    //           <div className={styles.icon}>
    //             <SvgWrapper svgSrc="checkmark"></SvgWrapper>
    //           </div>
    //           <div className={styles.deliverAdd}>
    //             <div className={styles.title}>
    //               {t("resource.common.deliver_to")}: {selectedAddress?.name}
    //             </div>
    //             <div className={styles.address}>
    //               {selectedAddress?.addressStr}
    //             </div>
    //           </div>
    //         </div>
    //         <div className={styles.rightSelected} onClick={backToEdit}>
    //           {t("resource.cart.change")}
    //         </div >
    //       </div >
    //     </>
    //   ) : (
    <>
      {/* <div
        className={`${styles.addressHeaderContainer} ${styles.addressHeaderContainer__mobile}`}
        onClick={showAddNewAddressModal}
      >
        <div className={styles.buttonWrapper}>
          <button className={`${styles.commonBtn} ${styles.addBtn} font-road-radio`}>
            <SvgWrapper svgSrc="addAddress" /> <span>{t("resource.common.address.add_new_address")}</span>
          </button>
        </div>
      </div> */}
      <div className={`${styles.addressHeaderContainer}`}>
        {/* <div className={styles.wrapper}> */}
        <div className={styles.headerWrapper}>
          <div
            className={`${styles.addressHeading} font-bold text-bodycopy-01 leading-[120%] tracking-[0%] font-road-radio !text-[11px]`}
          >
            {t("resource.checkout.delivery_address")}
          </div>
        </div>
        {/* </div> */}
        <div className={styles.buttonWrapper}>
          <button className={`body-1`} onClick={showAddNewAddressModal}>
            + <span>{t("resource.common.address.add_new_address")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
//     </>
//   );
// }

export default SinglesAddressHeader;

// className=("[a-z-]+")
// className={styles[$1]}
