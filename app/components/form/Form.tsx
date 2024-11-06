"use client";
import React, { Children } from "react";

import { z } from "zod";
import {
  createContext,
  CSSProperties,
  InputHTMLAttributes,
  useContext,
} from "react";
import {
  useForm,
  SubmitHandler,
  UseFormRegister,
  FormState,
} from "react-hook-form";
import { ChildProcess } from "child_process";
import { restrictChildrenType } from "@/utils/helpers/restrictChildrenType";

export interface SchemaProp {
  type:
    | "input"
    | "input_group"
    | "checkbox"
    | "checkbox_group"
    | "options"
    | "radio"
    | "radio_group";
  group?: {
    className?: string;
    style?: CSSProperties;
    inputs: SchemaProp[];
  };
  max_length?: number;
  min_lenght?: number;
  props?: InputHTMLAttributes<HTMLInputElement>;
  lable_text?: string;
  lable_style?: CSSProperties;
  lable_className?: string;
  validation?: { isRequired: boolean; pattern: RegExp; message?: string };
}

interface FormContextProp {
  schema: SchemaProp[];
  onSubmit: SubmitHandler<any>;
  register: UseFormRegister<any>;
  formState: FormState<any>;
}

const FormContext = createContext<FormContextProp | null>(null);

interface FormProp {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onSubmit: SubmitHandler<any>;
  schema: SchemaProp[];
}

const Root: React.FC<FormProp> = ({
  children,
  onSubmit,
  className,
  style,
  schema,
}) => {
  const { register, handleSubmit, formState, setError } = useForm<any>();
  // throwing error when user users  button tag inside Form.Root
  restrictChildrenType(
    "button",
    children,
    "please dont user any  button tags inside Form.Root as its will trigger the form if you need some extra button put them outside the Form.Root for example"
  );
  return (
    <FormContext.Provider value={{ onSubmit, schema, register, formState }}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={className}
        style={style}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

//
// Function to generate an error message
function generateErrorMessagePassword(value: string) {
  const password = z
    .string({ required_error: "password is required" })
    .min(8, { message: "8 characters" })
    .regex(/[a-z]/, {
      message: "one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "one uppercase letter",
    })
    .regex(/\d/, { message: " one digit" })
    .regex(/[!@#$%^&*()_+]/, {
      message: "one special character",
    });

  const parsedPassword = password.safeParse(value);

  if (!parsedPassword.success) {
    let errorMessage = `passowrd must have`;
    parsedPassword.error.errors.forEach(({ message }) => {
      errorMessage = `${errorMessage}, ${message} `;
    });
    return errorMessage;
  }
  return "";
}
//
const Input: React.FC<SchemaProp> = ({
  props,
  validation,
  max_length,
  min_lenght,
  lable_text,
  lable_style,
  lable_className,
}) => {
  //
  const {
    register,
    formState: { errors },
  } = useContext(FormContext)!;
  //
  return (
    <div key={props?.name} className="w-[100%] flex flex-col justify-end">
      {validation?.isRequired ? (
        <>
          {lable_text && (
            <label
              style={lable_style}
              className={lable_className}
              htmlFor={props?.name}
            >
              {lable_text}
            </label>
          )}
          <input
            {...props}
            id={props?.name}
            autoComplete={"current-password"}
            {...register(props?.name!, {
              required: `${props?.name} is required`,
              maxLength: max_length,
              minLength: min_lenght,
              validate: {
                matchPattern: (value) => {
                  if (props?.name === "password" && !validation.message) {
                    return (
                      validation.pattern.test(value) ||
                      generateErrorMessagePassword(value)
                    );
                  }
                  return validation.pattern.test(value) || validation.message;
                },
              },
            })}
          />
          <p
            className="text-[orangered] h-[1px]"
            style={{ width: props?.width }}
          >
            {props?.name && errors[props.name] && (
              <>{errors[props.name]?.message}</>
            )}
          </p>
        </>
      ) : (
        <>
          {" "}
          {lable_text && <label htmlFor={props?.name}>{lable_text}</label>}
          <input {...props} id={props?.name} className="flex-1" />
        </>
      )}
    </div>
  );
};
//
const InputGroup: React.FC<SchemaProp> = ({ group }) => {
  const {
    formState: { errors },
  } = useContext(FormContext)!;
  return (
    <div className={group?.className} style={group?.style}>
      {group?.inputs.map((data) => {
        return <Input key={data.props?.name} {...data} />;
      })}
    </div>
  );
};
//
const Content = () => {
  const { schema } = useContext(FormContext)!;

  return (
    <>
      {schema.map((data, index) => {
        switch (data.type) {
          case "input":
            return <Input key={data.props?.name} {...data} />;

          case "input_group":
            return <InputGroup key={index} {...data} />;
        }
      })}
    </>
  );
};
//
const Submit: React.FC<{
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  loader?: React.ReactNode;
}> = ({ className, style, children, loader }) => {
  const {
    formState: { isSubmitting },
  } = useContext(FormContext)!;

  return (
    <button
      disabled={isSubmitting}
      type="submit"
      className={className}
      style={style}
      title="hello world"
    >
      {!isSubmitting ? children : loader}
    </button>
  );
};

export const Form = {
  Root,
  Submit,
  Content,
};
