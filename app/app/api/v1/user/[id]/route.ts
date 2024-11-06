import { authOptions } from "@/lib/auth";
import { generateResponse } from "@/utils/helpers";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { prisma } from "@/clients/db";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }
    const userId = params.id;
    if (!userId) {
      return generateResponse(400, false, "Please provide the user id");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });
    return generateResponse(200, true, "fetched user successfully", { user });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
