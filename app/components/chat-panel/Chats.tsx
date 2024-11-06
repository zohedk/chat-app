"use client";
import { useChatPanle } from "@/context/ChatPanelContext";
import { useSendMessage } from "@/hooks/websocket";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BiSolidUser } from "react-icons/bi";
import MessageInput from "./MessageInput";
import { useCreateOneToOneChat, useGetRoomChats } from "@/hooks";
import toast from "react-hot-toast";
import { MessageCards } from "./MessageCards";
import { PageObserver } from "../PageObserver";

//
export const Chats = () => {
  //using page and limit state for infinty scroll
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  //
  const messageBox = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const { selectedUser, selectedRoom, isTypingInTheRoom } = useChatPanle();
  //
  const { sendMessage, sendTypingNotification, sendUserStopTyping } =
    useSendMessage(selectedRoom?.id);
  //
  const { mutation: createRoomMutation } = useCreateOneToOneChat();
  //

  //
  const {
    query,
    messages: roomMessages,
    setMessages: setRoomMessages,
  } = useGetRoomChats({
    roomId: selectedRoom?.id,
    page,
    limit,
  });
  //Scroll to the bottom of the chat when the component mounts or messages change
  const handleScrollBottoom = useCallback(
    (heightToscroll: number) => {
      if (messageBox.current) {
        messageBox.current.scrollTop = heightToscroll;
      }
    },
    [messageBox]
  );
  //
  useEffect(() => {
    if (!messageBox.current) return;
    // only scroll
    if (page === 1 && roomMessages.length > 0) {
      handleScrollBottoom(messageBox.current.scrollHeight);
    }
  }, [roomMessages, messageBox]);
  //
  useEffect(() => {
    //reseting page on change of room and reseting messages
    setPage(1);
    setInput("");
    if (selectedRoom) {
      query.refetch();
    }
    if (!selectedRoom) {
      setRoomMessages([]);
    }
  }, [selectedRoom]);

  //
  const handleSendMessage = useCallback(() => {
    if (!input) {
      return toast.error("please type something", { id: "nothing-typed" });
    }
    // if no roomId is selected than user is sending message to a new friend so create a room for them than send message
    if (selectedRoom && selectedRoom.id) {
      sendMessage({
        message: input,
        roomId: `${selectedRoom.id}`,
      });
    } else {
      if (selectedUser)
        createRoomMutation.mutate({ friendId: selectedUser.id, input });
    }
    setInput("");
  }, [selectedUser, selectedRoom, input]);
  //
  return (
    <div className="  w-full h-full flex flex-col  overflow-hidden ">
      {/* topbar */}

      <div className="  w-full h-[70px] flex  justify-between items-center  bg-[#1F2C33] pl-[20px] pr-[20px]">
        <div className="flex items-center gap-[20px]">
          {/* profile pic */}
          <div
            className={
              "relative w-[40px] h-[40px] flex justify-center items-end rounded-full overflow-hidden bg-[#697175] cursor-pointer"
            }
          >
            <BiSolidUser className="absolute bottom-[-5px] text-[35px] text-white" />
          </div>
          {/* name */}
          <h2 className="text-white font-bold">
            {(selectedRoom && selectedRoom.name) ||
              (selectedUser && selectedUser.name.split(" ")[0])}
            {isTypingInTheRoom[`${selectedRoom?.id}`]?.isTyping && (
              <p className="text-[14px]">typing...</p>
            )}
          </h2>
        </div>
      </div>

      {/* chats*/}
      <div
        ref={messageBox}
        className="relative w-full h-full flex flex-col-reverse gap-[7px] bg-[#0c1318f0] bg-blend-multiply  overflow-y-scroll overflow-x-hidden px-[30px] py-[30px]"
        style={{
          backgroundImage: "url('/chat-bg.png')",
          backgroundSize: "calc(100%/3)",
        }}
      >
        {roomMessages.map((prop, index) => {
          return (
            <MessageCards
              // last ten elem dropdown should open on top
              dropDownOnTop={index <= 3}
              key={prop.id}
              isGroupChat={selectedRoom?.isGroupChat}
              {...{ ...prop }}
            />
          );
        })}
        {/* when observer come into the window view it will refetch message with new page and limit */}
        {selectedRoom && roomMessages.length >= 20 && (
          <PageObserver
            setRoomMessage={setRoomMessages}
            roomMessages={roomMessages}
            roomId={selectedRoom.id}
            limit={limit}
            setLimit={setLimit}
            page={page}
            setPage={setPage}
          />
        )}
      </div>

      {/* input bar */}
      <div className=" w-full h-[70px] flex items-center justify-center bg-[#1F2C33]">
        {/* input  */}
        <MessageInput
          isTypingInTheRoom={isTypingInTheRoom}
          input={input}
          setInput={setInput}
          onSubmit={handleSendMessage}
          sendTypingNotification={sendTypingNotification}
          sendUserStopTyping={sendUserStopTyping}
        />
      </div>
    </div>
  );
};
