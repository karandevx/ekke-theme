import React from "react";
import Skeleton from "../../../components/core/skeletons/image-skeleton";
import styles from "./checkout-payment-skeleton.less";

function CheckoutPaymentSkeleton() {
  return (
    <div className={styles.paymentSkeleton}>
      <div className={styles.container}>
        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <Skeleton type="text" width="280px" height={16} />
        </div>

        {/* Payment Option Cards */}
        <div className={styles.paymentCards}>
          {/* Card 1 - Expanded (with form fields) */}
          <div className={styles.paymentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="80px" height={16} />
              </div>
              <div className={styles.cardRight}>
                <Skeleton type="box" width={32} height={16} />
                <Skeleton type="box" width={32} height={16} />
                <Skeleton type="box" width={32} height={16} />
              </div>
            </div>
            {/* Expanded content with form fields */}
            {/* <div className={styles.expandedContent}>
              <Skeleton type="text" width="200px" height={14} />
              <div className={styles.formField}>
                <Skeleton type="box" height={40} />
              </div>
              <div className={styles.formRow}>
                <Skeleton type="box" height={40} />
                <Skeleton type="box" height={40} />
              </div>
              <div className={styles.formField}>
                <Skeleton type="box" height={40} />
              </div>
              <div className={styles.checkboxField}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="180px" height={14} />
              </div>
            </div> */}
          </div>

          {/* Card 2 - Collapsed */}
          <div className={styles.paymentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="120px" height={16} />
              </div>
              <div className={styles.cardRight}>
                <Skeleton type="box" width={32} height={16} />
                <Skeleton type="box" width={32} height={16} />
                <Skeleton type="box" width={32} height={16} />
              </div>
            </div>
          </div>

          {/* Card 3 - Collapsed */}
          <div className={styles.paymentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="100px" height={16} />
              </div>
              <div className={styles.cardRight}>
                <Skeleton type="box" width={32} height={16} />
                <Skeleton type="box" width={32} height={16} />
              </div>
            </div>
          </div>

          {/* Card 4 - Collapsed (COD) */}
          <div className={styles.paymentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="140px" height={16} />
              </div>
              <div className={styles.cardRight}>
                <Skeleton type="box" width={32} height={16} />
              </div>
            </div>
          </div>

          {/* Billing Address Checkbox */}
          {/* <div className={styles.billingCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <Skeleton type="box" width={8} height={8} />
                <Skeleton type="text" width="320px" height={16} />
              </div>
            </div>
          </div> */}
        </div>

        {/* Place Order Button */}
        {/* <div className={styles.placeOrderButton}>
          <Skeleton type="box" height={48} />
        </div> */}
      </div>
    </div>
  );
}

export default CheckoutPaymentSkeleton;
