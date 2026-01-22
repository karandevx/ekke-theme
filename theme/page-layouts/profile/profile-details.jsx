import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles/profile-details.less";
// import { GENDER_OPTIONS } from "../../helper/constant";
// import FyInput from "../../components/core/fy-input/fy-input";
// import FyButton from "../../components/core/fy-button/fy-button";
import { deepEqual } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { USER_DATA_QUERY } from "../../queries/libQuery";
import { useNavigate } from "react-router-dom";

function ProfileDetails({ userData, handleSave, signOut, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const [isLoading, setIsLoading] = useState(false);
  const { firstName, lastName, gender, countryCode, mobile } = userData;
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  const genderOptions = [
    { value: "female", label: "FEMALE" },
    { value: "male", label: "MALE" },
    { value: "unisex", label: "NON BINARY" },
  ];

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Form validation schema
  const formSchema = {
    firstName: {
      required: "First name is required",
      maxLength: {
        value: 64,
        message: "First name cannot exceed 64 characters",
      },
      pattern: {
        value: /^[A-Za-z\s'-]+$/,
        message: "Please enter a valid first name",
      },
    },
    lastName: {
      required: "Last name is required",
      maxLength: {
        value: 64,
        message: "Last name cannot exceed 64 characters",
      },
      pattern: {
        value: /^[A-Za-z\s'-]+$/,
        message: "Please enter a valid last name",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        message: "Please enter a valid email address",
      },
    },
    birthDate: {
      validate: (value) => {
        if (!value) return true; // Optional field
        const selectedDate = new Date(value);
        const today = new Date();
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 13); // Minimum age 13

        if (selectedDate > today) {
          return "Birth date cannot be in the future";
        }
        if (selectedDate > minAge) {
          return "You must be at least 13 years old";
        }
        return true;
      },
    },
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
    trigger,
    setValue,
  } = useForm({
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      gender: gender || "",
      email: userDetails?.emails?.[0]?.email || "",
      birthDate: "",
      countryCode: countryCode || "91",
      mobile: mobile || "",
    },
    mode: "onChange",
  });

  // Memoized function to fetch user data
  const fetchUserDetails = useCallback(async () => {
    const data = await fpi.executeGQL(USER_DATA_QUERY);
    setUserDetails(data?.data?.user?.logged_in_user);
  }, [fpi]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    const formattedDob = formatDateForInput(userDetails?.dob);
    reset({
      firstName,
      lastName,
      gender,
      email: userDetails?.emails?.[0]?.email || "",
      birthDate: formattedDob || "",
      countryCode: countryCode || "91",
      mobile: mobile || "",
    });

    // Explicitly set birthDate if it exists
    if (formattedDob) {
      setValue("birthDate", formattedDob);
    }
  }, [userData, userDetails, reset, setValue]);

  const onSubmit = useCallback(
    async (data) => {
      try {
        setIsLoading(true);
        await handleSave(data);
        await fetchUserDetails();
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleSave, fetchUserDetails],
  );

  // Watch all form values
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");
  const genderValue = watch("gender");
  const emailValue = watch("email");
  const birthDateValue = watch("birthDate");

  // Create original values object for comparison
  const originalValues = useMemo(() => {
    const formattedDob = formatDateForInput(userDetails?.dob);
    const originalEmail = (userDetails?.emails?.[0]?.email || "")
      .trim()
      .toLowerCase();
    return {
      firstName: (firstName || "").trim(),
      lastName: (lastName || "").trim(),
      gender: (gender || "").trim(),
      email: originalEmail,
      birthDate: formattedDob || "",
    };
  }, [firstName, lastName, gender, userDetails]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    const currentValues = {
      firstName: (firstNameValue || "").trim(),
      lastName: (lastNameValue || "").trim(),
      gender: (genderValue || "").trim(),
      email: (emailValue || "").trim().toLowerCase(), // Case-insensitive email comparison
      birthDate: (birthDateValue || "").trim(),
    };
    return !deepEqual(currentValues, originalValues);
  }, [
    firstNameValue,
    lastNameValue,
    genderValue,
    emailValue,
    birthDateValue,
    originalValues,
  ]);

  // Check if form has validation errors
  const hasErrors = useMemo(
    () =>
      !!(
        errors?.firstName ||
        errors?.lastName ||
        errors?.email ||
        errors?.birthDate
      ),
    [errors?.firstName, errors?.lastName, errors?.email, errors?.birthDate],
  );

  // Disable save if no changes or has errors
  const disableSave = !hasChanges || hasErrors;

  // Memoize phone number display value
  const phoneNumberDisplay = useMemo(() => {
    return countryCode && mobile ? `+${countryCode} ${mobile}` : "";
  }, [countryCode, mobile]);

  const handleKeyDown = (event) => {
    /** Allow specific keys */
    const allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Tab",
      "Shift",
      " ",
    ];

    const isAlphaNumeric = /^[a-zA-Z0-9]$/.test(event.key); // Allow numeric keys

    if (!isAlphaNumeric && !allowedKeys.includes(event.key)) {
      event.preventDefault(); // Block invalid input
    }
  };

  // Calculate max date (13 years ago from today)
  const maxBirthDate = useMemo(() => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13);
    return maxDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }, []);

  return (
    <div className={`${styles.profileDetailsContainer} h-full overflow-auto`}>
      <div className={`${styles.formContainer} h-full`}>
        <div className="flex flex-col h-full lg:w-[467px] w-full">
          <div className="flex flex-col items-start gap-6 relative h-full">
            {/* heading */}
            <div className="h-[22px] items-center gap-2.5 px-0 pt-1 pb-2 w-full rounded-[1px]">
              <div className="flex items-center justify-between w-full">
                <div className="subheading-3">CONTACT DETAILS</div>
              </div>
            </div>
            {/* form */}
            <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
              <div className="flex flex-col lg:gap-[236px] gap-[46px]">
                <div className="flex items-start gap-2.5 relative rounded-[1px] w-full">
                  <div className="flex flex-col items-start gap-8 relative w-full">
                    <div className="flex flex-col items-start justify-between w-full">
                      <div className="flex flex-col items-start md:gap-6 gap-8 relative w-full">
                        <div className="flex flex-col items-start gap-3 relative w-full">
                          <div className="inline-flex items-center justify-center gap-2.5 relative">
                            <label className="body-1 !text-[#aaaaaa]">
                              GENDER
                            </label>
                          </div>

                          <div className="flex md:items-center md:justify-between items-start gap-4 md:gap-0 relative self-stretch w-full flex-[0_0_auto]">
                            {genderOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex w-full md:w-36 items-center gap-1 relative"
                              >
                                <input
                                  type="radio"
                                  {...register("gender", formSchema.gender)}
                                  value={option.value}
                                  id={option.value}
                                  className="appearance-none w-2 h-2 border border-solid border-neutral-900 cursor-pointer relative flex-shrink-0 checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-1 checked:after:bg-[#5c2e20]"
                                  style={{
                                    border: "1px solid #5C2E20",
                                    borderRadius: 0,
                                  }}
                                />
                                <label
                                  htmlFor={option.value}
                                  className="flex items-start gap-1 p-1 cursor-pointer"
                                >
                                  <div className="body-1">{option.label}</div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:gap-2.5 gap-6 items-start w-full">
                          <div className="flex flex-col w-full items-start gap-3 relative">
                            <div className="flex w-[110px] items-start gap-2.5 relative">
                              <label className="body-1 !text-[#aaaaaa]">
                                FIRST NAME
                              </label>
                            </div>

                            <div className="flex flex-col items-start gap-3 relative w-full bg-white">
                              <input
                                {...register("firstName", formSchema.firstName)}
                                placeholder="Name"
                                className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0  ${
                                  errors.firstName
                                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                                }`}
                              />
                              {errors.firstName && (
                                <span className="lg:body-2 body-5 text-[#5c2e20]">
                                  {errors.firstName.message}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 relative w-full">
                            <div className="flex w-[109px] items-start gap-2.5 relative">
                              <label className="body-1 !text-[#aaaaaa]">
                                LAST NAME
                              </label>
                            </div>

                            <div className="flex flex-col items-start gap-3 relative w-full bg-white">
                              <input
                                {...register("lastName", formSchema.lastName)}
                                placeholder="Last name"
                                className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none   focus-visible:outline-none focus-visible:ring-0 ${
                                  errors.lastName
                                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                                }`}
                              />
                              {errors.lastName && (
                                <span className="lg:body-2 body-5 text-[#5c2e20]">
                                  {errors.lastName.message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-row flex-col items-start md:gap-2.5 gap-6 relative w-full">
                          {/* <div className="flex flex-col w-full items-start gap-3 relative">
                            <div className="flex w-[110px] items-start gap-2.5 relative">
                              <label className="body-1 !text-[#aaaaaa]">
                                PHONE NUMBER
                              </label>
                            </div>

                            <div className="flex flex-col items-start gap-3 relative w-full bg-white">
                              <input
                                defaultValue="+91"
                                className="body-2 p-1 w-full overflow-hidden border border-solid border-[#aaaaaa] md:h-[24px] h-[32px]"
                              />
                            </div>
                          </div> */}

                          <div className="flex flex-col items-start gap-3 relative w-full">
                            <div className="inline-flex items-center justify-center gap-2.5 relative">
                              <label className="body-1 !text-[#aaaaaa]">
                                PHONE NUMBER
                              </label>
                            </div>

                            <div className="flex flex-col items-start gap-3 relative w-full">
                              <div className="flex items-center w-full border border-solid bg-white md:h-[24px] h-[32px] border-[#EEEEEE] opacity-60">
                                {/* Combined Phone Number Input (Disabled) */}
                                <input
                                  type="text"
                                  value={phoneNumberDisplay}
                                  disabled
                                  placeholder="+91"
                                  className="body-2 p-1 w-full border-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 bg-transparent cursor-not-allowed"
                                  style={{
                                    opacity: 1,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 relative w-full">
                            <div className="flex w-[110px] items-start gap-2.5 relative">
                              <label className="body-1 !text-[#aaaaaa]">
                                BIRTH DATE
                              </label>
                            </div>

                            <div className="flex flex-col items-start gap-3 relative w-full bg-white">
                              <input
                                {...register("birthDate", formSchema.birthDate)}
                                type="date"
                                max={maxBirthDate}
                                className={`body-2 p-1 !text-[#171717] w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                                  errors.birthDate
                                    ? "border-[#5C2E20] focus:border-[#5C2E20]"
                                    : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                                }`}
                              />
                              {errors.birthDate && (
                                <span className="lg:body-2 body-5 text-[#5c2e20]">
                                  {errors.birthDate.message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 relative w-full">
                          <div className="flex w-[228px] items-start gap-2.5 relative">
                            <label className="body-1 !text-[#aaaaaa]">
                              EMAIL ID
                            </label>
                          </div>

                          <div className="flex flex-col items-start gap-3 relative w-full bg-white">
                            <input
                              {...register("email", formSchema.email)}
                              placeholder="example@gmail.com"
                              className={`body-2 p-1 w-full overflow-hidden border border-solid md:h-[24px] h-[32px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                                errors.email
                                  ? "border-[#5C2E20] focus:border-[#5C2E20]"
                                  : "border-[#EEEEEE] focus:border-[#AAAAAA]"
                              }`}
                            />

                            {/* Error Messages */}
                            {errors.email && (
                              <span className="lg:body-2 body-5 text-[#5c2e20]">
                                {errors.email?.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* submit */}
                <div className="flex flex-col lg:gap-[40px] gap-8 w-full lg:mb-6">
                  {/* Manage and delete acccount */}
                  <div className="flex items-center gap-12">
                    <button
                      type="button"
                      className="underline text-[11px] !!capitalize text-ekke-black font-normal font-archivo hover:no-underline"
                      onClick={signOut}
                    >
                      Sign out
                    </button>
                    <button
                      type="button"
                      className="body-2 text-[#5c2e20] tracking-[var(--links-3-button-letter-spacing)] leading-[var(--links-3-button-line-height)] underline bg-transparent border-none p-0 cursor-pointer text-left hover:no-underline"
                      onClick={() => navigate("/c/delete-account")}
                    >
                      Delete account
                    </button>
                  </div>
                  <button
                    disabled={disableSave || isLoading}
                    className={`body-1 w-full h-6 pl-2 text-left transition-colors ${
                      disableSave || isLoading
                        ? "bg-[#eeeeee] !text-[#aaaaaa] cursor-not-allowed"
                        : "bg-[#171717] !text-white hover:bg-opacity-90 cursor-pointer"
                    }`}
                    type="submit"
                  >
                    <span>{isLoading ? "SUBMITING..." : "SUBMIT"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;
