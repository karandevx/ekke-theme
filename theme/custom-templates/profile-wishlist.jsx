import React from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import { useFPI } from "fdk-core/utils";
import { ProfileWishlist as WishlistContent } from "../page-layouts/profile/profile-wishlist";

function ProfileWishlist() {
  const fpi = useFPI();
  return (
    <ProfileRoot fpi={fpi}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
        style={{ width: "100%" }}
      >
        <WishlistContent fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileWishlist.authGuard = isLoggedIn;

export const sections = JSON.stringify([]);

export default ProfileWishlist;
