import { signOut } from "next-auth/react";
import React from "react";
import { LuLogOut } from "react-icons/lu";

const LogoutBtn = () => {
  return (
    <div
      className=" flex items-center text-[#E91E62] hover:text-[#ff76a3] gap-[5px]"
      onClick={() => {
        signOut();
      }}
    >
      <LuLogOut className="text-[25px]" />
      <button className="">Log out</button>
    </div>
  );
};

export default LogoutBtn;
