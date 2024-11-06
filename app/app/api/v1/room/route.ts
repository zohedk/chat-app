import { generateResponse } from "@/utils/helpers";
import { NextRequest } from "next/server";
import { prisma } from "@/clients/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { roomSchema } from "@/utils/schemas/roomSchema";

//route to get all user chats rooms
export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }

    // room associated to both users
    const rooms = await prisma.chatRoom.findMany({
      where: {
        users: { some: { id: session.user.userId } },
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        chats: {
          where: {
            OR: [
              {
                // only taking chats which users have not read
                readBy: {
                  none: { user: { id: session.user.userId } },
                },
              },
              {
                // Condition to get the latest message if no unread messages
                readBy: {
                  some: { user: { id: session.user.userId } },
                },
              },
            ],
          },
          include: {
            user: {
              select: { name: true },
            },
            readBy: {
              select: {
                user: { select: { id: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!rooms) {
      return generateResponse(200, false, "no room found");
    }

    // extracting all ready by users and making readBy an array of userId's
    rooms.forEach((room) => {
      room.chats.forEach((chat) => {
        // @ts-ignore
        chat.readBy = chat.readBy.map(({ user }) => user.id);
      });
      return room;
    });

    // Manually sort the rooms by the latest chat's `createdAt`
    const sortedRooms = rooms.sort((a, b) => {
      const latestChatA = a.chats[0]?.createdAt || a.createdAt;
      const latestChatB = b.chats[0]?.createdAt || b.createdAt;
      // If room A has no chat, keep it in its original position
      if (!latestChatA) return 1;

      // If room B has no chat, keep it in its original position
      if (!latestChatB) return -1;
      return new Date(latestChatB).getTime() - new Date(latestChatA).getTime();
    });

    return generateResponse(200, true, "got your chats", {
      rooms: sortedRooms,
    });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
// route to create room
export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return generateResponse(400, false, "Not Authorized");
    }
    const reqBody = await req.json();

    if (Object.keys(reqBody).length === 0) {
      return generateResponse(411, false, "user info not provided");
    }
    //
    const parsedBody = roomSchema.safeParse(reqBody);
    // checking if all the types are correct
    if (!parsedBody.success) {
      return generateResponse(411, false, "invalid body", {
        errors: parsedBody.error.format(),
      });
    }

    const { isGroupChat, users, name } = parsedBody.data;
    //
    if (isGroupChat) {
      const room = await prisma.chatRoom.create({
        data: {
          name,
          isGroupChat,
          users: { connect: users.map((id) => ({ id })) },
          admins: { connect: { id: session.user.userId } },
        },
      });
      return generateResponse(200, true, `group created with name: ${name}`, {
        room,
      });
    }
    //
    if (users.length !== 2) {
      return generateResponse(
        400,
        false,
        "only 2 user are allowed in one to one room"
      );
    }

    //
    let roomExist;
    //
    if (users[0] === users[1] && users[0] === session.user.userId) {
      // checking if user already have a self chat rooom
      roomExist = await prisma.chatRoom.findFirst({
        where: {
          isGroupChat: false,
          users: {
            every: {
              id: session.user.userId,
            },
          },
        },
        include: {
          users: true,
        },
      });
    }
    if (
      users[0] !== users[1] &&
      (users[0] === session.user.userId || users[1] === session.user.userId)
    ) {
      //
      roomExist = await prisma.chatRoom.findFirst({
        where: {
          isGroupChat: false,
          AND: users.map((id) => ({ users: { some: { id } } })),
        },
        include: {
          users: true,
        },
      });
    }

    if (roomExist) {
      return generateResponse(
        400,
        true,
        "room already exist with both the user"
      );
    }
    const room = await prisma.chatRoom.create({
      data: {
        isGroupChat,
        users: { connect: users.map((id) => ({ id })) },
      },
    });

    return generateResponse(200, true, `room created successfully`, { room });
  } catch (e: any) {
    return generateResponse(400, false, e.message);
  }
};
//
// route to delte room
// export const DELETE = async (req: NextRequest) => {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return generateResponse(400, false, "Not Authorized");
//     }

//     const roomId = req.nextUrl.searchParams.get("roomId");

//     if (!roomId) {
//       return generateResponse(400, false, "roomId not provided");
//     }

//     // checking if loged in user is admin the group
//     const user_is_admin_of_room = await prisma.room.delete({
//       where: {
//         id: parseInt(roomId),
//         isGroupChat: false,
//         admins: { some: { id: session.user.userId } },
//       },
//     });
//    return  generateResponse(200, true,`room deleted with roomId ${}`)
//   } catch (e: any) {
//     return generateResponse(400, false, e.message);
//   }
// };
