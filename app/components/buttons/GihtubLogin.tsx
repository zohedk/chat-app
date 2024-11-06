"use client";
import { signIn, useSession } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import React, { CSSProperties } from "react";

interface Props {
  style?: CSSProperties;
  iconStyle?: CSSProperties;
  textStyle?: CSSProperties;
  text: string;
}

export const GithubLogin: React.FC<Props> = ({
  style,
  iconStyle,
  text,
  textStyle,
}) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        signIn("github", { redirect: false });
      }}
      className="flex justify-center items-center font-bold bg-[#2C2C30]  hover:bg-[#71717A] rounded-md gap-[10px] cursor-pointer text-white "
      style={{ width: "200px", height: "50px", ...style }}
    >
      <FaGithub style={{ width: "25px", height: "25px", ...iconStyle }} />
      <span style={textStyle}>{text}</span>
    </button>
  );
};
