import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Message from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await req.json();
  const currentUserId = (session.user as { id: string }).id;

  if (!messageId || !currentUserId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Mark message as deleted for the current user only
  await Message.findByIdAndUpdate(messageId, {
    $addToSet: { deletedBy: currentUserId },
  });

  return NextResponse.json({ success: true });
}
