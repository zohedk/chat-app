"use client";
import { Chatpanel } from "@/components/chat-panel";
import { useCheckForConection } from "@/hooks";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  // A custon hooks which checks for connection to chat server
  useCheckForConection();

  return (
    <div className="w-screen h-screen bg-[#0C1318] p-[20px]">
      <Chatpanel />
    </div>
  );
}
