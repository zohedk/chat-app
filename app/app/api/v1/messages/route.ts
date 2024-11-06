import { authOptions } from "@/lib/auth";
import { generateResponse } from "@/utils/helpers";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { prisma } from "@/clients/db";
import { updateMessageStatusSchema } from "@/utils/schemas/messageSchema";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }

    const roomId = req.nextUrl.searchParams.get("roomId");
    const page = req.nextUrl.searchParams.get("page");
    const limit = req.nextUrl.searchParams.get("limit");
    //
    if (!roomId || !page || !limit) {
      return generateResponse(
        400,
        false,
        "one of the param not provided roomId, page, limit"
      );
    }
    //
    const start = (parseInt(page) - 1) * parseInt(limit);

    const chats = await prisma.message.findMany({
      where: { room: { id: parseInt(roomId) } },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: start,
      take: parseInt(limit),
    });

    //
    return generateResponse(200, true, "fetched room messages successfully", {
      chats: chats || [],
    });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
//
export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }

    const { message, roomId } = await req.json();

    const createdMessage = await prisma.message.create({
      data: {
        user: { connect: { id: session.user.userId } },
        room: { connect: { id: roomId } },
        readBy: {
          create: {
            user: { connect: { id: session.user.userId } },
          },
        },
        content: message,
      },
    });

    return generateResponse(200, true, "message created", {
      createdMessage,
    });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
//
// this will handle marking message staus to read
export const PATCH = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }

    const reqBody = (await req.json()) as { messages: string[] };

    const parsedBody = updateMessageStatusSchema.safeParse(reqBody);
    // checking if all the types are correct
    if (!parsedBody.success) {
      return generateResponse(411, false, "invalid body", {
        errors: parsedBody.error.format(),
      });
    }

    const { messages } = parsedBody.data;

    const messagesToMarkRed = messages.map((chatId) => {
      return { chatId, userId: session.user.userId };
    });

    await prisma.messageReadReceipt.createMany({
      data: messagesToMarkRed,
      skipDuplicates: true,
    });

    return generateResponse(200, true, "messages status updated");
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
