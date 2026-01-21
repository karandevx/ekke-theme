import React, { useState, useEffect } from "react";
import Login from "../login/login";
import "../../page-layouts/login/login.less";
import Register from "../register/register";
import "../../page-layouts/register/register.less";
import { useMobile } from "../../helper/hooks";
import useCheckAnnouncementBar from "../../helper/hooks/useCheckAnnouncementBar";

// const DUMMY_BG =
//   "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

const CustomAuth = ({
  loginProps = {},
  registerProps = {},
  pageConfig,
  fpi,
}) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isVerifyBothShowing, setIsVerifyBothShowing] = useState(false);
  const isMobile = useMobile();

  const handleForgotPasswordStateChange = (isForgotPassword) => {
    setShowForgotPassword(isForgotPassword);
  };

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Hide welcome screen after 3 seconds
    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  return (
    <main
      className="flex lg:flex-row flex-col w-full relative"
      style={{
        backgroundImage: `url("${isMobile ? pageConfig?.mobile_image_banner : pageConfig?.image_banner}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: hasAnnouncementBar
          ? "calc(100vh - 80px)"
          : "calc(100vh - 56px)",
      }}
    >
      {/* Welcome Screen - Replaces login/signup sections */}
      {showWelcome ? (
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{
            opacity: fadeOut ? 0 : 1,
            pointerEvents: fadeOut ? "none" : "auto",
          }}
        >
          {/* White opacity overlay */}
          <div className="absolute inset-0 bg-white opacity-60"></div>

          {/* Welcome text */}
          <p className="subheading-4 leading-[50%] relative z-10">WELCOME</p>
        </div>
      ) : (
        <>
          {/* login */}
          <section
            className={`flex flex-col ${showRegisterForm && isMobile ? "justify-center h-[57px]" : "justify-start h-1/2"} items-start relative transition-all duration-500 ease-in-out lg:w-1/2 w-full lg:p-6 lg:pb-[40px] p-3 md:h-full ${isMobile && showLoginForm ? "h-full" : "h-1/2"}`}
            onMouseEnter={() => setHoveredSection("login")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                showLoginForm
                  ? "bg-white"
                  : hoveredSection === "signup"
                    ? "bg-transparent"
                    : "lg:bg-white lg:bg-opacity-50"
              }`}
            ></div>
            <div
              className={`relative z-10 flex flex-col items-center text-center w-full justify-between ${isMobile && showRegisterForm ? "h-auto" : "h-1/2"} ${showLoginForm ? "h-full !justify-normal" : ""}`}
            >
              <p
                className={`subheading-4 leading-[50%] ${isMobile && showRegisterForm ? "bg-white w-full p-3" : "bg-transparent"} ${showLoginForm ? "h-1/4" : ""}`}
                onClick={() => {
                  setShowRegisterForm(false);
                  setShowLoginForm(true);
                  setShowForgotPassword(false);
                }}
              >
                {showForgotPassword ? "RESET PASSWORD" : "LOG IN"}
              </p>
              {!showLoginForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setShowLoginForm(true);
                  }}
                  className={`body-1 w-[218px] text-left lg:h-6 h-8 bg-[#F7F7F5] border-none !text-[#AAA] focus-visible:ring-0 uppercase focus-visible:ring-offset-0 pl-2 ${isMobile && showRegisterForm ? "hidden" : "block"}`}
                >
                  Enter EKKE
                </button>
              ) : (
                <div
                  className={`w-full max-w-md ${showLoginForm ? "h-[75%]" : "h-auto"}`}
                >
                  <Login
                    {...loginProps}
                    pageConfig={pageConfig}
                    fpi={fpi}
                    onForgotPasswordStateChange={
                      handleForgotPasswordStateChange
                    }
                    showForgotPassword={showForgotPassword}
                  />
                </div>
              )}
            </div>
          </section>
          <div className="bg-white bg-opacity-30 relative z-20"></div>
          {/* signup */}
          <section
            className={`flex flex-col items-start relative transition-all duration-500 ease-in-out lg:w-1/2 w-full lg:p-6 p-3 md:h-full ${isMobile && showLoginForm ? "justify-center h-[57px]" : "justify-start h-1/2"} ${isMobile && showRegisterForm ? "!h-full" : "h-1/2"}`}
            onMouseEnter={() => setHoveredSection("signup")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                showRegisterForm
                  ? "bg-white"
                  : hoveredSection === "login"
                    ? "bg-transparent"
                    : "lg:bg-white lg:bg-opacity-50"
              }`}
            ></div>
            <div
              className={`relative z-10 flex flex-col items-center text-center justify-between ${isMobile && showLoginForm ? "h-auto" : "h-1/2"} w-full ${showRegisterForm ? "h-full !justify-normal" : ""}`}
            >
              <p
                className={`subheading-4 leading-[50%] ${
                  isMobile && showLoginForm
                    ? "bg-white w-full p-3 pb-3"
                    : "bg-transparent pb-3"
                } 
            ${showRegisterForm && !isMobile && !isVerifyBothShowing ? "!justify-normal" : "h-auto"}`}
                onClick={() => {
                  setShowLoginForm(false);
                  setShowRegisterForm(true);
                }}
              >
                SIGN UP
              </p>
              {!showRegisterForm ? (
                <button
                  type="submit"
                  className={`body-1 w-[218px] text-left lg:h-6 h-8 !text-[#AAA] bg-[#F7F7F5] border-none focus-visible:ring-0 focus-visible:ring-offset-0 uppercase pl-2 ${isMobile && showLoginForm ? "hidden" : "block"}`}
                  onClick={() => {
                    setShowLoginForm(false);
                    setShowRegisterForm(true);
                  }}
                >
                  SIGN UP
                </button>
              ) : (
                <div className={`w-full max-w-md h-full my-[4rem] mx-auto`}>
                  <Register
                    {...registerProps}
                    pageConfig={pageConfig}
                    onVerifyBothStateChange={setIsVerifyBothShowing}
                  />
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default CustomAuth;
