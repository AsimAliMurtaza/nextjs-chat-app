import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline?: boolean;
  contacts: string[];
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  isOnline: Boolean,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
