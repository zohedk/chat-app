import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string({ required_error: "name is required" }),
  email: z.string().email({ message: "invalid email syntax" }),
  password: z
    .string({ required_error: "password is required" })
    .min(8, { message: "password must be 8 characters long" })
    .regex(/[a-z]/, {
      message: "Add a lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Add a uppercase letter",
    })
    .regex(/\d/, { message: "password must have one digit" })
    .regex(/[!@#$%^&*()_+]/, {
      message: "Add a special character",
    }),
});
