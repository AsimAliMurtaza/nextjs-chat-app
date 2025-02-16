import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/libs/mongodb";
import User from "@/models/user";
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
