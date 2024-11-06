import { AuthType, User } from "../types";
import { prisma } from "@/clients/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

// type guard to check if the authType is 'credentials'
function isCredentialsUser(
  authType: AuthType,
  user: Omit<User<AuthType>, "id">
): user is User<"credentials"> {
  return authType === "credentials";
}

export async function createUser<T extends AuthType>(
  authType: T,
  user: Omit<User<T>, "id">
) {
  if (isCredentialsUser(authType, user)) {
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        authType,
      },
    });
    return createdUser;
  }
  const createdUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      authType,
    },
  });
  return createdUser;
}

export async function hashPassword(password: string): Promise<string> {
  const SALT = parseInt(process.env.SALT as string);
  const genSalt = await bcrypt.genSalt(SALT);
  const hashedPassword = await bcrypt.hash(password, genSalt);
  return hashedPassword;
}

export async function checkPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const passwordMatched = await bcrypt.compare(password, hashedPassword);
  return passwordMatched;
}

export async function generateResponse(
  status: number,
  success: boolean,
  message: string,
  props?: object
) {
  return NextResponse.json(
    {
      success,
      message,
      ...props,
    },
    { status }
  );
}

//
export function validateEmailSyntax(value: string): boolean {
  const email = z.string().email();

  const isValidEmail = email.safeParse(value);

  if (!isValidEmail.success) {
    return false;
  }

  return true;
}
