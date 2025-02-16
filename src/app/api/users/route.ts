import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  await dbConnect();
  const users = await User.find({}, "_id name email"); // Fetch only necessary fields
  return NextResponse.json(users);
}
