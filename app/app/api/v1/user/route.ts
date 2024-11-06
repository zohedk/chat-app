import { NextRequest, NextResponse } from "next/server";
import { signUpSchema } from "@/utils/schemas";
import {
  createUser,
  generateResponse,
  hashPassword,
  validateEmailSyntax,
} from "@/utils/helpers";
import { prisma } from "@/clients/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const reqBody = await req.json();

    if (Object.keys(reqBody).length === 0) {
      return generateResponse(411, false, "user info not provided");
    }
    //
    const parsedBody = signUpSchema.safeParse(reqBody);
    // checking if all the types are correct
    if (!parsedBody.success) {
      return generateResponse(411, false, "invalid body", {
        errors: parsedBody.error.format(),
      });
    }
    // checking if user already present
    const userInDb = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });
    if (userInDb) {
      return generateResponse(409, false, "User already exist with this email");
    }

    const { name, email, password } = parsedBody.data;
    //hashing password and creating user
    const hashedPassword = await hashPassword(password);
    //
    await createUser("credentials", { name, email, password: hashedPassword });
    //TODO: add email sending functionality to verify email
    //
    return generateResponse(200, true, "Signed up successfully");

    //
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }
    const search = req.nextUrl.searchParams.get("search");

    if (!search || search?.trim() === "") {
      return generateResponse(400, false, "please provide name or email");
    }

    // checking if use is sending email or name
    const isEmail = validateEmailSyntax(search);

    const users = await prisma.user.findMany({
      where: isEmail
        ? {
            email: { contains: search, mode: "insensitive" },
          }
        : {
            name: { contains: search, mode: "insensitive" },
          },

      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 20, // Limit results
    });

    return generateResponse(200, true, "fetched users successfully", {
      users,
    });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
