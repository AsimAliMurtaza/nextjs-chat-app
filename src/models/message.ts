import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  message: string;
  timestamp: Date;
  file?: string;
  fileType?: string;
  deletedBy: string[]; // Tracks which users deleted the message
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    file: { type: String },
    fileType: { type: String },
    deletedBy: { type: [String], default: [] }, // Stores user IDs who deleted the chat
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
