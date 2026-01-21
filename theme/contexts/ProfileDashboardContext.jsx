import React, { useContext, createContext, useState } from "react";

// Create the context
export const ProfileDashboardContext = createContext();

export const ProfileDashboardProvider = ({ children }) => {
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  return (
    <ProfileDashboardContext.Provider
      value={{
        isMobileProfileMenuOpen,
        setIsMobileProfileMenuOpen,
      }}
    >
      {children}
    </ProfileDashboardContext.Provider>
  );
};

export const useProfileDashboardContext = () => {
  return useContext(ProfileDashboardContext);
};
