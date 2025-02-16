import { NextResponse } from "next/server";
import Message from "@/models/Message";
import dbConnect from "@/libs/dbConnect";

export async function GET() {
  await dbConnect();
  const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  await dbConnect();
  const { username, message } = await req.json();
  const newMessage = new Message({ username, message });
  await newMessage.save();
  return NextResponse.json(newMessage);
}
