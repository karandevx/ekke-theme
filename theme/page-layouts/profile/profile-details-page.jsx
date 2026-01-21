import React from "react";
import ProfileDetails from "./profile-details";
import "./styles/profile-details.less";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useAccounts, useWindowWidth } from "../../helper/hooks";
import { useToast } from "../../components/custom-toaster";

function ProfileDetailsPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const { first_name, last_name, gender, user, phone_numbers } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const toast = useToast();

  // Get primary phone number from phone_numbers array
  const primaryPhone =
    phone_numbers?.find((p) => p.primary) || phone_numbers?.[0];

  const userData = {
    firstName: first_name ?? user?.first_name,
    lastName: last_name ?? user?.last_name,
    gender: gender ?? user?.gender,
    countryCode: primaryPhone?.country_code?.toString() || "91",
    mobile: primaryPhone?.phone || "",
  };

  const { updateProfile, signOut } = useAccounts({ fpi });

  const handleSave = async ({
    firstName,
    lastName,
    gender,
    birthDate,
    email,
    countryCode,
    mobile,
  }) => {
    try {
      await updateProfile({
        firstName,
        lastName,
        gender,
        dob: birthDate,
        email,
        phone: {
          countryCode,
          mobile,
        },
      });
      // if (windowWidth <= 768) {
      //   navigate("/profile/profile-tabs");
      // }

      toast.success(t("resource.common.updated_success"));
    } catch (error) {
      toast.error(error?.message);
    }
  };

  return (
    <ProfileDetails
      handleSave={handleSave}
      userData={userData}
      signOut={signOut}
      fpi={fpi}
    />
  );
}

export default ProfileDetailsPage;
