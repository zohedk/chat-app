import React, { CSSProperties } from "react";
import { signIn } from "next-auth/react";
import clsx from "clsx";
import { GoogleLogo } from "../logo";
//
interface GoogleButtonProp {
  className?: string;
  style?: CSSProperties;
  text: string;
}
//
export const GoolgeLogin: React.FC<GoogleButtonProp> = (prop) => {
  //
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        signIn("google", { redirect: false });
      }}
      className={clsx(
        "flex items-center justify-center gap-[10px] bg-[#4284F3]  px-[15px] rounded-md",
        prop.className
      )}
      style={prop.style}
    >
      <GoogleLogo className="w-[30px] h-[30px] bg-[#FEFCF8] rounded-lg" />
      <p className="text-white font-bold bg-transparent">{prop.text}</p>
    </button>
  );
};
