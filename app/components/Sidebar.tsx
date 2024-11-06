import React from "react";
import { BiSolidUser } from "react-icons/bi";
import { useChatPanle } from "@/context/ChatPanelContext";
import { PiWechatLogoLight, PiWechatLogoFill } from "react-icons/pi";
import clsx from "clsx";

//
export const Sidebar = () => {
  //
  const { selectedTab, setSelectedTab } = useChatPanle();
  //

  return (
    <div className="w-[110px] h-full flex flex-col items-center justify-between  bg-[#1F2C33]">
      <div
        onClick={() => {
          setSelectedTab("chats");
        }}
        className={clsx(
          "mt-[40px] w-[40px] h-[40px] flex justify-center items-center rounded-full cursor-pointer",
          selectedTab === "chats" ? "bg-[#ffffff24]" : "hover:bg-[#ffffff4e]"
        )}
      >
        {selectedTab === "chats" ? (
          <PiWechatLogoFill className="text-[25px] text-white" />
        ) : (
          <PiWechatLogoLight className="text-[25px] text-white" />
        )}
      </div>
      <div
        onClick={() => {
          setSelectedTab("profile");
        }}
        className={clsx(
          "relative mb-[30px] w-[40px] h-[40px] flex justify-center items-end rounded-full overflow-hidden bg-[#697175] cursor-pointer",
          selectedTab === "profile" && "border-[3px] border-gray-400"
        )}
      >
        <BiSolidUser className="absolute bottom-[-5px] text-[35px] text-white" />
      </div>
    </div>
  );
};
