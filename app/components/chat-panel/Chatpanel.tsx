"use client";
import React, { useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { ChatRoomsSection } from "./ChatRoomsSection";
import { Chats } from "./Chats";
import { ChatPanelContextProp, useChatPanle } from "@/context/ChatPanelContext";
import { Profile } from "../tabs";
import CreateGroup from "../tabs/CreateGroup";

function showSelectedTab(selectedTab: ChatPanelContextProp["selectedTab"]) {
  switch (selectedTab) {
    case "chats":
      return <ChatRoomsSection />;
    case "profile":
      return <Profile />;
    case "create-group":
      return <CreateGroup />;
  }
}
export const Chatpanel = () => {
  const { selectedUser, selectedRoom, selectedTab } = useChatPanle();
  useEffect(() => {});
  return (
    <div className="w-full h-full flex">
      {/* side bar */}
      <Sidebar />
      {/* all friends */}
      {showSelectedTab(selectedTab)}
      {/* chats messages */}
      {selectedUser || selectedRoom ? (
        <Chats />
      ) : (
        <div className="w-full h-full flex justify-center items-center bg-[#1F2C33]">
          <h1 className=" text-white text-[40px] font-bold">
            Starts your chit chats
          </h1>
        </div>
      )}
    </div>
  );
};
