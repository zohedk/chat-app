import { useRouter } from "next/navigation";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RoomResponse, SearchResponse, UserData } from "@/utils/types";
import { useChatPanle } from "@/context/ChatPanelContext";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
//
export function useSignup() {
  const navigate = useRouter();
  const mutation = useMutation({
    mutationKey: [],
    mutationFn: async (data: any) => {
      toast.loading("signing up", { id: "signup" });
      const resData = (await axios.post("/api/v1/user", data)).data;
      return resData;
    },
    onSuccess: (data) => {
      toast.success(data.message || "signed up", { id: "signup" });
      navigate.push("/login");
    },
    onError: (error) => {
      // @ts-ignore
      const errMsg = error?.response?.data?.message;
      // @ts-ignore
      console.log("all errro", error?.response?.data?.errors);
      console.log("signup", errMsg);
      toast.error(errMsg || "error signin up", { id: "signup" });
    },
  });
  return { mutation };
}
//
export function debounce<T extends (...args: any) => any>(
  cb: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | void {
  let timeout: NodeJS.Timeout;

  return (...args): any => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

//
export function useSearchUsers(isGroupChat?: boolean) {
  const { data: sessionData } = useSession();
  const [users, setUsers] = useState<SearchResponse["users"] | []>([]);
  const [searching, setSearching] = useState(false);
  //
  useEffect(() => {
    setSearching(false);
  }, [users]);
  // a debounced funtion to seach users when user stop typing for 500ms

  const searchUsers = useCallback(
    debounce(async (searchInput: string) => {
      //
      if (!sessionData) return;
      setSearching(true);
      try {
        console.log("search input:", searchInput);
        if (!searchInput) return;
        const data = (await axios.get(`/api/v1/user?search=${searchInput}`))
          .data as SearchResponse;

        if (data.success && isGroupChat) {
          setSearching(false);
          const filteredUser = data.users.filter(
            ({ id }) => id !== sessionData.user.userId
          );
          setUsers(filteredUser);
          return;
        }

        if (data.success) {
          setSearching(false);
          setUsers(data.users);
        }
      } catch (error) {
        setSearching(false);
        console.log("user search error", error);
      }
    }, 500),
    [sessionData]
  );

  return { searchUsers, users, searching, setUsers };
}
