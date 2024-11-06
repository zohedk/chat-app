import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { MdOutlineAddToPhotos } from "react-icons/md";
import { SearchBar } from "./SearchBar";
import {
  useGetUserChats,
  useSetLatestMessage,
  useSetUnreadMessage,
} from "@/hooks";
import { UserInfoCard } from "./UserInfoCard";
import { useChatPanle } from "@/context/ChatPanelContext";
import { handleUserInfoOnClick } from "@/utils/helpers/chatHelper";
import { AllChatMoreOption } from "../dropdowns";

export const ChatRoomsSection = () => {
  const session = useSession();

  const { query } = useGetUserChats();
  const {
    rooms,
    setSelectedRoom,
    selectedRoom,
    setSelectedUser,
    temporaryRoom,
    setTemporaryRoom,
    unreadMessages,
    setSelectedTab,
  } = useChatPanle();

  const { addUnreadMessage } = useSetUnreadMessage();

  const { updateLatestMessage } = useSetLatestMessage();

  useEffect(() => {
    if (query.isError) {
      console.log(query.error);
    }
  }, [query.isError, rooms]);

  useEffect(() => {
    if (rooms && session && session.data) {
      rooms.map((prop, index) => {
        if (prop.id) {
          prop.chats.forEach((chat) => {
            if (
              !chat.readBy.includes(`${session.data.user.userId}`) &&
              !unreadMessages[`${prop.id}`]
            ) {
              addUnreadMessage({ messageId: chat.id, roomId: `${prop.id}` });
            }
          });
          //
          updateLatestMessage(`${prop.id}`, prop.chats[0]);
          //
        }
      });
    }
  }, [rooms, session, session.data]);

  return (
    <div className="w-[45%] h-full flex flex-col bg-[#111B21] border-l-[1px] border-r-[1px] border-[#ffffff30]">
      {/* top bar */}
      <div className="flex items-center justify-between px-[30px] mt-[20px]">
        <h1 className="text-[25px] text-white font-bold">Chats</h1>
        <div className="flex items-center gap-[15px]">
          <MdOutlineAddToPhotos
            onClick={() => {
              setSelectedTab("create-group");
            }}
            className="text-[25px] text-gray-400 hover:text-white cursor-pointer"
          />
          <AllChatMoreOption />
        </div>
      </div>
      {/* search bar */}

      <div className="w-full flex justify-center items-center">
        <SearchBar
          onClick={({ id, name, email }) => {
            setSelectedRoom(null);
            setSelectedUser({ id, name, email });
            setTemporaryRoom({ userID: id, name: name, email });
          }}
        />
      </div>

      {/* Chats */}
      <div className="w-full mt-[20px]">
        {temporaryRoom && (
          <div
            onClick={() => {
              setSelectedRoom(null);
              setSelectedUser({
                id: temporaryRoom.userID,
                name: temporaryRoom.name,
                email: temporaryRoom.email,
              });
            }}
          >
            <UserInfoCard
              isSearchUser={false}
              userId={temporaryRoom.userID}
              name={temporaryRoom.name}
            />
          </div>
        )}
        {rooms &&
          session &&
          session.data &&
          rooms.map((prop, index) => {
            let friendId = "";
            let friendName = "";
            let friendEmail = "";
            if (!prop.isGroupChat) {
              //
              const usersFriend =
                prop.users.length > 1 && !prop.isGroupChat
                  ? prop.users.filter(
                      ({ id }) => id !== session.data.user.userId
                    )
                  : prop.users;
              friendId = usersFriend[0]?.id;
              friendName = usersFriend[0]?.name;
              friendEmail = usersFriend[0]?.email;
              //
            }
            return (
              <div
                key={prop.id || friendId}
                className="w-full"
                onClick={() => {
                  handleUserInfoOnClick(prop, {
                    friendId,
                    friendEmail,
                    friendName,
                    selectedRoom,
                    setSelectedRoom,
                    setSelectedUser,
                    setTemporaryRoom,
                  });
                }}
              >
                <UserInfoCard
                  isSearchUser={false}
                  key={index}
                  roomId={prop.id}
                  userId={!prop.isGroupChat ? friendId : ""}
                  isGroupChat={prop.isGroupChat}
                  name={prop.isGroupChat ? prop.name : friendName}
                  latestMessage={prop.chats[0]?.content || ""}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};
