// app/api/messages/deleteForEveryone/route.ts
import { NextResponse } from "next/server";
import Message from "@/models/message";  // Adjust to your actual path
import mongoose from "mongoose";

// The deleteForEveryone handler
export async function POST(request: Request) {
  const { messageId, userId } = await request.json();

  if (!messageId || !userId) {
    return NextResponse.json({ message: "Message ID and user ID are required" }, { status: 400 });
  }

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    // Check if the current user is the sender of the message
    if (message.sender !== userId) {
      return NextResponse.json({ message: "You can only delete your own messages" }, { status: 403 });
    }

    // Add the current user to the `deletedBy` array
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
    }

    // If both sender and receiver have deleted the message, mark the message as deleted
    if (message.deletedBy.length === 2) {
      message.message = "[This message was deleted]";
    }

    // Save the updated message
    await message.save();

    return NextResponse.json({ message: "Message deleted for everyone" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
