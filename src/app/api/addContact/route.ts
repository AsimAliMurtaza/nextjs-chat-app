import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/libs/mongodb";
import User from "@/models/user";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contactEmail } = await req.json();
  if (!contactEmail) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  try {
    const user = await User.findOne({ email: session.user.email });
    const contact = await User.findOne({ email: contactEmail });

    if (!user || !contact) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if already added
    if (user.contacts.includes(contact._id)) {
      return NextResponse.json({ error: "Contact already added" }, { status: 400 });
    }

    // Add contact
    user.contacts.push(contact._id);
    await user.save();

    return NextResponse.json({ message: "Contact added", newContact: contact });
  } catch (error) {
    console.error("Error adding contact:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
