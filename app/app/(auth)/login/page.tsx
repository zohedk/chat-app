import { LoginForm } from "@/components/form";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IoIosCheckmark } from "react-icons/io";
import Link from "next/link";
import { LinkButton } from "@/components/buttons";
//
const Login = async () => {
  //
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");
  //
  return (
    <div className="w-screen  flex flex-col justify-center items-center">
      {/* app bar */}
      <div className="sticky top-0 flex items-center justify-between w-screen h-[70px] border-b-[1px] border-[#dfddd2] px-[100px]">
        <h1 className="text-[25px] font-bold">Chit Chat</h1>
        <LinkButton
          title="Sign Up"
          href="/signup"
          className="w-[100px] h-[40px] rounded-md bg-[#4284F3] hover:bg-[#6293e9] text-white font-bold"
        />
      </div>
      {/* content */}
      <div className="flex flex-col mt-[100px] ">
        <div className="flex justify-between items-center gap-[50px]">
          {/* text info */}

          {/* form */}
          <LoginForm />
        </div>{" "}
        {/* companies trust */}
        <div></div>
      </div>
    </div>
  );
};

export default Login;
