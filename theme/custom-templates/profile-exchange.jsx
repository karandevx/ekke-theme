import React from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import { useFPI } from "fdk-core/utils";
import ProfileExchangePage from "./profile-exchange-page";

function ProfileExchange() {
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
        <ProfileExchangePage fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileExchange.authGuard = isLoggedIn;

export const sections = JSON.stringify([]);

export default ProfileExchange;
