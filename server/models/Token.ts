import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Number
});

export const Token = mongoose.model("Token", tokenSchema);