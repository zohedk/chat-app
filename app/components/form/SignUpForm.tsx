"use client";
import React from "react";
import { Form } from "./Form";
import { signUpFomrSchema } from "@/utils/schemas";
import { GithubLogin, GoolgeLogin } from "../buttons";
import { useSignup } from "@/hooks";
import { useRouter } from "next/navigation";

//
export const SignUpForm = () => {
  const navigate = useRouter();
  const { mutation } = useSignup();

  function onSubmitHandler(data: any) {
    mutation.mutate(data);
  }
  return (
    <div className="w-[600px]  flex flex-col items-center gap-[20px] border-[#dfddd2] border-[1px] rounded-md py-[20px]">
      <GoolgeLogin
        text="Signup with google"
        style={{ width: "90%", height: "50px" }}
      />
      <GithubLogin style={{ width: "90%" }} text="Signup with github" />
      <div className="w-[90%] flex items-center gap-[10px]">
        <span className="w-[100%] h-[1px] bg-[#dfddd2]"></span>
        <span className="flex-1 text-[#403F3E] font-[500]">or</span>
        <span className="w-[100%] h-[1px] bg-[#dfddd2]"></span>
      </div>
      <Form.Root
        className=" w-full  flex flex-col items-center gap-[20px]"
        onSubmit={onSubmitHandler}
        schema={signUpFomrSchema}
      >
        <div className="w-[90%] flex flex-col gap-[25px]">
          <Form.Content />
        </div>
        <Form.Submit
          loader={
            <div className="w-full h-full flex justify-center items-center bg-[#4284F3] hover:bg-[#6293e9] text-[18px] font-[500]  text-white  rounded-full  transition-all duration-200 ease-out">
              <div className="w-[30px] h-[30px] border-r-0 border-[3px] border-white animate-spin rounded-full"></div>
            </div>
          }
          className=" bottom-[10px] w-[90%] h-[50px] mt-[50px]"
        >
          <div
            className={
              "w-full h-full flex justify-center items-center bg-[#4284F3] hover:bg-[#6293e9] text-[18px] font-[500]  text-white  rounded-full  transition-all duration-200 ease-out"
            }
          >
            Signup
          </div>
        </Form.Submit>
      </Form.Root>
      <div
        onClick={() => {
          navigate.push("/login");
        }}
        className="w-[90%] flex justify-end items-center gap-[5px] px-[5px] font-[500]"
      >
        Already have a account?{" "}
        <button className="text-[17px] text-[#4284F3] hover:text-[#6293e9] font-bold">
          login
        </button>
      </div>
    </div>
  );
};
