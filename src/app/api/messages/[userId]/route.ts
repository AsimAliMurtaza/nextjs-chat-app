import { NextRequest, NextResponse } from "next/server";
import dcbConnect from "@/libs/mongodb";
import Message from "@/models/message";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await dcbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = session.user?.id;
  const chatUserId = params.userId;

  if (!currentUserId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Fetch messages between current user and chat user, excluding deleted ones
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: chatUserId },
      { sender: chatUserId, receiver: currentUserId },
    ],
    deletedBy: { $ne: currentUserId }, // Exclude messages deleted by current user
  }).sort({ timestamp: 1 });

  return NextResponse.json(messages);
}
