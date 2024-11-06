"use client";
import { ChatPanelContextProp } from "@/context/ChatPanelContext";
import { debounce } from "@/hooks";
import React, { use, useEffect, useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
interface MessageInputProp {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  sendTypingNotification: () => void;
  sendUserStopTyping: (setIsTyping: any) => void;
  isTypingInTheRoom: ChatPanelContextProp["isTypingInTheRoom"];
}

const MessageInput: React.FC<MessageInputProp> = ({
  input,
  setInput,
  onSubmit,
  sendTypingNotification,
  sendUserStopTyping,
}) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping) {
      sendTypingNotification();
    }
  }, [isTyping]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim()) {
          onSubmit();
        }
      }}
      className="flex w-full  items-center justify-center"
    >
      <div className="w-[80%] h-[40px] flex items-center justify-between  bg-[#2A3942] rounded-md ">
        <input
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            setInput(value);
            if (!isTyping) {
              setIsTyping(true);
            }
            sendUserStopTyping(setIsTyping);
          }}
          type="text"
          placeholder="Type your message"
          className="w-full bg-transparent outline-none  border-none text-white text-[20px] px-[20px]"
        />
      </div>
      <button
        type="submit"
        className="w-[60px] h-[40px] flex justify-center items-center rotate-[45deg]"
      >
        {/* icon */}
        <RiSendPlaneFill className="text-[30px] hover:text-gray-300 text-gray-400 cursor-pointer" />
      </button>
    </form>
  );
};

export default MessageInput;
