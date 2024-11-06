import { NextRequest } from "next/server";
import { prisma } from "@/clients/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse } from "@/utils/helpers";
//

export const GET = () => {
  return generateResponse(200, true, "all good");
};
