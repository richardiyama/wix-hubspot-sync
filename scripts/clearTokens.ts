import mongoose from "mongoose";
import dotenv from "dotenv";
import { Token } from "../server/models/Token";

// LOAD ENV FILE
dotenv.config();

async function clear() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing in .env file");
  }

  await mongoose.connect(uri);

  await Token.deleteMany({});

  console.log("Tokens cleared");

  await mongoose.disconnect();
  process.exit(0);
}

clear();