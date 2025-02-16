import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Message from "@/models/message";
import dbConnect from "@/libs/mongodb";

// ✅ GET Route: Fetch chat history
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  if (!user1 || !user2) {
    return NextResponse.json({ error: "User IDs required" }, { status: 400 });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST Route: Save new message & return chat history
export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sender, receiver, message } = await req.json();

    if (!sender || !receiver || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Save the message with timestamp
    const newMessage = await Message.create({
      sender,
      receiver,
      message,
      timestamp: new Date(),
    });

    console.log("New message saved:", newMessage);

    // ✅ Send real-time update via WebSocket
    fetch(`http://localhost:3001`, {
      method: "POST",
      body: JSON.stringify(newMessage),
      headers: { "Content-Type": "application/json" },
    }).catch(console.error);

    return NextResponse.json(newMessage); // ✅ Only return the new message
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
