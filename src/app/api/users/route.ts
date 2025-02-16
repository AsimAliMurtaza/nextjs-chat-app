import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import User from "@/models/user";

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find({}, "name email avatar _id");
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
