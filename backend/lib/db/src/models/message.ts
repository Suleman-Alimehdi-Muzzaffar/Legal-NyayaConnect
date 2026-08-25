import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    id: { type: String, required: true },
    conversationId: { type: String, required: true },
    clientId: { type: String, required: true },
    lawyerId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderName: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { strict: false, collection: "messages" },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ clientId: 1, lawyerId: 1, createdAt: 1 });
messageSchema.index({ clientId: 1 });
messageSchema.index({ lawyerId: 1 });

export const Message = mongoose.models.Message ?? model("Message", messageSchema);