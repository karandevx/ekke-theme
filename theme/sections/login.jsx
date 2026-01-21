import React from "react";
import { useFPI } from "fdk-core/utils";
import useLogin from "../page-layouts/login/useLogin";
import AuthContainer from "../page-layouts/auth/auth-container/auth-container";
import { getConfigFromProps } from "../helper/utils";
import Login from "../page-layouts/login/login";
import "../page-layouts/login/login.less";
import CustomAuth from "../page-layouts/auth/auth";
import useRegister from "../page-layouts/register/useRegister";
import { useMobile } from "../helper/hooks";

function Component({ props }) {
  const fpi = useFPI();
  const loginProps = useLogin({ fpi });
  const registerProps = useRegister({ fpi });
  const pageConfig = getConfigFromProps(props);
  const isMobile = useMobile();

  return (
    <AuthContainer
      bannerImage={
        isMobile ? pageConfig?.mobile_image_banner : pageConfig?.image_banner
      }
      bannerAlignment={pageConfig?.image_layout}
      className={"h-full"}
      // style={{ height: "calc(100vh - 204px)" }}
    >
      {/* <Login {...loginProps} pageConfig={pageConfig} /> */}
      <CustomAuth
        loginProps={loginProps}
        registerProps={registerProps}
        pageConfig={pageConfig}
        fpi={fpi}
      />
    </AuthContainer>
  );
}

export default Component;

export const settings = {
  label: "t:resource.common.login",
  props: [
    // {
    //   id: "image_layout",
    //   type: "select",
    //   options: [
    //     {
    //       value: "no_banner",
    //       text: "t:resource.common.no_banner",
    //     },
    //     {
    //       value: "right_banner",
    //       text: "t:resource.common.right_banner",
    //     },
    //     {
    //       value: "left_banner",
    //       text: "t:resource.common.left_banner",
    //     },
    //   ],
    //   default: "no_banner",
    //   label: "t:resource.common.image_layout",
    // },
    {
      type: "image_picker",
      id: "image_banner",
      default: "",
      label: "t:resource.common.image_banner",
    },
    {
      type: "image_picker",
      id: "mobile_image_banner",
      default: "",
      label: "Mobile image banner",
    },
  ],
};
