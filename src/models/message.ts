import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  message: string; // Ensure it's named "message" instead of "text"
  timestamp: Date;
  file?: string;
  fileType?: string;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true }, // Match this with API request field
  timestamp: { type: Date, default: Date.now },
  file: { type: String },
  fileType: { type: String },
});

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
