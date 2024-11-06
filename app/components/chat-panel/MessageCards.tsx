import { Room } from "@/context/ChatPanelContext";
import { ChatResponse } from "@/utils/types";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import React from "react";
import { MessageDropdown } from "../dropdowns/MessageDropdown";

interface MessageCards extends ChatResponse {
  isGroupChat?: boolean;
  dropDownOnTop: boolean;
}

export const MessageCards: React.FC<MessageCards> = (prop) => {
  const { data: sessionData } = useSession();
  if (!sessionData) return <></>;

  return (
    <div
      className={clsx(
        "relative w-full flex items-center ",
        prop.userId === sessionData.user.userId && "justify-end"
      )}
    >
      {/* message box */}
      <div
        className={clsx(
          "group  relative w-fit max-w-[60%]  p-[10px] pr-[30px] text-white rounded-md",
          prop.userId === sessionData.user.userId
            ? "bg-[#015C4B]  rounded-br-none"
            : "bg-[#1F2C33]  rounded-tl-none"
        )}
      >
        {/* message drop down */}
        <MessageDropdown
          position={
            prop.userId === sessionData.user.userId
              ? prop.dropDownOnTop
                ? "top-left"
                : "left"
              : prop.dropDownOnTop
              ? "top-right"
              : "right"
          }
        />

        {prop.isGroupChat && sessionData.user.userId !== prop.userId && (
          <p className="aboslute top-[3px] left-[4px] text-[13px] text-[#03CF9C]">
            {prop.user.name.split(" ")[0]}
          </p>
        )}
        <p>{prop.content}</p>
      </div>
    </div>
  );
};
