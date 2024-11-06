import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";

export * from "./user";
export * from "./chats";

export function useCheckForConection() {
  const query = useQuery({
    queryKey: ["checking-for-connection"],
    queryFn: async () => {
      try {
        toast.loading("Connecting to chat server", {
          id: "connecting-to-server",
        });
        //
        const path = "https://chat-app-5sl1.onrender.com/health";
        // const path = "http://localhost:8000/health";

        const data = (await axios.get(path)).data;

        if (data.success) {
          toast.success("Connected to server", { id: "connecting-to-server" });
        }
        return data;
      } catch (error) {
        query.refetch();
        toast.loading("retrying...", { id: "connecting-to-server" });
      }
    },
    retry: 5,
  });
  //   retry when query fails

  return { query };
}
