import { useChatPanle } from "@/context/ChatPanelContext";
import { useSetUnreadMessage } from "@/hooks";
import { useWebSocket } from "@/hooks/websocket";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { BiSolidUser } from "react-icons/bi";
import { ChatDropdown } from "../dropdowns";

type UserInfoCardProp = {
  userId?: string;
  roomId?: number;
  name?: string;
  email?: string;
  isGroupChat?: boolean;
  latestMessage?: string;
  isSearchUser: boolean;
};

export const UserInfoCard: React.FC<UserInfoCardProp> = (prop) => {
  const { data: sessionData } = useSession();
  if (!sessionData) return <></>;
  //
  const {
    selectedUser,
    selectedRoom,
    unreadMessages,
    latestMessages,
    isTypingInTheRoom,
  } = useChatPanle();
  //

  useWebSocket({
    roomId: prop?.roomId,
  });

  //
  const { removeUnreadMessages, updateMessageStatus } = useSetUnreadMessage();

  return (
    <div
      onClick={async () => {
        if (prop.roomId) {
          await updateMessageStatus(prop.roomId);
          removeUnreadMessages(`${prop.roomId}`);
        }
      }}
      className={clsx(
        "group relative w-full h-[80px] flex items-center gap-[20px] px-[15px] cursor-pointer",
        (selectedRoom?.id === prop?.roomId ||
          selectedUser?.id === prop?.userId) &&
          !prop.isSearchUser
          ? "bg-[#ffffff28]"
          : "hover:bg-[#ffffff0f]"
      )}
    >
      {/* chat more dropdown */}

      <ChatDropdown />

      {/* profile img */}
      <div className="w-[70px] h-[70px] flex justify-center items-center">
        <div
          className={
            "relative w-[50px] h-[50px] flex justify-center items-end rounded-full overflow-hidden bg-[#697175] cursor-pointer"
          }
        >
          <BiSolidUser className="absolute bottom-[-5px] text-[45px] text-white" />
        </div>
      </div>
      {/* info  */}
      <div className="w-full flex flex-col gap-[5px] overflow-hidden">
        <h2 className="w-full text-white text-[20px]">
          {!prop.isGroupChat ? prop.name?.split(" ")[0] : prop.name}
        </h2>
        <h2 className="w-full flex justify-end items-center text-white text-[15px]">
          <div className="w-full flex items-center">
            {/* if search user show only email  */}
            {prop.isSearchUser && <p className="">{prop.email}</p>}

            {latestMessages[`${prop.roomId}`] && !prop.isSearchUser && (
              <div className="w-full flex items-center">
                <span>
                  {/* if group chat show user who send the message except the loged in user */}
                  {prop.isGroupChat &&
                    latestMessages[`${prop.roomId}`].userId !==
                      sessionData.user.userId && (
                      <span className="font-bold">
                        {latestMessages[`${prop.roomId}`].user.name.split(
                          " "
                        )[0] + ": "}
                      </span>
                    )}
                  {isTypingInTheRoom[`${prop.roomId}`]?.isTyping && (
                    <p className="text-[#04A784] text-[18px]">typing...</p>
                  )}
                  {!isTypingInTheRoom[`${prop.roomId}`]?.isTyping &&
                    latestMessages[`${prop.roomId}`].content.slice(0, 30)}
                  {/* slice message and add dots inf message length excedes */}
                  <span className="text-[18px]">
                    {!isTypingInTheRoom[`${prop.roomId}`]?.isTyping &&
                      latestMessages[`${prop.roomId}`].content.length > 30 &&
                      "........"}
                  </span>
                </span>
              </div>
            )}
          </div>

          {unreadMessages[`${prop?.roomId}`] && (
            <p className="absolute right-[10px] w-[20px] h-[20px] flex justify-center items-center bg-[#04A784] rounded-full text-black text-[14px] font-[500] ">
              {" "}
              {`${unreadMessages[`${prop.roomId}`]?.length}`}
            </p>
          )}
        </h2>
      </div>
      {/* divider */}
    </div>
  );
};
